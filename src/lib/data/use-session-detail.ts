"use client";

import { useState, useEffect, useCallback } from "react";
import type { SessionDetail } from "@/lib/types";

const PAGE_SIZE = 100;

export function useSessionDetail(sessionId: string | null) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const offset = page * PAGE_SIZE;
      const res = await fetch(
        `/api/gateway/sessions/${sessionId}?offset=${offset}&limit=${PAGE_SIZE}`
      );
      const json = await res.json();

      if (json.data) {
        setSession(json.data);
        setIsLive(json.data.isActive);
        setHasMore(json.data.messages.length >= PAGE_SIZE);
      }
    } catch {
      // fetch error
    }

    setIsLoading(false);
  }, [sessionId, page]);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPage(0);
  }, [sessionId]);

  useEffect(() => {
    fetchSession();

    const interval = setInterval(
      fetchSession,
      isLive ? 3000 : 30000
    );
    return () => clearInterval(interval);
  }, [fetchSession, isLive]);

  return { session, isLoading, isLive, page, setPage, hasMore };
}
