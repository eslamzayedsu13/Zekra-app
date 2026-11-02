import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

export interface FirestoreCategory {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  sort: number;
}

export interface FirestoreVariant {
  id: string;
  product_id?: string;
  name_ar: string;
  name_en: string;
  price_delta: number;
  stock: number;
  sort: number;
}

export interface FirestoreProduct {
  id: string;
  slug: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  featured: boolean;
  bestseller: boolean;
  sales_count: number;
  allow_engraving: boolean;
  engraving_price: number;
  active: boolean;
  created_at: string;
  product_variants: FirestoreVariant[];
}

export interface FirestoreShippingRate {
  governorate: string;
  name_ar: string;
  fee: number;
  eta_days: string;
}

// 5 Categories Seed
export const SEED_CATEGORIES: FirestoreCategory[] = [
  {
    id: "cat-engagement",
    slug: "engagement",
    name_ar: "للخطوبة",
    name_en: "For the Engagement",
    sort: 1,
  },
  { id: "cat-keepsakes", slug: "keepsakes", name_ar: "تذكارات", name_en: "Keepsakes", sort: 2 },
  { id: "cat-jewelry", slug: "jewelry", name_ar: "مجوهرات", name_en: "Jewelry", sort: 3 },
  { id: "cat-home", slug: "home", name_ar: "للبيت", name_en: "Home & Ritual", sort: 4 },
  {
    id: "cat-accessories",
    slug: "accessories",
    name_ar: "إكسسوارات",
    name_en: "Accessories",
    sort: 5,
  },
];

// 27 Governorates Shipping Rates Seed
export const SEED_SHIPPING_RATES: FirestoreShippingRate[] = [
  { governorate: "Cairo", name_ar: "القاهرة", fee: 60, eta_days: "1-2" },
  { governorate: "Giza", name_ar: "الجيزة", fee: 60, eta_days: "1-2" },
  { governorate: "Alexandria", name_ar: "الإسكندرية", fee: 70, eta_days: "2-3" },
  { governorate: "Qalyubia", name_ar: "القليوبية", fee: 70, eta_days: "2-3" },
  { governorate: "Dakahlia", name_ar: "الدقهلية", fee: 80, eta_days: "2-4" },
  { governorate: "Sharqia", name_ar: "الشرقية", fee: 80, eta_days: "2-4" },
  { governorate: "Gharbia", name_ar: "الغربية", fee: 80, eta_days: "2-4" },
  { governorate: "Monufia", name_ar: "المنوفية", fee: 80, eta_days: "2-4" },
  { governorate: "Beheira", name_ar: "البحيرة", fee: 80, eta_days: "2-4" },
  { governorate: "Kafr El Sheikh", name_ar: "كفر الشيخ", fee: 80, eta_days: "2-4" },
  { governorate: "Damietta", name_ar: "دمياط", fee: 80, eta_days: "2-4" },
  { governorate: "Port Said", name_ar: "بورسعيد", fee: 80, eta_days: "2-4" },
  { governorate: "Ismailia", name_ar: "الإسماعيلية", fee: 80, eta_days: "2-4" },
  { governorate: "Suez", name_ar: "السويس", fee: 80, eta_days: "2-4" },
  { governorate: "Faiyum", name_ar: "الفيوم", fee: 90, eta_days: "3-5" },
  { governorate: "Beni Suef", name_ar: "بني سويف", fee: 90, eta_days: "3-5" },
  { governorate: "Minya", name_ar: "المنيا", fee: 95, eta_days: "3-5" },
  { governorate: "Asyut", name_ar: "أسيوط", fee: 95, eta_days: "3-5" },
  { governorate: "Sohag", name_ar: "سوهاج", fee: 95, eta_days: "3-5" },
  { governorate: "Qena", name_ar: "قنا", fee: 100, eta_days: "4-6" },
  { governorate: "Luxor", name_ar: "الأقصر", fee: 100, eta_days: "4-6" },
  { governorate: "Aswan", name_ar: "أسوان", fee: 100, eta_days: "4-6" },
  { governorate: "Red Sea", name_ar: "البحر الأحمر", fee: 120, eta_days: "4-7" },
  { governorate: "Matrouh", name_ar: "مطروح", fee: 120, eta_days: "4-7" },
  { governorate: "New Valley", name_ar: "الوادي الجديد", fee: 120, eta_days: "5-7" },
  { governorate: "North Sinai", name_ar: "شمال سيناء", fee: 120, eta_days: "5-7" },
  { governorate: "South Sinai", name_ar: "جنوب سيناء", fee: 120, eta_days: "4-7" },
];

