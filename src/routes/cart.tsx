import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { CartLines, FreeShippingNote } from "@/components/store/CartDrawer";
import { Price } from "@/components/store/Price";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "السلة · Your bag — ذِكرى Zekra" },
      { name: "description", content: "Review the gifts in your bag before checkout." },
      { property: "og:title", content: "Your bag — Zekra" },
      { property: "og:description", content: "Review your gifts before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal } = useCart();
  const { t } = useI18n();
  return (
    <div className="container-ed pt-12 md:pt-20">
      <h1 className="text-5xl md:text-7xl">{t("cart_title")}</h1>
      {items.length === 0 ? (
        <div className="py-20">
          <p className="font-display text-2xl text-muted-foreground">{t("cart_empty")}</p>
          <Button variant="outline" className="mt-8" asChild>
            <Link to="/shop">{t("cart_continue")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 md:grid-cols-12">
          <div className="border-t border-border md:col-span-7">
            <CartLines />
          </div>
          <aside className="space-y-5 border-t border-foreground pt-6 md:col-span-4 md:col-start-9">
            <div className="flex justify-between text-sm">
              <span>{t("subtotal")}</span>
              <Price amount={subtotal} />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("shipping")}</span>
              <span>{t("shipping_calc")}</span>
            </div>
            <FreeShippingNote />
            <Button size="lg" className="w-full" asChild>
              <Link to="/checkout">{t("cart_checkout")}</Link>
            </Button>
            <Link to="/shop" className="link-draw block text-center text-sm">
              {t("cart_continue")}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
