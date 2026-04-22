"use client";

import { useState, useEffect } from "react";
import type { Data, Category } from "../types";
import { CATEGORY_SOURCES } from "../types";

interface UseNewsReturn {
  data: Data | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: Category;
  refreshing: boolean;
  refreshStatus: string;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: Category) => void;
  handleRefresh: () => Promise<void>;
  filteredStories: Data["stories"] | undefined;
  getSourceCategory: (source: string) => Category;
}

export function useNews(): UseNewsReturn {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState("");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data: Data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshStatus("Starting scraper...");

    try {
      const response = await fetch("/api/scrape", { method: "POST" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to refresh");
      }

      setRefreshStatus(`Success! ${result.data.total_stories} stories fetched`);
      setData(result.data);

      setTimeout(() => {
        setRefreshStatus("");
      }, 3000);
    } catch (err) {
      setRefreshStatus(`Error: ${err instanceof Error ? err.message : "Failed to refresh"}`);
      setTimeout(() => {
        setRefreshStatus("");
      }, 5000);
    } finally {
      setRefreshing(false);
    }
  };

  const getSourceCategory = (source: string): Category => {
    if (CATEGORY_SOURCES.benchmarks.some(s => source.includes(s))) return "benchmarks";
    if (CATEGORY_SOURCES["ai-blogs"].some(s => source.includes(s))) return "ai-blogs";
    if (CATEGORY_SOURCES["tech-news"].some(s => source.includes(s))) return "tech-news";
    return "community";
  };

  const filteredStories = data?.stories.filter((story) => {
    if (selectedCategory !== "all") {
      const storyCategory = getSourceCategory(story.source || "");
      if (storyCategory !== selectedCategory) return false;
    }
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.bullet_points.some((bp) => bp.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return {
    data,
    loading,
    error,
    searchTerm,
    selectedCategory,
    refreshing,
    refreshStatus,
    setSearchTerm,
    setSelectedCategory,
    handleRefresh,
    filteredStories,
    getSourceCategory,
  };
}
