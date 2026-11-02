import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Globe, Heart, Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

import { Logo, Wordmark } from "./Logo";
export { Logo, Wordmark };

export function Header() {
  const { t, lang, setLang, dir, pick } = useI18n();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [isFading, setIsFading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sheet on route change
  useEffect(() => {
    setMenu(false);
    setDesktopSearchOpen(false);
  }, [location.pathname]);

  const links = [
    { num: "01", to: "/shop" as const, label: t("nav_shop") },
    { num: "02", to: "/about" as const, label: t("nav_story") },
    { num: "03", to: "/contact" as const, label: t("nav_contact") },
  ];

  const categories = [
    { cat: "engagement", label: pick("للخطوبة", "Engagement") },
    { cat: "keepsakes", label: pick("تذكارات", "Keepsakes") },
    { cat: "jewelry", label: pick("مجوهرات", "Jewelry") },
    { cat: "home", label: pick("للبيت", "Home") },
    { cat: "accessories", label: pick("إكسسوارات", "Accessories") },
  ];

  const handleToggleLang = () => {
    setIsFading(true);
    setTimeout(() => {
      setLang(lang === "ar" ? "en" : "ar");
      setIsFading(false);
    }, 150);
  };

  const submitDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDesktopSearchOpen(false);
    navigate({ to: "/shop", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-[3px]">
      {/* Top Banner */}
      <div className="bg-ink py-2 text-center text-[11px] tracking-wide text-primary-foreground">
        {t("shipping_note")}
      </div>

      <div className="container-ed grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
        {/* Left: Mobile Hamburger or Desktop Navigation */}
        <div className="flex items-center gap-2">
          <button
            className="grid min-h-[44px] min-w-[44px] place-items-center md:hidden text-foreground hover:text-rose-deep transition-colors"
            onClick={() => setMenu(true)}
            aria-label={t("nav_menu")}
          >
            <Menu className="size-5 stroke-[1.5]" />
          </button>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-draw"
                activeProps={{ "aria-current": "page" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Brand Wordmark */}
        <Link to="/" aria-label="ZEKRA" className="flex justify-center">
          <Logo size="md" />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {/* Mobile Language Pill (44px min tap target, thin border) */}
          <button
            onClick={handleToggleLang}
            aria-label={lang === "ar" ? "Switch to English" : "التغيير إلى العربية"}
            className={`flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium tracking-wide transition-opacity duration-150 md:hidden ${
              isFading ? "opacity-30" : "opacity-100"
            }`}
          >
            <Globe className="size-3.5 stroke-[1.5] text-muted-foreground" />
            <span>{lang === "ar" ? "EN" : "ع"}</span>
          </button>

          {/* Desktop Language Switch */}
          <button
            onClick={handleToggleLang}
            className={`link-draw me-2 hidden text-xs tracking-wide md:inline transition-opacity duration-150 ${
              isFading ? "opacity-30" : "opacity-100"
            }`}
            lang={lang === "ar" ? "en" : "ar"}
          >
            {t("lang_switch")}
          </button>

          {/* Desktop Search Button */}
          <button
            className="hidden md:grid size-10 place-items-center text-foreground hover:text-rose-deep transition-colors"
            onClick={() => setDesktopSearchOpen((s) => !s)}
            aria-label={t("search_placeholder")}
          >
            <Search className="size-[18px] stroke-[1.25]" />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="hidden md:grid size-10 place-items-center text-foreground hover:text-rose-deep transition-colors"
            aria-label={t("nav_wishlist")}
          >
            <Heart className="size-[18px] stroke-[1.25]" />
          </Link>

          {/* Cart Bag Button (opens drawer on mobile <= 768px, navigates to /cart on desktop > 768px) */}
          <button
            className="relative grid min-h-[44px] min-w-[44px] place-items-center text-foreground hover:text-rose-deep transition-colors"
            onClick={(e) => {
              if (typeof window !== "undefined" && window.innerWidth <= 768) {
                e.preventDefault();
                setOpen(true);
              } else {
                navigate({ to: "/cart" });
              }
            }}
            aria-label={t("nav_cart")}
          >
            <ShoppingBag className="size-[19px] stroke-[1.3]" />
            {count > 0 ? (
              <span className="absolute end-1 top-1.5 grid min-w-4 place-items-center rounded-full bg-rose-deep px-1 text-[10px] leading-4 text-primary-foreground font-medium">
                {formatNumber(count, lang)}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Desktop Search Dropdown Form */}
      {desktopSearchOpen ? (
        <form
          onSubmit={submitDesktopSearch}
          className="border-t border-border bg-background animate-in slide-in-from-top-2 duration-200"
        >
          <div className="container-ed flex h-14 items-center gap-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search_placeholder")}
              className="h-full flex-1 bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground"
              aria-label={t("search_placeholder")}
            />
            <button
              type="button"
              onClick={() => setDesktopSearchOpen(false)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </form>
      ) : null}

      {/* Mobile Side Menu Sheet */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent
          side={dir === "rtl" ? "right" : "left"}
          className="flex h-full w-[88%] max-w-sm flex-col justify-between bg-background p-0"
          dir={dir}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <SheetTitle className="p-0 m-0 text-start">
              <Link to="/" onClick={() => setMenu(false)} aria-label="ZEKRA">
                <Logo size="sm" />
              </Link>
            </SheetTitle>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Large Numbered Links (Staggered Animation) */}
            <nav className="flex flex-col divide-y divide-border/60 border-y border-border/60">
              {links.map((l, idx) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenu(false)}
                  className="flex items-baseline justify-between py-4 group transition-all"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="font-display text-3xl group-hover:text-rose-deep transition-colors">
                    {l.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground/70">{l.num}</span>
                </Link>
              ))}
            </nav>

            {/* Category Chips */}
            <div>
              <p className="eyebrow mb-3">{t("nav_collections")}</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.cat}
                    to="/shop"
                    search={{ cat: c.cat }}
                    onClick={() => setMenu(false)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground bg-paper"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Dedicated Icon Rows */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              {/* Track Order (replaces Account) */}
              <Link
                to="/track"
                onClick={() => setMenu(false)}
                className="flex items-center gap-3.5 rounded p-2 text-sm text-foreground hover:bg-paper transition-colors"
              >
                <Truck className="size-4 stroke-[1.5] text-rose-deep" />
                <span>{t("track_order")}</span>
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                onClick={() => setMenu(false)}
                className="flex items-center gap-3.5 rounded p-2 text-sm text-foreground hover:bg-paper transition-colors"
              >
                <Heart className="size-4 stroke-[1.5]" />
                <span>{t("nav_wishlist")}</span>
              </Link>

              {/* Bag Row with count */}
              <button
                onClick={() => {
                  setMenu(false);
                  setOpen(true);
                }}
                className="flex w-full items-center justify-between rounded p-2 text-sm text-foreground hover:bg-paper transition-colors"
              >
                <span className="flex items-center gap-3.5">
                  <ShoppingBag className="size-4 stroke-[1.5]" />
                  <span>{t("nav_cart")}</span>
                </span>
                {count > 0 ? (
                  <span className="rounded-full bg-rose-deep px-2 py-0.5 text-xs text-white">
                    {formatNumber(count, lang)}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Footer with Segmented Language Toggle & Safe Area Padding */}
          <div className="border-t border-border px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-paper/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{pick("اللغة", "Language")}</span>
              <div className="inline-flex rounded-full border border-border p-0.5 bg-background text-xs">
                <button
                  onClick={() => {
                    if (lang !== "ar") handleToggleLang();
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    lang === "ar"
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  عربي
                </button>
                <button
                  onClick={() => {
                    if (lang !== "en") handleToggleLang();
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    lang === "en"
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground/80 flex items-center justify-between">
              <span>القاهرة، مصر · Cairo, Egypt</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
