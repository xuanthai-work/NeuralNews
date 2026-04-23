"use client";

import { useTheme } from "../context/ThemeContext";

interface EmptyStateProps {
  searchTerm?: string;
  onClearSearch?: () => void;
}

export function EmptyState({ searchTerm, onClearSearch }: EmptyStateProps) {
  const { darkMode } = useTheme();

  const cardBgClass = darkMode
    ? "bg-zinc-900/80 border-zinc-800/60 backdrop-blur-sm"
    : "bg-white/80 border-zinc-200/80 backdrop-blur-sm";

  const textColorClass = darkMode ? "text-zinc-400" : "text-zinc-600";
  const titleClass = darkMode ? "text-zinc-100" : "text-zinc-900";

  return (
    <div className="text-center py-20">
      <div
        className={`
          max-w-md mx-auto rounded-2xl border p-8
          transition-all duration-300
          ${cardBgClass}
        `}
      >
        {/* Illustration */}
        <div className="mb-6 flex justify-center">
          <div
            className={`
              w-20 h-20 rounded-2xl border-2
              flex items-center justify-center
              ${darkMode
                ? "bg-zinc-800/50 border-zinc-700/50"
                : "bg-zinc-100 border-zinc-300"
              }
            `}
          >
            {searchTerm ? (
              <svg
                className={`w-10 h-10 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            ) : (
              <svg
                className={`w-10 h-10 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-lg font-bold mb-2 ${titleClass}`}>
          {searchTerm ? "No matches found" : "No stories yet"}
        </h3>

        {/* Description */}
        <p className={`text-sm mb-6 ${textColorClass}`}>
          {searchTerm
            ? `We couldn't find any stories matching "${searchTerm}". Try adjusting your search terms or clearing the search.`
            : "There are no stories available at the moment. Check back soon for fresh intelligence from the AI landscape."}
        </p>

        {/* Action button */}
        {searchTerm && onClearSearch && (
          <button
            onClick={onClearSearch}
            className={`
              inline-flex items-center justify-center gap-2
              px-5 py-2.5 rounded-xl
              text-xs font-bold uppercase tracking-wide
              transition-all duration-300
              ${darkMode
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:border-zinc-600"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 hover:border-zinc-400"
              }
              hover:-translate-y-0.5 hover:scale-[1.02]
              active:translate-y-0 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
              ${darkMode ? "focus:ring-offset-zinc-950" : "focus:ring-offset-zinc-50"}
            `}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
}