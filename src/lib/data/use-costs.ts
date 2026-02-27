"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentCostEntry, BudgetPeriod } from "@/lib/types";

const MOCK_COSTS: AgentCostEntry[] = [
  { date: "Feb 22", agentId: "nyx", inputTokens: 32400, outputTokens: 21600, totalTokens: 54000, estimatedCost: 2.11, model: "claude-opus-4-6", sessionCount: 3 },
  { date: "Feb 23", agentId: "nyx", inputTokens: 21540, outputTokens: 14360, totalTokens: 35900, estimatedCost: 1.40, model: "claude-opus-4-6", sessionCount: 2 },
  { date: "Feb 24", agentId: "nyx", inputTokens: 34980, outputTokens: 23320, totalTokens: 58300, estimatedCost: 2.27, model: "claude-opus-4-6", sessionCount: 4 },
  { date: "Feb 25", agentId: "nyx", inputTokens: 43260, outputTokens: 28840, totalTokens: 72100, estimatedCost: 2.81, model: "claude-opus-4-6", sessionCount: 5 },
  { date: "Feb 26", agentId: "nyx", inputTokens: 29100, outputTokens: 19400, totalTokens: 48500, estimatedCost: 1.89, model: "claude-opus-4-6", sessionCount: 3 },
  { date: "Feb 26", agentId: "hemera", inputTokens: 1920, outputTokens: 1280, totalTokens: 3200, estimatedCost: 0.001, model: "gpt-4o-mini", sessionCount: 1 },
];

export function useCosts(period: BudgetPeriod = "weekly") {
  const [costs, setCosts] = useState<AgentCostEntry[]>(MOCK_COSTS);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/gateway/costs?period=${period}`);
      const json = await res.json();
      setCosts(json.data || MOCK_COSTS);
      setIsLive(json.source === "live");
    } catch {
      setCosts(MOCK_COSTS);
      setIsLive(false);
    }
    setIsLoading(false);
  }, [period]);

  useEffect(() => {
    fetchCosts();
    const interval = setInterval(fetchCosts, 60000);
    return () => clearInterval(interval);
  }, [fetchCosts]);

  const totalSpend = costs.reduce((sum, c) => sum + c.estimatedCost, 0);

  return { costs, totalSpend, isLive, isLoading };
}
