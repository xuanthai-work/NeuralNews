"use client";

import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  searchTerm: string;
  refreshing: boolean;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

export function Header({ searchTerm, refreshing, onSearchChange, onRefresh }: HeaderProps) {
  const { darkMode } = useTheme();

  return (
    <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
      <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6">
          <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search signals..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all ${darkMode ? "bg-zinc-900 border border-zinc-800 text-zinc-300" : "bg-zinc-100 border border-zinc-300 text-zinc-700"}`}
            />
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-all ${
              refreshing
                ? "bg-indigo-500/20 text-indigo-400"
                : darkMode
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
            }`}
            title="Refresh feed"
          >
            <svg
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
