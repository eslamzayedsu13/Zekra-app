import { createServerFn } from "@tanstack/react-start";
import * as fs from "fs";
import * as path from "path";
import { normalizeEgyptianPhone } from "./format";
import { extrasTotal, shippingFee } from "./pricing";
import { db } from "./firebase";
import { collection, doc, getDocs, getDoc, setDoc, query, where } from "firebase/firestore";

export type OrderStage = "received" | "preparing" | "shipped" | "delivered" | "cancelled";

export interface StatusHistoryEntry {
  status: OrderStage;
  created_at: string;
}

export interface StoredOrderItem {
  productId: string;
  variantId?: string | null;
  nameAr: string;
  nameEn: string;
  variantAr?: string | null;
  variantEn?: string | null;
  unitPrice: number;
  engravingPrice: number;
  engraving?: string | null;
  qty: number;
  lineTotal: number;
}

export interface StoredOrder {
  id: string;
  order_code: string;
  tracking_token: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  governorate: string;
  city: string;
  street: string;
  address_notes?: string | null;
  gift_wrap: boolean;
  greeting_card: boolean;
  gift_message?: string | null;
  payment_method: string;
  status: OrderStage;
  subtotal: number;
  extras_total: number;
  shipping_fee: number;
  total: number;
  items: StoredOrderItem[];
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

// In-memory cache + persistent JSON backing
const DATA_FILE = path.join(process.cwd(), "data", "orders.json");
let ordersCache: Map<string, StoredOrder> | null = null;

function ensureLoaded(): Map<string, StoredOrder> {
  if (ordersCache) return ordersCache;
  ordersCache = new Map();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list = JSON.parse(raw) as StoredOrder[];
      for (const o of list) {
        ordersCache.set(o.order_code.toUpperCase(), o);
      }
    }
  } catch (e) {
    console.warn("[Orders] Could not load orders.json:", e);
  }
  return ordersCache;
}

function persistOrders() {
  if (!ordersCache) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([...ordersCache.values()], null, 2), "utf-8");
  } catch (e) {
    console.warn("[Orders] Could not save orders.json:", e);
  }
}

