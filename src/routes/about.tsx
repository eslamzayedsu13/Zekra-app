import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/store/ContentPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "حكايتنا · Our Story — ذِكرى Zekra" },
      {
        name: "description",
        content:
          "The story behind Zekra — handmade gifts and keepsakes made with Egyptian artisans.",
      },
      { property: "og:title", content: "حكايتنا · Our Story — Zekra" },
      {
        property: "og:description",
        content:
          "The story behind Zekra — handmade gifts and keepsakes made with Egyptian artisans.",
      },
    ],
  }),
  component: () => <ContentPage page="about" />,
});
