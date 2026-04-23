"use client";

import type { Story } from "../types";
import { useTheme } from "../context/ThemeContext";

interface NewsCardProps {
  story: Story;
}

interface CategoryConfig {
  label: string;
  colorClass: string;
  barColor: string;
  icon: string;
}

function getScoreConfig(score: number, darkMode: boolean): {
  colorClass: string;
  bgClass: string;
  label: string;
} {
  if (score >= 9) {
    return {
      colorClass: darkMode ? "text-emerald-400" : "text-emerald-700",
      bgClass: darkMode ? "bg-emerald-500/15" : "bg-emerald-100",
      label: "Excellent",
    };
  }
  if (score >= 7) {
    return {
      colorClass: darkMode ? "text-green-400" : "text-green-700",
      bgClass: darkMode ? "bg-green-500/15" : "bg-green-100",
      label: "Good",
    };
  }
  if (score >= 5) {
    return {
      colorClass: darkMode ? "text-yellow-400" : "text-yellow-700",
      bgClass: darkMode ? "bg-yellow-500/15" : "bg-yellow-100",
      label: "Fair",
    };
  }
  return {
    colorClass: darkMode ? "text-red-400" : "text-red-700",
    bgClass: darkMode ? "bg-red-500/15" : "bg-red-100",
    label: "Low",
  };
}

function getCategoryConfig(source: string): CategoryConfig {
  const sourceLower = source.toLowerCase();

  if (
    sourceLower.includes("benchmark") ||
    sourceLower.includes("papers") ||
    sourceLower.includes("hugging face")
  ) {
    return {
      label: "RESEARCH",
      colorClass: "text-amber-600 bg-amber-100 border-amber-200 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/30",
      barColor: "bg-amber-500",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    };
  }

  if (
    sourceLower.includes("anthropic") ||
    sourceLower.includes("openai") ||
    sourceLower.includes("google ai") ||
    sourceLower.includes("deepmind") ||
    sourceLower.includes("meta") ||
    sourceLower.includes("microsoft")
  ) {
    return {
      label: "MODEL HUB",
      colorClass: "text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/30",
      barColor: "bg-blue-500",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    };
  }

  if (
    sourceLower.includes("techcrunch") ||
    sourceLower.includes("verge") ||
    sourceLower.includes("ars") ||
    sourceLower.includes("bloomberg")
  ) {
    return {
      label: "INDUSTRY",
      colorClass: "text-purple-600 bg-purple-100 border-purple-200 dark:text-purple-400 dark:bg-purple-500/15 dark:border-purple-500/30",
      barColor: "bg-purple-500",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    };
  }

  if (
    sourceLower.includes("ollama") ||
    sourceLower.includes("github") ||
    sourceLower.includes("vllm")
  ) {
    return {
      label: "SOFTWARE",
      colorClass: "text-emerald-600 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/30",
      barColor: "bg-emerald-500",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    };
  }

  return {
    label: "NEWS",
    colorClass: "text-zinc-600 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-500/15 dark:border-zinc-500/30",
    barColor: "bg-zinc-500",
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
  };
}

function formatDate(timestamp: string | null): string {
  if (!timestamp) return "Recent";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "unknown";
  }
}

export function NewsCard({ story }: NewsCardProps) {
  const { darkMode } = useTheme();
  const category = getCategoryConfig(story.source || "");
  const scoreConfig = getScoreConfig(story.ai_score, darkMode);
  const domain = extractDomain(story.url);

  const cardBgClass = darkMode
    ? "bg-zinc-900/80 backdrop-blur-sm border-zinc-800/60"
    : "bg-white border-zinc-200/80";

  const cardHoverClass = darkMode
    ? "hover:border-zinc-600 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-900/50"
    : "hover:border-zinc-300 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50";

  const titleColorClass = darkMode
    ? "text-zinc-100 group-hover:text-indigo-400"
    : "text-zinc-900 group-hover:text-indigo-600";

  const metaColorClass = darkMode ? "text-zinc-500" : "text-zinc-600";
  const bulletColorClass = darkMode ? "text-zinc-400" : "text-zinc-700";
  const dividerClass = darkMode ? "border-zinc-800/60" : "border-zinc-200/60";

  return (
    <article
      className={`
        group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out
        ${cardBgClass} ${cardHoverClass}
        hover:-translate-y-1.5 hover:shadow-2xl
        active:scale-[0.98] active:translate-y-0
        focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:ring-offset-2
        ${darkMode ? "focus-within:ring-offset-zinc-950" : "focus-within:ring-offset-zinc-50"}
      `}
    >
      {/* Category accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${category.barColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
          ${darkMode ? "bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent" : "bg-gradient-to-br from-indigo-400/3 via-transparent to-transparent"}
        `}
      />

      <div className="relative p-5 sm:p-6 flex flex-col h-full">
        {/* Header: Category + Source + AI Score */}
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            {/* Category badge */}
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold
                rounded-full uppercase tracking-wider border transition-all duration-300
                ${category.colorClass}
                group-hover:scale-105
              `}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
              </svg>
              {category.label}
            </span>

            {/* Source domain */}
            <span
              className={`
                hidden sm:inline-flex items-center text-[10px] font-medium
                ${metaColorClass} truncate max-w-[150px]
              `}
              title={domain}
            >
              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {domain}
            </span>
          </div>

          {/* AI Score badge */}
          <div
            className={`
              flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2
              flex flex-col items-center justify-center
              transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
              ${scoreConfig.bgClass} ${scoreConfig.colorClass}
              ${darkMode ? "border-zinc-700/50" : "border-zinc-200"}
            `}
            title={`AI Score: ${story.ai_score}/10 - ${scoreConfig.label}`}
          >
            <span className="text-lg sm:text-xl font-black leading-none">{story.ai_score}</span>
            <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-tighter opacity-70 mt-0.5">score</span>
          </div>
        </header>

        {/* Title */}
        <h3
          className={`
            text-base sm:text-lg font-bold leading-snug mb-3 line-clamp-2
            transition-colors duration-300 ${titleColorClass}
          `}
        >
          {story.title}
        </h3>

        {/* Meta: Author + Date */}
        <div
          className={`
            flex items-center gap-2 text-[11px] sm:text-xs mb-4
            ${metaColorClass}
          `}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`truncate ${darkMode ? "text-zinc-400" : "text-zinc-700"}`}>
              {story.author}
            </span>
          </div>
          <span className="flex-shrink-0">•</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(story.timestamp)}</span>
          </div>
        </div>

        {/* Divider */}
        <hr className={`mb-4 ${dividerClass}`} />

        {/* Bullet points */}
        <ul className="space-y-2.5 mb-5 flex-grow">
          {story.bullet_points.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm group/bullet"
            >
              <span
                className={`
                  mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0
                  bg-gradient-to-br from-indigo-500 to-purple-500
                  group-hover/bullet:scale-125 group-hover/bullet:rotate-45
                  transition-transform duration-300
                `}
              />
              <span
                className={`
                  leading-relaxed line-clamp-2
                  ${bulletColorClass}
                `}
              >
                {point}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            group/btn inline-flex items-center justify-center gap-2
            px-4 py-2.5 rounded-xl
            text-xs sm:text-sm font-bold uppercase tracking-wide
            transition-all duration-300 ease-out
            ${darkMode
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }
            hover:-translate-y-0.5 hover:scale-[1.02]
            active:translate-y-0 active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
            ${darkMode ? "focus:ring-offset-zinc-900" : "focus:ring-offset-white"}
          `}
        >
          <span>Read Full Story</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </article>
  );
}
