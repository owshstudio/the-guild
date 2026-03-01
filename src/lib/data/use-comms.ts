"use client";

import { useState, useCallback } from "react";
import { usePoll } from "./use-poll";
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

  const from = options?.from;
  const to = options?.to;
  const channel = options?.channel;

  const fetchComms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", "50");

      const res = await fetch(`/api/gateway/comms?${params.toString()}`);
      const json = await res.json();

      let data: CommMessage[] = json.data || [];

      // Client-side channel filter
      if (channel) {
        data = data.filter((m: CommMessage) => m.channel === channel);
      }

      setMessages(data);
      setIsLive(json.source === "live");
    } catch {
      setMessages([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, [from, to, channel]);

  usePoll(fetchComms, 15000);

  return { messages, isLive, isLoading };
}
