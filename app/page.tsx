import type { Metadata } from "next";
import { Suspense } from "react";
import { getNewsData } from "./lib/data";
import HomeClient from "./HomeClient";
import { LoadingState } from "./components";

// Revalidate the page every 60 seconds so updates from GitHub Actions are picked up
export const revalidate = 60;

export const metadata: Metadata = {
  title: "NeuralNews · AI-curated tech news dashboard",
  description:
    "Curated AI and tech news from 20+ sources including Anthropic, OpenAI, Google AI, arXiv, Hacker News, and more. Stories scored for relevance with AI.",
  openGraph: {
    title: "NeuralNews · AI-curated tech news",
    description: "Curated AI and tech news, scored for relevance.",
    type: "website",
  },
};

export default async function Home() {
  const data = await getNewsData();
  return (
    <Suspense fallback={<LoadingState />}>
      <HomeClient initialData={data} />
    </Suspense>
  );
}
