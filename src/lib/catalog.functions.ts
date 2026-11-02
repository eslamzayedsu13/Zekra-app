import { createServerFn } from "@tanstack/react-start";
import {
  getCategoriesFromFirestore,
  getProductsFromFirestore,
  getShippingRatesFromFirestore,
} from "./firestore-catalog";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const [cats, prods] = await Promise.all([
    getCategoriesFromFirestore(),
    getProductsFromFirestore(false),
  ]);
  return { categories: cats, products: prods };
});

export const getShippingRates = createServerFn({ method: "GET" }).handler(async () => {
  const rates = await getShippingRatesFromFirestore();
  return rates.sort((a, b) => a.fee - b.fee || a.governorate.localeCompare(b.governorate));
});
