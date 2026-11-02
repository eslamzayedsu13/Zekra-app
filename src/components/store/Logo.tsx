import { memo } from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LETTERS = ["Z", "E", "K", "R", "A"];

export const Logo = memo(function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-[1.2rem] md:text-[1.35rem]",
    md: "text-[1.5rem] md:text-[1.75rem]",
    lg: "text-[1.85rem] md:text-[2.1rem]",
  }[size];

  return (
    <div
      className={`group inline-flex flex-col items-center justify-center text-center select-none ${className}`}
      dir="ltr"
    >
      {/* Wordmark Letters */}
      <span
        className={`font-['Cormorant_Garamond',serif] font-[500] uppercase text-foreground leading-none tracking-[0.35em] ps-[0.35em] transition-[letter-spacing,padding] duration-[400ms] ease-out md:group-hover:tracking-[0.42em] md:group-hover:ps-[0.42em] flex items-center justify-center ${sizeClasses}`}
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 500,
        }}
      >
        {LETTERS.map((char, index) => (
          <span
            key={index}
            className="animate-logo-letter"
            style={{
              animationDelay: `${index * 70}ms`,
            }}
          >
            {char}
          </span>
        ))}
      </span>

      {/* Centered Dusty-Rose 1px Line (40% width) */}
      <span className="mt-1.5 h-[1px] w-[40%] mx-auto bg-rose-deep/75 block animate-logo-line" />
    </div>
  );
});

// Backward compatible export for existing usages
export const Wordmark = Logo;
