import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PageIntro } from "@/components/store/PageIntro";

// NOTE: placeholder contact details — replace with the real ones.
const CONTACT = {
  phone: "+20 100 000 0000",
  whatsapp: "201000000000",
  email: "hello@zekra.example",
  hours: { ar: "السبت–الخميس، ١١ص–٨م", en: "Sat–Thu, 11am–8pm" },
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل · Contact — ذِكرى Zekra" },
      {
        name: "description",
        content:
          "Reach Zekra by WhatsApp, phone or email for orders, engraving and gifting questions.",
      },
      { property: "og:title", content: "Contact — Zekra" },
      { property: "og:description", content: "WhatsApp, phone or email — we're here to help." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { lang, pick } = useI18n();
  const rows = [
    {
      label: pick("واتساب", "WhatsApp"),
      value: CONTACT.phone,
      href: `https://wa.me/${CONTACT.whatsapp}`,
    },
    {
      label: pick("هاتف", "Phone"),
      value: CONTACT.phone,
      href: `tel:${CONTACT.phone.replace(/\s/g, "")}`,
    },
    { label: pick("البريد", "Email"), value: CONTACT.email, href: `mailto:${CONTACT.email}` },
  ];
  return (
    <>
      <PageIntro title={pick("نحب أن نسمع منكم.", "We'd love to hear from you.")}>
        {pick(
          "للطلبات، أو الحفر، أو مساعدتكم في اختيار هدية — راسلونا وسنرد خلال يوم عمل.",
          "For orders, engraving, or help choosing a gift — write to us and we'll reply within one working day.",
        )}
      </PageIntro>
      <div className="container-ed grid gap-12 md:grid-cols-2">
        <dl className="divide-y divide-border border-y border-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-5">
              <dt className="eyebrow">{r.label}</dt>
              <dd>
                <a
                  href={r.href}
                  className="link-draw font-display text-xl"
                  dir="ltr"
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  {r.value}
                </a>
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between py-5">
            <dt className="eyebrow">{pick("المواعيد", "Hours")}</dt>
            <dd className="text-sm">{CONTACT.hours[lang]}</dd>
          </div>
        </dl>
        <div className="text-sm leading-relaxed text-muted-foreground">
          <p>
            {pick(
              "قبل التواصل، قد تجدون إجابتكم هنا:",
              "Before writing, you may find your answer here:",
            )}
          </p>
          <ul className="mt-4 space-y-2 text-foreground">
            <li>
              <Link to="/faq" className="link-draw">
                {pick("الأسئلة الشائعة", "FAQ")}
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="link-draw">
                {pick("الشحن والتوصيل", "Shipping")}
              </Link>
            </li>
            <li>
              <Link to="/returns" className="link-draw">
                {pick("الاسترجاع والاستبدال", "Returns")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
