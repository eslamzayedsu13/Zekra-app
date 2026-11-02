/**
 * Display-side pricing. The database function `place_order` recomputes every
 * amount on the server — keep these constants in sync with it.
 */
export const GIFT_WRAP_FEE = 75;
export const GREETING_CARD_FEE = 40;
export const FREE_SHIPPING_THRESHOLD = 3000;
export const MAX_QTY = 20;

export interface PricedLine {
  unitPrice: number;
  engravingPrice: number;
  qty: number;
}

export function lineTotal(l: PricedLine): number {
  return (l.unitPrice + l.engravingPrice) * l.qty;
}

export function cartSubtotal(lines: PricedLine[]): number {
  return lines.reduce((s, l) => s + lineTotal(l), 0);
}

export function shippingFee(subtotal: number, governorateFee: number | null): number | null {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return governorateFee;
}

export function extrasTotal(opts: { giftWrap: boolean; greetingCard: boolean }): number {
  return (opts.giftWrap ? GIFT_WRAP_FEE : 0) + (opts.greetingCard ? GREETING_CARD_FEE : 0);
}

export function orderTotal(
  lines: PricedLine[],
  governorateFee: number | null,
  opts: { giftWrap: boolean; greetingCard: boolean },
): number | null {
  const sub = cartSubtotal(lines);
  const ship = shippingFee(sub, governorateFee);
  if (ship === null) return null;
  return sub + ship + extrasTotal(opts);
}

export const EG_PHONE = /^01[0125][0-9]{8}$/;
