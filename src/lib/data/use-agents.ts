"use client";

import { useState, useEffect, useCallback } from "react";
import type { Agent } from "@/lib/types";
import { agents as mockAgents } from "@/lib/mock-data";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/agents");
      const json = await res.json();
      setAgents(json.data || mockAgents);
      setIsLive(json.source === "live");
    } catch {
      setAgents(mockAgents);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  return { agents, isLive, isLoading };
}
