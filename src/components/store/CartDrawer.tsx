import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { resolveImage } from "@/lib/images";
import { formatNumber } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, lineTotal } from "@/lib/pricing";
import { Price } from "./Price";
import { QuantityStepper } from "./QuantityStepper";
import { cn } from "@/lib/utils";

export function CartLines({ compact }: { compact?: boolean }) {
  const { items, setQty, remove } = useCart();
  const { pick, t, price } = useI18n();
  return (
    <ul className="divide-y divide-border">
      {items.map((i) => (
        <li key={i.key} className="flex gap-4 py-5">
          <Link to="/product/$slug" params={{ slug: i.slug }} className="shrink-0">
            <img
              src={resolveImage(i.image)}
              alt=""
              width={compact ? 80 : 112}
              height={compact ? 100 : 140}
              loading="lazy"
              className={compact ? "h-[100px] w-20 object-cover" : "h-[140px] w-28 object-cover"}
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg leading-snug">{pick(i.nameAr, i.nameEn)}</p>
                {i.variantAr ? (
                  <p className="text-xs text-muted-foreground">{pick(i.variantAr, i.variantEn)}</p>
                ) : null}
                {i.engraving ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("engraving")}: «{i.engraving}»{" "}
                    {i.engravingPrice > 0
                      ? `+ ${price(i.engravingPrice)}`
                      : `(${t("engraving_free")})`}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(i.key)}
                className="grid min-h-[44px] min-w-[44px] place-items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("remove")}
              >
                <X className="size-4 stroke-[1.25]" />
              </button>
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <QuantityStepper
                size="sm"
                value={i.qty}
                max={Math.min(20, i.maxQty)}
                onChange={(n) => setQty(i.key, n)}
              />
              <Price amount={lineTotal(i)} className="text-sm" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FreeShippingNote() {
  const { subtotal } = useCart();
  const { t, price } = useI18n();
  const left = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <div className="text-xs text-muted-foreground">
      <p>{left > 0 ? t("free_ship_left", { amount: price(left) }) : t("free_ship_ok")}</p>
      <div className="mt-2 h-px w-full bg-border">
        <div
          className="h-px bg-rose-deep transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { open, setOpen, items, subtotal, count, setQty, remove } = useCart();
  const { t, dir, lang, pick, price } = useI18n();

  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation lifecycle
  useEffect(() => {
    if (open) {
      setIsRendered(true);
      const rId = requestAnimationFrame(() => {
        setIsActive(true);
      });
      return () => cancelAnimationFrame(rId);
    } else {
      setIsActive(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 310);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on desktop resize (> 768px)
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth > 768 && open) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, setOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  // Focus management & initial focus
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === "function"
      ) {
        previousActiveElement.current.focus();
      }
    }
  }, [open]);

  // Focus trap & ESC key listener
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (!mounted || !isRendered) return null;

  const isRtl = dir === "rtl";

  return createPortal(
    <>
      <style>{`
        @keyframes drawerItemEntry {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .drawer-stagger-item {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Backdrop: semi-transparent dark overlay with light blur */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex bg-black/45 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          isRtl ? "justify-start" : "justify-end",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-hidden={!open}
      >
        {/* Drawer container: slides in from right (left in RTL), half screen width, rounded inner corners, soft shadow */}
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("cart_title")}
          dir={dir}
          className={cn(
            "relative flex h-full flex-col bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:transform-none border-border overflow-hidden",
            "w-[clamp(300px,50vw,85vw)]",
            isRtl ? "rounded-r-2xl border-e" : "rounded-l-2xl border-s",
            isRtl
              ? isActive
                ? "translate-x-0"
                : "-translate-x-full"
              : isActive
                ? "translate-x-0"
                : "translate-x-full",
          )}
        >
          {/* Header: "Cart" title, item count badge, and a close (X) button */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl sm:text-2xl font-normal text-foreground">
                {t("cart_title")}
              </h2>
              {count > 0 ? (
                <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-rose-deep px-1.5 text-xs font-semibold text-white tabular-nums">
                  {formatNumber(count, lang)}
                </span>
              ) : null}
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setOpen(false)}
              className="grid min-h-[44px] min-w-[44px] place-items-center text-muted-foreground hover:text-foreground transition-colors -me-2 rounded-full"
              aria-label={pick("إغلاق السلة", "Close cart")}
            >
              <X className="size-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Body: Items or Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="grid size-16 place-items-center rounded-full bg-paper border border-border mb-3.5">
                <ShoppingBag className="size-8 stroke-[1.25] text-rose-deep" />
              </div>
              <p className="font-display text-2xl text-foreground">{t("cart_empty")}</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                {pick(
                  "استكشف هدايانا التذكارية المحفورة والمصنوعة بحب",
                  "Explore our engraved keepsakes crafted with love",
                )}
              </p>
              <Link
                to="/shop"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-paper px-6 py-2 text-sm font-medium text-foreground hover:border-foreground hover:bg-background transition-colors"
              >
                {t("cart_continue")}
              </Link>
            </div>
          ) : (
            <>
              {/* Independently scrolling items list */}
              <div className="flex-1 overflow-y-auto px-5 divide-y divide-border/60">
                {items.map((i, idx) => (
                  <div
                    key={i.key}
                    className="drawer-stagger-item flex gap-3.5 py-4 transition-all duration-300 ease-out"
                    style={{
                      animation: "drawerItemEntry 300ms cubic-bezier(0.32, 0.72, 0, 1) backwards",
                      animationDelay: `${Math.min(idx * 50, 250)}ms`,
                    }}
                  >
                    {/* Thumbnail */}
                    <Link
                      to="/product/$slug"
                      params={{ slug: i.slug }}
                      onClick={() => setOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={resolveImage(i.image)}
                        alt=""
                        width={76}
                        height={96}
                        loading="lazy"
                        className="h-[96px] w-[76px] rounded-md object-cover border border-border/50 bg-paper"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <Link
                            to="/product/$slug"
                            params={{ slug: i.slug }}
                            onClick={() => setOpen(false)}
                            className="min-w-0 flex-1"
                          >
                            <p className="font-display text-base font-normal leading-snug line-clamp-1 hover:text-rose-deep transition-colors">
                              {pick(i.nameAr, i.nameEn)}
                            </p>
                          </Link>

                          {/* Remove button: min 44px tap target */}
                          <button
                            type="button"
                            onClick={() => remove(i.key)}
                            className="grid min-h-[44px] min-w-[44px] -me-2 -mt-2 place-items-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            aria-label={t("remove")}
                          >
                            <X className="size-4 stroke-[1.5]" />
                          </button>
                        </div>

                        {i.variantAr ? (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {pick(i.variantAr, i.variantEn)}
                          </p>
                        ) : null}

                        {i.engraving ? (
                          <p className="mt-0.5 text-xs text-muted-foreground/90 line-clamp-1">
                            {t("engraving")}: «{i.engraving}»{" "}
                            {i.engravingPrice > 0
                              ? `+ ${price(i.engravingPrice)}`
                              : `(${t("engraving_free")})`}
                          </p>
                        ) : null}
                      </div>

                      {/* Quantity Stepper & Price Row */}
                      <div className="flex items-center justify-between pt-2">
                        <div
                          className="inline-flex h-9 items-center border border-border rounded"
                          role="group"
                          aria-label={t("quantity")}
                        >
                          <button
                            type="button"
                            className="grid min-h-[44px] min-w-[44px] -m-[7px] place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            onClick={() => setQty(i.key, i.qty - 1)}
                            disabled={i.qty <= 1}
                            aria-label="−"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span
                            className="w-7 text-center text-xs font-medium tabular-nums"
                            aria-live="polite"
                          >
                            {formatNumber(i.qty, lang)}
                          </span>
                          <button
                            type="button"
                            className="grid min-h-[44px] min-w-[44px] -m-[7px] place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                            onClick={() => setQty(i.key, i.qty + 1)}
                            disabled={i.qty >= Math.min(20, i.maxQty)}
                            aria-label="+"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <Price amount={lineTotal(i)} className="text-sm font-medium" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sticky Footer: Subtotal, Primary Checkout button, Secondary View full cart link */}
              <div className="shrink-0 border-t border-border bg-paper/60 px-5 py-4 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <FreeShippingNote />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <Price amount={subtotal} className="font-semibold text-base" />
                </div>

                <div className="space-y-2 pt-1">
                  <Button
                    size="lg"
                    className="w-full min-h-[44px] bg-foreground text-background hover:bg-foreground/90 font-medium"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/checkout">{t("cart_checkout")}</Link>
                  </Button>

                  <Link
                    to="/cart"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] w-full items-center justify-center text-center text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground link-draw transition-colors"
                  >
                    {t("cart_view")}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
