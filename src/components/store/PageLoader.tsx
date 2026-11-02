import { useEffect, useState, useRef } from "react";

interface PageLoaderProps {
  /** If passed, controls visibility externally; otherwise shows automatically with 250ms delay */
  active?: boolean;
  className?: string;
}

export function PageLoader({ active = true, className = "" }: PageLoaderProps) {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const showTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | undefined;
    let minDurationTimer: ReturnType<typeof setTimeout> | undefined;

    if (active) {
      setFadingOut(false);
      // Only appear if loading takes over ~250ms
      delayTimer = setTimeout(() => {
        setVisible(true);
        showTimeRef.current = Date.now();
      }, 250);
    } else {
      if (showTimeRef.current) {
        const elapsed = Date.now() - showTimeRef.current;
        const remaining = Math.max(0, 400 - elapsed); // Stay at least ~400ms once shown
        minDurationTimer = setTimeout(() => {
          setFadingOut(true);
          const fadeTimer = setTimeout(() => {
            setVisible(false);
            showTimeRef.current = null;
          }, 300);
          return () => clearTimeout(fadeTimer);
        }, remaining);
      } else {
        setVisible(false);
      }
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (minDurationTimer) clearTimeout(minDurationTimer);
    };
  }, [active]);

  return (
    <>
      {/* Fast top navigation progress bar */}
      {active ? (
        <div className="fixed inset-x-0 top-0 z-[9999] h-[2.5px] bg-transparent pointer-events-none">
          <div className="h-full bg-rose-deep [animation:top-progress_2s_ease-out_forwards]" />
        </div>
      ) : null}

      {/* Full-screen / container branded loader overlay */}
      {visible ? (
        <div
          className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-300 ${
            fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
          } ${className}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center">
            {/* ZEKRA Wordmark */}
            <span
              className="font-['Cormorant_Garamond',serif] text-3xl md:text-4xl uppercase tracking-[0.35em] text-foreground font-light select-none motion-safe:[animation:letter-breathe_2s_ease-in-out_infinite]"
              style={{ paddingInlineStart: "0.35em" }}
            >
              ZEKRA
            </span>

            {/* Looping Rose Accent Line */}
            <div className="mt-3 h-[1.5px] w-20 overflow-hidden bg-rose-soft relative">
              <div className="size-full bg-rose-deep motion-safe:[animation:line-draw-loop_1.6s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
