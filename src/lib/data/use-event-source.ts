"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface EventHandlers {
  [eventType: string]: (data: unknown) => void;
}

const MAX_BACKOFF_MS = 30_000;

export function useEventSource(
  url: string,
  handlers: EventHandlers,
  enabled = true
): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);
  const retriesRef = useRef(0);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep handlers ref in sync without triggering reconnects
  handlersRef.current = handlers;

  const cleanup = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    function connect() {
      cleanup();

      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        retriesRef.current = 0;
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        esRef.current = null;

        // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
        const delay = Math.min(
          1000 * Math.pow(2, retriesRef.current),
          MAX_BACKOFF_MS
        );
        retriesRef.current++;
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      // Register named event listeners
      const eventTypes = Object.keys(handlersRef.current);
      for (const eventType of eventTypes) {
        es.addEventListener(eventType, ((event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handlersRef.current[eventType]?.(data);
          } catch {
            // malformed data
          }
        }) as EventListener);
      }
    }

    connect();

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, cleanup]);

  return { connected };
}
