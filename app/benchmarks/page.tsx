"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sidebar } from "../components/Sidebar";

// Type definitions for benchmark data
type BenchmarkCategory = "text" | "code" | "vision" | "document";
type LicenseType = "open" | "Open Source" | "proprietary" | "closed" | "commercial";
type ProviderType = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "Cohere" | "Other" | string;
type SortByType = "rank" | "elo" | "votes";
type SortOrderType = "asc" | "desc";

interface Model {
  rank: number;
  name: string;
  provider: ProviderType;
  arena_elo: number;
  confidence: number;
  votes: number;
  license: LicenseType | string;
  parameters: string;
  input_price?: string | null;
  output_price?: string | null;
  context_window?: string | null;
  description?: string;
  knowledge_cutoff?: string;
}

interface BenchmarkData {
  updated_at: string;
  models: Model[];
  category?: BenchmarkCategory;
}

interface SortConfig {
  column: SortByType;
  direction: SortOrderType;
}

export default function BenchmarksPage() {
  const { darkMode } = useTheme();
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<BenchmarkCategory>("text");
  const [sortBy, setSortBy] = useState<SortByType>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("asc");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  useEffect(() => {
    // Fetch real benchmark data from Arena API via our backend
    const categoryMap: Record<BenchmarkCategory, string> = {
      text: "text",
      code: "code",
      vision: "vision",
      document: "document",
    };
    const category = categoryMap[selectedTab];

    setLoading(true);
    fetch(`/api/benchmarks?category=${category}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch benchmark data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading benchmarks:", err);
        setLoading(false);
      });
  }, [selectedTab]);

  // Calculate summary statistics
  const stats = data?.models.length
    ? {
        totalModels: data.models.length,
        totalVotes: data.models.reduce((sum, m) => sum + m.votes, 0),
        avgElo: Math.round(data.models.reduce((sum, m) => sum + m.arena_elo, 0) / data.models.length),
        topModel: data.models[0]?.name,
      }
    : null;

  // Get unique providers for filter dropdown
  const providers = useMemo(() => {
    if (!data?.models) return [];
    const uniqueProviders = Array.from(new Set(data.models.map(m => m.provider)));
    return uniqueProviders.sort();
  }, [data]);

  // Sort and filter models based on selection and search query
  const sortedModels = useMemo(() => {
    if (!data?.models) return [];

    let filtered = [...data.models];

    // Apply provider filter
    if (providerFilter !== "all") {
      filtered = filtered.filter((model) => model.provider === providerFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "rank") comparison = a.rank - b.rank;
      else if (sortBy === "elo") comparison = a.arena_elo - b.arena_elo;
      else if (sortBy === "votes") comparison = a.votes - b.votes;
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [data, sortBy, sortOrder, searchQuery, providerFilter]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setProviderFilter("all");
    setSortBy("rank");
    setSortOrder("asc");
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || providerFilter !== "all" || sortBy !== "rank" || sortOrder !== "asc";

  // Handle column header click for sorting
  const handleColumnSort = useCallback((column: "rank" | "elo" | "votes") => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      // New column, default to descending for ELO/votes, ascending for rank
      setSortBy(column);
      setSortOrder(column === "rank" ? "asc" : "desc");
    }
  }, [sortBy]);

  // Get sort indicator for column header
  const getSortIndicator = (column: "rank" | "elo" | "votes") => {
    if (sortBy !== column) return null;
    return sortOrder === "desc" ? " ↓" : " ↑";
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return darkMode
      ? "bg-gradient-to-br from-yellow-400/40 to-amber-500/30 text-yellow-200 border-yellow-400/60 shadow-lg shadow-yellow-500/30"
      : "bg-gradient-to-br from-yellow-100 to-amber-50 text-yellow-700 border-yellow-300 shadow-md";
    if (rank === 2) return darkMode
      ? "bg-gradient-to-br from-slate-300/40 to-gray-400/30 text-slate-200 border-slate-400/60 shadow-lg shadow-slate-400/30"
      : "bg-gradient-to-br from-slate-100 to-gray-50 text-slate-600 border-slate-300 shadow-md";
    if (rank === 3) return darkMode
      ? "bg-gradient-to-br from-amber-600/40 to-orange-500/30 text-amber-200 border-amber-500/60 shadow-lg shadow-amber-500/30"
      : "bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 border-amber-300 shadow-md";
    return darkMode
      ? "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
      : "bg-zinc-100 text-zinc-600 border-zinc-200";
  };

  const getEloBarColor = (elo: number) => {
    if (elo >= 1300) return "bg-gradient-to-r from-emerald-500 to-teal-400";
    if (elo >= 1200) return "bg-gradient-to-r from-blue-500 to-cyan-400";
    if (elo >= 1100) return "bg-gradient-to-r from-violet-500 to-purple-400";
    return "bg-gradient-to-r from-zinc-500 to-gray-400";
  };

  const getProviderBadge = (provider: string) => {
    const providerColors: Record<string, string> = {
      "OpenAI": darkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Anthropic": darkMode ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-100 text-orange-700 border-orange-200",
      "Google": darkMode ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-200",
      "Meta": darkMode ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-indigo-100 text-indigo-700 border-indigo-200",
      "Mistral": darkMode ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-200",
    };
    return providerColors[provider] || (darkMode ? "bg-zinc-700 text-zinc-300 border-zinc-600" : "bg-zinc-200 text-zinc-600 border-zinc-300");
  };

  const getLicenseBadge = (license: string) => {
    return license === "open" || license === "Open Source"
      ? darkMode
        ? "bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
        : "bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
      : darkMode
        ? "bg-zinc-700 text-zinc-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
        : "bg-zinc-300 text-zinc-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase";
  };

  const formatVotes = (votes: number) => {
    if (votes >= 1000000) return `${(votes / 1000000).toFixed(1)}M`;
    if (votes >= 1000) return `${(votes / 1000).toFixed(1)}K`;
    return votes.toString();
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-ping"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className={`text-lg font-semibold ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>Loading Benchmarks</div>
            <div className={`text-sm ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Fetching latest rankings from Chatbot Arena...</div>
          </div>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-xl h-16 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800/50" : "bg-white/80 border-b border-zinc-200/50"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className={`lg:hidden text-xl font-bold tracking-tight ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${darkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className={`text-xs font-medium ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>Live Data</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full flex-1">
          {/* Hero Section with Gradient */}
          <section className={`relative overflow-hidden rounded-2xl ${darkMode ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/30 border border-zinc-800/50" : "bg-gradient-to-br from-white via-white to-indigo-50 border border-zinc-200"} p-8 md:p-10 mb-8`}>
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-emerald-400 font-mono uppercase tracking-wider text-[10px] font-semibold">Live Benchmark Updates</span>
                  </span>
                </div>
                <h2 className={`text-4xl md:text-5xl font-bold ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">LLM Leaderboard</span>
                </h2>
                <p className={`${darkMode ? "text-zinc-400" : "text-zinc-600"} text-lg max-w-xl`}>
                  Real-time AI model rankings based on human preference data from Chatbot Arena. Updated daily with comprehensive benchmarks.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button className={`group border ${darkMode ? "border-zinc-700 hover:bg-zinc-800/50 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-700"} px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-zinc-500/10 hover:-translate-y-0.5`}>
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm font-medium">Export CSV</span>
                  </button>
                  <button className={`group border ${darkMode ? "border-zinc-700 hover:bg-zinc-800/50 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-700"} px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-zinc-500/10 hover:-translate-y-0.5`}>
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium">Compare Models</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              {stats && (
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className={`px-6 py-4 rounded-2xl ${darkMode ? "bg-zinc-800/50 border border-zinc-700/50" : "bg-white border border-zinc-200"} backdrop-blur-sm`}>
                    <div className={`text-2xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{stats.totalModels}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Models</div>
                  </div>
                  <div className={`px-6 py-4 rounded-2xl ${darkMode ? "bg-zinc-800/50 border border-zinc-700/50" : "bg-white border border-zinc-200"} backdrop-blur-sm`}>
                    <div className={`text-2xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{formatVotes(stats.totalVotes)}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Total Votes</div>
                  </div>
                  <div className={`px-6 py-4 rounded-2xl ${darkMode ? "bg-zinc-800/50 border border-zinc-700/50" : "bg-white border border-zinc-200"} backdrop-blur-sm`}>
                    <div className={`text-2xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{stats.avgElo}</div>
                    <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Avg ELO</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Leaderboard Tabs with Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Category Tabs */}
            <div className={`inline-flex p-1 rounded-xl ${darkMode ? "bg-zinc-900/50 border border-zinc-800/50" : "bg-zinc-100 border border-zinc-200"}`}>
              {(["text", "code", "vision", "document"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedTab === tab
                      ? "text-white"
                      : darkMode
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
                  }`}
                >
                  {selectedTab === tab && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg shadow-indigo-500/25"></div>
                  )}
                  <span className="relative z-10 capitalize">{tab}</span>
                </button>
              ))}
            </div>

            {/* Sorting, Search, and Last Updated */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Input */}
              <div className={`relative flex items-center ${darkMode ? "bg-zinc-900" : "bg-white"} rounded-lg border ${darkMode ? "border-zinc-700" : "border-zinc-300"}`}>
                <svg className={`w-4 h-4 ml-3 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search models or providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`px-3 py-2 bg-transparent border-none outline-none text-sm w-40 lg:w-48 ${darkMode ? "text-zinc-200 placeholder-zinc-600" : "text-zinc-800 placeholder-zinc-400"}`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`mr-2 p-1 rounded-full ${darkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Provider Filter */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Provider:</span>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    darkMode
                      ? "bg-zinc-900 border-zinc-700 text-zinc-300 focus:border-indigo-500"
                      : "bg-white border-zinc-300 text-zinc-700 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer max-w-[150px]`}
                  aria-label="Filter by provider"
                >
                  <option value="all">All Providers</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Sort:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split("-") as ["rank" | "elo" | "votes", "asc" | "desc"];
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className={`text-sm rounded-lg px-3 py-2 border ${
                    darkMode
                      ? "bg-zinc-900 border-zinc-700 text-zinc-300 focus:border-indigo-500"
                      : "bg-white border-zinc-300 text-zinc-700 focus:border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer`}
                  aria-label="Sort models"
                >
                  <option value="rank-asc">Rank ↑</option>
                  <option value="rank-desc">Rank ↓</option>
                  <option value="elo-desc">ELO ↓</option>
                  <option value="elo-asc">ELO ↑</option>
                  <option value="votes-desc">Votes ↓</option>
                  <option value="votes-asc">Votes ↑</option>
                </select>
              </div>

              {/* Clear All Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    darkMode
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-300"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all
                </button>
              )}

              {/* Last Updated */}
              <div className={`flex items-center gap-2 text-xs ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{new Date(data?.updated_at || "").toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className={`${darkMode ? "bg-zinc-900/50 border border-zinc-800/50" : "bg-white border border-zinc-200"} rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-zinc-500/5`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? "bg-zinc-900/80" : "bg-zinc-50/80"} border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                    <th
                      onClick={() => handleColumnSort("rank")}
                      className={`text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest cursor-pointer transition-colors ${
                        sortBy === "rank"
                          ? darkMode ? "text-indigo-400" : "text-indigo-600"
                          : "text-zinc-500 hover:text-zinc-300"
                      } w-16`}
                    >
                      Rank{getSortIndicator("rank")}
                    </th>
                    <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500 min-w-[200px]">Model</th>
                    <th
                      onClick={() => handleColumnSort("elo")}
                      className={`text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest cursor-pointer transition-colors ${
                        sortBy === "elo"
                          ? darkMode ? "text-indigo-400" : "text-indigo-600"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>ELO Score{getSortIndicator("elo")}</span>
                        <svg className={`w-3.5 h-3.5 transition-colors ${sortBy === "elo" ? "text-indigo-500" : "text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </th>
                    <th
                      onClick={() => handleColumnSort("votes")}
                      className={`text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest cursor-pointer transition-colors ${
                        sortBy === "votes"
                          ? darkMode ? "text-indigo-400" : "text-indigo-600"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Votes{getSortIndicator("votes")}</span>
                        <svg className={`w-3.5 h-3.5 transition-colors ${sortBy === "votes" ? "text-indigo-500" : "text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Price/1M</span>
                        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </th>
                    <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedModels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className={`w-16 h-16 rounded-2xl ${darkMode ? "bg-zinc-800" : "bg-zinc-100"} flex items-center justify-center`}>
                            <svg className={`w-8 h-8 ${darkMode ? "text-zinc-600" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className={`text-lg font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>No models found</div>
                            <div className={`text-sm ${darkMode ? "text-zinc-500" : "text-zinc-500"} mt-1`}>Try adjusting your search query</div>
                          </div>
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedModels.map((model, index) => {
                    const maxElo = Math.max(...(data?.models.map(m => m.arena_elo) || [1200]));
                    const eloPercentage = Math.min((model.arena_elo / maxElo) * 100, 100);

                    return (
                      <tr
                        key={model.name}
                        onMouseEnter={() => setHoveredRow(model.name)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className={`border-b ${darkMode ? "border-zinc-800/30" : "border-zinc-100"} transition-all duration-200 ${
                          hoveredRow === model.name
                            ? darkMode
                              ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent scale-[1.005]"
                              : "bg-gradient-to-r from-indigo-50/50 via-purple-50/20 to-transparent scale-[1.005]"
                            : ""
                        }`}
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${Math.min(index * 0.03, 0.6)}s both`,
                        }}
                      >
                        <td className="py-4 px-4">
                          <div className={`relative w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            hoveredRow === model.name ? "scale-110 shadow-lg" : ""
                          } ${getRankBadge(model.rank)}`}>
                            {model.rank === 1 && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            )}
                            {model.rank}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-base ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.name}</span>
                              <span className={getLicenseBadge(model.license)}>{model.license === "open" ? "Open Source" : "Proprietary"}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider border ${getProviderBadge(model.provider)}`}>
                                {model.provider}
                              </span>
                              <span className={`text-[10px] ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>•</span>
                              <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>{model.parameters}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.arena_elo}</span>
                              <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>±{model.confidence}</span>
                            </div>
                            {/* ELO Progress Bar */}
                            <div className={`w-24 h-1.5 rounded-full ${darkMode ? "bg-zinc-800" : "bg-zinc-200"} overflow-hidden`}>
                              <div
                                className={`h-full rounded-full ${getEloBarColor(model.arena_elo)} transition-all duration-500`}
                                style={{ width: `${eloPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{formatVotes(model.votes)}</span>
                            <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>community votes</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              <span className={`font-mono text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.input_price || "$0.10"}</span>
                              <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}>/</span>
                              <span className={`font-mono text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.output_price || "$0.40"}</span>
                            </div>
                            <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>input / output</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.context_window || "128K"}</span>
                            <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>tokens</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Cards with Visual Enhancements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Safety Benchmarks Card */}
            <div className={`relative overflow-hidden group ${darkMode ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/20 border border-zinc-800/50" : "bg-gradient-to-br from-white via-white to-emerald-50 border border-zinc-200"} p-6 rounded-2xl shadow-lg shadow-zinc-500/5`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-emerald-100 border border-emerald-200"}`}>
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className={`text-sm font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Safety Benchmarks</h4>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Claude 3.5</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Low Toxicity
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>GPT-5.1</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Low Toxicity
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Llama 4</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                      Moderate Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Latency Card */}
            <div className={`relative overflow-hidden group ${darkMode ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/20 border border-zinc-800/50" : "bg-gradient-to-br from-white via-white to-blue-50 border border-zinc-200"} p-6 rounded-2xl shadow-lg shadow-zinc-500/5`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/15 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-blue-500/20 border border-blue-500/30" : "bg-blue-100 border border-blue-200"}`}>
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className={`text-sm font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Avg Latency</h4>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Groq (Llama 3)</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      480 t/s
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>GPT-5.1 API</span>
                    <span className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>92 t/s</span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Claude 3.5</span>
                    <span className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>64 t/s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Cutoff Card */}
            <div className={`relative overflow-hidden group ${darkMode ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/20 border border-zinc-800/50" : "bg-gradient-to-br from-white via-white to-purple-50 border border-zinc-200"} p-6 rounded-2xl shadow-lg shadow-zinc-500/5`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? "bg-purple-500/20 border border-purple-500/30" : "bg-purple-100 border border-purple-200"}`}>
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className={`text-sm font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>Knowledge Cutoff</h4>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Claude Opus 4.6</span>
                    <span className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Apr 2026</span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>GPT-5.1</span>
                    <span className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Oct 2025</span>
                  </div>
                  <div className={`flex items-center justify-between p-2.5 rounded-lg ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                    <span className={`text-xs font-medium ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Llama 4</span>
                    <span className={`text-xs font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Dec 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Methodology Note */}
          <div className={`mt-8 relative overflow-hidden ${darkMode ? "bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-indigo-950/20 border border-zinc-800/50" : "bg-gradient-to-br from-white via-zinc-50 to-indigo-50 border border-zinc-200"} rounded-2xl p-6 backdrop-blur-sm`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-indigo-100 border border-indigo-200"}`}>
                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold mb-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>About Our Methodology</h4>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Our benchmarks are updated in real-time as official data and community verified runs are published.
                  We use a weighted average of reasoning, coding, and mathematical benchmarks to calculate the final score.
                  ELO scores are derived from pairwise human preferences in the Chatbot Arena.
                </p>
                <a
                  href="https://lmarena.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 mt-3 text-sm font-medium ${darkMode ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-500"} transition-colors group`}
                >
                  Learn more about our methodology
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800/50 bg-zinc-900/30" : "border-zinc-200/50 bg-white/50"} backdrop-blur-sm`}>
          <div className={`max-w-7xl mx-auto px-4 py-8 text-center`}>
            <div className={`text-sm font-medium ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
              NeuralNews <span className="mx-2">&middot;</span> LLM Leaderboard <span className="mx-2">&middot;</span> AI Model Benchmarks
            </div>
            <div className={`text-xs mt-2 ${darkMode ? "text-zinc-600" : "text-zinc-500"}`}>
              Data source: <a href="https://lmarena.ai" target="_blank" rel="noopener noreferrer" className={`underline ${darkMode ? "text-zinc-500 hover:text-zinc-400" : "text-zinc-500 hover:text-zinc-600"}`}>LMSys Chatbot Arena</a> &middot; Updated daily
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation (Mobile Only) - Enhanced */}
      <nav className={`lg:hidden fixed bottom-0 w-full z-50 backdrop-blur-xl flex justify-around items-center h-16 px-2 pb-safe shadow-2xl ${darkMode ? "bg-zinc-950/95 border-t border-zinc-800/50" : "bg-white/95 border-t border-zinc-200/50"}`}>
        <a className="group flex-1" href="/">
          <div className="flex flex-col items-center justify-center py-2 px-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${darkMode ? "text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300" : "text-zinc-500 group-hover:bg-zinc-100 group-hover:text-zinc-700"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className={`text-[9px] font-medium uppercase tracking-wider mt-1 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Feed</span>
          </div>
        </a>
        <a className="group flex-1" href="/benchmarks">
          <div className="flex flex-col items-center justify-center py-2 px-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${darkMode ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25" : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className={`text-[9px] font-medium uppercase tracking-wider mt-1 ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Bench</span>
          </div>
        </a>
        <a className="group flex-1" href="#">
          <div className="flex flex-col items-center justify-center py-2 px-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${darkMode ? "text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300" : "text-zinc-500 group-hover:bg-zinc-100 group-hover:text-zinc-700"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className={`text-[9px] font-medium uppercase tracking-wider mt-1 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Saved</span>
          </div>
        </a>
        <a className="group flex-1" href="#">
          <div className="flex flex-col items-center justify-center py-2 px-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${darkMode ? "text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-300" : "text-zinc-500 group-hover:bg-zinc-100 group-hover:text-zinc-700"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" strokeWidth={1.5} />
              </svg>
            </div>
            <span className={`text-[9px] font-medium uppercase tracking-wider mt-1 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Account</span>
          </div>
        </a>
      </nav>

      {/* Global animation styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