// 16 Products Seed
export const SEED_PRODUCTS: FirestoreProduct[] = [
  {
    id: "prod-engraved-ring-dish",
    slug: "engraved-ring-dish",
    category_id: "cat-engagement",
    name_ar: "طبق الخواتم المحفور",
    name_en: "Engraved Ring Dish",
    description_ar:
      "طبق خزفي مصنوع يدويًا يحفظ خاتمَي الخطوبة، مع إمكانية حفر الأحرف الأولى وتاريخ اليوم الذي بدأ فيه كل شيء.",
    description_en:
      "A hand-thrown ceramic dish to hold your engagement rings, with optional engraving of your initials and the date it all began.",
    price: 650,
    compare_at_price: null,
    stock: 40,
    images: ["ringdish", "giftbox"],
    featured: true,
    bestseller: true,
    sales_count: 212,
    allow_engraving: true,
    engraving_price: 120,
    active: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-couples-journal",
    slug: "couples-journal",
    category_id: "cat-keepsakes",
    name_ar: "دفتر الحكاية المشتركة",
    name_en: "The Shared Story Journal",
    description_ar:
      "دفتر مجلّد بالكتان بأسئلة موجّهة لتكتبا معًا حكايتكما منذ اللقاء الأول وحتى الزفاف.",
    description_en:
      "A linen-bound journal with guided prompts for writing your story together, from the first meeting to the wedding day.",
    price: 780,
    compare_at_price: 950,
    stock: 55,
    images: ["journal", "giftbox"],
    featured: true,
    bestseller: true,
    sales_count: 341,
    allow_engraving: true,
    engraving_price: 90,
    active: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-initial-necklace",
    slug: "initial-necklace",
    category_id: "cat-jewelry",
    name_ar: "قلادة الحرف الأول",
    name_en: "Initial Pendant Necklace",
    description_ar: "قلادة رقيقة من الفضة المطلية بذهب عيار ١٨ بحرف أول من اختيارك.",
    description_en:
      "A delicate 18k gold-plated sterling silver necklace carrying an initial of your choice.",
    price: 1450,
    compare_at_price: null,
    stock: 0,
    images: ["necklace", "box"],
    featured: true,
    bestseller: true,
    sales_count: 288,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    product_variants: [
      {
        id: "var-necklace-1",
        name_ar: "ذهبي — ٤٠ سم",
        name_en: "Gold — 40 cm",
        price_delta: 0,
        stock: 25,
        sort: 1,
      },
      {
        id: "var-necklace-2",
        name_ar: "ذهبي — ٤٥ سم",
        name_en: "Gold — 45 cm",
        price_delta: 0,
        stock: 18,
        sort: 2,
      },
      {
        id: "var-necklace-3",
        name_ar: "فضي — ٤٥ سم",
        name_en: "Silver — 45 cm",
        price_delta: -200,
        stock: 12,
        sort: 3,
      },
    ],
  },
  {
    id: "prod-star-map-print",
    slug: "star-map-print",
    category_id: "cat-keepsakes",
    name_ar: "خريطة نجوم ليلتكما",
    name_en: "Your Night Sky Star Map",
    description_ar:
      "طبعة فنية لسماء الليلة التي التقيتما فيها، بالتاريخ والمدينة، في إطار من خشب البلوط.",
    description_en:
      "A fine-art print of the sky on the night you met, with date and city, in a solid oak frame.",
    price: 1850,
    compare_at_price: null,
    stock: 0,
    images: ["starmap", "frame"],
    featured: true,
    bestseller: false,
    sales_count: 164,
    allow_engraving: true,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    product_variants: [
      {
        id: "var-starmap-1",
        name_ar: "٣٠×٤٠ سم",
        name_en: "30×40 cm",
        price_delta: 0,
        stock: 30,
        sort: 1,
      },
      {
        id: "var-starmap-2",
        name_ar: "٥٠×٧٠ سم",
        name_en: "50×70 cm",
        price_delta: 900,
        stock: 14,
        sort: 2,
      },
    ],
  },
  {
    id: "prod-pressed-flower-frame",
    slug: "pressed-flower-frame",
    category_id: "cat-home",
    name_ar: "إطار الزهور المجففة",
    name_en: "Pressed Flower Frame",
    description_ar: "زهور برية مجففة يدويًا بين لوحين من الزجاج في إطار نحاسي نحيف.",
    description_en: "Hand-pressed wildflowers between two panes of glass in a slim brass frame.",
    price: 1250,
    compare_at_price: null,
    stock: 22,
    images: ["frame", "starmap"],
    featured: false,
    bestseller: true,
    sales_count: 197,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-candle-duo",
    slug: "candle-duo",
    category_id: "cat-home",
    name_ar: "ثنائي الشموع المعطرة",
    name_en: "Scented Candle Duo",
    description_ar:
      "شمعتان من شمع الصويا بعطر زهر البرتقال والمسك الأبيض، تُصبّان يدويًا في أوعية خزفية.",
    description_en:
      "Two hand-poured soy candles in orange blossom and white musk, set in ceramic vessels.",
    price: 890,
    compare_at_price: null,
    stock: 60,
    images: ["candle", "giftbox"],
    featured: true,
    bestseller: true,
    sales_count: 402,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-silk-scrunchie-set",
    slug: "silk-scrunchie-set",
    category_id: "cat-accessories",
    name_ar: "طقم ربطات الحرير",
    name_en: "Silk Scrunchie Set",
    description_ar: "ثلاث ربطات شعر من الحرير الطبيعي بألوان العاج والوردي الترابي والمريمية.",
    description_en: "Three pure mulberry silk scrunchies in ivory, dusty rose and sage.",
    price: 450,
    compare_at_price: null,
    stock: 80,
    images: ["silk", "giftbox"],
    featured: false,
    bestseller: true,
    sales_count: 356,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-leather-keepsake-box",
    slug: "leather-keepsake-box",
    category_id: "cat-keepsakes",
    name_ar: "صندوق الذكريات الجلدي",
    name_en: "Leather Keepsake Box",
    description_ar: "صندوق من الجلد الطبيعي ببطانة حريرية لحفظ الرسائل والتذاكر وكل ما لا يُنسى.",
    description_en:
      "A full-grain leather box with silk lining for letters, tickets and everything worth keeping.",
    price: 2650,
    compare_at_price: 2950,
    stock: 0,
    images: ["box", "journal"],
    featured: true,
    bestseller: false,
    sales_count: 98,
    allow_engraving: true,
    engraving_price: 150,
    active: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    product_variants: [
      {
        id: "var-box-1",
        name_ar: "وردي ترابي",
        name_en: "Dusty Rose",
        price_delta: 0,
        stock: 9,
        sort: 1,
      },
      { id: "var-box-2", name_ar: "فحمي", name_en: "Charcoal", price_delta: 0, stock: 6, sort: 2 },
    ],
  },
  {
    id: "prod-engagement-gift-box",
    slug: "engagement-gift-box",
    category_id: "cat-engagement",
    name_ar: "صندوق هدية الخطوبة",
    name_en: "The Engagement Gift Box",
    description_ar: "صندوق منسّق يضم دفتر الحكاية وشمعة وطبق الخواتم، ملفوف بورق عاجي وشريط حريري.",
    description_en:
      "A curated box with the story journal, a candle and the ring dish, wrapped in ivory paper and silk ribbon.",
    price: 2950,
    compare_at_price: 3420,
    stock: 15,
    images: ["giftbox", "ringdish", "journal"],
    featured: true,
    bestseller: true,
    sales_count: 143,
    allow_engraving: true,
    engraving_price: 120,
    active: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-promise-bracelet",
    slug: "promise-bracelet",
    category_id: "cat-jewelry",
    name_ar: "سوار الوعد",
    name_en: "Promise Bracelet",
    description_ar: "سوار رفيع بسلسلة ناعمة وقرص صغير يمكن حفره باسم أو تاريخ.",
    description_en: "A fine chain bracelet with a small disc that can carry a name or a date.",
    price: 1150,
    compare_at_price: null,
    stock: 0,
    images: ["necklace", "box"],
    featured: false,
    bestseller: false,
    sales_count: 77,
    allow_engraving: true,
    engraving_price: 100,
    active: true,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    product_variants: [
      {
        id: "var-bracelet-1",
        name_ar: "ذهبي",
        name_en: "Gold",
        price_delta: 0,
        stock: 20,
        sort: 1,
      },
      {
        id: "var-bracelet-2",
        name_ar: "فضي",
        name_en: "Silver",
        price_delta: -150,
        stock: 15,
        sort: 2,
      },
    ],
  },
  {
    id: "prod-wedding-guest-book",
    slug: "wedding-guest-book",
    category_id: "cat-engagement",
    name_ar: "دفتر ضيوف الفرح",
    name_en: "Wedding Guest Book",
    description_ar: "دفتر كبير بورق قطني سميك لتجمعا فيه كلمات الأحبة يوم الفرح.",
    description_en:
      "A large book of heavy cotton paper to gather the words of loved ones on your wedding day.",
    price: 1350,
    compare_at_price: null,
    stock: 30,
    images: ["journal", "frame"],
    featured: false,
    bestseller: false,
    sales_count: 64,
    allow_engraving: true,
    engraving_price: 90,
    active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-love-letters-set",
    slug: "love-letters-set",
    category_id: "cat-keepsakes",
    name_ar: "طقم رسائل الحب",
    name_en: "Love Letters Set",
    description_ar:
      "اثنتا عشرة بطاقة وظرفًا من الورق القطني مع ختم شمعي، لرسالة في كل شهر من السنة الأولى.",
    description_en:
      "Twelve cotton-paper cards and envelopes with a wax seal—one letter for each month of your first year.",
    price: 590,
    compare_at_price: null,
    stock: 70,
    images: ["giftbox", "journal"],
    featured: false,
    bestseller: true,
    sales_count: 231,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-silk-eye-mask",
    slug: "silk-eye-mask",
    category_id: "cat-accessories",
    name_ar: "قناع النوم الحريري",
    name_en: "Silk Sleep Mask",
    description_ar: "قناع نوم من الحرير الطبيعي، ناعم على البشرة ومثالي لهدايا السفر وشهر العسل.",
    description_en:
      "A pure silk sleep mask, gentle on the skin and perfect for travel and the honeymoon.",
    price: 520,
    compare_at_price: null,
    stock: 45,
    images: ["silk", "candle"],
    featured: false,
    bestseller: false,
    sales_count: 88,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-ceramic-vase",
    slug: "ceramic-vase",
    category_id: "cat-home",
    name_ar: "مزهرية خزفية صغيرة",
    name_en: "Small Ceramic Bud Vase",
    description_ar: "مزهرية مصنوعة يدويًا بلمسة غير منتظمة، لزهرة واحدة أو غصن مجفف.",
    description_en:
      "A hand-made bud vase with an irregular finish, for a single stem or a dried branch.",
    price: 480,
    compare_at_price: null,
    stock: 35,
    images: ["frame", "candle"],
    featured: false,
    bestseller: false,
    sales_count: 59,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-anniversary-candle",
    slug: "anniversary-candle",
    category_id: "cat-home",
    name_ar: "شمعة الذكرى السنوية",
    name_en: "Anniversary Candle",
    description_ar: "شمعة كبيرة بثلاث فتائل وملصق مخصّص بأسمائكما وتاريخكما.",
    description_en: "A large three-wick candle with a custom label carrying your names and date.",
    price: 760,
    compare_at_price: null,
    stock: 40,
    images: ["candle", "giftbox"],
    featured: false,
    bestseller: false,
    sales_count: 72,
    allow_engraving: true,
    engraving_price: 60,
    active: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    product_variants: [],
  },
  {
    id: "prod-pearl-hair-clip",
    slug: "pearl-hair-clip",
    category_id: "cat-accessories",
    name_ar: "مشبك اللؤلؤ",
    name_en: "Pearl Hair Clip",
    description_ar: "مشبك شعر نحاسي مرصّع بلآلئ المياه العذبة، لمسة ناعمة ليوم الخطوبة.",
    description_en:
      "A brass hair clip set with freshwater pearls, a soft touch for the engagement day.",
    price: 380,
    compare_at_price: null,
    stock: 50,
    images: ["silk", "necklace"],
    featured: false,
    bestseller: false,
    sales_count: 121,
    allow_engraving: false,
    engraving_price: 0,
    active: true,
    created_at: new Date().toISOString(),
    product_variants: [],
  },
];

