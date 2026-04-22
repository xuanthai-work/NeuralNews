"use client";

import type { Story } from "../types";
import { useTheme } from "../context/ThemeContext";

interface StoryCardProps {
  story: Story;
}

function getScoreColor(score: number, darkMode: boolean): string {
  if (score >= 9) return darkMode
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : "text-emerald-700 bg-emerald-100 border-emerald-300";
  if (score >= 7) return darkMode
    ? "text-green-400 bg-green-500/10 border-green-500/30"
    : "text-green-700 bg-green-100 border-green-300";
  if (score >= 5) return darkMode
    ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
    : "text-yellow-700 bg-yellow-100 border-yellow-300";
  return darkMode
    ? "text-red-400 bg-red-500/10 border-red-500/30"
    : "text-red-700 bg-red-100 border-red-300";
}

function getCategoryTag(source: string, darkMode: boolean): { label: string; color: string } {
  if (source.includes("Benchmark") || source.includes("Papers") || source.includes("Hugging Face")) {
    return { label: "RESEARCH", color: darkMode
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-amber-700 bg-amber-100 border-amber-300" };
  }
  if (source.includes("Anthropic") || source.includes("OpenAI") || source.includes("Google AI") || source.includes("DeepMind") || source.includes("Meta") || source.includes("Microsoft")) {
    return { label: "MODEL HUB", color: darkMode
      ? "text-blue-400 bg-blue-500/10 border-blue-500/30"
      : "text-blue-700 bg-blue-100 border-blue-300" };
  }
  if (source.includes("TechCrunch") || source.includes("Verge") || source.includes("Ars") || source.includes("Bloomberg")) {
    return { label: "INDUSTRY", color: darkMode
      ? "text-purple-400 bg-purple-500/10 border-purple-500/30"
      : "text-purple-700 bg-purple-100 border-purple-300" };
  }
  if (source.includes("Ollama") || source.includes("github") || source.includes("vLLM")) {
    return { label: "SOFTWARE", color: darkMode
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : "text-emerald-700 bg-emerald-100 border-emerald-300" };
  }
  return { label: "NEWS", color: darkMode
    ? "text-zinc-400 bg-zinc-500/10 border-zinc-500/30"
    : "text-zinc-700 bg-zinc-100 border-zinc-300" };
}

export function StoryCard({ story }: StoryCardProps) {
  const { darkMode } = useTheme();
  const categoryTag = getCategoryTag(story.source || "", darkMode);

  return (
    <article
      className={`${darkMode ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700" : "bg-white border border-zinc-200 hover:border-zinc-300"} rounded-xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        categoryTag.label === "RESEARCH" ? "bg-amber-500" :
        categoryTag.label === "MODEL HUB" ? "bg-blue-500" :
        categoryTag.label === "INDUSTRY" ? "bg-purple-500" :
        categoryTag.label === "SOFTWARE" ? "bg-emerald-500" :
        "bg-zinc-500"
      }`} />

      <div className="flex items-start justify-between mb-4 pt-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${categoryTag.color}`}>
            {categoryTag.label}
          </span>
          <span className={`text-[10px] font-mono ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            {new URL(story.url).hostname.replace("www.", "")}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm ${getScoreColor(story.ai_score, darkMode)}`}>
          {story.ai_score}
        </div>
      </div>

      <h4 className={`text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
        {story.title}
      </h4>

      <div className={`flex items-center gap-2 text-[11px] mb-4 ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
        <span className={`font-bold ${darkMode ? "text-zinc-400" : "text-zinc-700"}`}>{story.author}</span>
        <span>•</span>
        <span>{story.timestamp ? new Date(story.timestamp).toLocaleDateString() : "Recent"}</span>
      </div>

      <hr className={`mb-4 ${darkMode ? "border-zinc-800" : "border-zinc-200"}`} />

      <ul className="space-y-2 mb-6 flex-grow">
        {story.bullet_points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
            <span className={`line-clamp-2 ${darkMode ? "text-zinc-400" : "text-zinc-700"}`}>{point}</span>
          </li>
        ))}
      </ul>

      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-sm font-bold flex items-center gap-1 mt-auto ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"}`}
      >
        Read Full Story <span className="text-lg">→</span>
      </a>
    </article>
  );
}
