"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEventSource } from "./use-event-source";

interface SessionMeta {
  id: string;
  filepath: string;
  size: number;
  lastModified: string;
  isActive: boolean;
}

const BASE_INTERVAL = 30_000;
const MAX_BACKOFF_INTERVAL = 120_000;

export function useSessions() {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const errorCountRef = useRef(0);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/sessions");
      const json = await res.json();
      // json.data || [] is correct here — empty array is the intended fallback
      setSessions(json.data ?? []);
      setIsLive(json.source === "live");
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current++;
      // Keep previous data on network errors rather than resetting
      if (errorCountRef.current >= 3) {
        setSessions([]);
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
    intervalRef.current = setInterval(fetchSessions, getPollInterval());
  }, [fetchSessions, getPollInterval]);

  // SSE: on session-change, refetch immediately
  // onReconnect: refetch to cover events missed during disconnect
  useEventSource(
    "/api/gateway/events",
    {
      "session-change": () => {
        fetchSessions();
        resetPollTimer();
      },
    },
    isLive,
    fetchSessions
  );

  useEffect(() => {
    const fnRef = fetchSessions;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fnRef();
    intervalRef.current = setInterval(fnRef, BASE_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchSessions]);

  return { sessions, isLive, isLoading };
}
