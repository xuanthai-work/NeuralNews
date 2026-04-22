"use client";

import { useTheme } from "../context/ThemeContext";

export function LoadingState() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Loading neural feed...</div>
      </div>
    </div>
  );
}