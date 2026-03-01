"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SessionMessage, SessionDetail } from "@/lib/types";
import { sanitizeContent } from "@/lib/utils/content-sanitize";

export function useChat() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const loadedAgentRef = useRef<string | null>(null);

  // Close any open EventSource
  const closeSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return closeSSE;
  }, [closeSSE]);

  // When agent changes, auto-load the Guild session for that agent
  useEffect(() => {
    closeSSE();
    setError(null);

    if (!selectedAgentId) {
      setActiveSessionId(null);
      setMessages([]);
      return;
    }

    // Avoid reloading if we already loaded this agent's session
    if (loadedAgentRef.current === selectedAgentId) return;
    loadedAgentRef.current = selectedAgentId;

    setIsLoadingSession(true);
    setMessages([]);
    setActiveSessionId(null);

    fetch(`/api/gateway/guild-session?agentId=${encodeURIComponent(selectedAgentId)}`)
      .then((r) => r.json())
      .then((json) => {
        const sessionId = json.data?.sessionId;
        if (!sessionId) {
          setIsLoadingSession(false);
          return;
        }

        // Load the session's messages
        return fetch(`/api/gateway/sessions/${sessionId}?offset=0&limit=200`)
          .then((r) => r.json())
          .then((sessionJson) => {
            const detail = sessionJson.data as SessionDetail | undefined;
            if (detail) {
              setActiveSessionId(sessionId);
              setMessages(detail.messages);
            }
            setIsLoadingSession(false);
          });
      })
      .catch(() => {
        setIsLoadingSession(false);
      });
  }, [selectedAgentId, closeSSE]);

  // Open SSE stream for a session
  const openStream = useCallback(
    (sessionId: string) => {
      closeSSE();

      const es = new EventSource(
        `/api/gateway/sessions/${sessionId}/stream`
      );
      eventSourceRef.current = es;
      setIsStreaming(true);

      es.onmessage = (event) => {
        try {
          const entry = JSON.parse(event.data);
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

            setMessages((prev) => [...prev, newMessage]);
          }
        } catch {
          // skip malformed SSE data
        }
      };

      es.onerror = () => {
        closeSSE();
      };
    },
    [closeSSE]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!selectedAgentId) return;

      setError(null);

      // Optimistically add user message
      const userMessage: SessionMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        const res = await fetch("/api/gateway/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: selectedAgentId,
            message: text,
            sessionId: activeSessionId ?? undefined,
          }),
        });
        const json = await res.json();
        const result = json.data;

        if (!result?.success) {
          setError(result?.error || "Dispatch failed");
          return;
        }

        const sessionId = result.sessionId;
        if (sessionId) {
          setActiveSessionId(sessionId);
          openStream(sessionId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      }
    },
    [selectedAgentId, activeSessionId, openStream]
  );

  const startNewSession = useCallback(() => {
    closeSSE();
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
  }, [closeSSE]);

  const loadSession = useCallback(
    async (sessionId: string) => {
      closeSSE();
      setError(null);
      setIsLoadingSession(true);

      try {
        const res = await fetch(
          `/api/gateway/sessions/${sessionId}?offset=0&limit=100`
        );
        const json = await res.json();
        const detail = json.data as SessionDetail | undefined;

        if (detail) {
          setActiveSessionId(sessionId);
          setMessages(detail.messages);

          // If the session is still active, open SSE stream
          if (detail.isActive) {
            openStream(sessionId);
          }
        } else {
          setError("Session not found or could not be loaded");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoadingSession(false);
      }
    },
    [closeSSE, openStream]
  );

  return {
    selectedAgentId,
    setSelectedAgentId,
    activeSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    error,
    sendMessage,
    startNewSession,
    loadSession,
  };
}
