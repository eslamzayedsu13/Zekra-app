import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { catalogQuery, minPrice } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";
import { ProductCard } from "@/components/store/ProductCard";
import { cn } from "@/lib/utils";

const SORTS = ["featured", "newest", "price_asc", "price_desc", "bestselling"] as const;

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  cat: z.string().optional().catch(undefined),
  sort: z.enum(SORTS).optional().catch(undefined),
  min: z.coerce.number().optional().catch(undefined),
  max: z.coerce.number().optional().catch(undefined),
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "المتجر · Shop — ذِكرى Zekra" },
      {
        name: "description",
        content:
          "Browse engagement gifts, keepsakes, jewelry and home rituals. Prices in EGP, delivered across Egypt.",
      },
      { property: "og:title", content: "Shop all gifts — Zekra" },
      {
        property: "og:description",
        content: "Engraved, handmade gifts for couples. Filter by category and price.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Shop,
});

function Shop() {
  const { data } = useSuspenseQuery(catalogQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { t, pick, lang } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sort = search.sort ?? "featured";

  const list = useMemo(() => {
    const q = search.q?.trim().toLowerCase();
    const cat = data.categories.find((c) => c.slug === search.cat);
    let out = data.products.filter((p) => {
      if (cat && p.category_id !== cat.id) return false;
      const price = minPrice(p);
      if (search.min != null && price < search.min) return false;
      if (search.max != null && price > search.max) return false;
      if (q) {
        const hay =
          `${p.name_ar} ${p.name_en} ${p.description_ar} ${p.description_en}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.created_at.localeCompare(a.created_at);
        case "price_asc":
          return minPrice(a) - minPrice(b);
        case "price_desc":
          return minPrice(b) - minPrice(a);
        case "bestselling":
          return b.sales_count - a.sales_count;
        default:
          return Number(b.featured) - Number(a.featured) || b.sales_count - a.sales_count;
      }
    });
    return out;
  }, [data, search, sort]);

  const activeCat = data.categories.find((c) => c.slug === search.cat);
  const hasFilters = !!(search.q || search.cat || search.min != null || search.max != null);

  const Filters = (
    <div className="space-y-10">
      <div>
        <p className="eyebrow mb-4">{t("filter_category")}</p>
        <ul className="space-y-2.5 text-sm">
          <li>
            <Link
              to="/shop"
              search={(s) => ({ ...s, cat: undefined })}
              className={cn("link-draw", !search.cat && "text-rose-deep")}
            >
              {t("shop_all")}
            </Link>
          </li>
          {data.categories.map((c) => (
            <li key={c.id}>
              <Link
                to="/shop"
                search={(s) => ({ ...s, cat: c.slug })}
                className={cn("link-draw", search.cat === c.slug && "text-rose-deep")}
              >
                {pick(c.name_ar, c.name_en)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-4">{t("filter_price")}</p>
        <div className="flex items-center gap-2">
          {(["min", "max"] as const).map((k) => (
            <label key={k} className="flex-1">
              <span className="sr-only">{t(k === "min" ? "filter_min" : "filter_max")}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={t(k === "min" ? "filter_min" : "filter_max")}
                defaultValue={search[k] ?? ""}
                onBlur={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  navigate({ search: (s) => ({ ...s, [k]: v }) });
                }}
                className="h-10 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
              />
            </label>
          ))}
        </div>
      </div>
      {hasFilters ? (
        <button
          onClick={() => navigate({ search: { sort: search.sort } })}
          className="link-draw text-sm text-muted-foreground"
        >
          {t("filter_clear")}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="container-ed pb-10 pt-12 md:pt-20">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{t("shop_title")}</p>
          <h1 className="mt-4 text-5xl md:text-7xl">
            {activeCat ? pick(activeCat.name_ar, activeCat.name_en) : t("shop_all")}
          </h1>
          {search.q ? <p className="mt-3 text-sm text-muted-foreground">«{search.q}»</p> : null}
        </div>
        <div className="flex items-center justify-between gap-4 border-y border-border py-3 md:border-0 md:py-0">
          <button
            className="flex items-center gap-2 text-sm md:hidden"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? (
              <X className="size-4" />
            ) : (
              <SlidersHorizontal className="size-4 stroke-[1.25]" />
            )}{" "}
            {t("filters")}
          </button>
          <span className="text-xs text-muted-foreground">
            {formatNumber(list.length, lang)} {t("results")}
          </span>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("sort")}</span>
            <select
              value={sort}
              onChange={(e) =>
                navigate({
                  search: (s) => ({ ...s, sort: e.target.value as (typeof SORTS)[number] }),
                })
              }
              className="bg-transparent text-sm outline-none"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`sort_${s}` as "sort_featured")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-[200px_1fr] md:gap-14">
        <aside className={cn("md:block", filtersOpen ? "block" : "hidden")}>{Filters}</aside>
        <div>
          {list.length === 0 ? (
            <p className="py-20 font-display text-2xl text-muted-foreground">{t("no_results")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3 lg:gap-x-6">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
