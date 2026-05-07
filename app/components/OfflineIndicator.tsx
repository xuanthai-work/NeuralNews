"use client";

import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider py-1.5 text-center shadow-lg flex items-center justify-center gap-2"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636L5.636 18.364m0-12.728l12.728 12.728" />
      </svg>
      You&apos;re offline · Showing cached data
    </div>
  );
}
