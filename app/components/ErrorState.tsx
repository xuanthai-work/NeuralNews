"use client";

import { useTheme } from "../context/ThemeContext";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"} flex items-center justify-center`}>
      <div className="text-red-400">Error: {error}</div>
    </div>
  );
}