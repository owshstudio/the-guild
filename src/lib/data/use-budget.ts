"use client";

import { useState, useEffect, useCallback } from "react";
import type { BudgetConfig, BudgetAlert, AgentCostEntry } from "@/lib/types";

const DEFAULT_CONFIG: BudgetConfig = {
  enabled: false,
  limits: { daily: 10, weekly: 50, monthly: 150 },
  alertThresholds: [50, 75, 90, 100],
};

export function useBudget(costs: AgentCostEntry[]) {
  const [config, setConfig] = useState<BudgetConfig>(DEFAULT_CONFIG);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  // Load config and alerts from localStorage
  useEffect(() => {
    try {
      const rawConfig = localStorage.getItem("guild-budget-config");
      if (rawConfig) setConfig(JSON.parse(rawConfig));
    } catch {
      // Use defaults
    }
    try {
      const rawAlerts = localStorage.getItem("guild-budget-alerts");
      if (rawAlerts) setAlerts(JSON.parse(rawAlerts));
    } catch {
      // No alerts
    }
  }, []);

  // Generate alerts when costs or config change
  useEffect(() => {
    if (!config.enabled) return;

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = `${months[now.getMonth()]} ${now.getDate()}`;

    const todaySpend = costs
      .filter((c) => c.date === today)
      .reduce((s, c) => s + c.estimatedCost, 0);
    const weekKeys = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      weekKeys.add(`${months[d.getMonth()]} ${d.getDate()}`);
    }

    const weeklySpend = costs
      .filter((c) => weekKeys.has(c.date))
      .reduce((s, c) => s + c.estimatedCost, 0);

    const currentMonth = months[now.getMonth()];
    const monthlySpend = costs
      .filter((c) => c.date.startsWith(currentMonth))
      .reduce((s, c) => s + c.estimatedCost, 0);

    const newAlerts: BudgetAlert[] = [];

    const checkLimit = (
      spend: number,
      limit: number | undefined,
      period: "daily" | "weekly" | "monthly",
      agentId: string
    ) => {
      if (!limit) return;
      for (const threshold of config.alertThresholds) {
        const pct = (spend / limit) * 100;
        if (pct >= threshold) {
          const id = `${agentId}-${period}-${threshold}`;
          const existing = alerts.find((a) => a.id === id);
          if (!existing || existing.dismissed) continue;
          newAlerts.push({
            id,
            agentId,
            period,
            threshold,
            currentSpend: spend,
            limit,
            triggeredAt: new Date().toISOString(),
            dismissed: false,
          });
        }
      }
    };

    checkLimit(todaySpend, config.limits.daily, "daily", "all");
    checkLimit(weeklySpend, config.limits.weekly, "weekly", "all");
    checkLimit(monthlySpend, config.limits.monthly, "monthly", "all");

    if (newAlerts.length > 0) {
      const merged = [...alerts];
      for (const na of newAlerts) {
        const idx = merged.findIndex((a) => a.id === na.id);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], currentSpend: na.currentSpend };
        } else {
          merged.push(na);
        }
      }
      setAlerts(merged);
      localStorage.setItem("guild-budget-alerts", JSON.stringify(merged));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- alerts excluded to prevent infinite loop
  }, [costs, config]);

  const updateConfig = useCallback((newConfig: BudgetConfig) => {
    setConfig(newConfig);
    localStorage.setItem("guild-budget-config", JSON.stringify(newConfig));
  }, []);

  const dismissAlert = useCallback(
    (id: string) => {
      const updated = alerts.map((a) =>
        a.id === id ? { ...a, dismissed: true } : a
      );
      setAlerts(updated);
      localStorage.setItem("guild-budget-alerts", JSON.stringify(updated));
    },
    [alerts]
  );

  return { config, alerts, updateConfig, dismissAlert };
}
