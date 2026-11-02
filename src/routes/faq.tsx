import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/store/ContentPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "الأسئلة الشائعة · FAQ — ذِكرى Zekra" },
      {
        name: "description",
        content: "Answers about ordering, engraving, payment and delivery at Zekra.",
      },
      { property: "og:title", content: "الأسئلة الشائعة · FAQ — Zekra" },
      {
        property: "og:description",
        content: "Answers about ordering, engraving, payment and delivery at Zekra.",
      },
    ],
  }),
  component: () => <ContentPage page="faq" />,
});
