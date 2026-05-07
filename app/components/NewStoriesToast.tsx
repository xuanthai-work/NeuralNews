"use client";

import { useTheme } from "../context/ThemeContext";

interface NewStoriesToastProps {
  storyDelta: number;
  newTotal: number;
  onRefresh: () => void;
  onDismiss: () => void;
}

export function NewStoriesToast({
  storyDelta,
  newTotal,
  onRefresh,
  onDismiss,
}: NewStoriesToastProps) {
  const { darkMode } = useTheme();

  const message = storyDelta > 0
    ? `${storyDelta} new ${storyDelta === 1 ? "story" : "stories"} available`
    : `Fresh data available (${newTotal} stories)`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[100] animate-slide-up bottom-20 lg:bottom-6"
    >
      <div
        className={`
          flex items-center gap-3 pl-4 pr-2 py-2 rounded-full shadow-2xl
          backdrop-blur-md border
          ${darkMode
            ? "bg-zinc-900/95 border-indigo-500/40 shadow-indigo-500/20"
            : "bg-white/95 border-indigo-200 shadow-indigo-500/10"
          }
        `}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
        </span>

        <span className={`text-sm font-medium ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
          {message}
        </span>

        <button
          onClick={onRefresh}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
            text-xs font-bold uppercase tracking-wide
            transition-all
            ${darkMode
              ? "bg-indigo-500 hover:bg-indigo-400 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }
            shadow-lg shadow-indigo-500/25
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>

        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className={`
            w-7 h-7 rounded-full flex items-center justify-center
            transition-all
            ${darkMode
              ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            }
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
