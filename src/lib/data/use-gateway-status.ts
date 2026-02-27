"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface GatewayStatus {
  connected: boolean;
  assistantName?: string;
  gatewayPort: number;
}

const BASE_INTERVAL = 30_000;
const MAX_BACKOFF_INTERVAL = 120_000;
const DEFAULT_STATUS: GatewayStatus = { connected: false, gatewayPort: 18789 };

export function useGatewayStatus() {
  const [status, setStatus] = useState<GatewayStatus>(DEFAULT_STATUS);
  const [isLoading, setIsLoading] = useState(true);
  const errorCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/health");
      const json = await res.json();
      setStatus(json.data ?? DEFAULT_STATUS);
      errorCountRef.current = 0;
    } catch {
      errorCountRef.current++;
      // Keep previous data on transient errors; reset after 3 consecutive failures
      if (errorCountRef.current >= 3) {
        setStatus(DEFAULT_STATUS);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();

    // Use backoff-aware polling — restart interval after each fetch
    function schedulePoll() {
      clearInterval(intervalRef.current);
      const interval =
        errorCountRef.current === 0
          ? BASE_INTERVAL
          : Math.min(
              BASE_INTERVAL * Math.pow(2, errorCountRef.current),
              MAX_BACKOFF_INTERVAL
            );
      intervalRef.current = setInterval(fetchStatus, interval);
    }

    schedulePoll();
    return () => clearInterval(intervalRef.current);
  }, [fetchStatus]);

  return { status, isLoading };
}
