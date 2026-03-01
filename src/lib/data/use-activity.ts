"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityEntry } from "@/lib/types";
import { activityFeed as mockActivity } from "@/lib/mock-data";
import { useEventSource } from "./use-event-source";

const BASE_INTERVAL = 20_000;
const MAX_BACKOFF_INTERVAL = 120_000;

export function useActivity() {
  const [activity, setActivity] = useState<ActivityEntry[]>(mockActivity);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const errorCountRef = useRef(0);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/activity");
      const json = await res.json();
      setActivity(json.data ?? mockActivity);
      setIsLive(json.source === "live");
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current++;
      // Keep previous data on network errors rather than resetting to mock
      if (errorCountRef.current >= 3) {
        setActivity(mockActivity);
        setIsLive(false);
      }
    }
    setIsLoading(false);
  }, []);

  const getPollInterval = useCallback(() => {
    if (errorCountRef.current === 0) return BASE_INTERVAL;
    return Math.min(
      BASE_INTERVAL * Math.pow(2, errorCountRef.current),
      MAX_BACKOFF_INTERVAL
    );
  }, []);

  const resetPollTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchActivity, getPollInterval());
  }, [fetchActivity, getPollInterval]);

  // SSE: on agent-change, refetch activity immediately
  // onReconnect: refetch to cover events missed during disconnect
  useEventSource(
    "/api/gateway/events",
    {
      "agent-change": () => {
        fetchActivity();
        resetPollTimer();
      },
    },
    isLive,
    fetchActivity
  );

  useEffect(() => {
    const fnRef = fetchActivity;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fnRef();
    intervalRef.current = setInterval(fnRef, BASE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchActivity]);

  return { activity, isLive, isLoading };
}