let isSeeding = false;

/**
 * Checks Firestore and seeds categories, products, and shipping rates if empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  // Only authenticated admins can seed Firestore; prevents PERMISSION_DENIED stream errors for guest visitors
  if (!auth.currentUser || isSeeding) return;
  isSeeding = true;
  try {
    const catsSnap = await getDocs(collection(db, "categories"));
    if (catsSnap.empty) {
      console.log("[Firestore] Seeding initial categories...");
      const batch = writeBatch(db);
      for (const cat of SEED_CATEGORIES) {
        batch.set(doc(db, "categories", cat.id), cat);
      }
      await batch.commit();
    }

    const prodsSnap = await getDocs(collection(db, "products"));
    if (prodsSnap.empty) {
      console.log("[Firestore] Seeding initial products...");
      const batch = writeBatch(db);
      for (const prod of SEED_PRODUCTS) {
        batch.set(doc(db, "products", prod.id), prod);
      }
      await batch.commit();
    }

    const ratesSnap = await getDocs(collection(db, "shipping_rates"));
    if (ratesSnap.empty) {
      console.log("[Firestore] Seeding initial shipping rates...");
      const batch = writeBatch(db);
      for (const rate of SEED_SHIPPING_RATES) {
        batch.set(doc(db, "shipping_rates", rate.governorate), rate);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn("[Firestore] Auto-seed notice:", err);
  } finally {
    isSeeding = false;
  }
}

/**
 * Get all categories from Firestore
 */
