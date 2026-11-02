import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/format";
import { statusKey } from "@/components/store/StatusTimeline";
import { Price } from "@/components/store/Price";

export const Route = createFileRoute("/_authenticated/account/orders/")({ component: Orders });

function Orders() {
  const { t, lang } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select("id,order_number,status,total,created_at")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (!data?.length)
    return <p className="font-display text-2xl text-muted-foreground">{t("orders_empty")}</p>;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {data.map((o) => (
        <li key={o.id}>
          <Link
            to="/account/orders/$id"
            params={{ id: o.id }}
            search={{ placed: undefined }}
            className="grid grid-cols-2 gap-2 py-5 text-sm transition-colors hover:bg-paper md:grid-cols-4"
          >
            <span className="font-display text-lg">
              {t("order")} #{formatNumber(o.order_number, lang).replace(/[٬,]/g, "")}
            </span>
            <span className="text-muted-foreground">{formatDate(o.created_at, lang)}</span>
            <span>{t(statusKey(o.status))}</span>
            <Price amount={o.total} className="md:justify-self-end" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
