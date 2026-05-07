"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Story } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { Sidebar } from "../../components/Sidebar";
import { BottomNav } from "../../components/BottomNav";
import { NewsCard } from "../../components/NewsCard";
import { BookmarkButton } from "../../components/BookmarkButton";

interface ArticleClientProps {
  story: Story;
  relatedStories: Story[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

function formatDate(timestamp: string | null): string {
  if (!timestamp) return "Recent";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getScoreConfig(score: number, darkMode: boolean) {
  if (score >= 9) {
    return {
      colorClass: darkMode ? "text-emerald-400" : "text-emerald-700",
      bgClass: darkMode ? "bg-emerald-500/15" : "bg-emerald-100",
      borderClass: darkMode ? "border-emerald-500/30" : "border-emerald-300",
      label: "Excellent",
    };
  }
  if (score >= 7) {
    return {
      colorClass: darkMode ? "text-green-400" : "text-green-700",
      bgClass: darkMode ? "bg-green-500/15" : "bg-green-100",
      borderClass: darkMode ? "border-green-500/30" : "border-green-300",
      label: "Good",
    };
  }
  if (score >= 5) {
    return {
      colorClass: darkMode ? "text-yellow-400" : "text-yellow-700",
      bgClass: darkMode ? "bg-yellow-500/15" : "bg-yellow-100",
      borderClass: darkMode ? "border-yellow-500/30" : "border-yellow-300",
      label: "Fair",
    };
  }
  return {
    colorClass: darkMode ? "text-red-400" : "text-red-700",
    bgClass: darkMode ? "bg-red-500/15" : "bg-red-100",
    borderClass: darkMode ? "border-red-500/30" : "border-red-300",
    label: "Low",
  };
}

export default function ArticleClient({ story, relatedStories }: ArticleClientProps) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(story.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const bgClass = darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const scoreConfig = getScoreConfig(story.ai_score, darkMode);
  const domain = extractDomain(story.url);

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky header with back button */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[900px] mx-auto">
            <button
              onClick={() => router.back()}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${darkMode ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <div className="flex items-center gap-2">
              <BookmarkButton story={story} size="sm" />
              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${darkMode ? "bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"}`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Article content */}
        <article className="flex-1 max-w-[900px] mx-auto w-full px-4 md:px-6 py-8">
          {/* Source + score header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${darkMode ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" : "bg-indigo-100 text-indigo-700 border-indigo-300"}`}>
                {story.source || "Unknown Source"}
              </span>
              <span className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                {domain}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${scoreConfig.bgClass} ${scoreConfig.colorClass} ${scoreConfig.borderClass}`}
              title={`AI Relevance Score: ${story.ai_score}/10`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-sm font-bold">{story.ai_score}/10</span>
              <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                {scoreConfig.label}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-4 ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>
            {story.title}
          </h1>

          {/* Meta */}
          <div className={`flex flex-wrap items-center gap-4 text-sm mb-8 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{story.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(story.timestamp)}</span>
            </div>
          </div>

          {/* Key points section */}
          <section className={`rounded-2xl p-6 md:p-8 mb-8 ${darkMode ? "bg-zinc-900/60 border border-zinc-800" : "bg-white border border-zinc-200"}`}>
            <div className="flex items-center gap-2 mb-5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h2 className={`text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                Key Points
              </h2>
              <span className={`ml-auto text-xs font-mono uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                AI Summary
              </span>
            </div>

            <ul className="space-y-4">
              {story.bullet_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                    {idx + 1}
                  </span>
                  <span className={`text-sm md:text-base leading-relaxed ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA - Read original */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wide bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              <span>Read Full Story on {domain}</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Related stories */}
          {relatedStories.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                  Related Stories
                </h2>
                <span className={`text-xs font-mono uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                  {relatedStories.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {relatedStories.map((s) => (
                  <NewsCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* Back to feed link */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 text-sm font-medium ${darkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse all stories
            </Link>
          </div>
        </article>

        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-[900px] mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            NeuralNews · AI-curated tech news
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
