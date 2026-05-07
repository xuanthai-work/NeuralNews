"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Data } from "../types";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface FreshnessState {
  hasNewData: boolean;
  newGeneratedAt: string | null;
  newTotal: number;
  storyDelta: number;
}

interface UseDataFreshnessReturn extends FreshnessState {
  dismiss: () => void;
  checkNow: () => Promise<void>;
}

export function useDataFreshness(
  currentGeneratedAt: string | undefined,
  enabled: boolean
): UseDataFreshnessReturn {
  const [state, setState] = useState<FreshnessState>({
    hasNewData: false,
    newGeneratedAt: null,
    newTotal: 0,
    storyDelta: 0,
  });

  // Track current + last-dismissed via refs so polling closure doesn't go stale
  const currentRef = useRef<{ generatedAt: string | undefined; total: number }>({
    generatedAt: currentGeneratedAt,
    total: 0,
  });
  const dismissedRef = useRef<string | null>(null);

  useEffect(() => {
    currentRef.current.generatedAt = currentGeneratedAt;
  }, [currentGeneratedAt]);

  const checkNow = useCallback(async () => {
    if (!currentRef.current.generatedAt) return;
    try {
      const res = await fetch("/data.json", { cache: "no-store" });
      if (!res.ok) return;
      const data: Data = await res.json();
      const isNewer = data.generated_at !== currentRef.current.generatedAt;
      const notAlreadyDismissed = data.generated_at !== dismissedRef.current;
      if (isNewer && notAlreadyDismissed) {
        setState({
          hasNewData: true,
          newGeneratedAt: data.generated_at,
          newTotal: data.total_stories,
          storyDelta: Math.max(0, data.total_stories - (currentRef.current.total || data.total_stories)),
        });
      }
    } catch {
      // network errors are non-fatal — try again next poll
    }
  }, []);

  useEffect(() => {
    if (!enabled || !currentGeneratedAt) return;
    if (state.hasNewData) return; // Already detected, stop polling until dismiss

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      // Skip when tab is hidden — saves battery and avoids stale checks
      if (typeof document !== "undefined" && document.hidden) return;
      await checkNow();
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);

    // Re-check immediately when the tab becomes visible again
    const onVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, currentGeneratedAt, state.hasNewData, checkNow]);

  const dismiss = useCallback(() => {
    setState((prev) => {
      // Remember which version was dismissed so we don't re-prompt for the same one
      if (prev.newGeneratedAt) {
        dismissedRef.current = prev.newGeneratedAt;
      }
      return {
        hasNewData: false,
        newGeneratedAt: null,
        newTotal: 0,
        storyDelta: 0,
      };
    });
  }, []);

  return { ...state, dismiss, checkNow };
}
