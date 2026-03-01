"use client";

import { useState, useCallback } from "react";
import type { AgentCostEntry, BudgetPeriod } from "@/lib/types";
import { usePoll } from "./use-poll";

const INITIAL_COSTS: AgentCostEntry[] = [];

export function useCosts(period: BudgetPeriod = "weekly") {
  const [costs, setCosts] = useState<AgentCostEntry[]>(INITIAL_COSTS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/gateway/costs?period=${period}`);
      const json = await res.json();
      setCosts(json.data || []);
      setIsLive(json.source === "live");
    } catch {
      setCosts([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, [period]);

  usePoll(fetchCosts, 60000);

  const totalSpend = costs.reduce((sum, c) => sum + c.estimatedCost, 0);

  return { costs, totalSpend, isLive, isLoading };
}
