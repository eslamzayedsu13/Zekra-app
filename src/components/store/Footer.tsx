import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";

export function Footer() {
  const { t, lang, setLang, pick } = useI18n();
  const year = new Date().getFullYear();

  const links = [
    { to: "/shop" as const, label: t("nav_shop") },
    { to: "/about" as const, label: t("nav_story") },
    { to: "/contact" as const, label: t("nav_contact") },
  ];

  const handleToggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  return (
    <footer className="mt-24 border-t border-border/80 bg-background text-foreground">
      <div className="container-ed py-14 md:py-18">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-6">
          {/* Brand Logo */}
          <Link to="/" aria-label="ZEKRA" className="inline-flex items-center">
            <Logo size="md" />
          </Link>

          {/* 3 Editorial Links */}
          <nav className="flex items-center gap-7 md:gap-9 text-xs tracking-[0.18em] uppercase">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="link-draw text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Switch & Socials */}
          <div className="flex items-center gap-6">
            {/* Language Switch */}
            <button
              onClick={handleToggleLang}
              aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
              className="text-xs tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground link-draw"
            >
              {lang === "ar" ? "English" : "العربية"}
            </button>

            <span className="h-3 w-px bg-border/80" aria-hidden="true" />

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-muted-foreground">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram"
                className="transition-colors hover:text-foreground"
              >
                <Instagram className="size-4 stroke-[1.25]" />
              </a>
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="WhatsApp"
                className="transition-colors hover:text-foreground"
              >
                <MessageCircle className="size-4 stroke-[1.25]" />
              </a>
            </div>
          </div>
        </div>

        {/* Minimal Hairline & Sub-bar */}
        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] tracking-wider text-muted-foreground/80">
          <span>
            {pick("القاهرة، مصر", "Cairo, Egypt")} · © {year} ZEKRA
          </span>
          <div className="flex items-center gap-4">
            <Link to="/track" className="hover:text-foreground transition-colors">
              {t("track_order")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
