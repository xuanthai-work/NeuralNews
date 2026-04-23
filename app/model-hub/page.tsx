"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";

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
};

const SAMPLE_MODELS: Model[] = [
  {
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    description: "Most capable model for complex tasks with exceptional reasoning and coding abilities.",
    context_window: "200K",
    input_price: 15,
    output_price: 75,
    parameters: "~175B",
    knowledge_cutoff: "April 2026",
    max_output: "16K",
    capabilities: ["Reasoning", "Code", "Vision", "Long Context"],
  },
  {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    description: "Balanced performance and speed for everyday tasks with strong general capabilities.",
    context_window: "200K",
    input_price: 3,
    output_price: 15,
    parameters: "~70B",
    knowledge_cutoff: "April 2026",
    max_output: "16K",
    capabilities: ["General", "Code", "Vision"],
  },
  {
    name: "GPT-5.1",
    provider: "OpenAI",
    description: "Flagship model with advanced reasoning, multimodal understanding, and tool use.",
    context_window: "128K",
    input_price: 10,
    output_price: 40,
    parameters: "~200B",
    knowledge_cutoff: "October 2025",
    max_output: "32K",
    capabilities: ["Reasoning", "Code", "Vision", "Tool Use"],
  },
  {
    name: "GPT-4.5 Turbo",
    provider: "OpenAI",
    description: "Cost-effective option with strong performance across all domains.",
    context_window: "128K",
    input_price: 2.5,
    output_price: 10,
    parameters: "~100B",
    knowledge_cutoff: "October 2025",
    max_output: "16K",
    capabilities: ["General", "Code", "Vision"],
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Google's most advanced model with native multimodal training and long context.",
    context_window: "1M",
    input_price: 7,
    output_price: 21,
    parameters: "~150B",
    knowledge_cutoff: "January 2026",
    max_output: "64K",
    capabilities: ["Vision", "Video", "Audio", "Long Context"],
  },
  {
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Fast, efficient model optimized for high-throughput applications.",
    context_window: "256K",
    input_price: 0.3,
    output_price: 1.2,
    parameters: "~30B",
    knowledge_cutoff: "January 2026",
    max_output: "8K",
    capabilities: ["General", "Vision", "Fast"],
  },
  {
    name: "Llama 4 Maverick",
    provider: "Meta",
    description: "Open source powerhouse with competitive performance and local deployment options.",
    context_window: "128K",
    input_price: 0.8,
    output_price: 0.8,
    parameters: "~400B MoE",
    knowledge_cutoff: "December 2025",
    max_output: "32K",
    capabilities: ["General", "Code", "Open Source"],
  },
  {
    name: "Llama 4 Scout",
    provider: "Meta",
    description: "Efficient open source model for resource-constrained deployments.",
    context_window: "32K",
    input_price: 0.1,
    output_price: 0.1,
    parameters: "~17B",
    knowledge_cutoff: "December 2025",
    max_output: "4K",
    capabilities: ["General", "Fast", "Open Source"],
  },
  {
    name: "Command R+",
    provider: "Microsoft",
    description: "Enterprise-focused model with strong RAG capabilities and tool integration.",
    context_window: "128K",
    input_price: 2.5,
    output_price: 10,
    parameters: "~104B",
    knowledge_cutoff: "March 2026",
    max_output: "8K",
    capabilities: ["RAG", "Tool Use", "Enterprise"],
  },
  {
    name: "Phi-4",
    provider: "Microsoft",
    description: "Compact model with surprising capabilities for its size.",
    context_window: "16K",
    input_price: 0.15,
    output_price: 0.6,
    parameters: "~14B",
    knowledge_cutoff: "March 2026",
    max_output: "4K",
    capabilities: ["General", "Efficient"],
  },
  {
    name: "Llama 4 Local",
    provider: "Ollama",
    description: "Run Llama locally with optimized quantization for consumer hardware.",
    context_window: "8K",
    input_price: 0,
    output_price: 0,
    parameters: "~8B (Q4)",
    knowledge_cutoff: "December 2025",
    max_output: "4K",
    capabilities: ["Local", "Open Source", "Offline"],
  },
  {
    name: "Mistral Large",
    provider: "Ollama",
    description: "European alternative with strong multilingual capabilities.",
    context_window: "32K",
    input_price: 2,
    output_price: 6,
    parameters: "~123B",
    knowledge_cutoff: "February 2026",
    max_output: "8K",
    capabilities: ["Multilingual", "Code", "General"],
  },
];

export default function ModelHubPage() {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate loading - in production would fetch from API
    const timer = setTimeout(() => {
      setModels(SAMPLE_MODELS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredModels = models.filter((model) => {
    const matchesProvider = selectedProvider === "all" || model.provider === selectedProvider;
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  const providers = ["all", ...Object.keys(PROVIDER_CONFIGS)];

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
                Explore and compare the latest large language models. Find the right model for your use case.
              </p>
            </div>
          </section>

          {/* Provider Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
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
                  : PROVIDER_CONFIGS[provider];

                return (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`
                      flex-shrink-0
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
              const providerConfig = PROVIDER_CONFIGS[model.provider] || PROVIDER_CONFIGS["Ollama"];
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
                    <button
                      className={`
                        w-full py-2.5 rounded-xl
                        text-xs font-bold uppercase tracking-wide
                        transition-all duration-300
                        ${darkMode
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                        }
                        hover:-translate-y-0.5 hover:scale-[1.02]
                      `}
                    >
                      View Details
                    </button>
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
