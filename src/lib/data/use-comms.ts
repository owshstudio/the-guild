"use client";

import { useState, useEffect, useCallback } from "react";
import type { CommMessage } from "@/lib/types";

interface UseCommsOptions {
  from?: string;
  to?: string;
  channel?: string;
}

export function useComms(options?: UseCommsOptions) {
  const [messages, setMessages] = useState<CommMessage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (options?.from) params.set("from", options.from);
      if (options?.to) params.set("to", options.to);
      params.set("limit", "50");

      const res = await fetch(`/api/gateway/comms?${params.toString()}`);
      const json = await res.json();

      let data: CommMessage[] = json.data || [];

      // Client-side channel filter
      if (options?.channel) {
        data = data.filter((m: CommMessage) => m.channel === options.channel);
      }

      setMessages(data);
      setIsLive(json.source === "live");
    } catch {
      setMessages([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, [options?.from, options?.to, options?.channel]);

  useEffect(() => {
    fetchComms();
    const interval = setInterval(fetchComms, 15000);
    return () => clearInterval(interval);
  }, [fetchComms]);

  return { messages, isLive, isLoading };
}
