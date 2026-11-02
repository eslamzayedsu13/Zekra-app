import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";
import { cartSubtotal, extrasTotal, orderTotal, shippingFee, EG_PHONE } from "./pricing";

describe("price formatting", () => {
  it("formats Arabic prices with Arabic digits and ج.م", () => {
    expect(formatPrice(1250, "ar")).toBe("١٬٢٥٠ ج.م");
  });
  it("formats English prices as EGP 1,250", () => {
    expect(formatPrice(1250, "en")).toBe("EGP 1,250");
  });
});

describe("cart totals", () => {
  it("includes engraving per unit", () => {
    expect(
      cartSubtotal([
        { unitPrice: 650, engravingPrice: 120, qty: 2 },
        { unitPrice: 450, engravingPrice: 0, qty: 1 },
      ]),
    ).toBe(1990);
  });
  it("adds gift wrap 75 and card 40", () => {
    expect(extrasTotal({ giftWrap: true, greetingCard: true })).toBe(115);
  });
});

describe("shipping", () => {
  it("charges the governorate fee below 3000 EGP", () => {
    expect(shippingFee(2999, 60)).toBe(60);
  });
  it("is free from 3000 EGP", () => {
    expect(shippingFee(3000, 120)).toBe(0);
  });
  it("total = subtotal + shipping + extras", () => {
    expect(
      orderTotal([{ unitPrice: 890, engravingPrice: 0, qty: 1 }], 80, {
        giftWrap: true,
        greetingCard: false,
      }),
    ).toBe(1045);
  });
});

describe("phone validation", () => {
  it("accepts Egyptian mobiles and rejects others", () => {
    expect(EG_PHONE.test("01012345678")).toBe(true);
    expect(EG_PHONE.test("0131234567")).toBe(false);
  });
});