export async function getCategoriesFromFirestore(): Promise<FirestoreCategory[]> {
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(query(collection(db, "categories"), orderBy("sort", "asc")));
    if (snap.empty) return SEED_CATEGORIES;
    return snap.docs.map((d) => ({ ...(d.data() as FirestoreCategory), id: d.id }));
  } catch (err) {
    console.error("[Firestore] getCategories error:", err);
    return SEED_CATEGORIES;
  }
}

/**
 * Get all active products from Firestore
 */
export async function getProductsFromFirestore(
  includeInactive = false,
): Promise<FirestoreProduct[]> {
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(query(collection(db, "products"), orderBy("created_at", "desc")));
    if (snap.empty) return includeInactive ? SEED_PRODUCTS : SEED_PRODUCTS.filter((p) => p.active);
    const all = snap.docs.map((d) => ({ ...(d.data() as FirestoreProduct), id: d.id }));
    return includeInactive ? all : all.filter((p) => p.active);
  } catch (err) {
    console.error("[Firestore] getProducts error:", err);
    return includeInactive ? SEED_PRODUCTS : SEED_PRODUCTS.filter((p) => p.active);
  }
}

/**
 * Get single product by slug
 */
export async function getProductBySlugFromFirestore(
  slug: string,
): Promise<FirestoreProduct | null> {
  const products = await getProductsFromFirestore(true);
  return products.find((p) => p.slug === slug) ?? null;
}

/**
 * Get shipping rates from Firestore
 */
export async function getShippingRatesFromFirestore(): Promise<FirestoreShippingRate[]> {
  try {
    await seedFirestoreIfEmpty();
    const snap = await getDocs(collection(db, "shipping_rates"));
    if (snap.empty) return SEED_SHIPPING_RATES;
    return snap.docs.map((d) => d.data() as FirestoreShippingRate);
  } catch (err) {
    console.error("[Firestore] getShippingRates error:", err);
    return SEED_SHIPPING_RATES;
  }
}
