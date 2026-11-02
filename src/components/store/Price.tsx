import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Price({
  amount,
  compareAt,
  className,
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
}) {
  const { price } = useI18n();
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span>{price(amount)}</span>
      {compareAt && compareAt > amount ? (
        <s className="text-[0.85em] text-muted-foreground">{price(compareAt)}</s>
      ) : null}
    </span>
  );
}
