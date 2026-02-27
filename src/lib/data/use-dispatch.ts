"use client";

import { useState, useCallback } from "react";
import type { DispatchRequest, DispatchResponse } from "@/lib/types";

export function useDispatch() {
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastResult, setLastResult] = useState<DispatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useCallback(async (request: DispatchRequest) => {
    setIsDispatching(true);
    setError(null);
    try {
      const res = await fetch("/api/gateway/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const json = await res.json();
      const result = json.data as DispatchResponse;
      setLastResult(result);
      if (!result.success) {
        setError(result.error || "Dispatch failed");
      }
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg);
      setLastResult({ success: false, error: msg });
      return { success: false, error: msg } as DispatchResponse;
    } finally {
      setIsDispatching(false);
    }
  }, []);

  return { dispatch, isDispatching, lastResult, error };
}
