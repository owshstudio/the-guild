"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SessionDetail, SessionMessage } from "@/lib/types";
import { sanitizeContent } from "@/lib/utils/content-sanitize";

const PAGE_SIZE = 100;

export function useSessionDetail(sessionId: string | null) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sseFailedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    // Cancel any in-flight fetch
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const offset = page * PAGE_SIZE;
      const res = await fetch(
        `/api/gateway/sessions/${sessionId}?offset=${offset}&limit=${PAGE_SIZE}`,
        { signal: controller.signal }
      );
      const json = await res.json();

      if (json.data) {
        setSession(json.data);
        setIsLive(json.data.isActive);
        setHasMore(json.data.messages.length >= PAGE_SIZE);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // other fetch error — ignore
    }

    setIsLoading(false);
  }, [sessionId, page]);

  // Close any existing EventSource
  const closeSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Open SSE stream for live sessions
  useEffect(() => {
    if (!sessionId || !isLive || sseFailedRef.current) {
      closeSSE();
      return;
    }

    const es = new EventSource(
      `/api/gateway/sessions/${sessionId}/stream`
    );
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        // Convert JSONL entry to SessionMessage and append
        if (entry.type === "message" && entry.message) {
          const msg = entry.message;
          const rawContent =
            typeof msg.content === "string"
              ? msg.content
              : Array.isArray(msg.content)
                ? msg.content
                    .filter((b: { type: string }) => b.type === "text")
                    .map((b: { text?: string }) => b.text || "")
                    .join("\n")
                : "";
          const newMessage: SessionMessage = {
            id: `${sessionId}-sse-${Date.now()}`,
            role: msg.role,
            content: sanitizeContent(rawContent),
            timestamp: entry.timestamp,
            model: msg.model,
          };

          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, newMessage],
              messageCount: prev.messageCount + 1,
            };
          });
        }
      } catch {
        // skip malformed SSE data
      }
    };

    es.onerror = () => {
      // SSE failed — fall back to polling
      sseFailedRef.current = true;
      closeSSE();
    };

    return closeSSE;
  }, [sessionId, isLive, closeSSE]);

  // Reset SSE failure flag when session changes
  useEffect(() => {
    sseFailedRef.current = false;
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      /* eslint-disable react-hooks/set-state-in-effect -- reset state when session changes */
      setSession(null);
      setIsLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    setIsLoading(true);
    setPage(0);
  }, [sessionId]);

  useEffect(() => {
    const fn = fetchSession;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fn();

    const sseActive = isLive && !sseFailedRef.current;
    const interval = setInterval(
      fn,
      sseActive ? 30000 : isLive ? 3000 : 30000
    );
    return () => clearInterval(interval);
  }, [fetchSession, isLive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      closeSSE();
      abortRef.current?.abort();
    };
  }, [closeSSE]);

  return { session, isLoading, isLive, page, setPage, hasMore };
}
