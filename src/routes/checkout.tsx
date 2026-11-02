import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { shippingRatesQuery } from "@/lib/queries";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { extrasTotal, GIFT_WRAP_FEE, GREETING_CARD_FEE, shippingFee } from "@/lib/pricing";
import { formatNumber, normalizeDigits, normalizeEgyptianPhone } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/store/Price";
import { Field } from "./auth";
import { createOrderFn } from "@/lib/order.functions";
import { saveRecentOrder } from "@/lib/recent-orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب · Checkout — ذِكرى Zekra" },
      { name: "description", content: "Complete your Zekra order with cash on delivery." },
      { property: "og:title", content: "Checkout — Zekra" },
      { property: "og:description", content: "Complete your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { t, pick, price, lang } = useI18n();
  const navigate = useNavigate();
  const { data: rates = [] } = useQuery(shippingRatesQuery);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gov: "",
    city: "",
    street: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    gov?: string;
    city?: string;
    street?: string;
  }>({});

  const [wrap, setWrap] = useState(false);
  const [card, setCard] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Element refs for scrolling to first invalid input
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const govRef = useRef<HTMLSelectElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);

  const rate = rates.find((r) => r.governorate === form.gov) ?? null;
  const ship = shippingFee(subtotal, rate?.fee ?? null);
  const extras = extrasTotal({ giftWrap: wrap, greetingCard: card });
  const total = ship === null ? null : subtotal + ship + extras;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const normalized = normalizeDigits(raw);
    setForm((prev) => ({ ...prev, phone: normalized }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleFieldChange = (field: keyof typeof form, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const nameTrimmed = form.name.trim();
    if (nameTrimmed.length < 2) {
      newErrors.name = t("err_name_req");
    }

    const { isValid: phoneValid } = normalizeEgyptianPhone(form.phone);
    if (!phoneValid) {
      newErrors.phone = t("err_phone_req");
    }

    if (!form.gov) {
      newErrors.gov = t("err_gov_req");
    }

    if (form.city.trim().length < 2) {
      newErrors.city = t("err_city_req");
    }

    if (form.street.trim().length < 4) {
      newErrors.street = t("err_street_req");
    }

    setErrors(newErrors);
    return newErrors;
  };

  const placeOrder = async () => {
    // Temporary console log to confirm validation state and diagnose button action
    console.log("[Checkout] Place order button clicked. Form state:", {
      name: form.name,
      phone: form.phone,
      gov: form.gov,
      city: form.city,
      street: form.street,
      itemsCount: items.length,
    });

    if (busy) return;

    if (items.length === 0) {
      toast.error(t("err_EMPTY_CART"));
      return;
    }

    const validationErrors = validate();
    const errorKeys = Object.keys(validationErrors);

    if (errorKeys.length > 0) {
      // Scroll to and focus the first invalid field
      const firstError = errorKeys[0];
      if (firstError === "name") {
        nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        nameRef.current?.focus();
      } else if (firstError === "phone") {
        phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        phoneRef.current?.focus();
      } else if (firstError === "gov") {
        govRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        govRef.current?.focus();
      } else if (firstError === "city") {
        cityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        cityRef.current?.focus();
      } else if (firstError === "street") {
        streetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        streetRef.current?.focus();
      }
      return;
    }

    setBusy(true);
    try {
      const res = await createOrderFn({
        data: {
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId || null,
            nameAr: i.nameAr,
            nameEn: i.nameEn,
            variantAr: i.variantAr || null,
            variantEn: i.variantEn || null,
            unitPrice: i.unitPrice,
            engravingPrice: i.engravingPrice || 0,
            engraving: i.engraving || null,
            qty: i.qty,
          })),
          contact_name: form.name.trim(),
          contact_phone: form.phone,
          contact_email: form.email || null,
          governorate: form.gov,
          city: form.city.trim(),
          street: form.street.trim(),
          address_notes: form.notes || null,
          gift_wrap: wrap,
          greeting_card: card,
          gift_message: card ? message : null,
          shipping_rate_fee: rate?.fee,
        },
      });

      if (!res?.code || !res?.token) {
        throw new Error(t("err_generic"));
      }

      // Save order to recent orders on this device
      saveRecentOrder({
        code: res.code,
        token: res.token,
        created_at: new Date().toISOString(),
        total: total ?? subtotal,
        items_count: items.reduce((s, i) => s + i.qty, 0),
        city: form.city,
      });

      clear();
      toast.success(t("order_received"));
      navigate({
        to: "/order/$code",
        params: { code: res.code },
        search: { token: res.token },
      });
    } catch (err: unknown) {
      console.error("[Checkout] Order submission error:", err);
      const msg = err instanceof Error ? err.message : t("err_generic");
      if (msg.includes("EMPTY_CART")) {
        toast.error(t("err_EMPTY_CART"));
      } else if (msg.includes("INVALID_PHONE")) {
        setErrors((prev) => ({ ...prev, phone: t("err_phone_req") }));
        toast.error(t("err_INVALID_PHONE"));
      } else {
        toast.error(t("err_generic"));
      }
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-ed min-h-[60vh] py-20">
        <h1 className="text-4xl">{t("checkout_title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("cart_empty")}</p>
        <Button variant="outline" className="mt-8" asChild>
          <Link to="/shop">{t("cart_continue")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-ed pb-24 pt-10 md:pt-16">
      <h1 className="text-4xl md:text-5xl">{t("checkout_title")}</h1>

      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <div className="space-y-12 md:col-span-7">
          {/* 01 Contact Info */}
          <section>
            <p className="eyebrow mb-5">01 — {t("contact")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-start">
                  <span className="mb-1.5 block text-xs text-muted-foreground">
                    {t("full_name")} *
                  </span>
                  <input
                    ref={nameRef}
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    autoComplete="name"
                    required
                    className={`h-11 w-full border ${
                      errors.name
                        ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                        : "border-border focus:border-foreground"
                    } bg-transparent px-3 text-sm outline-none transition-colors`}
                  />
                  {errors.name ? (
                    <span className="mt-1.5 block text-xs text-destructive">{errors.name}</span>
                  ) : null}
                </label>
              </div>

              <div>
                <label className="block text-start">
                  <span className="mb-1.5 block text-xs text-muted-foreground">{t("phone")} *</span>
                  <input
                    ref={phoneRef}
                    type="tel"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="01012345678"
                    dir="ltr"
                    autoComplete="tel"
                    required
                    className={`h-11 w-full border ${
                      errors.phone
                        ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                        : "border-border focus:border-foreground"
                    } bg-transparent px-3 text-sm outline-none transition-colors`}
                  />
                  {errors.phone ? (
                    <span className="mt-1.5 block text-xs text-destructive">{errors.phone}</span>
                  ) : (
                    <span className="mt-1.5 block text-xs text-muted-foreground">
                      {t("phone_hint")}
                    </span>
                  )}
                </label>
              </div>

              <div>
                <Field
                  label={`${t("email")} (${t("optional") || "اختياري"})`}
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          {/* 02 Delivery Address */}
          <section>
            <p className="eyebrow mb-5">02 — {t("address")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-start sm:col-span-2">
                <span className="mb-1.5 block text-xs text-muted-foreground">
                  {t("governorate")} *
                </span>
                <select
                  ref={govRef}
                  value={form.gov}
                  onChange={(e) => handleFieldChange("gov", e.target.value)}
                  className={`h-11 w-full border ${
                    errors.gov
                      ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                      : "border-border focus:border-foreground"
                  } bg-transparent px-3 text-sm outline-none transition-colors`}
                  required
                >
                  <option value="">{t("choose_governorate")}</option>
                  {rates.map((r) => (
                    <option key={r.governorate} value={r.governorate}>
                      {pick(r.name_ar, r.governorate)} — {price(r.fee)}
                    </option>
                  ))}
                </select>
                {errors.gov ? (
                  <span className="mt-1.5 block text-xs text-destructive">{errors.gov}</span>
                ) : null}
              </label>

              <div className="sm:col-span-2">
                <label className="block text-start">
                  <span className="mb-1.5 block text-xs text-muted-foreground">{t("city")} *</span>
                  <input
                    ref={cityRef}
                    value={form.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    required
                    className={`h-11 w-full border ${
                      errors.city
                        ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                        : "border-border focus:border-foreground"
                    } bg-transparent px-3 text-sm outline-none transition-colors`}
                  />
                  {errors.city ? (
                    <span className="mt-1.5 block text-xs text-destructive">{errors.city}</span>
                  ) : null}
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-start">
                  <span className="mb-1.5 block text-xs text-muted-foreground">
                    {t("street")} *
                  </span>
                  <input
                    ref={streetRef}
                    value={form.street}
                    onChange={(e) => handleFieldChange("street", e.target.value)}
                    autoComplete="street-address"
                    required
                    className={`h-11 w-full border ${
                      errors.street
                        ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                        : "border-border focus:border-foreground"
                    } bg-transparent px-3 text-sm outline-none transition-colors`}
                  />
                  {errors.street ? (
                    <span className="mt-1.5 block text-xs text-destructive">{errors.street}</span>
                  ) : null}
                </label>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label={t("notes")}
                  value={form.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>
          </section>

          {/* 03 Gift Options */}
          <section>
            <p className="eyebrow mb-5">03 — {t("gift_options")}</p>
            <div className="divide-y divide-border border-y border-border">
              {[
                { on: wrap, set: setWrap, label: t("gift_wrap"), fee: GIFT_WRAP_FEE },
                { on: card, set: setCard, label: t("greeting_card"), fee: GREETING_CARD_FEE },
              ].map((o) => (
                <label
                  key={o.label}
                  className="flex cursor-pointer items-center justify-between py-4 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={o.on}
                      onChange={(e) => o.set(e.target.checked)}
                      className="size-4 accent-[var(--rose-deep)]"
                    />
                    {o.label}
                  </span>
                  <span className="text-muted-foreground">+ {price(o.fee)}</span>
                </label>
              ))}
            </div>
            {card ? (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                placeholder={t("gift_message_ph")}
                className="mt-4 h-24 w-full border border-border bg-transparent p-3 text-sm outline-none focus:border-foreground"
              />
            ) : null}
          </section>

          {/* 04 Payment Method */}
          <section>
            <p className="eyebrow mb-5">04 — {t("payment")}</p>
            <div className="border border-border p-4">
              <label className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="pay"
                    defaultChecked
                    className="size-4 accent-[var(--rose-deep)]"
                  />
                  <span>
                    <strong className="font-normal">{t("cod")}</strong>
                    <span className="block text-xs text-muted-foreground">{t("cod_d")}</span>
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="md:col-span-4 md:col-start-9">
          <div className="border-t border-foreground pt-6 md:sticky md:top-32">
            <p className="eyebrow mb-4">{t("summary")}</p>
            <ul className="space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-3">
                  <span className="min-w-0">
                    {pick(i.nameAr, i.nameEn)} × {formatNumber(i.qty, lang)}
                    {i.variantAr ? (
                      <span className="block text-xs text-muted-foreground">
                        {pick(i.variantAr, i.variantEn)}
                      </span>
                    ) : null}
                    {i.engraving ? (
                      <span className="block text-xs text-muted-foreground">
                        {t("engraving")}: «{i.engraving}»
                      </span>
                    ) : null}
                  </span>
                  <Price amount={(i.unitPrice + i.engravingPrice) * i.qty} />
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt>{t("subtotal")}</dt>
                <dd>
                  <Price amount={subtotal} />
                </dd>
              </div>
              {extras > 0 ? (
                <div className="flex justify-between">
                  <dt>{t("extras")}</dt>
                  <dd>
                    <Price amount={extras} />
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt>{t("shipping")}</dt>
                <dd>
                  {ship === null ? (
                    <span className="text-muted-foreground">{t("choose_governorate")}</span>
                  ) : ship === 0 ? (
                    t("free")
                  ) : (
                    <Price amount={ship} />
                  )}
                </dd>
              </div>
              {rate ? (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <dt>{t("eta")}</dt>
                  <dd>
                    {rate.eta_days} {t("days")}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
                <dt>{t("total")}</dt>
                <dd>{total === null ? "—" : <Price amount={total} />}</dd>
              </div>
            </dl>

            {/* Note: Never disabled because of validation! Only disabled while busy/submitting */}
            <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={placeOrder}>
              {busy ? t("placing") : t("place_order")}
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">{t("cod_d")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
