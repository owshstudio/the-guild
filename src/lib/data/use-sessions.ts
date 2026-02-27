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

export function useSessions() {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/sessions");
      const json = await res.json();
      setSessions(json.data || []);
      setIsLive(json.source === "live");
    } catch {
      setSessions([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  const resetPollTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchSessions, 30000);
  }, [fetchSessions]);

  // SSE: on session-change, refetch immediately
  useEventSource(
    "/api/gateway/events",
    {
      "session-change": () => {
        fetchSessions();
        resetPollTimer();
      },
    },
    isLive
  );

  useEffect(() => {
    fetchSessions();
    intervalRef.current = setInterval(fetchSessions, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchSessions]);

  return { sessions, isLive, isLoading };
}
