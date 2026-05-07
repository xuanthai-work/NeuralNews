"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Model } from "../../lib/models";
import type { Story } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { Sidebar } from "../../components/Sidebar";
import { BottomNav } from "../../components/BottomNav";
import { NewsCard } from "../../components/NewsCard";

interface ModelDetailClientProps {
  model: Model;
  similar: Model[];
  relatedStories: Story[];
  providerLinks: { docs?: string; pricing?: string; playground?: string; about?: string };
}

const PROVIDER_COLORS: Record<string, string> = {
  Anthropic: "from-orange-500/20 to-red-500/10 border-orange-500/30",
  OpenAI: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
  Google: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
  Meta: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",
  Microsoft: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
  xAI: "from-slate-500/20 to-zinc-500/10 border-slate-500/30",
  DeepSeek: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30",
  "Mistral AI": "from-purple-500/20 to-violet-500/10 border-purple-500/30",
  Alibaba: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
};

function modelSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function ModelDetailClient({
  model,
  similar,
  relatedStories,
  providerLinks,
}: ModelDetailClientProps) {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const bgClass = darkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900";
  const cardClass = darkMode
    ? "bg-zinc-900/60 border-zinc-800"
    : "bg-white border-zinc-200";
  const dimClass = darkMode ? "text-zinc-400" : "text-zinc-600";
  const fadeClass = darkMode ? "text-zinc-500" : "text-zinc-500";
  const heroGradient = PROVIDER_COLORS[model.provider] || "from-indigo-500/20 to-purple-500/10 border-indigo-500/30";

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <Sidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky header */}
        <header className={`sticky top-0 w-full z-50 backdrop-blur-md h-14 ${darkMode ? "bg-zinc-950/80 border-b border-zinc-800" : "bg-white/80 border-b border-zinc-200"}`}>
          <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1100px] mx-auto">
            <button
              onClick={() => router.back()}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${darkMode ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>

            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${darkMode ? "bg-zinc-800/60 text-zinc-300 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"}`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Share
                </>
              )}
            </button>
          </div>
        </header>

        <article className="flex-1 max-w-[1100px] mx-auto w-full px-4 md:px-6 py-8">
          {/* Hero */}
          <section className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${heroGradient} border p-6 md:p-8 mb-8`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${dimClass}`}>
                    {model.provider}
                  </span>
                  {model.license && (
                    <>
                      <span className={fadeClass}>·</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${model.license === "open" ? (darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700") : (darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-700")}`}>
                        {model.license === "open" ? "Open Source" : "Proprietary"}
                      </span>
                    </>
                  )}
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-3 ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>
                  {model.name}
                </h1>
                <p className={`text-base leading-relaxed max-w-2xl ${dimClass}`}>
                  {model.description}
                </p>
              </div>

              {/* ELO badge */}
              {model.arena_elo && model.arena_elo > 0 && (
                <div className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl ${darkMode ? "bg-zinc-900/80 border border-amber-500/30" : "bg-white border border-amber-300"}`}>
                  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div>
                    <div className={`text-2xl font-bold leading-none ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>{model.arena_elo}</div>
                    <div className={`text-[10px] font-mono uppercase tracking-widest mt-1 ${fadeClass}`}>
                      Arena ELO{model.votes ? ` · ${model.votes.toLocaleString()} votes` : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Capabilities pills */}
            {model.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {model.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${darkMode ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-indigo-100 text-indigo-700 border-indigo-300"}`}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Specs grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Spec label="Context window" value={model.context_window} darkMode={darkMode} />
            <Spec label="Input / output" value={`$${model.input_price} / $${model.output_price}`} sublabel="per 1M tokens" darkMode={darkMode} />
            <Spec label="Parameters" value={model.parameters || "—"} darkMode={darkMode} />
            <Spec label="Knowledge cutoff" value={model.knowledge_cutoff || "—"} darkMode={darkMode} />
          </section>

          {/* Provider links */}
          {Object.keys(providerLinks).length > 0 && (
            <section className={`rounded-2xl border p-5 md:p-6 mb-8 ${cardClass}`}>
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${fadeClass}`}>
                Resources
              </h2>
              <div className="flex flex-wrap gap-2">
                {providerLinks.about && (
                  <ResourceLink href={providerLinks.about} label="Model page" icon="info" darkMode={darkMode} />
                )}
                {providerLinks.docs && (
                  <ResourceLink href={providerLinks.docs} label="Docs" icon="book" darkMode={darkMode} />
                )}
                {providerLinks.pricing && (
                  <ResourceLink href={providerLinks.pricing} label="Pricing" icon="dollar" darkMode={darkMode} />
                )}
                {providerLinks.playground && (
                  <ResourceLink href={providerLinks.playground} label="Playground" icon="play" darkMode={darkMode} />
                )}
              </div>
            </section>
          )}

          {/* Related news */}
          {relatedStories.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                  In the news
                </h2>
                <span className={`text-xs font-mono uppercase tracking-widest ${fadeClass}`}>
                  {relatedStories.length} stories
                </span>
              </div>
              <p className={`text-sm mb-5 ${dimClass}`}>
                Recent NeuralNews stories mentioning {model.name.split(/[-\s]/).slice(0, 2).join(" ")}.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {relatedStories.map((s) => (
                  <NewsCard key={s.id} story={s} />
                ))}
              </div>
            </section>
          )}

          {/* Similar models */}
          {similar.length > 0 && (
            <section className="mb-12">
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                Similar models
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similar.map((m) => (
                  <Link
                    key={m.name}
                    href={`/model-hub/${modelSlug(m.name)}`}
                    className={`group p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg ${cardClass}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${dimClass}`}>
                        {m.provider}
                      </span>
                      {m.arena_elo && m.arena_elo > 0 && (
                        <span className={`text-xs font-mono ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                          ★ {m.arena_elo}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold mb-1 group-hover:text-indigo-400 transition-colors ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>
                      {m.name}
                    </h3>
                    <p className={`text-xs line-clamp-2 ${dimClass}`}>
                      {m.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="text-center">
            <Link
              href="/model-hub"
              className={`inline-flex items-center gap-2 text-sm font-medium ${darkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse all models
            </Link>
          </div>
        </article>

        <footer className={`border-t mt-auto ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <div className={`max-w-[1100px] mx-auto px-4 py-6 text-center text-sm ${fadeClass}`}>
            NeuralNews · Model Hub · Data from Chatbot Arena
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}

function Spec({ label, value, sublabel, darkMode }: { label: string; value: string; sublabel?: string; darkMode: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${darkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"}`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
        {label}
      </div>
      <div className={`text-lg font-bold ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}>{value}</div>
      {sublabel && (
        <div className={`text-[10px] mt-1 ${darkMode ? "text-zinc-600" : "text-zinc-500"}`}>{sublabel}</div>
      )}
    </div>
  );
}

const ICONS: Record<string, string> = {
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  play: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function ResourceLink({ href, label, icon, darkMode }: { href: string; label: string; icon: string; darkMode: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${darkMode ? "bg-zinc-800/60 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[icon]} />
      </svg>
      <span>{label}</span>
      <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  );
}
