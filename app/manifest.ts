import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NeuralNews · AI-curated tech news",
    short_name: "NeuralNews",
    description:
      "AI-curated tech news from 20+ sources. AI/ML breakthroughs, model releases, benchmarks, and industry news scored for relevance.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["news", "technology", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
