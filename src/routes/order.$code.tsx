import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, CheckCheck, MessageCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { lookupOrderFn } from "@/lib/order.functions";
import { OrderTracker } from "@/components/store/OrderTracker";
import { Price } from "@/components/store/Price";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order/$code")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `طلبك ${params.code} — ذِكرى Zekra` },
      { name: "description", content: "Order confirmation and tracking." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { code } = Route.useParams();
  const { token } = Route.useSearch();
  const { t, pick, lang, dir } = useI18n();
  const [copied, setCopied] = useState(false);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order-details", code, token],
    queryFn: async () => {
      const res = await lookupOrderFn({ data: { code, token: token || null } });
      return res;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("order_copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(code);
    }
  };

  if (isLoading) {
    return (
      <div className="container-ed min-h-[60vh] flex flex-col items-center justify-center py-20">
        <p className="font-display text-2xl animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-ed min-h-[60vh] py-20 text-center max-w-lg mx-auto">
        <h1 className="font-display text-3xl">{t("track_not_found")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {pick(
            "تأكد من رابط الطلب أو استخدم صفحة التتبّع برقم الموبايل.",
            "Verify your order link or use the track page with your mobile number.",
          )}
        </p>
        <Button className="mt-8" asChild>
          <Link to="/track">{t("track_order")}</Link>
        </Button>
      </div>
    );
  }

  const whatsappText = encodeURIComponent(`${t("order_whatsapp_msg")} ${order.code}`);
  const whatsappUrl = `https://wa.me/201000000000?text=${whatsappText}`;

  return (
    <div className="container-ed pb-24 pt-12 md:pt-16 max-w-4xl mx-auto">
      {/* Success Banner */}
      <div className="text-center">
        {/* Animated Check Icon */}
        <div className="mx-auto size-16 rounded-full bg-rose-soft/70 border border-rose-deep/20 flex items-center justify-center text-rose-deep shadow-sm">
          <Check className="size-8 stroke-[2.5] animate-in zoom-in-75 duration-500" />
        </div>

        <h1 className="mt-5 text-4xl md:text-5xl">{t("order_success_title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("order_received_d")}</p>

        {/* Order code with copy pill */}
        <div className="mt-6 inline-flex items-center gap-3 bg-paper border border-border px-4 py-2 rounded-full">
          <span className="text-xs text-muted-foreground">{t("order_code")}:</span>
          <span className="font-mono font-medium text-base tracking-wider">{order.code}</span>
          <button
            onClick={copyCode}
            aria-label={t("order_copy")}
            className="ms-1 p-1 hover:text-rose-deep transition-colors"
          >
            {copied ? (
              <CheckCheck className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Tracker Stepper */}
      <div className="mt-12 rounded border border-border bg-paper p-6 md:p-8">
        <p className="eyebrow mb-2">{t("tracking")}</p>
        <OrderTracker status={order.status} stageTimes={order.stage_times} />
      </div>

      {/* Order Summary & Expected Delivery */}
      <div className="mt-10 grid gap-8 md:grid-cols-12">
        <div className="rounded border border-border p-6 md:col-span-7">
          <p className="eyebrow mb-4">{t("summary")}</p>
          <ul className="divide-y divide-border text-sm">
            {order.item_names.map((item, idx) => (
              <li key={idx} className="py-3 flex justify-between gap-3">
                <div>
                  <p className="font-medium">{pick(item.name_ar, item.name_en)}</p>
                  {item.variant_ar ? (
                    <span className="text-xs text-muted-foreground block">
                      {pick(item.variant_ar, item.variant_en || "")}
                    </span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    × {formatNumber(item.qty, lang)}
                  </span>
                </div>
                <Price amount={item.line_total} />
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("subtotal")}</dt>
              <dd>
                <Price amount={order.subtotal} />
              </dd>
            </div>
            {order.extras_total > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("extras")}</dt>
                <dd>
                  <Price amount={order.extras_total} />
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("shipping")}</dt>
              <dd>
                {order.shipping_fee === 0 ? t("free") : <Price amount={order.shipping_fee} />}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
              <dt>{t("total")}</dt>
              <dd>
                <Price amount={order.total} />
              </dd>
            </div>
          </dl>
        </div>

        {/* Shipping & Support Card */}
        <div className="flex flex-col justify-between rounded border border-border p-6 md:col-span-5 bg-paper">
          <div>
            <p className="eyebrow mb-3">{t("order_expected_delivery")}</p>
            <p className="text-lg font-display">
              {order.city} — {order.governorate}
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {t("shipping_note")}
            </p>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-border">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-emerald-600/30 text-emerald-800 hover:bg-emerald-50"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4 text-emerald-600" />
                <span>{t("order_whatsapp")}</span>
              </a>
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link to="/shop" className="flex items-center justify-center gap-2">
                <span>{t("cart_continue")}</span>
                <Arrow className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
