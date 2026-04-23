"use client";

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";

interface SavedStory {
  id: number;
  title: string;
  url: string;
  source: string;
  savedAt: string;
  category: string;
}

// Placeholder data - would come from user's saved items in production
const PLACEHOLDER_SAVED: SavedStory[] = [];

export default function SavedPage() {
  const { darkMode } = useTheme();
  const [savedStories, setSavedStories] = useState<SavedStory[]>(PLACEHOLDER_SAVED);

  const handleClearAll = () => {
    setSavedStories([]);
  };

  if (savedStories.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
        <Sidebar />

        <main className="lg:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
            <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
              <div className="flex items-center gap-6">
                <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>Saved</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full flex-1 flex items-center justify-center">
            <div className={`text-center max-w-md ${darkMode ? "bg-zinc-900/80 border border-zinc-800/60" : "bg-white/80 border border-zinc-200/80"} rounded-2xl border p-8 backdrop-blur-sm`}>
              {/* Illustration */}
              <div className="mb-6 flex justify-center">
                <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center ${darkMode ? "bg-zinc-800/50 border-zinc-700/50" : "bg-zinc-100 border-zinc-300"}`}>
                  <svg className={`w-10 h-10 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                No Saved Stories
              </h3>

              {/* Description */}
              <p className={`text-sm mb-6 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Save articles from the neural feed to read later. Your saved stories will appear here for easy access.
              </p>

              {/* CTA Button */}
              <a
                href="/"
                className={`
                  inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-xl
                  text-xs font-bold uppercase tracking-wide
                  transition-all duration-300
                  ${darkMode
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                  }
                  hover:-translate-y-0.5 hover:scale-[1.02]
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Browse Feed
              </a>
            </div>
          </div>

          <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
            <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
              NeuralNews Saved Items
            </div>
          </footer>
        </main>

        <BottomNav />
      </div>
    );
  }

  // When there are saved stories (future state)
  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>Saved</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClearAll}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide
                  transition-all
                  ${darkMode
                    ? "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                    : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                  }
                `}
              >
                Clear All
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full flex-1">
          {/* Header Section */}
          <section className="mb-6">
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
              Saved Stories
            </h2>
            <p className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
              {savedStories.length} items saved for later reading
            </p>
          </section>

          {/* Saved Stories List */}
          <div className="space-y-4">
            {savedStories.map((story) => (
              <article
                key={story.id}
                className={`
                  group relative overflow-hidden rounded-xl border p-4
                  transition-all duration-300
                  ${darkMode ? "bg-zinc-900/80 border-zinc-800/60" : "bg-white border-zinc-200/80"}
                  hover:-translate-y-0.5 hover:shadow-lg
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"}`}>
                        {story.category}
                      </span>
                      <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                        {story.source}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-base font-bold mb-2 line-clamp-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                      {story.title}
                    </h3>

                    {/* Meta */}
                    <div className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                      Saved {new Date(story.savedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        p-2 rounded-lg transition-all
                        ${darkMode
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }
                      `}
                      title="Read article"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      className={`
                        p-2 rounded-lg transition-all
                        ${darkMode
                          ? "bg-red-500/15 hover:bg-red-500/25 text-red-400"
                          : "bg-red-100 hover:bg-red-200 text-red-600"
                        }
                      `}
                      title="Remove from saved"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            NeuralNews Saved Items
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
