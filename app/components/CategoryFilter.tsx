"use client";

import type { Category } from "../types";
import { useTheme } from "../context/ThemeContext";

interface CategoryFilterProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  dataGeneratedAt?: string;
  refreshStatus?: string;
}

interface CategoryConfig {
  label: string;
  shortLabel: string;
  icon: string;
  colorClass: string;
  bgClass: string;
  borderColor: string;
  activeBgClass: string;
  activeBorderClass: string;
}

const categories: { value: Category; getConfig: (darkMode: boolean) => CategoryConfig }[] = [
  {
    value: "all",
    getConfig: (darkMode) => ({
      label: "All Stories",
      shortLabel: "All",
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      colorClass: darkMode ? "text-zinc-300" : "text-zinc-700",
      bgClass: darkMode ? "bg-zinc-800" : "bg-zinc-100",
      borderColor: darkMode ? "border-zinc-700" : "border-zinc-300",
      activeBgClass: darkMode ? "bg-zinc-700" : "bg-zinc-200",
      activeBorderClass: darkMode ? "border-zinc-500" : "border-zinc-400",
    }),
  },
  {
    value: "benchmarks",
    getConfig: (darkMode) => ({
      label: "Benchmarks",
      shortLabel: "Bench",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      colorClass: darkMode ? "text-amber-400" : "text-amber-700",
      bgClass: darkMode ? "bg-amber-500/15" : "bg-amber-100",
      borderColor: darkMode ? "border-amber-500/30" : "border-amber-200",
      activeBgClass: darkMode ? "bg-amber-500/25" : "bg-amber-200",
      activeBorderClass: darkMode ? "border-amber-400" : "border-amber-400",
    }),
  },
  {
    value: "ai-blogs",
    getConfig: (darkMode) => ({
      label: "AI Blogs",
      shortLabel: "AI",
      icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 16a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
      colorClass: darkMode ? "text-blue-400" : "text-blue-700",
      bgClass: darkMode ? "bg-blue-500/15" : "bg-blue-100",
      borderColor: darkMode ? "border-blue-500/30" : "border-blue-200",
      activeBgClass: darkMode ? "bg-blue-500/25" : "bg-blue-200",
      activeBorderClass: darkMode ? "border-blue-400" : "border-blue-400",
    }),
  },
  {
    value: "tech-news",
    getConfig: (darkMode) => ({
      label: "Tech News",
      shortLabel: "Tech",
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      colorClass: darkMode ? "text-purple-400" : "text-purple-700",
      bgClass: darkMode ? "bg-purple-500/15" : "bg-purple-100",
      borderColor: darkMode ? "border-purple-500/30" : "border-purple-200",
      activeBgClass: darkMode ? "bg-purple-500/25" : "bg-purple-200",
      activeBorderClass: darkMode ? "border-purple-400" : "border-purple-400",
    }),
  },
  {
    value: "community",
    getConfig: (darkMode) => ({
      label: "Community",
      shortLabel: "Community",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      colorClass: darkMode ? "text-emerald-400" : "text-emerald-700",
      bgClass: darkMode ? "bg-emerald-500/15" : "bg-emerald-100",
      borderColor: darkMode ? "border-emerald-500/30" : "border-emerald-200",
      activeBgClass: darkMode ? "bg-emerald-500/25" : "bg-emerald-200",
      activeBorderClass: darkMode ? "border-emerald-400" : "border-emerald-400",
    }),
  },
];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  dataGeneratedAt,
  refreshStatus,
}: CategoryFilterProps) {
  const { darkMode } = useTheme();
  const activeConfig = categories.find((c) => c.value === selectedCategory)!.getConfig(darkMode);

  return (
    <div className={`
      relative overflow-visible rounded-2xl border p-5 pb-6 mb-6
      transition-all duration-500
      ${darkMode ? "bg-zinc-900/50 border-zinc-800/60" : "bg-white/50 border-zinc-200/60"}
      backdrop-blur-sm
    `}>
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none
        bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent
      `} />

      <div className="relative flex flex-col gap-4">
        {/* Top row: Title and description */}
        <div className="flex items-start sm:items-center gap-2.5">
          {/* Dynamic category icon */}
          <div className={`
            w-8 h-8 rounded-lg border flex items-center justify-center
            transition-all duration-300
            ${activeConfig.bgClass} ${activeConfig.borderColor}
          `}>
            <svg className={`w-4 h-4 ${activeConfig.colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activeConfig.icon} />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-black tracking-tight ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>
              Intelligence Feed
            </h3>
            <p className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
              Real-time signals from the AI research and industry landscape.
            </p>
          </div>
        </div>

        {/* Bottom row: Category chips + status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category chip buttons - horizontal scroll on mobile */}
          <div className="flex gap-2 overflow-x-visible py-2 -mx-1 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            {categories.map(({ value, getConfig }) => {
              const config = getConfig(darkMode);
              const isActive = selectedCategory === value;
              return (
                <button
                  key={value}
                  onClick={() => onCategoryChange(value)}
                  className={`
                    flex-shrink-0
                    inline-flex items-center gap-1.5
                    px-3 py-1.5
                    rounded-lg border
                    text-xs font-bold uppercase tracking-wider
                    transition-all duration-300
                    ${isActive
                      ? `${config.activeBgClass} ${config.activeBorderClass} ${config.colorClass} shadow-md`
                      : `${config.bgClass} ${config.borderColor} ${config.colorClass} hover:scale-105`
                    }
                    ${isActive ? "ring-2 ring-offset-2 ring-indigo-500/30" : ""}
                    ${darkMode && isActive ? "ring-offset-zinc-900" : darkMode ? "" : "ring-offset-white"}
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                  `}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                  </svg>
                  <span className="hidden xs:inline">{config.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Status indicators */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {dataGeneratedAt && (
              <span className={`flex items-center gap-1.5 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(dataGeneratedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {refreshStatus && (
              <span className={`
                flex items-center gap-1.5 font-medium
                ${refreshStatus.includes("Error") ? "text-red-400" : "text-emerald-400"}
              `}>
                <svg className={`w-3 h-3 ${refreshStatus.includes("Error") ? "" : "animate-pulse"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {refreshStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
