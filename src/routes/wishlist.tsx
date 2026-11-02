import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/queries";
import { useWishlist } from "@/lib/wishlist";
import { useI18n } from "@/lib/i18n";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "المفضلة · Wishlist — ذِكرى Zekra" },
      { name: "description", content: "The gifts you've saved for later." },
      { property: "og:title", content: "Wishlist — Zekra" },
      { property: "og:description", content: "Gifts saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: WishlistPage,
});

function WishlistPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const { ids } = useWishlist();
  const { t } = useI18n();
  const list = data.products.filter((p) => ids.has(p.id));
  return (
    <div className="container-ed pt-12 md:pt-20">
      <h1 className="mb-12 text-5xl md:text-7xl">{t("wishlist_title")}</h1>
      {list.length === 0 ? (
        <div>
          <p className="font-display text-2xl text-muted-foreground">{t("wishlist_empty")}</p>
          <Button variant="outline" className="mt-8" asChild>
            <Link to="/shop">{t("cart_continue")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
