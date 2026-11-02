import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { lookupOrderFn } from "@/lib/order.functions";
import { OrderTracker } from "@/components/store/OrderTracker";
import { Price } from "@/components/store/Price";
import { Button } from "@/components/ui/button";
import { normalizeDigits, normalizeEgyptianPhone, formatDate } from "@/lib/format";
import { getRecentOrders, type RecentOrder } from "@/lib/recent-orders";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "تتبّع الطلب · Track order — ذِكرى Zekra" },
      { name: "description", content: "Track your Zekra order status and delivery updates." },
      { property: "og:title", content: "Track order — Zekra" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t, pick, lang, dir } = useI18n();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [activeQuery, setActiveQuery] = useState<{
    code: string;
    phone?: string;
    token?: string;
  } | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    setRecentOrders(getRecentOrders());
  }, []);

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["track-order-lookup", activeQuery?.code, activeQuery?.phone, activeQuery?.token],
    queryFn: async () => {
      if (!activeQuery) return null;
      return await lookupOrderFn({
        data: {
          code: activeQuery.code,
          phone: activeQuery.phone || null,
          token: activeQuery.token || null,
        },
      });
    },
    enabled: !!activeQuery,
    refetchInterval: 30000,
    retry: 0,
  });

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    const { cleaned: cleanPhone, isValid } = normalizeEgyptianPhone(phone);
    if (!isValid) {
      toast.error(t("err_INVALID_PHONE"));
      return;
    }

    setActiveQuery({
      code: cleanCode,
      phone: cleanPhone,
    });
  };

  const handleTrackRecent = (item: RecentOrder) => {
    setCode(item.code);
    setActiveQuery({
      code: item.code,
      token: item.token,
    });
  };

  return (
    <div className="container-ed pb-24 pt-12 md:pt-16 max-w-4xl mx-auto">
      <div className="text-center max-w-lg mx-auto">
        <p className="eyebrow">{t("tracking")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl">{t("track_title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {pick(
            "أدخل رمز الطلب ورقم الموبايل المسجّل لمتابعة حالة شحنتك.",
            "Enter your order code and registered mobile number to follow your shipment.",
          )}
        </p>
      </div>

      {/* Lookup Form */}
      <div className="mt-10 max-w-lg mx-auto rounded border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <label className="block text-start">
            <span className="mb-1.5 block text-xs text-muted-foreground">
              {t("track_code_label")} *
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ZK-4821"
              required
              dir="ltr"
              className="h-11 w-full border border-border bg-transparent px-3 text-sm uppercase tracking-wider outline-none focus:border-foreground"
            />
          </label>

          <label className="block text-start">
            <span className="mb-1.5 block text-xs text-muted-foreground">
              {t("track_phone_label")} *
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizeDigits(e.target.value))}
              placeholder="01012345678"
              required
              dir="ltr"
              className="h-11 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
            />
          </label>

          <Button
            type="submit"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Search className="size-4" />
            <span>{isLoading ? t("loading") : t("track_btn")}</span>
          </Button>
        </form>
      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="mt-12 text-center py-10">
          <p className="font-display text-xl animate-pulse text-muted-foreground">{t("loading")}</p>
        </div>
      ) : error ? (
        <div className="mt-10 rounded border border-destructive/20 bg-destructive/5 p-6 text-center max-w-lg mx-auto">
          <p className="font-display text-lg text-destructive">{t("track_not_found")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pick(
              "تأكد من كتابة رمز الطلب ورقم الموبايل بالشكل الصحيح.",
              "Ensure your order code and mobile number are entered correctly.",
            )}
          </p>
        </div>
      ) : order ? (
        <div className="mt-12 space-y-8 animate-in fade-in duration-300">
          {/* Tracker Card */}
          <div className="rounded border border-border bg-paper p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <span className="text-xs text-muted-foreground">{t("order_code")}:</span>
                <span className="ms-2 font-mono font-medium text-lg">{order.code}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span>
                  {order.city} — {order.governorate}
                </span>
              </div>
            </div>

            <OrderTracker status={order.status} stageTimes={order.stage_times} />
          </div>

          {/* Items & Financial Breakdown */}
          <div className="rounded border border-border p-6 bg-card">
            <p className="eyebrow mb-4">{t("items")}</p>
            <ul className="divide-y divide-border text-sm">
              {order.item_names.map((item, i) => (
                <li key={i} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <span className="font-medium">{pick(item.name_ar, item.name_en)}</span>
                    {item.variant_ar ? (
                      <span className="text-xs text-muted-foreground ms-2">
                        ({pick(item.variant_ar, item.variant_en || "")})
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground ms-2">× {item.qty}</span>
                  </div>
                  <Price amount={item.line_total} />
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-border flex justify-between font-display text-lg">
              <span>{t("total")}</span>
              <Price amount={order.total} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Orders on This Device */}
      {recentOrders.length > 0 ? (
        <div className="mt-16 border-t border-border pt-10">
          <p className="eyebrow mb-4">{t("track_recent_title")}</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {recentOrders.map((rec) => (
              <button
                key={rec.code}
                onClick={() => handleTrackRecent(rec)}
                className={`text-start rounded border p-4 transition-all hover:border-foreground bg-paper ${
                  activeQuery?.code === rec.code
                    ? "border-rose-deep ring-1 ring-rose-deep"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{rec.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(rec.created_at, lang)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{rec.city}</span>
                  <Price amount={rec.total} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
