"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TaskChain } from "@/lib/types";

export function useChains() {
  const [chains, setChains] = useState<TaskChain[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const checkTickRef = useRef(0);

  const fetchChains = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/chains");
      const json = await res.json();
      setChains(json.data || []);
      setIsLive(json.source === "live");
    } catch {
      setChains([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  const triggerCheck = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/chains/check", { method: "POST" });
      const json = await res.json();
      if (json.data) setChains(json.data);
    } catch {
      // check failed silently
    }
  }, []);

  useEffect(() => {
    const fetch = fetchChains;
    const check = triggerCheck;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    fetch();
    const interval = setInterval(() => {
      checkTickRef.current += 1;
      if (checkTickRef.current % 2 === 0) {
        check();
      } else {
        fetch();
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [fetchChains, triggerCheck]);

  const activeChains = chains.filter((c) => c.status === "active");

  const createChain = useCallback(async (chain: TaskChain) => {
    try {
      const res = await fetch("/api/gateway/chains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chain),
      });
      const json = await res.json();
      if (json.data) setChains(json.data);
    } catch {
      // network error — keep current state
    }
  }, []);

  const updateChain = useCallback(async (chain: TaskChain) => {
    try {
      const res = await fetch("/api/gateway/chains", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chain),
      });
      const json = await res.json();
      if (json.data) setChains(json.data);
    } catch {
      // network error — keep current state
    }
  }, []);

  const deleteChain = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/gateway/chains?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.data) setChains(json.data);
    } catch {
      // network error — keep current state
    }
  }, []);

  const pauseChain = useCallback(
    async (id: string) => {
      const chain = chains.find((c) => c.id === id);
      if (!chain) return;
      await updateChain({ ...chain, status: "paused" });
    },
    [chains, updateChain]
  );

  const resumeChain = useCallback(
    async (id: string) => {
      const chain = chains.find((c) => c.id === id);
      if (!chain) return;
      await updateChain({ ...chain, status: "active" });
    },
    [chains, updateChain]
  );

  return {
    chains,
    activeChains,
    isLive,
    isLoading,
    createChain,
    updateChain,
    deleteChain,
    pauseChain,
    resumeChain,
  };
}
