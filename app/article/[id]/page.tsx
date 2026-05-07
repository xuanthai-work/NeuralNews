import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsData } from "../../lib/data";
import type { Story } from "../../types";
import ArticleClient from "./ArticleClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Pre-render all article pages at build time for instant load + SEO
export async function generateStaticParams() {
  const data = await getNewsData();
  return data.stories.map((story) => ({ id: String(story.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getNewsData();
  const story = data.stories.find((s) => s.id === Number(id));

  if (!story) {
    return { title: "Article Not Found · NeuralNews" };
  }

  const description = story.bullet_points[0]?.slice(0, 160) || `${story.source ?? "News"} story curated by NeuralNews.`;

  return {
    title: `${story.title} · NeuralNews`,
    description,
    openGraph: {
      title: story.title,
      description,
      type: "article",
      url: `/article/${story.id}`,
    },
    twitter: {
      card: "summary",
      title: story.title,
      description,
    },
  };
}

function pickRelated(all: Story[], current: Story, max = 3): Story[] {
  const sameSource = all.filter((s) => s.id !== current.id && s.source === current.source);
  if (sameSource.length >= max) return sameSource.slice(0, max);
  const others = all.filter((s) => s.id !== current.id && !sameSource.includes(s));
  return [...sameSource, ...others.slice(0, max - sameSource.length)].slice(0, max);
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getNewsData();
  const story = data.stories.find((s) => s.id === Number(id));

  if (!story) {
    notFound();
  }

  const relatedStories = pickRelated(data.stories, story);

  return <ArticleClient story={story} relatedStories={relatedStories} />;
}
