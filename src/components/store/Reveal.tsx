import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
  clipReveal?: boolean;
}

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  yOffset = 16,
  clipReveal = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion, show immediately
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0"
      } ${className}`}
      style={{
        transform: isVisible ? "none" : `translateY(${yOffset}px)`,
        clipPath: clipReveal
          ? isVisible
            ? "inset(0% 0% 0% 0%)"
            : "inset(8% 0% 8% 0%)"
          : undefined,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
