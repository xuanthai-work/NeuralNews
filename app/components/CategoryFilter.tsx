"use client";

import type { Category } from "../types";
import { useTheme } from "../context/ThemeContext";

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  dataGeneratedAt?: string;
  refreshStatus?: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  dataGeneratedAt,
  refreshStatus,
}: CategoryFilterProps) {
  const { darkMode } = useTheme();

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <h3 className={`text-xl font-bold ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>Intelligence Feed</h3>
        <div className="flex items-center gap-2">
          <p className={`text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>Real-time signals from the AI research and industry landscape.</p>
          {dataGeneratedAt && (
            <span className={`text-xs ${darkMode ? "text-zinc-600" : "text-zinc-500"}`}>
              • Updated: {new Date(dataGeneratedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
        {refreshStatus && (
          <p className={`text-xs mt-1 ${refreshStatus.includes("Error") ? "text-red-400" : "text-emerald-400"}`}>
            {refreshStatus}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            className={`appearance-none text-xs font-bold uppercase tracking-wider rounded-lg pl-4 pr-10 py-2 cursor-pointer transition-all focus:outline-none ${darkMode ? "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600" : "bg-zinc-100 text-zinc-600 border border-zinc-300 hover:border-zinc-400"}`}
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
          >
            <option value="all">All Stories</option>
            <option value="benchmarks">Benchmarks</option>
            <option value="ai-blogs">AI Blogs</option>
            <option value="tech-news">Tech News</option>
            <option value="community">Community</option>
          </select>
          <svg className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? "text-zinc-400" : "text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
