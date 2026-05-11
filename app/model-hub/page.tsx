"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";

function modelSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Case-insensitive provider config lookup, falls back to "Other"
function lookupProviderConfig(
  configs: Record<string, ProviderConfig>,
  provider: string
): ProviderConfig {
  if (configs[provider]) return configs[provider];
  const lower = provider.toLowerCase();
  for (const key of Object.keys(configs)) {
    if (key.toLowerCase() === lower) return configs[key];
  }
  return configs["Other"];
}

interface Model {
  name: string;
  provider: string;
  description: string;
  context_window: string;
  input_price: number;
  output_price: number;
  parameters?: string;
  knowledge_cutoff?: string;
  max_output?: string;
  release_date?: string;
  arena_elo?: number;
  votes?: number;
  license?: string;
  capabilities: string[];
}

interface ProviderConfig {
  name: string;
  color: string;
  bg: string;
  border: string;
  activeBg: string;
  activeBorder: string;
  icon: string;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  "Anthropic": {
    name: "Anthropic",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    activeBg: "bg-orange-500/25",
    activeBorder: "border-orange-500/50",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  "OpenAI": {
    name: "OpenAI",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    activeBg: "bg-emerald-500/25",
    activeBorder: "border-emerald-500/50",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  "Google": {
    name: "Google",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    activeBg: "bg-blue-500/25",
    activeBorder: "border-blue-500/50",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  },
  "Meta": {
    name: "Meta",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/15",
    border: "border-indigo-500/30",
    activeBg: "bg-indigo-500/25",
    activeBorder: "border-indigo-500/50",
    icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
  },
  "Microsoft": {
    name: "Microsoft",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    activeBg: "bg-sky-500/25",
    activeBorder: "border-sky-500/50",
    icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  },
  "Ollama": {
    name: "Ollama",
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-500/15",
    border: "border-zinc-500/30",
    activeBg: "bg-zinc-500/25",
    activeBorder: "border-zinc-500/50",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  },
  "xAI": {
    name: "xAI",
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
    activeBg: "bg-slate-500/25",
    activeBorder: "border-slate-500/50",
    icon: "M6 18L18 6M6 6l12 12",
  },
  "DeepSeek": {
    name: "DeepSeek",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    activeBg: "bg-cyan-500/25",
    activeBorder: "border-cyan-500/50",
    icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 12l2 2 4-4",
  },
  "Mistral AI": {
    name: "Mistral AI",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    activeBg: "bg-purple-500/25",
    activeBorder: "border-purple-500/50",
    icon: "M5 3v18M19 3v18M5 12h14",
  },
  "Alibaba": {
    name: "Alibaba",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    activeBg: "bg-amber-500/25",
    activeBorder: "border-amber-500/50",
    icon: "M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9-4 9 4",
  },
  "Cohere": {
    name: "Cohere",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    activeBg: "bg-pink-500/25",
    activeBorder: "border-pink-500/50",
    icon: "M12 6v6l4 2",
  },
  "Baidu": {
    name: "Baidu",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    activeBg: "bg-red-500/25",
    activeBorder: "border-red-500/50",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
  },
  "Moonshot": {
    name: "Moonshot",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-500/15",
    border: "border-teal-500/30",
    activeBg: "bg-teal-500/25",
    activeBorder: "border-teal-500/50",
    icon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  },
  "Xiaomi": {
    name: "Xiaomi",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    activeBg: "bg-orange-500/25",
    activeBorder: "border-orange-500/50",
    icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  },
  "Z.ai": {
    name: "Z.ai",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-500/15",
    border: "border-fuchsia-500/30",
    activeBg: "bg-fuchsia-500/25",
    activeBorder: "border-fuchsia-500/50",
    icon: "M4 7h16M4 12h16M4 17h16",
  },
  "01.AI": {
    name: "01.AI",
    color: "text-lime-600 dark:text-lime-400",
    bg: "bg-lime-500/15",
    border: "border-lime-500/30",
    activeBg: "bg-lime-500/25",
    activeBorder: "border-lime-500/50",
    icon: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  "Other": {
    name: "Other",
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-500/15",
    border: "border-zinc-500/30",
    activeBg: "bg-zinc-500/25",
    activeBorder: "border-zinc-500/50",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2",
  },
};


export default function ModelHubPage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load models (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setModels(Array.isArray(data.models) ? data.models : []);
        setUpdatedAt(data.updated_at || "");
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error loading models:", err);
        setError(err.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredModels = models.filter((model) => {
    const matchesProvider = selectedProvider === "all" || model.provider === selectedProvider;
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  // Build providers list dynamically from actual model data
  const providers = ["all", ...Array.from(new Set(models.map((m) => m.provider))).sort()];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Loading model catalog...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"} flex items-center justify-center`}>
        <div className={`text-center max-w-md p-8 rounded-2xl ${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"}`}>
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold mb-2">Failed to load models</h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>Model Hub</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-56 transition-all ${darkMode ? "bg-zinc-900 border border-zinc-800 text-zinc-300" : "bg-zinc-100 border border-zinc-300 text-zinc-700"}`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full flex-1">
          {/* Hero Section */}
          <section className={`relative overflow-hidden rounded-xl ${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} p-8 mb-8`}>
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <span className="text-[120px] leading-none">🤖</span>
            </div>
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-indigo-400 font-mono uppercase tracking-widest text-xs">Model Directory</span>
              </div>
              <h2 className={`text-4xl font-bold ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>Model Hub</h2>
              <p className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Explore and compare the latest large language models, ranked by Chatbot Arena. Find the right model for your use case.
              </p>
              <div className={`flex flex-wrap gap-4 text-xs ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {models.length} models
                </span>
                {updatedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Updated {new Date(updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Provider Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-x-visible">
              {providers.map((provider) => {
                const isActive = selectedProvider === provider;
                const config = provider === "all"
                  ? {
                      color: darkMode ? "text-zinc-300" : "text-zinc-700",
                      bg: darkMode ? "bg-zinc-800" : "bg-zinc-100",
                      border: darkMode ? "border-zinc-700" : "border-zinc-300",
                      activeBg: darkMode ? "bg-zinc-700" : "bg-zinc-200",
                      activeBorder: darkMode ? "border-zinc-500" : "border-zinc-400",
                      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                    }
                  : lookupProviderConfig(PROVIDER_CONFIGS, provider);

                return (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`
                      flex-shrink-0 sm:flex-shrink
                      inline-flex items-center gap-1.5
                      px-3 py-1.5
                      rounded-lg border
                      text-xs font-bold uppercase tracking-wider
                      transition-all duration-300
                      ${isActive
                        ? `${config.activeBg || config.bg} ${config.activeBorder || config.border} ${config.color} shadow-md`
                        : `${config.bg} ${config.border} ${config.color} hover:scale-105`
                      }
                    `}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                    </svg>
                    <span>{provider === "all" ? "All" : provider}</span>
                  </button>
                );
              })}
            </div>
            <div className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-600"} hidden sm:block`}>
              {filteredModels.length} models
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const providerConfig = lookupProviderConfig(PROVIDER_CONFIGS, model.provider);
              const cardBgClass = darkMode
                ? "bg-zinc-900/80 backdrop-blur-sm border-zinc-800/60"
                : "bg-white border-zinc-200/80";

              return (
                <article
                  key={model.name}
                  className={`
                    group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out
                    ${cardBgClass}
                    hover:-translate-y-1.5 hover:shadow-2xl
                    active:scale-[0.98] active:translate-y-0
                  `}
                >
                  {/* Provider accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${providerConfig.bg.replace("/15", "")} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${providerConfig.bg} ${providerConfig.border} ${providerConfig.color}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={providerConfig.icon} />
                        </svg>
                        {model.provider}
                      </div>
                      {model.arena_elo && model.arena_elo > 0 && (
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full ${darkMode ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-amber-100 text-amber-700 border border-amber-300"}`}
                          title={`Arena ELO: ${model.arena_elo}${model.votes ? ` (${model.votes.toLocaleString()} votes)` : ""}`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {model.arena_elo}
                        </div>
                      )}
                    </div>

                    {/* Model name */}
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                      {model.name}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed mb-4 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                      {model.description}
                    </p>

                    {/* Specs grid */}
                    <div className={`grid grid-cols-2 gap-3 p-3 rounded-lg mb-4 ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}>
                      <div>
                        <div className={`text-[10px] uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Context</div>
                        <div className={`text-sm font-bold ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>{model.context_window}</div>
                      </div>
                      <div>
                        <div className={`text-[10px] uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Input / Output</div>
                        <div className={`text-sm font-bold ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>
                          ${model.input_price} / ${model.output_price}
                        </div>
                      </div>
                      {model.parameters && (
                        <div>
                          <div className={`text-[10px] uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Parameters</div>
                          <div className={`text-sm font-bold ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>{model.parameters}</div>
                        </div>
                      )}
                      {model.knowledge_cutoff && (
                        <div>
                          <div className={`text-[10px] uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>Knowledge</div>
                          <div className={`text-sm font-bold ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}>{model.knowledge_cutoff}</div>
                        </div>
                      )}
                    </div>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {model.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className={`
                            px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                            ${darkMode
                              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            }
                          `}
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    <Link
                      href={`/model-hub/${modelSlug(model.name)}`}
                      className={`
                        w-full py-2.5 rounded-xl
                        text-xs font-bold uppercase tracking-wide
                        transition-all duration-300
                        flex items-center justify-center gap-2
                        ${darkMode
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                        }
                        hover:-translate-y-0.5 hover:scale-[1.02]
                      `}
                    >
                      <span>View Details</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div className={`text-center py-20 ${darkMode ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200"} rounded-2xl`}>
              <div className="text-6xl mb-4">🔍</div>
              <div className={`text-lg ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
                No models match your search.
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedProvider("all");
                }}
                className={`mt-4 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${darkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"}`}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            NeuralNews Model Hub &middot; Compare AI Models
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
