"use client";

import { useState, useEffect, useCallback } from "react";

interface GatewayStatus {
  connected: boolean;
  assistantName?: string;
  gatewayPort: number;
}

export function useGatewayStatus() {
  const [status, setStatus] = useState<GatewayStatus>({
    connected: false,
    gatewayPort: 18789,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/health");
      const json = await res.json();
      setStatus(json.data || { connected: false, gatewayPort: 18789 });
    } catch {
      setStatus({ connected: false, gatewayPort: 18789 });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, isLoading };
}
