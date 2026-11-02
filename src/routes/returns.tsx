import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/store/ContentPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "الاسترجاع · Returns — ذِكرى Zekra" },
      {
        name: "description",
        content: "Zekra's 14-day returns and exchanges policy, including personalised pieces.",
      },
      { property: "og:title", content: "الاسترجاع · Returns — Zekra" },
      {
        property: "og:description",
        content: "Zekra's 14-day returns and exchanges policy, including personalised pieces.",
      },
    ],
  }),
  component: () => <ContentPage page="returns" />,
});
