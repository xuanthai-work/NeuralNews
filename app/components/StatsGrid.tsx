"use client";

import { useTheme } from "../context/ThemeContext";

export function StatsGrid() {
  const { darkMode } = useTheme();
  const cardClass = darkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200";
  const labelClass = darkMode ? "text-zinc-500" : "text-zinc-600";
  const valueClass = darkMode ? "text-zinc-50" : "text-zinc-900";

  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div className={`${cardClass} p-4 rounded-xl`}>
        <p className={`text-[10px] ${labelClass} font-mono uppercase tracking-widest mb-1`}>Active Models</p>
        <p className="text-2xl font-bold text-blue-400">1,248</p>
        <p className="text-[10px] text-emerald-400 mt-1">↑ +12.4%</p>
      </div>
      <div className={`${cardClass} p-4 rounded-xl`}>
        <p className={`text-[10px] ${labelClass} font-mono uppercase tracking-widest mb-1`}>Papers Today</p>
        <p className={`text-2xl font-bold ${valueClass}`}>42</p>
        <p className={`text-[10px] ${darkMode ? "text-zinc-400" : "text-zinc-600"} mt-1`}>Steady</p>
      </div>
      <div className={`${cardClass} p-4 rounded-xl`}>
        <p className={`text-[10px] ${labelClass} font-mono uppercase tracking-widest mb-1`}>Avg Token Cost</p>
        <p className="text-2xl font-bold text-emerald-400">$0.002</p>
        <p className="text-[10px] text-red-400 mt-1">↓ -8.2%</p>
      </div>
      <div className={`${cardClass} p-4 rounded-xl`}>
        <p className={`text-[10px] ${labelClass} font-mono uppercase tracking-widest mb-1`}>Inference Latency</p>
        <p className={`text-2xl font-bold ${valueClass}`}>142ms</p>
        <p className="text-[10px] text-emerald-400 mt-1">↓ 6%</p>
      </div>
      <div className={`${cardClass} p-4 rounded-xl`}>
        <p className={`text-[10px] ${labelClass} font-mono uppercase tracking-widest mb-1`}>System Load</p>
        <p className="text-2xl font-bold text-amber-400">82%</p>
        <p className="text-[10px] text-red-400 mt-1">High</p>
      </div>
    </section>
  );
}
