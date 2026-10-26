import { createFileRoute } from "@tanstack/react-router";
import { GeoDashboard } from "@/components/layout/GeoDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FESA Geo Intelligence — Visitas Comerciais" },
      { name: "description", content: "Inteligência geográfica das visitas comerciais da FESA em todo o Brasil." },
      { property: "og:title", content: "FESA Geo Intelligence" },
      { property: "og:description", content: "Mapa interativo e análise territorial das visitas comerciais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeoDashboard,
});
