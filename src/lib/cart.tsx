import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartSubtotal, MAX_QTY } from "./pricing";

export interface CartItem {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  nameAr: string;
  nameEn: string;
  variantAr: string | null;
  variantEn: string | null;
  image: string;
  unitPrice: number;
  engraving: string;
  engravingPrice: number;
  qty: number;
  maxQty: number;
}

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (item: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "zekra-cart-v1";

export function lineKey(productId: string, variantId: string | null, engraving: string) {
  return `${productId}|${variantId ?? ""}|${engraving.trim()}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    const key = lineKey(item.productId, item.variantId, item.engraving);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      const cap = Math.min(MAX_QTY, item.maxQty);
      if (found)
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(cap, i.qty + item.qty) } : i,
        );
      return [...prev, { ...item, key, qty: Math.min(cap, item.qty) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, qty: Math.max(1, Math.min(Math.min(MAX_QTY, i.maxQty), qty)) } : i,
      ),
    );
  }, []);

  const remove = useCallback(
    (key: string) => setItems((prev) => prev.filter((i) => i.key !== key)),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: cartSubtotal(items),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, open, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
