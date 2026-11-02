import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

export function Splash() {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Skip on checkout, order confirmation, and track pages
    const path = location.pathname;
    if (path.startsWith("/checkout") || path.startsWith("/order") || path.startsWith("/track")) {
      return;
    }

    // Check if shown once per session
    try {
      const alreadyShown = window.sessionStorage.getItem("zekra_splash_shown");
      if (alreadyShown) return;
      window.sessionStorage.setItem("zekra_splash_shown", "1");
    } catch {
      return;
    }

    setShow(true);

    // Fade out after ~1.3s so total duration is ~1.6s
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1300);

    const endTimer = setTimeout(() => {
      setShow(false);
    }, 1650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname]);

  if (!show) return null;

  const letters = ["Z", "E", "K", "R", "A"];

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background transition-opacity duration-350 pointer-events-none select-none ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center">
        {/* Animated Letters */}
        <div className="flex items-center text-4xl md:text-5xl font-['Cormorant_Garamond',serif] tracking-[0.35em] text-foreground font-light ps-[0.35em]">
          {letters.map((char, i) => (
            <span
              key={i}
              className="inline-block [animation:splash-letter_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Drawing Rose Accent Line */}
        <div className="mt-4 h-[1.5px] w-24 overflow-hidden bg-rose-soft/40 relative">
          <div className="size-full bg-rose-deep [animation:splash-line_0.7s_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:480ms]" />
        </div>
      </div>
    </div>
  );
}
