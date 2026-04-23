"use client";

import { useTheme } from "../context/ThemeContext";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const { darkMode, toggleDarkMode } = useTheme();
  const pathname = usePathname();

  const getNavItemClickClass = (href: string) => {
    const isActive = pathname === href;
    return `flex flex-col items-center justify-center py-2 transition-all duration-300 ${
      isActive
        ? "scale-110"
        : "hover:scale-105 active:scale-95"
    }`;
  };

  const getIconClass = (href: string) => {
    const isActive = pathname === href;
    if (isActive) {
      return darkMode
        ? "text-indigo-400"
        : "text-indigo-600";
    }
    return darkMode
      ? "text-zinc-500"
      : "text-zinc-600";
  };

  const getLabelClass = (href: string) => {
    const isActive = pathname === href;
    if (isActive) {
      return darkMode
        ? "text-indigo-300 font-bold"
        : "text-indigo-700 font-bold";
    }
    return darkMode
      ? "text-zinc-500"
      : "text-zinc-600";
  };

  return (
    <nav className={`lg:hidden fixed bottom-0 w-full z-50 backdrop-blur-lg flex justify-around items-center h-16 px-4 pb-safe shadow-2xl ${darkMode ? "bg-zinc-950/90 border-t border-zinc-800" : "bg-white/90 border-t border-zinc-200"}`}>
      <a href="/">
        <div className={getNavItemClickClass("/")}>
          <svg className={`w-6 h-6 ${getIconClass("/")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${getLabelClass("/")}`}>Feed</span>
        </div>
      </a>
      <a href="/benchmarks">
        <div className={getNavItemClickClass("/benchmarks")}>
          <svg className={`w-6 h-6 ${getIconClass("/benchmarks")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${getLabelClass("/benchmarks")}`}>Bench</span>
        </div>
      </a>
      <a href="/model-hub">
        <div className={getNavItemClickClass("/model-hub")}>
          <svg className={`w-6 h-6 ${getIconClass("/model-hub")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${getLabelClass("/model-hub")}`}>Models</span>
        </div>
      </a>
      <a href="/settings">
        <div className={getNavItemClickClass("/settings")}>
          <svg className={`w-6 h-6 ${getIconClass("/settings")}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${getLabelClass("/settings")}`}>Settings</span>
        </div>
      </a>

      {/* Theme toggle button */}
      <button
        onClick={toggleDarkMode}
        className={`
          flex flex-col items-center justify-center py-2
          transition-all duration-300
          hover:scale-105 active:scale-95
        `}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div className="relative w-6 h-6">
          {/* Sun icon */}
          <svg
            className={`
              absolute inset-0 w-6 h-6
              transition-all duration-500 ease-out
              ${darkMode ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {/* Moon icon */}
          <svg
            className={`
              absolute inset-0 w-6 h-6
              transition-all duration-500 ease-out
              ${darkMode ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
        <span className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${darkMode ? "text-zinc-500" : "text-zinc-600"}`}>
          Theme
        </span>
      </button>
    </nav>
  );
}
