"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

const VALID_CATEGORIES: Category[] = ["all", "benchmarks", "ai-blogs", "tech-news", "community"];

function isValidCategory(value: string | null): value is Category {
  return value !== null && (VALID_CATEGORIES as string[]).includes(value);
}

export function useNews(initialData?: Data): UseNewsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filter state from URL — URL is the source of truth so links are shareable
  const urlCategory = searchParams.get("category");
  const selectedCategory: Category = isValidCategory(urlCategory) ? urlCategory : "all";
  const searchTerm = searchParams.get("q") ?? "";

  const [data, setData] = useState<Data | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState("");

  useEffect(() => {
    if (initialData) return; // Server-rendered, skip client fetch
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
  }, [initialData]);

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setSearchTerm = useCallback(
    (term: string) => {
      updateUrl({ q: term });
    },
    [updateUrl]
  );

  const setSelectedCategory = useCallback(
    (category: Category) => {
      updateUrl({ category: category === "all" ? null : category });
    },
    [updateUrl]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshStatus("Checking for updates...");

    // Try /api/scrape first (works locally with Python). On hosts that don't
    // have Python (Vercel etc.), fall back to re-fetching /data.json so the
    // user still picks up whatever GitHub Actions last committed.
    try {
      const response = await fetch("/api/scrape", { method: "POST" });
      if (response.ok) {
        const result = await response.json();
        setRefreshStatus(`Success! ${result.data.total_stories} stories fetched`);
        setData(result.data);
        setTimeout(() => setRefreshStatus(""), 3000);
        return;
      }
      // Fall through to the data.json fallback below
    } catch {
      // Fall through
    }

    try {
      const dataRes = await fetch("/data.json", { cache: "no-store" });
      if (!dataRes.ok) throw new Error("Failed to load data");
      const fresh: Data = await dataRes.json();
      setData(fresh);
      setRefreshStatus(`Loaded ${fresh.total_stories} stories`);
      setTimeout(() => setRefreshStatus(""), 3000);
    } catch (err) {
      setRefreshStatus(`Error: ${err instanceof Error ? err.message : "Failed to refresh"}`);
      setTimeout(() => setRefreshStatus(""), 5000);
    } finally {
      setRefreshing(false);
    }
  };

  const getSourceCategory = (source: string): Category => {
    if (CATEGORY_SOURCES.benchmarks.some((s) => source.includes(s))) return "benchmarks";
    if (CATEGORY_SOURCES["ai-blogs"].some((s) => source.includes(s))) return "ai-blogs";
    if (CATEGORY_SOURCES["tech-news"].some((s) => source.includes(s))) return "tech-news";
    return "community";
  };

  const filteredStories = data?.stories.filter((story) => {
    if (selectedCategory !== "all") {
      const storyCategory = getSourceCategory(story.source || "");
      if (storyCategory !== selectedCategory) return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      story.title.toLowerCase().includes(term) ||
      story.bullet_points.some((bp) => bp.toLowerCase().includes(term))
    );
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
