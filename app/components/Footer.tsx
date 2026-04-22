"use client";

import { useTheme } from "../context/ThemeContext";

export function Footer() {
  const { darkMode } = useTheme();

  return (
    <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
      <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
        <div className="mb-2">
          NeuralNews &middot; 20+ Sources &middot; AI-Powered Curation
        </div>
        <div className="text-xs text-zinc-600">
          🏆 Benchmarks &middot; 🧠 AI Blogs &middot; 📰 Tech News &middot; 👥 Community
        </div>
      </div>
    </footer>
  );
}
