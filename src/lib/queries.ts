import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getShippingRates } from "./catalog.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
  staleTime: 60_000,
});

export const shippingRatesQuery = queryOptions({
  queryKey: ["shipping-rates"],
  queryFn: () => getShippingRates(),
  staleTime: 10 * 60_000,
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
export type Product = Catalog["products"][number];
export type Category = Catalog["categories"][number];
export type Variant = Product["product_variants"][number];

export function productStock(p: Product): number {
  return p.product_variants.length ? p.product_variants.reduce((s, v) => s + v.stock, 0) : p.stock;
}

export function minPrice(p: Product): number {
  if (!p.product_variants.length) return p.price;
  return p.price + Math.min(...p.product_variants.map((v) => v.price_delta));
}
