"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityEntry } from "@/lib/types";
import { activityFeed as mockActivity } from "@/lib/mock-data";

export function useActivity() {
  const [activity, setActivity] = useState<ActivityEntry[]>(mockActivity);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 20000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  return { activity, isLive, isLoading };
}
