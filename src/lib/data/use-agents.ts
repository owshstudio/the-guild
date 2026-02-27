"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Agent } from "@/lib/types";
import { agents as mockAgents } from "@/lib/mock-data";
import { useEventSource } from "./use-event-source";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

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

  // Reset poll timer after SSE-triggered refetch
  const resetPollTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchAgents, 15000);
  }, [fetchAgents]);

  // SSE: on agent-change, refetch immediately and reset poll timer
  useEventSource(
    "/api/gateway/events",
    {
      "agent-change": () => {
        fetchAgents();
        resetPollTimer();
      },
    },
    isLive
  );

  useEffect(() => {
    fetchAgents();
    intervalRef.current = setInterval(fetchAgents, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fetchAgents]);

  return { agents, isLive, isLoading };
}
