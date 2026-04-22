"use client";

import { useTheme } from "../context/ThemeContext";

export function BottomNav() {
  const { darkMode } = useTheme();

  return (
    <nav className={`lg:hidden fixed bottom-0 w-full z-50 backdrop-blur-lg flex justify-around items-center h-16 px-4 pb-safe shadow-2xl ${darkMode ? "bg-zinc-950/90 border-t border-zinc-800" : "bg-white/90 border-t border-zinc-200"}`}>
      <a className={darkMode ? "text-zinc-100" : "text-zinc-900"} href="/">
        <div className="flex flex-col items-center justify-center py-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Feed</span>
        </div>
      </a>
      <a className={darkMode ? "text-zinc-500" : "text-zinc-600"} href="/benchmarks">
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
  );
}
