import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import type { DictKey } from "@/lib/dict";
import { cn } from "@/lib/utils";

export const ORDER_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
export type OrderStatus = (typeof ORDER_FLOW)[number] | "cancelled";

export function statusKey(s: string) {
  return `st_${s}` as DictKey;
}

export function StatusTimeline({
  status,
  events,
}: {
  status: OrderStatus;
  events: { status: string; created_at: string }[];
}) {
  const { t, lang } = useI18n();
  if (status === "cancelled") {
    return (
      <p className="border border-destructive/40 px-4 py-3 text-sm text-destructive">
        {t("st_cancelled")}
      </p>
    );
  }
  const current = ORDER_FLOW.indexOf(status);
  return (
    <ol className="relative space-y-6 border-s border-border ps-6">
      {ORDER_FLOW.map((s, i) => {
        const ev = events.find((e) => e.status === s);
        const done = i <= current;
        return (
          <li key={s} className="relative">
            <span
              className={cn(
                "absolute -start-[29px] top-1.5 size-2.5 rounded-full border",
                done ? "border-rose-deep bg-rose-deep" : "border-border bg-background",
              )}
            />
            <p className={cn("text-sm", !done && "text-muted-foreground")}>{t(statusKey(s))}</p>
            {ev ? (
              <p className="text-xs text-muted-foreground">{formatDateTime(ev.created_at, lang)}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
