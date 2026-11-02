export interface RecentOrder {
  code: string;
  token: string;
  created_at: string;
  total: number;
  items_count: number;
  city: string;
}

const STORAGE_KEY = "zekra_recent_orders";

export function saveRecentOrder(order: RecentOrder): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentOrders();
    const updated = [order, ...existing.filter((o) => o.code !== order.code)].slice(0, 10);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save recent order to localStorage:", e);
  }
}

export function getRecentOrders(): RecentOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentOrder[]) : [];
  } catch {
    return [];
  }
}
