import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Field } from "../auth";

export const Route = createFileRoute("/_authenticated/account/")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () =>
      (await supabase.from("addresses").select("*").order("created_at", { ascending: false }))
        .data ?? [],
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    setName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  return (
    <div className="grid gap-14 md:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase
            .from("profiles")
            .update({ full_name: name, phone })
            .eq("id", user!.id);
          if (error) toast.error(t("err_generic"));
          else {
            toast.success(t("saved"));
            qc.invalidateQueries({ queryKey: ["profile"] });
          }
        }}
      >
        <p className="eyebrow mb-2">{t("profile")}</p>
        <Field label={t("email")} value={user?.email ?? ""} disabled dir="ltr" />
        <Field label={t("full_name")} value={name} onChange={(e) => setName(e.target.value)} />
        <Field
          label={t("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          inputMode="tel"
        />
        <Button type="submit">{t("save")}</Button>
      </form>
      <div>
        <p className="eyebrow mb-4">{t("saved_addresses")}</p>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">—</p>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-4 text-sm">
                <span>
                  {a.full_name} · <span dir="ltr">{a.phone}</span>
                  <span className="block text-muted-foreground">
                    {a.street}, {a.city}, {a.governorate}
                  </span>
                </span>
                <button
                  className="link-draw text-xs text-muted-foreground"
                  onClick={async () => {
                    await supabase.from("addresses").delete().eq("id", a.id);
                    qc.invalidateQueries({ queryKey: ["addresses"] });
                  }}
                >
                  {t("delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
