"use client";

import { useTheme } from "../context/ThemeContext";

function LoadingLogo() {
  const { darkMode } = useTheme();

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      {/* Animated logo container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`
          w-16 h-16 rounded-2xl border-2
          border-indigo-500/30
          animate-spin
        `} style={{ animationDuration: "3s" }} />

        {/* Inner pulsing gradient logo */}
        <div className={`
          absolute inset-1 rounded-xl
          bg-gradient-to-br from-indigo-500 to-purple-600
          flex items-center justify-center
          animate-pulse
          shadow-lg shadow-indigo-500/30
        `}>
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Orbiting dots */}
        <div className={`
          absolute -inset-4 rounded-full border
          border-dashed border-indigo-500/20
          animate-spin
        `} style={{ animationDuration: "8s", animationDirection: "reverse" }}>
          <div className={`
            absolute -top-1 left-1/2 -translate-x-1/2
            w-2 h-2 rounded-full
            bg-indigo-500
            shadow-lg shadow-indigo-500/50
          `} />
        </div>
      </div>

      {/* Loading text with animated dots */}
      <div className={`text-sm font-medium ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}>
        Loading neural feed
        <span className="inline-flex w-12 justify-start">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border p-5 sm:p-6
        ${darkMode ? "bg-zinc-900/80 border-zinc-800/60" : "bg-white border-zinc-200/80"}
      `}
    >
      {/* Shimmer effect */}
      <div
        className={`
          absolute inset-0 opacity-50
          ${darkMode ? "bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" : "bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent"}
          animate-shimmer
        `}
        style={{ backgroundSize: "200% 100%" }}
      />

      <div className="relative flex flex-col h-full">
        {/* Header: Category badge + AI Score */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {/* Category badge skeleton */}
            <div
              className={`
                w-20 h-6 rounded-full
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
            {/* Source domain skeleton (hidden on mobile) */}
            <div
              className={`
                hidden sm:block w-24 h-6 rounded
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
          </div>

          {/* AI Score badge skeleton */}
          <div
            className={`
              w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2
              ${darkMode ? "bg-zinc-800 border-zinc-700/50" : "bg-zinc-100 border-zinc-200"}
              animate-pulse
            `}
          />
        </div>

        {/* Title skeleton */}
        <div
          className={`
            w-full h-5 sm:h-6 rounded
            ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
            animate-pulse mb-3
          `}
        />
        <div
          className={`
            w-3/4 h-5 sm:h-6 rounded
            ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
            animate-pulse mb-4
          `}
        />

        {/* Meta: Author + Date skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`
              w-32 h-4 rounded
              ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
              animate-pulse
            `}
          />
          <div
            className={`
              w-2 h-2 rounded-full
              ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
              animate-pulse
            `}
          />
          <div
            className={`
              w-16 h-4 rounded
              ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
              animate-pulse
            `}
          />
        </div>

        {/* Divider */}
        <hr className={`mb-4 ${darkMode ? "border-zinc-800/60" : "border-zinc-200/60"}`} />

        {/* Bullet points skeleton */}
        <div className="space-y-2.5 mb-5 flex-grow">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={`
                  mt-1.5 w-1.5 h-1.5 rounded-full
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
              <div
                className={`
                  flex-1 h-4 rounded
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
            </div>
          ))}
        </div>

        {/* CTA Button skeleton */}
        <div
          className={`
            w-full h-10 rounded-xl
            ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
            animate-pulse
          `}
        />
      </div>
    </div>
  );
}

export function LoadingState() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"}`}>
      {/* Header skeleton */}
      <header
        className={`
          sticky top-0 w-full z-50 backdrop-blur-md h-14 border-b
          ${darkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-200"}
        `}
      >
        <div className="flex justify-between items-center px-4 md:px-6 h-full max-w-[1440px] mx-auto">
          {/* Logo skeleton */}
          <div
            className={`
              w-28 h-6 rounded
              ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
              animate-pulse
            `}
          />

          {/* Search + Refresh skeleton */}
          <div className="flex items-center gap-3">
            <div
              className={`
                hidden sm:block w-64 h-9 rounded-lg
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
            <div
              className={`
                w-10 h-10 rounded-lg
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
        <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full flex-1">
          {/* Loading Logo */}
          <LoadingLogo />

          {/* Stats Grid skeleton - with staggered animation */}
          <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`
                  p-4 rounded-xl border
                  ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}
                `}
              >
                <div
                  className={`
                    w-20 h-3 rounded mb-2
                    ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                    animate-pulse
                  `}
                />
                <div
                  className={`
                    w-16 h-8 rounded mb-2
                    ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                    animate-pulse
                  `}
                />
                <div
                  className={`
                    w-12 h-3 rounded
                    ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                    animate-pulse
                  `}
                />
              </div>
            ))}
          </section>

          {/* Category Filter skeleton */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <div
                className={`
                  w-40 h-6 rounded mb-2
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
              <div
                className={`
                  w-64 h-4 rounded
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
            </div>
            <div
              className={`
                w-36 h-10 rounded-lg
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
          </div>

          {/* News Cards Grid with staggered animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Load More button skeleton */}
          <div className="mt-8 flex justify-center">
            <div
              className={`
                w-48 h-11 rounded-lg
                ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                animate-pulse
              `}
            />
          </div>
        </div>
      </main>

      {/* Bottom Nav skeleton (mobile only) */}
      <nav
        className={`
          lg:hidden fixed bottom-0 w-full z-50 backdrop-blur-lg
          h-16 px-4 pb-safe
          ${darkMode ? "bg-zinc-950/90 border-t border-zinc-800" : "bg-white/90 border-t border-zinc-200"}
        `}
      >
        <div className="flex justify-around items-center h-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-6 h-6 rounded
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
              <div
                className={`
                  w-10 h-3 rounded
                  ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}
                  animate-pulse
                `}
              />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}