// Rate limiting map: identifier -> array of request timestamps
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) ?? []).filter((t) => now - t < 60000);
  if (timestamps.length >= 20) return false;
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    variantId?: string | null;
    nameAr?: string;
    nameEn?: string;
    variantAr?: string | null;
    variantEn?: string | null;
    unitPrice: number;
    engravingPrice: number;
    engraving?: string | null;
    qty: number;
  }>;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  governorate: string;
  city: string;
  street: string;
  address_notes?: string | null;
  gift_wrap?: boolean;
  greeting_card?: boolean;
  gift_message?: string | null;
  shipping_rate_fee?: number;
}

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((d: CreateOrderPayload) => d)
  .handler(async ({ data: payload }) => {
    // 1. Validate items
    if (!payload.items || payload.items.length === 0) {
      throw new Error("EMPTY_CART");
    }
    if (payload.items.length > 50) {
      throw new Error("TOO_MANY_ITEMS");
    }

    // 2. Validate & normalize name
    const name = (payload.contact_name || "").trim();
    if (name.length < 2 || name.length > 120) {
      throw new Error("INVALID_NAME");
    }

    // 3. Validate & normalize phone
    const { cleaned: phoneCleaned, isValid: phoneValid } = normalizeEgyptianPhone(
      payload.contact_phone || "",
    );
    if (!phoneValid) {
      throw new Error("INVALID_PHONE");
    }

    // 4. Validate address
    const gov = (payload.governorate || "").trim();
    if (!gov) throw new Error("INVALID_GOVERNORATE");

    const city = (payload.city || "").trim();
    if (city.length < 2) throw new Error("INVALID_ADDRESS");

    const street = (payload.street || "").trim();
    if (street.length < 4) throw new Error("INVALID_ADDRESS");

    // 5. Calculate financials server-side
    let subtotal = 0;
    const orderItems: StoredOrderItem[] = [];
    for (const item of payload.items) {
      const q = Math.max(1, Math.min(20, item.qty || 1));
      const lineTotal = (item.unitPrice + (item.engravingPrice || 0)) * q;
      subtotal += lineTotal;
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        nameAr: item.nameAr || "هدية ذِكرى",
        nameEn: item.nameEn || "Zekra Gift",
        variantAr: item.variantAr || null,
        variantEn: item.variantEn || null,
        unitPrice: item.unitPrice,
        engravingPrice: item.engravingPrice || 0,
        engraving: item.engraving || null,
        qty: q,
        lineTotal,
      });
    }

    const wrap = !!payload.gift_wrap;
    const card = !!payload.greeting_card;
    const extras = extrasTotal({ giftWrap: wrap, greetingCard: card });
    const fee = payload.shipping_rate_fee ?? 60;
    const ship = shippingFee(subtotal, fee) ?? fee;
    const total = subtotal + extras + ship;

    // 6. Generate short readable code (e.g. ZK-4821) and tracking token
    const store = ensureLoaded();
    let code = "";
    do {
      const rand = Math.floor(1000 + Math.random() * 9000);
      code = `ZK-${rand}`;
    } while (store.has(code));

    const token = crypto.randomUUID();
    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const newOrder: StoredOrder = {
      id,
      order_code: code,
      tracking_token: token,
      contact_name: name,
      contact_phone: phoneCleaned,
      contact_email: payload.contact_email?.trim() || null,
      governorate: gov,
      city,
      street,
      address_notes: payload.address_notes?.slice(0, 300) || null,
      gift_wrap: wrap,
      greeting_card: card,
      gift_message: card ? payload.gift_message?.slice(0, 300) || null : null,
      payment_method: "cod",
      status: "received",
      subtotal,
      extras_total: extras,
      shipping_fee: ship,
      total,
      items: orderItems,
      status_history: [{ status: "received", created_at: nowIso }],
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, "orders", id), newOrder);
      console.log(`[Firestore Order Created] ID: ${id}, Code: ${code}`);
    } catch (fsErr) {
      console.error("[Firestore Order Write Error]", fsErr);
    }

    // Also keep local fallback cache
    store.set(code.toUpperCase(), newOrder);
    persistOrders();

    console.log(`[Order Created] Code: ${code}, Total: ${total} EGP, Phone: ${phoneCleaned}`);

    return {
      success: true,
      id,
      code,
      token,
    };
  });

export interface LookupOrderParams {
  code: string;
  token?: string | null;
  phone?: string | null;
}

export const lookupOrderFn = createServerFn({ method: "POST" })
  .validator((d: LookupOrderParams) => d)
  .handler(async ({ data: params }) => {
    const rawCode = (params.code || "").trim().toUpperCase();
    if (!rawCode) {
      throw new Error("NOT_FOUND");
    }

    // Rate limiting
    const clientKey = `${rawCode}_${params.phone || params.token || "guest"}`;
    if (!checkRateLimit(clientKey)) {
      throw new Error("RATE_LIMITED");
    }

    let order: StoredOrder | null = null;

    // Check Firestore first
    try {
      const q = query(collection(db, "orders"), where("order_code", "==", rawCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        order = snap.docs[0].data() as StoredOrder;
      }
    } catch (e) {
      console.warn("[Firestore Lookup Error]", e);
    }

    if (!order) {
      const store = ensureLoaded();
      order = store.get(rawCode) || null;
    }

    if (!order) {
      throw new Error("NOT_FOUND");
    }

    // Must match either tracking token OR phone number
    let authenticated = false;
    if (params.token && params.token === order.tracking_token) {
      authenticated = true;
    } else if (params.phone) {
      const { cleaned } = normalizeEgyptianPhone(params.phone);
      if (cleaned && cleaned === order.contact_phone) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      throw new Error("NOT_FOUND");
    }

    // Return safe public-facing tracking details only
    return {
      code: order.order_code,
      status: order.status,
      created_at: order.created_at,
      city: order.city,
      governorate: order.governorate,
      item_names: order.items.map((i) => ({
        name_ar: i.nameAr,
        name_en: i.nameEn,
        variant_ar: i.variantAr,
        variant_en: i.variantEn,
        qty: i.qty,
        line_total: i.lineTotal,
      })),
      items_count: order.items.reduce((s, i) => s + i.qty, 0),
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      extras_total: order.extras_total,
      total: order.total,
      stage_times: order.status_history,
    };
  });
