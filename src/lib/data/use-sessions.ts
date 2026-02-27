"use client";

import { useState, useEffect, useCallback } from "react";

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

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return { sessions, isLive, isLoading };
}
