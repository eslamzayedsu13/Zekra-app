import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import hero from "@/assets/hero.jpg";
import story from "@/assets/story.jpg";
import journal from "@/assets/p-journal.jpg";
import box from "@/assets/p-box.jpg";
import necklace from "@/assets/p-necklace.jpg";
import { catalogQuery } from "@/lib/queries";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "@/components/store/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ذِكرى Zekra — هدايا للمخطوبين ومن يحبّون" },
      {
        name: "description",
        content:
          "Engraved ring dishes, couple's journals, star maps and keepsakes — handmade gifts for engaged couples, delivered across Egypt.",
      },
      { property: "og:title", content: "ذِكرى Zekra — Gifts kept by heart" },
      {
        property: "og:description",
        content: "Handmade, engraved gifts for engaged couples in Egypt. Cash on delivery.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: Home,
});

/**
 * Subtle parallax image component for the editorial engraving showcase.
 * Uses lightweight scroll-position tracking to shift the image gently inside its container.
 * Strictly respects prefers-reduced-motion (both initial and dynamic preference changes)
 * and keeps corner rounding to max 12px (rounded-xl).
 */
function ParallaxEngravingImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId: number | null = null;
    let isTicking = false;

    const updateParallax = () => {
      isTicking = false;
      const container = containerRef.current;
      const img = imageRef.current;
      if (!container || !img) return;

      if (mediaQuery.matches) {
        img.style.transform = "none";
        return;
      }

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Only calculate and update transform when the element intersects the viewport
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        const viewportCenter = windowHeight / 2;
        const elementCenter = rect.top + rect.height / 2;
        const distanceFromCenter = elementCenter - viewportCenter;

        // Subtle parallax shift (max ~22px in either direction)
        const shiftY = Math.max(-24, Math.min(24, distanceFromCenter * 0.075));
        img.style.transform = `translate3d(0, ${shiftY.toFixed(1)}px, 0) scale(1.1)`;
      }
    };

    const onScrollOrResize = () => {
      if (!isTicking) {
        isTicking = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    const handleMotionChange = () => {
      if (mediaQuery.matches) {
        if (imageRef.current) {
          imageRef.current.style.transform = "none";
        }
      } else {
        updateParallax();
      }
    };

    // Apply initial state
    if (mediaQuery.matches) {
      if (imageRef.current) {
        imageRef.current.style.transform = "none";
      }
    } else {
      updateParallax();
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-xl bg-muted"
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        loading="lazy"
        width={1600}
        height={900}
        style={{
          transform: "scale(1.1)",
        }}
        className="size-full object-cover will-change-transform"
      />
    </div>
  );
}

function Home() {
  // Ensure catalog data is loaded without altering any query logic
  useSuspenseQuery(catalogQuery);
  const { pick, dir } = useI18n();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  // 3 Curated Collections for the asymmetric editorial section
  const collections = [
    {
      num: "01",
      cat: "engagement",
      name: pick("للخطوبة", "Engagement"),
      img: box,
      aspectClass: "aspect-[3/4]",
      desktopOffsetClass: "md:mt-0",
    },
    {
      num: "02",
      cat: "keepsakes",
      name: pick("تذكارات", "Keepsakes"),
      img: journal,
      aspectClass: "aspect-[2/3]",
      desktopOffsetClass: "md:mt-16",
    },
    {
      num: "03",
      cat: "jewelry",
      name: pick("مجوهرات", "Jewelry"),
      img: necklace,
      aspectClass: "aspect-[3/4]",
      desktopOffsetClass: "md:mt-8",
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* ============================================================
          SECTION 1: HERO
          Full-bleed photo, slow Ken Burns zoom (1 to 1.06 over 12s),
          headline bottom-left (bottom-right in RTL), text-link CTA.
          ============================================================ */}
      <section className="relative w-full h-[84vh] min-h-[580px] max-h-[880px] overflow-hidden bg-ink">
        <figure className="relative size-full">
          <img
            src={hero}
            alt={pick("طبق الخواتم المحفور", "Hand-engraved keepsake dish")}
            width={1920}
            height={1200}
            fetchPriority="high"
            loading="eager"
            className="size-full object-cover object-center animate-ken-burns will-change-transform"
          />
          {/* Subtle cinematic gradient to ensure crisp typographic contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent"
            aria-hidden="true"
          />
        </figure>

        {/* Bottom Headline & Text-link CTA positioned bottom-left (bottom-right in RTL) */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-12 pt-24">
          <div className="container-ed">
            <Reveal yOffset={16} delayMs={100} className="max-w-xl text-start">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.08] text-[#f6f2ea]">
                {pick("حكايتك، محفورة.", "Your story, engraved.")}
              </h1>
              <div className="mt-6">
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-2.5 text-sm md:text-base font-light tracking-wide text-[#f6f2ea]/90 hover:text-white transition-colors link-draw"
                >
                  <span>{pick("تسوّق المجموعات", "Shop collections")}</span>
                  <Arrow className="size-4 stroke-[1.25] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: COLLECTIONS
          3 collections as tall images in a staggered, asymmetric layout
          (horizontal snap-scroll carousel on mobile). Under each image
          only small number (01, 02, 03) and collection name.
          ============================================================ */}
      <section className="container-ed py-24 md:py-36">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-12 md:gap-8 md:overflow-visible">
          {collections.map((c, idx) => (
            <div
              key={c.num}
              className={`shrink-0 w-[78vw] snap-center sm:w-[58vw] md:w-auto md:col-span-4 ${c.desktopOffsetClass}`}
            >
              <Reveal delayMs={idx * 160} yOffset={16} clipReveal>
                <Link
                  to="/shop"
                  search={{ cat: c.cat }}
                  className="group block focus-visible:outline-none"
                >
                  {/* Image container: rounded max 12px, hover scale 1.03 */}
                  <div
                    className={`relative w-full ${c.aspectClass} overflow-hidden rounded-xl bg-muted`}
                  >
                    <img
                      src={c.img}
                      alt={c.name}
                      loading="lazy"
                      width={800}
                      height={1060}
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* Under image: only small number and collection name */}
                  <div className="mt-4 flex items-baseline justify-between px-1">
                    <h2 className="font-display text-xl sm:text-2xl font-light text-foreground transition-colors group-hover:text-rose-deep">
                      {c.name}
                    </h2>
                    <span className="font-mono text-xs tracking-widest text-muted-foreground/75">
                      {c.num}
                    </span>
                  </div>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 3: ENGRAVING MOMENT
          Large close-up image, subtle parallax, single line:
          "Names. Dates. Forever." / "أسماء. تواريخ. للأبد.",
          plus link "Personalize yours".
          ============================================================ */}
      <section className="container-ed pb-24 md:pb-36">
        <Reveal yOffset={16} clipReveal>
          <div className="group block">
            <ParallaxEngravingImage
              src={story}
              alt={pick("تفاصيل الحفر اليدوي", "Close-up of hand engraving")}
            />
          </div>
        </Reveal>

        <div className="mt-12 md:mt-16 text-center">
          <Reveal yOffset={16} delayMs={150}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
              {pick("أسماء. تواريخ. للأبد.", "Names. Dates. Forever.")}
            </h2>
          </Reveal>

          <Reveal yOffset={16} delayMs={250}>
            <div className="mt-5">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2.5 text-sm md:text-base font-light tracking-wide text-foreground/80 hover:text-foreground transition-colors link-draw"
              >
                <span>{pick("صمّم قطعتك", "Personalize yours")}</span>
                <Arrow className="size-4 stroke-[1.25] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: TRUST STRIP
          One thin line in tiny text, "Delivery across Egypt · Cash on delivery"
          Bounded by 1px hairline dividers.
          ============================================================ */}
      <section className="border-y border-border/80 py-6 bg-paper/30">
        <div className="container-ed">
          <p className="text-center font-sans text-[11px] sm:text-xs md:text-sm font-light tracking-[0.22em] uppercase text-muted-foreground">
            {pick(
              "توصيل لكل محافظات مصر · الدفع عند الاستلام",
              "Delivery across Egypt · Cash on delivery",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
