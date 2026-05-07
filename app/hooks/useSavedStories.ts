"use client";

import { useState, useEffect, useCallback } from "react";
import type { Story } from "../types";

const STORAGE_KEY = "neuralnews_saved_stories";

export interface SavedStory extends Story {
  savedAt: string;
}

interface UseSavedStoriesReturn {
  savedStories: SavedStory[];
  savedIds: Set<number>;
  isSaved: (id: number) => boolean;
  toggleSaved: (story: Story) => void;
  removeSaved: (id: number) => void;
  clearAll: () => void;
  count: number;
}

function loadFromStorage(): SavedStory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(stories: SavedStory[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    window.dispatchEvent(new CustomEvent("savedStoriesChanged"));
  } catch (err) {
    console.error("Failed to save stories:", err);
  }
}

export function useSavedStories(): UseSavedStoriesReturn {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSavedStories(loadFromStorage());
    setMounted(true);

    const handleChange = () => setSavedStories(loadFromStorage());
    window.addEventListener("savedStoriesChanged", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("savedStoriesChanged", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  const savedIds = new Set(savedStories.map((s) => s.id));

  const isSaved = useCallback(
    (id: number) => savedIds.has(id),
    [savedIds]
  );

  const toggleSaved = useCallback((story: Story) => {
    const current = loadFromStorage();
    const exists = current.find((s) => s.id === story.id);
    let next: SavedStory[];
    if (exists) {
      next = current.filter((s) => s.id !== story.id);
    } else {
      next = [{ ...story, savedAt: new Date().toISOString() }, ...current];
    }
    saveToStorage(next);
    setSavedStories(next);
  }, []);

  const removeSaved = useCallback((id: number) => {
    const current = loadFromStorage();
    const next = current.filter((s) => s.id !== id);
    saveToStorage(next);
    setSavedStories(next);
  }, []);

  const clearAll = useCallback(() => {
    saveToStorage([]);
    setSavedStories([]);
  }, []);

  return {
    savedStories: mounted ? savedStories : [],
    savedIds,
    isSaved,
    toggleSaved,
    removeSaved,
    clearAll,
    count: mounted ? savedStories.length : 0,
  };
}
