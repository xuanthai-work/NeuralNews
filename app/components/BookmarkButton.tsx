"use client";

import type { Story } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useSavedStories } from "../hooks/useSavedStories";

interface BookmarkButtonProps {
  story: Story;
  size?: "sm" | "md";
}

export function BookmarkButton({ story, size = "md" }: BookmarkButtonProps) {
  const { darkMode } = useTheme();
  const { isSaved, toggleSaved } = useSavedStories();
  const saved = isSaved(story.id);

  const sizeClass = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  const baseClass = `
    ${sizeClass}
    rounded-lg flex items-center justify-center
    transition-all duration-300
    border
    hover:scale-110 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-indigo-500/50
  `;

  const savedClass = darkMode
    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
    : "bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200";

  const unsavedClass = darkMode
    ? "bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200"
    : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(story);
      }}
      className={`${baseClass} ${saved ? savedClass : unsavedClass}`}
      aria-label={saved ? "Remove from saved" : "Save story"}
      title={saved ? "Remove from saved" : "Save for later"}
    >
      <svg
        className={iconSize}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
