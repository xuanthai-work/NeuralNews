"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  searchTerm: string;
  refreshing: boolean;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

// Recent searches type
interface RecentSearch {
  term: string;
  timestamp: number;
}

export function Header({ searchTerm, refreshing, onSearchChange, onRefresh }: HeaderProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse recent searches");
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [
      { term, timestamp: Date.now() },
      ...recentSearches.filter(s => s.term !== term)
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent-searches", JSON.stringify(updated));
  };

  // Clear a specific recent search
  const clearRecentSearch = (term: string) => {
    const updated = recentSearches.filter(s => s.term !== term);
    setRecentSearches(updated);
    localStorage.setItem("recent-searches", JSON.stringify(updated));
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent-searches");
  };

  // Handle search change with save on blur
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Handle blur - save search if has value
  const handleSearchBlur = () => {
    setIsFocused(false);
    if (searchTerm.trim()) {
      saveSearch(searchTerm);
    }
  };

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
      <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6">
          {/* Mobile logo + search toggle */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all ${
              darkMode ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</span>
        </div>

        {/* Mobile search overlay */}
        {isMobileSearchOpen && (
          <div className={`
            fixed inset-0 z-50 lg:hidden
            ${darkMode ? "bg-zinc-950" : "bg-white"}
            animate-in fade-in duration-200
          `}>
            <div className={`flex items-center gap-3 px-4 py-3 border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
              <svg className={`w-5 h-5 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                className={`flex-1 bg-transparent text-base outline-none ${
                  darkMode ? "text-zinc-100 placeholder-zinc-600" : "text-zinc-900 placeholder-zinc-400"
                }`}
                autoFocus
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className={`p-2 rounded-lg ${darkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-600 hover:bg-zinc-200"}`}
              >
                Close
              </button>
            </div>
            {/* Recent searches in mobile */}
            {recentSearches.length > 0 && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>Recent</span>
                  <button
                    onClick={clearAllRecentSearches}
                    className={`text-xs ${darkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search.timestamp}
                      onClick={() => {
                        onSearchChange(search.term);
                        setIsMobileSearchOpen(false);
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-sm
                        transition-all duration-200
                        ${darkMode
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }
                      `}
                    >
                      {search.term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Search input with enhanced focus states */}
          <div className="relative hidden sm:block">
            <div className={`
              flex items-center gap-2
              rounded-xl border transition-all duration-300
              ${isFocused
                ? `w-80 shadow-lg shadow-indigo-500/10 ${
                    darkMode
                      ? "bg-zinc-900 border-indigo-500/50"
                      : "bg-white border-indigo-500/50"
                  }`
                : `w-64 ${
                    darkMode
                      ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      : "bg-zinc-100 border-zinc-300 hover:border-zinc-400"
                  }`
              }
            `}>
              <svg className={`ml-3 w-4 h-4 transition-colors ${
                isFocused
                  ? darkMode ? "text-indigo-400" : "text-indigo-600"
                  : darkMode ? "text-zinc-500" : "text-zinc-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                onBlur={handleSearchBlur}
                className={`
                  flex-1 bg-transparent py-2 text-sm outline-none
                  ${darkMode ? "text-zinc-100 placeholder-zinc-600" : "text-zinc-900 placeholder-zinc-400"}
                `}
              />
              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={() => {
                    onSearchChange("");
                    searchInputRef.current?.focus();
                  }}
                  className={`
                    mr-2 p-1 rounded-full transition-all duration-200
                    ${darkMode
                      ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200"
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Keyboard shortcut hint */}
            <kbd className={`
              absolute right-8 top-1/2 -translate-y-1/2
              px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded
              transition-opacity duration-300
              ${isFocused ? "opacity-0" : "opacity-100"}
              ${darkMode ? "bg-zinc-800 text-zinc-500 border border-zinc-700" : "bg-zinc-200 text-zinc-500 border border-zinc-300"}
            `}>
              ⌘K
            </kbd>

            {/* Recent searches dropdown */}
            {isFocused && recentSearches.length > 0 && !searchTerm && (
              <div className={`
                absolute top-full left-0 right-0 mt-2 p-3
                rounded-xl border shadow-xl
                animate-in fade-in slide-in-from-top-2 duration-200
                ${darkMode
                  ? "bg-zinc-900 border-zinc-800 shadow-zinc-950/50"
                  : "bg-white border-zinc-200 shadow-zinc-200/50"
                }
              `}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>Recent</span>
                  <button
                    onClick={clearAllRecentSearches}
                    className={`text-xs ${darkMode ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`}
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search.timestamp}
                      onClick={() => {
                        onSearchChange(search.term);
                        searchInputRef.current?.blur();
                      }}
                      className={`
                        group flex items-center gap-1.5
                        px-3 py-1.5 rounded-full text-sm
                        transition-all duration-200
                        ${darkMode
                          ? "bg-zinc-800 text-zinc-300 hover:bg-indigo-600 hover:text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-indigo-600 hover:text-white"
                        }
                      `}
                    >
                      <svg className="w-3 h-3 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {search.term}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          clearRecentSearch(search.term);
                        }}
                        className={`
                          ml-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100
                          transition-opacity duration-200
                          ${darkMode ? "hover:bg-zinc-700" : "hover:bg-zinc-200"}
                        `}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle button with animated icon transition */}
          <button
            onClick={toggleDarkMode}
            className={`
              group relative p-2 rounded-lg overflow-hidden
              transition-all duration-300
              ${darkMode
                ? "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 hover:shadow-lg hover:shadow-amber-500/10"
                : "text-zinc-600 hover:text-indigo-600 hover:bg-zinc-200 hover:shadow-lg hover:shadow-indigo-500/10"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
              ${darkMode ? "focus:ring-offset-zinc-950" : "focus:ring-offset-white"}
            `}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {/* Animated icon container */}
            <div className="relative w-5 h-5">
              {/* Sun icon (shown in light mode) */}
              <svg
                className={`
                  absolute inset-0 w-5 h-5
                  transition-all duration-500 ease-out
                  ${darkMode ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>

              {/* Moon icon (shown in dark mode) */}
              <svg
                className={`
                  absolute inset-0 w-5 h-5
                  transition-all duration-500 ease-out
                  ${darkMode ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className={`
              p-2 rounded-lg transition-all duration-300
              ${refreshing
                ? "bg-indigo-500/20 text-indigo-400"
                : darkMode
                ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 hover:rotate-90"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 hover:rotate-90"
              }
            `}
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
