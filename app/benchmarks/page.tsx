"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sidebar } from "../components/Sidebar";

interface Model {
  rank: number;
  name: string;
  provider: string;
  arena_elo: number;
  confidence: number;
  votes: number;
  license: string;
  parameters: string;
  input_price?: string;
  output_price?: string;
  context_window?: string;
}

interface BenchmarkData {
  updated_at: string;
  models: Model[];
}

export default function BenchmarksPage() {
  const { darkMode } = useTheme();
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"text" | "code" | "vision" | "document">("text");

  useEffect(() => {
    // Fetch real benchmark data from Arena API via our backend
    const categoryMap: Record<string, string> = {
      text: "text",
      code: "code",
      vision: "vision",
      document: "document",
    };
    const category = categoryMap[selectedTab] || "text";

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) return darkMode
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
      : "bg-emerald-100 text-emerald-700 border-emerald-300";
    if (rank === 2) return darkMode
      ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
      : "bg-blue-100 text-blue-700 border-blue-300";
    if (rank === 3) return darkMode
      ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
      : "bg-amber-100 text-amber-700 border-amber-300";
    return darkMode
      ? "bg-zinc-800 text-zinc-400 border-zinc-700"
      : "bg-zinc-200 text-zinc-700 border-zinc-300";
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-indigo-500/20">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className={`text-sm ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Loading benchmark data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
            <div className="flex items-center gap-6">
              <span className={`lg:hidden text-lg font-bold tracking-tighter ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</span>
            </div>

            <div className="flex items-center gap-4">
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full flex-1">
          {/* Hero Section */}
          <section className={`relative overflow-hidden rounded-xl ${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} p-8 mb-8`}>
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <span className="text-[120px] leading-none">🏆</span>
            </div>
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-mono uppercase tracking-widest text-xs">Live Benchmark Updates</span>
              </div>
              <h2 className={`text-4xl font-bold ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>LLM Leaderboard</h2>
              <p className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Real-time AI model rankings based on human preference data from Chatbot Arena. Updated daily.</p>
              <div className="flex gap-3 pt-2">
                <button className={`border ${darkMode ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-700"} px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>
                <button className={`border ${darkMode ? "border-zinc-700 hover:bg-zinc-800 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-700"} px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare Models
                </button>
              </div>
            </div>
          </section>

          {/* Leaderboard Tabs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab("text")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTab === "text"
                    ? "bg-indigo-500 text-white"
                    : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setSelectedTab("code")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTab === "code"
                    ? "bg-indigo-500 text-white"
                    : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setSelectedTab("vision")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTab === "vision"
                    ? "bg-indigo-500 text-white"
                    : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => setSelectedTab("document")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTab === "document"
                    ? "bg-indigo-500 text-white"
                    : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                }`}
              >
                Document
              </button>
            </div>
            <div className={`text-xs ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
              Updated: {new Date(data?.updated_at || "").toLocaleString()}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} rounded-xl overflow-hidden`}>
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
                  <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500 w-16">Rank</th>
                  <th className="text-left py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Model</th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span title="Arena Score">Score</span>
                  </th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Votes</th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <span title="Price per 1M tokens (input / output)">Price $/M</span>
                  </th>
                  <th className="text-right py-4 px-4 text-[10px] font-mono uppercase tracking-widest text-zinc-500">Context</th>
                </tr>
              </thead>
              <tbody>
                {data?.models.map((model) => (
                  <tr
                    key={model.name}
                    className={`border-b ${darkMode ? "border-zinc-800/50 hover:bg-zinc-800/50" : "border-zinc-200/50 hover:bg-zinc-100"} transition-colors group`}
                  >
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm ${getRankBadge(model.rank)}`}>
                        {model.rank}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.name}</span>
                          <span className={getLicenseBadge(model.license)}>{model.license}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>{model.provider}</span>
                          <span className={`text-[10px] ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}>•</span>
                          <span className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>{model.parameters}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`font-mono text-sm ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.arena_elo}</span>
                        <span className="text-[10px] text-zinc-500">±{model.confidence}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-mono text-sm ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{formatVotes(model.votes)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <span className={`font-mono ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>{model.input_price || "$1"}</span>
                        <span className="text-zinc-600">/</span>
                        <span className={`font-mono ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>{model.output_price || "$5"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-mono text-sm ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{model.context_window || "128K"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} p-6 rounded-xl`}>
              <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                🛡️ Safety Benchmarks
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Claude 3.5</span>
                  <span className="text-emerald-400">Low Toxicity</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>GPT-5.1</span>
                  <span className="text-emerald-400">Low Toxicity</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Llama 4</span>
                  <span className="text-yellow-400">Moderate Risk</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} p-6 rounded-xl`}>
              <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                ⚡ Avg Latency (tokens/s)
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Groq (Llama 3)</span>
                  <span className="text-emerald-400">480 t/s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>GPT-5.1 API</span>
                  <span className={`${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>92 t/s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Claude 3.5</span>
                  <span className={`${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>64 t/s</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"} p-6 rounded-xl`}>
              <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                📅 Knowledge Cutoff
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Claude Opus 4.6</span>
                  <span className={`${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>April 2026</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>GPT-5.1</span>
                  <span className={`${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Oct 2025</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>Llama 4</span>
                  <span className={`${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>Dec 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Methodology Note */}
          <div className={`mt-8 ${darkMode ? "bg-zinc-900/50 border border-zinc-800" : "bg-zinc-100 border border-zinc-200"} rounded-xl p-6`}>
            <div className="flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <h4 className={`text-sm font-bold mb-2 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>About Our Methodology</h4>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Our benchmarks are updated in real-time as official data and community verified runs are published.
                  We use a weighted average of reasoning, coding, and mathematical benchmarks to calculate the final score.
                  ELO scores are derived from pairwise human preferences in the Chatbot Arena.
                </p>
                <a href="https://lmarena.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
                  Learn more about our methodology →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-7xl mx-auto px-4 py-6 text-center text-sm ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
            <div className="mb-2">
              NeuralNews &middot; LLM Leaderboard &middot; AI Model Benchmarks
            </div>
            <div className="text-xs text-zinc-600">
              Data source: LMSys Chatbot Arena &middot; Updated daily
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className={`lg:hidden fixed bottom-0 w-full z-50 backdrop-blur-lg flex justify-around items-center h-16 px-4 pb-safe shadow-2xl ${darkMode ? "bg-zinc-950/90 border-t border-zinc-800" : "bg-white/90 border-t border-zinc-200"}`}>
        <a className={darkMode ? "text-zinc-500" : "text-zinc-600"} href="/">
          <div className="flex flex-col items-center justify-center py-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Feed</span>
          </div>
        </a>
        <a className={darkMode ? "text-zinc-100" : "text-zinc-900"} href="/benchmarks">
          <div className="flex flex-col items-center justify-center py-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Bench</span>
          </div>
        </a>
        <a className={darkMode ? "text-zinc-500" : "text-zinc-600"} href="#">
          <div className="flex flex-col items-center justify-center py-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Saved</span>
          </div>
        </a>
        <a className={darkMode ? "text-zinc-500" : "text-zinc-600"} href="#">
          <div className="flex flex-col items-center justify-center py-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" strokeWidth={1.5} />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Account</span>
          </div>
        </a>
      </nav>
    </div>
  );
}
