import { Minus, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

export function QuantityStepper({
  value,
  onChange,
  max,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  size?: "sm" | "md";
}) {
  const { t, lang } = useI18n();
  const h = size === "sm" ? "h-8" : "h-11";
  return (
    <div
      className={`inline-flex ${h} items-center border border-border`}
      role="group"
      aria-label={t("quantity")}
    >
      <button
        type="button"
        className={`${h} w-9 grid place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="−"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {formatNumber(value, lang)}
      </span>
      <button
        type="button"
        className={`${h} w-9 grid place-items-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="+"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
