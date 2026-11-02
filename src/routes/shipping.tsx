import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/store/ContentPage";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "الشحن · Shipping — ذِكرى Zekra" },
      {
        name: "description",
        content: "Shipping fees, delivery times and tracking for every governorate in Egypt.",
      },
      { property: "og:title", content: "الشحن · Shipping — Zekra" },
      {
        property: "og:description",
        content: "Shipping fees, delivery times and tracking for every governorate in Egypt.",
      },
    ],
  }),
  component: () => <ContentPage page="shipping" />,
});
