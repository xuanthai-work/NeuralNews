"use client";

import { useTheme } from "../context/ThemeContext";

interface EmptyStateProps {
  searchTerm?: string;
}

export function EmptyState({ searchTerm }: EmptyStateProps) {
  const { darkMode } = useTheme();

  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <div className={`text-lg ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
        {searchTerm ? "No stories match your search." : "No stories available."}
      </div>
    </div>
  );
}