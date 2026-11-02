import { Check, Clock, PackageCheck, Sparkles, Truck, Gift, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format";
import type { OrderStage, StatusHistoryEntry } from "@/lib/order.functions";

interface OrderTrackerProps {
  status: OrderStage;
  stageTimes?: StatusHistoryEntry[];
  className?: string;
}

const STAGES: Array<{
  id: OrderStage;
  titleKey: "stage_1_title" | "stage_2_title" | "stage_3_title" | "stage_4_title";
  descKey: "stage_1_desc" | "stage_2_desc" | "stage_3_desc" | "stage_4_desc";
  icon: typeof PackageCheck;
}> = [
  {
    id: "received",
    titleKey: "stage_1_title",
    descKey: "stage_1_desc",
    icon: PackageCheck,
  },
  {
    id: "preparing",
    titleKey: "stage_2_title",
    descKey: "stage_2_desc",
    icon: Sparkles,
  },
  {
    id: "shipped",
    titleKey: "stage_3_title",
    descKey: "stage_3_desc",
    icon: Truck,
  },
  {
    id: "delivered",
    titleKey: "stage_4_title",
    descKey: "stage_4_desc",
    icon: Gift,
  },
];

export function OrderTracker({ status, stageTimes = [], className = "" }: OrderTrackerProps) {
  const { t, lang } = useI18n();

  const isCancelled = status === "cancelled";
  const currentIndex = isCancelled ? -1 : STAGES.findIndex((s) => s.id === status);

  const getStageTime = (stageId: OrderStage) => {
    const entry = stageTimes.find((e) => e.status === stageId);
    return entry ? formatDateTime(entry.created_at, lang) : null;
  };

  if (isCancelled) {
    return (
      <div
        className={`rounded border border-destructive/30 bg-destructive/5 p-6 text-center ${className}`}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="size-6" />
        </div>
        <h3 className="mt-3 font-display text-2xl text-destructive">
          {t("stage_cancelled_title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("stage_cancelled_desc")}</p>
        {stageTimes.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Clock className="size-3.5" />
            <span>{formatDateTime(stageTimes[stageTimes.length - 1]!.created_at, lang)}</span>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`w-full py-6 ${className}`}>
      {/* Desktop horizontal stepper */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          {/* Background guide line */}
          <div className="absolute top-6 start-8 end-8 h-[2px] bg-border -z-0" />
          {/* Active progress fill line */}
          <div
            className="absolute top-6 start-8 h-[2px] bg-rose-deep transition-all duration-700 -z-0"
            style={{
              width: currentIndex <= 0 ? "0%" : `${(currentIndex / (STAGES.length - 1)) * 92}%`,
            }}
          />

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;
            const time = getStageTime(stage.id);
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className="relative z-10 flex flex-col items-center text-center flex-1 px-2"
              >
                {/* Circle badge */}
                <div
                  className={`size-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-rose-deep text-white shadow-sm"
                      : isCurrent
                        ? "bg-rose-soft text-rose-deep ring-4 ring-rose/30 animate-pulse"
                        : "bg-paper border border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="size-5 stroke-[1.5]" />
                  )}
                </div>

                {/* Stage Info */}
                <h4
                  className={`mt-4 font-display text-lg leading-tight ${
                    isCurrent
                      ? "font-medium text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {t(stage.titleKey)}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  {t(stage.descKey)}
                </p>

                {time ? (
                  <span className="mt-2 text-[11px] text-muted-foreground/80 flex items-center gap-1 font-sans">
                    <Clock className="size-3" />
                    <span>{time}</span>
                  </span>
                ) : (
                  <span className="mt-2 text-[11px] text-transparent select-none">—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical stepper */}
      <div className="md:hidden relative space-y-8 ps-12">
        {/* Background vertical line */}
        <div className="absolute top-4 bottom-4 start-5 w-[2px] bg-border -z-0" />
        {/* Active progress fill line */}
        <div
          className="absolute top-4 start-5 w-[2px] bg-rose-deep transition-all duration-700 -z-0"
          style={{
            height: currentIndex <= 0 ? "0%" : `${(currentIndex / (STAGES.length - 1)) * 88}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const time = getStageTime(stage.id);
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative text-start">
              {/* Badge absolute placed at line */}
              <div
                className={`absolute -start-12 top-0 size-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-rose-deep text-white"
                    : isCurrent
                      ? "bg-rose-soft text-rose-deep ring-4 ring-rose/30 animate-pulse"
                      : "bg-paper border border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : (
                  <Icon className="size-4 stroke-[1.5]" />
                )}
              </div>

              <div>
                <h4
                  className={`font-display text-lg leading-tight ${
                    isCurrent
                      ? "font-medium text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {t(stage.titleKey)}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {t(stage.descKey)}
                </p>
                {time ? (
                  <p className="mt-1.5 text-[11px] text-muted-foreground/80 flex items-center gap-1 font-sans">
                    <Clock className="size-3" />
                    <span>{time}</span>
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
