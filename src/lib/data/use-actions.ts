"use client";

import { useState, useCallback } from "react";
import type { QuickActionRequest, QuickActionResponse } from "@/lib/types";

export function useActions() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<QuickActionResponse | null>(null);

  const execute = useCallback(async (request: QuickActionRequest) => {
    setIsExecuting(true);
    try {
      const res = await fetch("/api/gateway/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const json = await res.json();
      const result = json.data as QuickActionResponse;
      setLastResult(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      const result: QuickActionResponse = { success: false, message: "Action failed", error: msg };
      setLastResult(result);
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return { execute, isExecuting, lastResult };
}
