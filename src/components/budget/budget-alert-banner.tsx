"use client";

import { useState, useEffect } from "react";
import type { BudgetAlert } from "@/lib/types";

export function BudgetAlertBanner() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("guild-budget-alerts");
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetAlert[];
        setAlerts(parsed.filter((a) => !a.dismissed)); // eslint-disable-line react-hooks/set-state-in-effect
      }
    } catch {
      // No alerts
    }
  }, []);

  const dismiss = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        const raw = localStorage.getItem("guild-budget-alerts");
        if (raw) {
          const all = JSON.parse(raw) as BudgetAlert[];
          const patched = all.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          );
          localStorage.setItem("guild-budget-alerts", JSON.stringify(patched));
        }
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const isWarning = topAlert.threshold < 100;

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm ${
        isWarning
          ? "bg-[#eab308]/10 text-[#eab308]"
          : "bg-[#ef4444]/10 text-[#ef4444]"
      }`}
    >
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1L1 14h14L8 1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8 6v4M8 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>
          Budget alert: {topAlert.agentId.toUpperCase()} has used $
          {topAlert.currentSpend.toFixed(2)} of ${topAlert.limit.toFixed(2)}{" "}
          {topAlert.period} limit ({topAlert.threshold}%)
        </span>
      </div>
      <button
        onClick={() => dismiss(topAlert.id)}
        className="rounded p-1 transition hover:bg-white/10"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
