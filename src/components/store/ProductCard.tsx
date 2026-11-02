import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { resolveImage } from "@/lib/images";
import { minPrice, productStock, type Product } from "@/lib/queries";
import { Price } from "./Price";
import { WishlistButton } from "./WishlistButton";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
  tall,
}: {
  product: Product;
  className?: string;
  tall?: boolean;
}) {
  const { pick, t } = useI18n();
  const stock = productStock(product);
  const [img1, img2] = product.images;
  return (
    <article className={cn("group relative", className)}>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            tall ? "aspect-[3/4.4]" : "aspect-[4/5]",
          )}
        >
          <img
            src={resolveImage(img1)}
            alt={pick(product.name_ar, product.name_en)}
            loading="lazy"
            width={1024}
            height={1280}
            className="img-reveal absolute inset-0 size-full object-cover transition-opacity duration-700"
          />
          {img2 ? (
            <img
              src={resolveImage(img2)}
              alt=""
              aria-hidden
              loading="lazy"
              width={1024}
              height={1280}
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          ) : null}
          {stock === 0 ? (
            <span className="absolute start-3 top-3 bg-background/90 px-2 py-1 text-[11px] tracking-wide">
              {t("out_of_stock")}
            </span>
          ) : product.compare_at_price ? (
            <span className="absolute start-3 top-3 bg-rose-soft px-2 py-1 text-[11px] tracking-wide text-accent-foreground">
              {t("sale")}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl leading-snug">{pick(product.name_ar, product.name_en)}</h3>
            <Price
              amount={minPrice(product)}
              compareAt={product.compare_at_price}
              className="mt-1 text-sm text-muted-foreground"
            />
          </div>
        </div>
      </Link>
      <WishlistButton
        productId={product.id}
        className="absolute end-2 top-2 bg-background/80 hover:bg-background"
      />
    </article>
  );
}
