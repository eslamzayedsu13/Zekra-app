import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { catalogQuery, productStock } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/store/Price";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { WishlistButton } from "@/components/store/WishlistButton";
import { ProductCard } from "@/components/store/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQuery);
    const product = data.products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { nameAr: product.name_ar, nameEn: product.name_en, desc: product.description_en };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.nameAr} · ${loaderData.nameEn} — ذِكرى Zekra` },
          { name: "description", content: loaderData.desc },
          { property: "og:title", content: `${loaderData.nameEn} — Zekra` },
          { property: "og:description", content: loaderData.desc },
          { property: "og:type", content: "product" },
        ]
      : [{ title: "Unavailable — Zekra" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const product = data.products.find((p) => p.slug === slug)!;
  const { t, pick } = useI18n();
  const { add, setOpen } = useCart();
  const variants = [...product.product_variants].sort((a, b) => a.sort - b.sort);
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? null,
  );
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [engrave, setEngrave] = useState(false);
  const [engraving, setEngraving] = useState("");

  const variant = variants.find((v) => v.id === variantId) ?? null;
  const stock = variant ? variant.stock : variants.length ? 0 : product.stock;
  const unit = product.price + (variant?.price_delta ?? 0);
  const engrPrice = engrave && engraving.trim() ? product.engraving_price : 0;
  const category = data.categories.find((c) => c.id === product.category_id);
  const related = data.products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);
  const totalStock = productStock(product);

  const onAdd = () => {
    if (stock <= 0) return;
    add({
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      nameAr: product.name_ar,
      nameEn: product.name_en,
      variantAr: variant?.name_ar ?? null,
      variantEn: variant?.name_en ?? null,
      image: product.images[0] ?? "",
      unitPrice: unit,
      engraving: engrave ? engraving.trim().slice(0, 24) : "",
      engravingPrice: engrPrice,
      qty,
      maxQty: stock,
    });
    toast(t("added_to_cart"));
    setOpen(true);
  };

  return (
    <>
      <div className="container-ed pt-6 text-xs text-muted-foreground">
        <Link to="/" className="link-draw">
          {t("home")}
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" search={{ cat: category?.slug }} className="link-draw">
          {category ? pick(category.name_ar, category.name_en) : t("shop_all")}
        </Link>
      </div>
      <div className="container-ed grid gap-10 pt-6 md:grid-cols-12 md:gap-12 md:pt-10">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div
            className="flex snap-x snap-mandatory overflow-x-auto md:block md:overflow-visible"
            aria-label="gallery"
          >
            {product.images.map((img, i) => (
              <img
                key={img + i}
                src={resolveImage(img)}
                alt={i === 0 ? pick(product.name_ar, product.name_en) : ""}
                width={1024}
                height={1280}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn("aspect-[4/5] w-full shrink-0 snap-center object-cover md:hidden")}
              />
            ))}
            <img
              src={resolveImage(product.images[active])}
              alt={pick(product.name_ar, product.name_en)}
              width={1024}
              height={1280}
              key={active}
              className="img-reveal hidden aspect-[4/5] w-full object-cover md:block"
            />
          </div>
          {product.images.length > 1 ? (
            <div className="mt-4 hidden gap-3 md:flex">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActive(i)}
                  aria-label={`${i + 1}`}
                  aria-current={i === active}
                  className={cn(
                    "w-20 border transition-opacity",
                    i === active
                      ? "border-foreground"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img
                    src={resolveImage(img)}
                    alt=""
                    width={80}
                    height={100}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Buy box */}
        <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl leading-[1.1] md:text-5xl">
              {pick(product.name_ar, product.name_en)}
            </h1>
            <WishlistButton productId={product.id} className="shrink-0 border border-border" />
          </div>
          <Price amount={unit} compareAt={product.compare_at_price} className="mt-4 text-xl" />
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {pick(product.description_ar, product.description_en)}
          </p>

          {variants.length ? (
            <fieldset className="mt-8">
              <legend className="eyebrow mb-3">{t("choose_variant")}</legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock === 0}
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    aria-pressed={v.id === variantId}
                    className={cn(
                      "h-10 border px-4 text-sm transition-colors disabled:line-through disabled:opacity-40",
                      v.id === variantId
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground",
                    )}
                  >
                    {pick(v.name_ar, v.name_en)}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {product.allow_engraving ? (
            <div className="mt-8 border-t border-border pt-6">
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={engrave}
                    onChange={(e) => setEngrave(e.target.checked)}
                    className="size-4 accent-[var(--rose-deep)]"
                  />
                  {t("engraving")}
                </span>
                <span className="text-muted-foreground">
                  {product.engraving_price > 0 ? (
                    <>
                      + <Price amount={product.engraving_price} />
                    </>
                  ) : (
                    t("engraving_free")
                  )}
                </span>
              </label>
              {engrave ? (
                <div className="mt-3">
                  <input
                    value={engraving}
                    maxLength={24}
                    onChange={(e) => setEngraving(e.target.value)}
                    placeholder="M & S · 12.10.2026"
                    className="h-11 w-full border border-border bg-transparent px-3 font-display text-lg outline-none focus:border-foreground"
                    aria-label={t("engraving")}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">{t("engraving_hint")}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            <QuantityStepper value={qty} max={Math.max(1, Math.min(20, stock))} onChange={setQty} />
            <Button
              size="lg"
              className="flex-1"
              onClick={onAdd}
              disabled={stock <= 0 || (engrave && !engraving.trim())}
            >
              {stock <= 0 ? t("out_of_stock") : t("add_to_cart")}
            </Button>
          </div>
          <p
            className={cn(
              "mt-3 text-xs",
              stock > 0 && stock <= 5 ? "text-rose-deep" : "text-muted-foreground",
            )}
          >
            {totalStock === 0
              ? t("out_of_stock")
              : stock > 0 && stock <= 5
                ? t("low_stock")
                : stock > 0
                  ? t("in_stock")
                  : t("out_of_stock")}
          </p>
          <p className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            {t("shipping_note")}
          </p>
        </div>
      </div>

      {related.length ? (
        <section className="container-ed mt-28">
          <h2 className="mb-10 text-3xl md:text-4xl">{t("related")}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
