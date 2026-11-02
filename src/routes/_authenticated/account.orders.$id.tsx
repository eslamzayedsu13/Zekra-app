import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/format";
import { resolveImage } from "@/lib/images";
import { StatusTimeline, type OrderStatus } from "@/components/store/StatusTimeline";
import { Price } from "@/components/store/Price";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  validateSearch: z.object({ placed: z.boolean().optional().catch(undefined) }),
  component: OrderDetail,
});

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_events(status,created_at)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function OrderView({ id }: { id: string }) {
  const { t, pick, lang } = useI18n();
  const { data: o, isLoading } = useOrder(id);
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (!o) return <p>{t("not_found")}</p>;
  return (
    <div className="grid gap-12 md:grid-cols-12">
      <div className="md:col-span-7">
        <h2 className="text-3xl">
          {t("order")} #{formatNumber(o.order_number, lang).replace(/[٬,]/g, "")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(o.created_at, lang)} · {t("cod")}
        </p>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {o.order_items.map((i) => (
            <li key={i.id} className="flex gap-4 py-4 text-sm">
              <img
                src={resolveImage(i.image)}
                alt=""
                width={64}
                height={80}
                className="h-20 w-16 object-cover"
                loading="lazy"
              />
              <div className="flex-1">
                <p className="font-display text-lg">
                  {pick(i.name_ar, i.name_en)} × {formatNumber(i.quantity, lang)}
                </p>
                {i.variant_ar ? (
                  <p className="text-xs text-muted-foreground">
                    {pick(i.variant_ar, i.variant_en)}
                  </p>
                ) : null}
                {i.engraving_text ? (
                  <p className="text-xs text-muted-foreground">
                    {t("engraving")}: «{i.engraving_text}»
                  </p>
                ) : null}
              </div>
              <Price amount={i.line_total} />
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>{t("subtotal")}</dt>
            <dd>
              <Price amount={o.subtotal} />
            </dd>
          </div>
          {o.extras_total > 0 ? (
            <div className="flex justify-between">
              <dt>
                {t("extras")}{" "}
                <span className="text-xs text-muted-foreground">
                  (
                  {[o.gift_wrap && t("gift_wrap"), o.greeting_card && t("greeting_card")]
                    .filter(Boolean)
                    .join("، ")}
                  )
                </span>
              </dt>
              <dd>
                <Price amount={o.extras_total} />
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>{t("shipping")}</dt>
            <dd>{o.shipping_fee === 0 ? t("free") : <Price amount={o.shipping_fee} />}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-xl">
            <dt>{t("total")}</dt>
            <dd>
              <Price amount={o.total} />
            </dd>
          </div>
        </dl>
        {o.gift_message ? (
          <p className="mt-6 border-s-2 border-rose ps-4 font-display text-lg italic">
            «{o.gift_message}»
          </p>
        ) : null}
        <p className="mt-6 text-sm text-muted-foreground">
          {o.contact_name} · <span dir="ltr">{o.contact_phone}</span>
          <br />
          {o.street}, {o.city}, {o.governorate}
        </p>
      </div>
      <aside className="md:col-span-4 md:col-start-9">
        <p className="eyebrow mb-6">{t("tracking")}</p>
        <StatusTimeline status={o.status as OrderStatus} events={o.order_status_events} />
      </aside>
    </div>
  );
}

function OrderDetail() {
  const { id } = Route.useParams();
  const { placed } = Route.useSearch();
  const { t } = useI18n();
  return (
    <>
      {placed ? (
        <div className="mb-12 border border-sage bg-sage-soft p-6">
          <p className="font-display text-2xl">{t("order_received")}</p>
          <p className="mt-2 text-sm">{t("order_received_d")}</p>
        </div>
      ) : null}
      <OrderView id={id} />
    </>
  );
}
