"use client";

import { useTheme } from "../context/ThemeContext";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { darkMode } = useTheme();
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? darkMode
        ? "bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-md flex items-center gap-3 px-3 py-2 transition-all"
        : "bg-zinc-200 text-zinc-900 border border-zinc-300 rounded-md flex items-center gap-3 px-3 py-2 transition-all"
      : darkMode
      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 flex items-center gap-3 px-3 py-2 rounded-md transition-all"
      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 flex items-center gap-3 px-3 py-2 rounded-md transition-all";
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 border-r hidden lg:flex flex-col p-4 gap-2 z-50 ${darkMode ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-zinc-50"}`}>
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}>NeuralNews</h1>
          <p className={`text-[10px] font-mono tracking-widest ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>V1.0.0</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <a className={getLinkClass("/")} href="/">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium text-sm">Latest Feed</span>
        </a>
        <a className={getLinkClass("/benchmarks")} href="/benchmarks">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium text-sm">Benchmarks</span>
        </a>
        <a className={getLinkClass("/model-hub")} href="/model-hub">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-sm">Model Hub</span>
        </a>
        <a className={getLinkClass("/saved")} href="/saved">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="font-medium text-sm">Saved Items</span>
        </a>
      </nav>

      <div className={`border-t pt-4 ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
        <a className={getLinkClass("/settings")} href="/settings">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium text-sm">Settings</span>
        </a>
      </div>
    </aside>
  );
}
