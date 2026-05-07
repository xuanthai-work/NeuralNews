import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getModels,
  getModelBySlug,
  modelToSlug,
  PROVIDER_LINKS,
  type Model,
} from "../../lib/models";
import { getNewsData } from "../../lib/data";
import type { Story } from "../../types";
import ModelDetailClient from "./ModelDetailClient";

// Models data ages slowly; revalidate hourly
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { models } = await getModels();
    return models.map((m) => ({ slug: modelToSlug(m.name) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) {
    return { title: "Model not found · NeuralNews" };
  }
  return {
    title: `${model.name} · ${model.provider} · NeuralNews`,
    description: model.description,
    openGraph: {
      title: `${model.name} — ${model.provider}`,
      description: model.description,
      type: "article",
      url: `/model-hub/${slug}`,
    },
  };
}

const STOPWORDS = new Set([
  "preview", "thinking", "reasoning", "instruct", "chat", "base",
  "high", "low", "medium", "fast", "turbo", "mini", "nano", "experimental",
  "alpha", "beta",
]);

function extractMatchTokens(name: string): string[] {
  const tokens = name
    .toLowerCase()
    .split(/[-\s./]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t) && isNaN(Number(t)));
  return Array.from(new Set(tokens));
}

function findRelatedNews(stories: Story[], model: Model, max = 6): Story[] {
  const tokens = extractMatchTokens(model.name);
  if (tokens.length === 0) return [];

  const fullName = model.name.toLowerCase();
  const naturalName = fullName.replace(/-/g, " ");

  type Scored = { story: Story; score: number };
  const scored: Scored[] = [];

  for (const story of stories) {
    const haystack = `${story.title} ${story.bullet_points.join(" ")}`.toLowerCase();
    let score = 0;

    // Strong: full slug or natural-form match
    if (haystack.includes(fullName) || haystack.includes(naturalName)) {
      score += 5;
    }

    // Token matches (each significant token)
    for (const t of tokens) {
      if (haystack.includes(t)) score += 1;
    }

    // Require at least 2 tokens (or 1 strong full-name match)
    const minTokenMatches = tokens.length >= 2 ? 2 : 1;
    const tokenHits = tokens.filter((t) => haystack.includes(t)).length;

    if (score >= 5 || tokenHits >= minTokenMatches) {
      scored.push({ story, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ story }) => story);
}

function findSimilarModels(all: Model[], current: Model, max = 6): Model[] {
  const others = all.filter((m) => m.name !== current.name);

  // Score each candidate: same provider +3, ELO proximity +0..3
  const scored = others.map((m) => {
    let score = 0;
    if (m.provider === current.provider) score += 3;
    if (current.arena_elo && m.arena_elo) {
      const diff = Math.abs(m.arena_elo - current.arena_elo);
      if (diff < 20) score += 3;
      else if (diff < 50) score += 2;
      else if (diff < 100) score += 1;
    }
    return { model: m, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ model }) => model);
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [{ models }, news] = await Promise.all([getModels(), getNewsData()]);
  const model = models.find((m) => modelToSlug(m.name) === slug);

  if (!model) notFound();

  const similar = findSimilarModels(models, model);
  const relatedStories = findRelatedNews(news.stories, model);
  const providerLinks = PROVIDER_LINKS[model.provider] || {};

  return (
    <ModelDetailClient
      model={model}
      similar={similar}
      relatedStories={relatedStories}
      providerLinks={providerLinks}
    />
  );
}
