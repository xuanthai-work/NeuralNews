"use client";

import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

interface ErrorConfig {
  icon: string;
  title: string;
  message: string;
  colorClass: string;
  bgClass: string;
  borderColor: string;
  glowFrom: string;
}

function getErrorConfig(error: string, darkMode: boolean): ErrorConfig {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("network") || errorLower.includes("fetch") || errorLower.includes("offline")) {
    return {
      icon: "M18.364 5.636a9 9 0 010 12.728m0 0l-2.828-2.829m2.828 2.829L21 21M15 13a3 3 0 10-6 0 3 3 0 006 0zm-6-6a3 3 0 100-6 3 3 0 000 6zm0 0L6.343 9.657M9 7l2.828 2.828M12 12a3 3 0 100-6 3 3 0 000 6z",
      title: "Connection Lost",
      message: "Unable to reach the neural feed. Check your internet connection and try again.",
      colorClass: darkMode ? "text-amber-400" : "text-amber-600",
      bgClass: darkMode ? "bg-amber-500/15" : "bg-amber-100",
      borderColor: darkMode ? "border-amber-500/30" : "border-amber-200",
      glowFrom: "from-amber-500/5",
    };
  }

  if (errorLower.includes("timeout") || errorLower.includes("slow")) {
    return {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Request Timeout",
      message: "The server took too long to respond. This might be due to high traffic.",
      colorClass: darkMode ? "text-orange-400" : "text-orange-600",
      bgClass: darkMode ? "bg-orange-500/15" : "bg-orange-100",
      borderColor: darkMode ? "border-orange-500/30" : "border-orange-200",
      glowFrom: "from-orange-500/5",
    };
  }

  if (errorLower.includes("permission") || errorLower.includes("unauthorized") || errorLower.includes("403")) {
    return {
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      title: "Access Denied",
      message: "You don't have permission to access this resource. Please check your credentials.",
      colorClass: darkMode ? "text-red-400" : "text-red-600",
      bgClass: darkMode ? "bg-red-500/15" : "bg-red-100",
      borderColor: darkMode ? "border-red-500/30" : "border-red-200",
      glowFrom: "from-red-500/5",
    };
  }

  if (errorLower.includes("not found") || errorLower.includes("404")) {
    return {
      icon: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Resource Not Found",
      message: "The requested data could not be located. It may have been moved or deleted.",
      colorClass: darkMode ? "text-zinc-400" : "text-zinc-600",
      bgClass: darkMode ? "bg-zinc-500/15" : "bg-zinc-100",
      borderColor: darkMode ? "border-zinc-500/30" : "border-zinc-200",
      glowFrom: "from-zinc-500/5",
    };
  }

  if (errorLower.includes("server") || errorLower.includes("500") || errorLower.includes("502") || errorLower.includes("503")) {
    return {
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      title: "Server Error",
      message: "Something went wrong on our end. We're working to fix it. Please try again shortly.",
      colorClass: darkMode ? "text-red-400" : "text-red-600",
      bgClass: darkMode ? "bg-red-500/15" : "bg-red-100",
      borderColor: darkMode ? "border-red-500/30" : "border-red-200",
      glowFrom: "from-red-500/5",
    };
  }

  // Default generic error
  return {
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Signal Interrupted",
    message: "An unexpected error occurred while fetching the neural feed.",
    colorClass: darkMode ? "text-red-400" : "text-red-600",
    bgClass: darkMode ? "bg-red-500/15" : "bg-red-100",
    borderColor: darkMode ? "border-red-500/30" : "border-red-200",
    glowFrom: "from-red-500/5",
  };
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { darkMode } = useTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const config = getErrorConfig(error, darkMode);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const cardBgClass = darkMode
    ? "bg-zinc-900/80 backdrop-blur-sm border-zinc-800/60"
    : "bg-white/80 backdrop-blur-sm border-zinc-200/80";

  const cardHoverClass = darkMode
    ? "hover:border-zinc-600 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-900/50"
    : "hover:border-zinc-300 hover:bg-white hover:shadow-xl hover:shadow-zinc-200/50";

  const buttonClass = darkMode
    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30";

  // Extract color for accent bar
  const accentBarClass = config.colorClass.replace("text-", "bg-");

  return (
    <div className={`min-h-screen ${darkMode ? "bg-zinc-950" : "bg-zinc-50"} flex items-center justify-center p-4`}>
      <div
        className={`
          group relative overflow-hidden rounded-2xl border transition-all duration-500 ease-out
          ${cardBgClass} ${cardHoverClass}
          max-w-md w-full
          hover:-translate-y-1.5
          active:scale-[0.98] active:translate-y-0
          backdrop-blur-sm
        `}
      >
        {/* Accent bar at top - matches NewsCard category bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${accentBarClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Glow effect on hover - matches NewsCard */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
            bg-gradient-to-br ${config.glowFrom} via-transparent to-transparent
          `}
        />

        <div className="relative p-8 flex flex-col items-center text-center">
          {/* Error icon with animated ring */}
          <div
            className={`
              relative w-20 h-20 rounded-2xl border-2
              flex items-center justify-center
              mb-6
              ${config.bgClass} ${config.colorClass} ${config.borderColor}
            `}
          >
            {/* Animated pulse rings */}
            <div
              className={`
                absolute inset-0 rounded-2xl
                animate-ping opacity-20
                ${config.bgClass}
              `}
              style={{ animationDuration: "2s" }}
            />
            <div
              className={`
                absolute -inset-2 rounded-2xl border
                animate-pulse opacity-30
                ${config.borderColor}
              `}
            />

            {/* Error icon */}
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={config.icon}
              />
            </svg>
          </div>

          {/* Animated sparkles on hover */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <svg className={`w-4 h-4 ${config.colorClass} animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
            </svg>
          </div>

          {/* Error title */}
          <h2
            className={`
              text-xl font-black tracking-tight mb-2
              ${darkMode ? "text-zinc-50" : "text-zinc-900"}
            `}
          >
            {config.title}
          </h2>

          {/* Error message */}
          <p
            className={`
              text-sm leading-relaxed mb-6
              ${darkMode ? "text-zinc-400" : "text-zinc-600"}
            `}
          >
            {config.message}
          </p>

          {/* Error details (collapsible) */}
          {error && (
            <div className="w-full mb-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`
                  text-xs font-medium uppercase tracking-wider
                  hover:text-indigo-400 transition-colors duration-300
                  flex items-center justify-center gap-2 mx-auto
                  ${darkMode ? "text-zinc-500" : "text-zinc-500"}
                `}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showDetails ? "Hide" : "Show"} Technical Details
              </button>

              {showDetails && (
                <div
                  className={`
                    mt-3 p-3 rounded-lg text-xs font-mono text-left break-all
                    ${darkMode ? "bg-zinc-950/50 border border-zinc-800/50 text-zinc-400" : "bg-zinc-100 border border-zinc-200/50 text-zinc-600"}
                  `}
                >
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Retry button */}
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`
                group/btn inline-flex items-center justify-center gap-2
                px-6 py-3 rounded-xl
                text-sm font-bold uppercase tracking-wide
                transition-all duration-300 ease-out
                ${buttonClass}
                hover:-translate-y-0.5 hover:scale-[1.02]
                active:translate-y-0 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2
                ${darkMode ? "focus:ring-offset-zinc-950" : "focus:ring-offset-zinc-50"}
              `}
            >
              {isRetrying ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Retrying...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover/btn:-rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry Connection
                </>
              )}
            </button>
          )}

          {/* Troubleshooting tips - matches NewsCard bullet style */}
          <div className={`mt-6 pt-4 border-t w-full ${darkMode ? "border-zinc-800/60" : "border-zinc-200/60"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 text-center ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}>
              Quick Tips
            </p>
            <ul className="space-y-2">
              <li
                className={`
                  flex items-center justify-center gap-2 text-xs
                  transition-colors duration-300
                  ${darkMode ? "text-zinc-500" : "text-zinc-600"}
                `}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Click retry to refresh the connection</span>
              </li>
              <li
                className={`
                  flex items-center justify-center gap-2 text-xs
                  transition-colors duration-300
                  ${darkMode ? "text-zinc-500" : "text-zinc-600"}
                `}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
                <span>Check your internet connection</span>
              </li>
              <li
                className={`
                  flex items-center justify-center gap-2 text-xs
                  transition-colors duration-300
                  ${darkMode ? "text-zinc-500" : "text-zinc-600"}
                `}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Clear cache if issue persists</span>
              </li>
            </ul>

            {/* Support link */}
            <p
              className={`
                mt-4 text-xs text-center
                ${darkMode ? "text-zinc-600" : "text-zinc-500"}
              `}
            >
              Still having issues?{" "}
              <a
                href="/support"
                className={`
                  font-medium underline decoration-indigo-500/50
                  hover:text-indigo-400 hover:decoration-indigo-400
                  transition-all duration-300
                `}
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}