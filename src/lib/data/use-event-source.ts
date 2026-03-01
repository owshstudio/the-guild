"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { subscribe, isConnected } from "./sse-manager";

interface EventHandlers {
  [eventType: string]: (data: unknown) => void;
}

/**
 * SSE hook backed by a shared connection manager.
 *
 * Multiple hooks calling useEventSource with the same URL share a single
 * underlying EventSource connection (ref-counted, auto-reconnects).
 *
 * `onReconnect` fires when the shared connection re-establishes after
 * a disconnect, allowing callers to refetch data missed while offline.
 */
export function useEventSource(
  url: string,
  handlers: EventHandlers,
  enabled = true,
  onReconnect?: () => void
): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);
  const onReconnectRef = useRef(onReconnect);

  // Keep refs in sync without triggering re-subscribe
  useEffect(() => {
    handlersRef.current = handlers;
    onReconnectRef.current = onReconnect;
  });

  const listener = useCallback((event: string, data: unknown) => {
    if (event === "__reconnect") {
      setConnected(true);
      onReconnectRef.current?.();
      return;
    }
    handlersRef.current[event]?.(data);
  }, []);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on disable
      setConnected(false);
      return;
    }

    const unsubscribe = subscribe(url, listener);

    // Check initial connection state
    setConnected(isConnected(url));

    // Poll connection state (lightweight — just reads readyState)
    const check = setInterval(() => {
      setConnected(isConnected(url));
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(check);
    };
  }, [url, enabled, listener]);

  return { connected };
}
