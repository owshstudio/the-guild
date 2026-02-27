"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityEntry } from "@/lib/types";
import { activityFeed as mockActivity } from "@/lib/mock-data";
import { useEventSource } from "./use-event-source";

export function useActivity() {
  const [activity, setActivity] = useState<ActivityEntry[]>(mockActivity);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/activity");
      const json = await res.json();
      setActivity(json.data || mockActivity);
      setIsLive(json.source === "live");
    } catch {
      setActivity(mockActivity);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  const resetPollTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchActivity, 20000);
  }, [fetchActivity]);

  // SSE: on agent-change, refetch activity immediately
  useEventSource(
    "/api/gateway/events",
    {
      "agent-change": () => {
        fetchActivity();
        resetPollTimer();
      },
    },
    isLive
  );

  useEffect(() => {
    fetchActivity();
    intervalRef.current = setInterval(fetchActivity, 20000);
    return () => clearInterval(intervalRef.current);
  }, [fetchActivity]);

  return { activity, isLive, isLoading };
}
