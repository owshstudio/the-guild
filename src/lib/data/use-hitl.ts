"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { HITLItem, HITLStatus } from "@/lib/types";
import {
  requestNotificationPermission,
  fireHITLNotification,
} from "@/components/hitl/hitl-notification";

export function useHITL() {
  const [items, setItems] = useState<HITLItem[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const scanTickRef = useRef(0);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/hitl");
      const json = await res.json();
      const data: HITLItem[] = json.data || [];
      setItems(data);
      setIsLive(json.source === "live");

      // Fire notifications for new pending items
      for (const item of data) {
        if (
          item.status === "pending" &&
          !knownIdsRef.current.has(item.id)
        ) {
          fireHITLNotification(item);
        }
      }
      knownIdsRef.current = new Set(data.map((i) => i.id));
    } catch {
      setItems([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  const triggerScan = useCallback(async () => {
    try {
      await fetch("/api/gateway/hitl/scan", { method: "POST" });
    } catch {
      // scan failed silently
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    const fetch = fetchQueue;
    const scan = triggerScan;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fetch();

    const interval = setInterval(() => {
      scanTickRef.current += 1;
      if (scanTickRef.current % 6 === 0) {
        scan().then(fetch);
      } else {
        fetch();
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [fetchQueue, triggerScan]);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  const respond = useCallback(
    async (id: string, response: string, status: HITLStatus) => {
      // Optimistic update — immediately reflect the status change
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, response } : item
        )
      );
      try {
        await fetch("/api/gateway/hitl", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, response, status }),
        });
      } catch {
        // Revert on failure
      }
      await fetchQueue();
    },
    [fetchQueue]
  );

  const dismiss = useCallback(
    async (id: string) => {
      // Optimistic update — remove from list immediately
      setItems((prev) => prev.filter((item) => item.id !== id));
      try {
        await fetch(`/api/gateway/hitl?id=${id}`, { method: "DELETE" });
      } catch {
        // Revert on failure
      }
      await fetchQueue();
    },
    [fetchQueue]
  );

  return { items, pendingCount, isLive, isLoading, respond, dismiss };
}
