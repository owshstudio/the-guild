"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Agent } from "@/lib/types";
import { agents as mockAgents } from "@/lib/mock-data";
import { useEventSource } from "./use-event-source";

const BASE_INTERVAL = 15_000;
const MAX_BACKOFF_INTERVAL = 120_000;

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const errorCountRef = useRef(0);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/agents");
      const json = await res.json();
      setAgents(json.data ?? mockAgents);
      setIsLive(json.source === "live");
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current++;
      // Keep previous data on network errors rather than resetting to mock
      if (errorCountRef.current >= 3) {
        setAgents(mockAgents);
        setIsLive(false);
      }
    }
    setIsLoading(false);
  }, []);

  // Compute poll interval with exponential backoff on consecutive errors
  const getPollInterval = useCallback(() => {
    if (errorCountRef.current === 0) return BASE_INTERVAL;
    return Math.min(
      BASE_INTERVAL * Math.pow(2, errorCountRef.current),
      MAX_BACKOFF_INTERVAL
    );
  }, []);

  // Reset poll timer after SSE-triggered refetch
  const resetPollTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchAgents, getPollInterval());
  }, [fetchAgents, getPollInterval]);

  // SSE: on agent-change, refetch immediately and reset poll timer
  // onReconnect: refetch to cover events missed during disconnect
  useEventSource(
    "/api/gateway/events",
    {
      "agent-change": () => {
        fetchAgents();
        resetPollTimer();
      },
    },
    isLive,
    fetchAgents
  );

  useEffect(() => {
    const fnRef = fetchAgents;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fnRef();
    intervalRef.current = setInterval(fnRef, BASE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchAgents]);

  return { agents, isLive, isLoading };
}
