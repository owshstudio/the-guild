"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentUsageDay } from "@/lib/types";
import { dailyUsage as mockUsage } from "@/lib/mock-data";

export function useUsage() {
  const [usage, setUsage] = useState<AgentUsageDay[]>(mockUsage);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/usage");
      const json = await res.json();
      setUsage(json.data || mockUsage);
      setIsLive(json.source === "live");
    } catch {
      setUsage(mockUsage);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  return { usage, isLive, isLoading };
}
