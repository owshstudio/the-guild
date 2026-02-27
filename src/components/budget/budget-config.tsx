"use client";

import { useState, useEffect } from "react";
import type { BudgetConfig } from "@/lib/types";

interface BudgetConfigPanelProps {
  config: BudgetConfig;
  onSave: (config: BudgetConfig) => void;
}

export function BudgetConfigPanel({ config, onSave }: BudgetConfigPanelProps) {
  const [local, setLocal] = useState<BudgetConfig>(config);
  const [showPerAgent, setShowPerAgent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocal(config);
  }, [config]);

  const handleSave = () => {
    onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const thresholdOptions = [50, 75, 90, 100];

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#d4d4d4]">
              Budget Tracking
            </h3>
            <p className="mt-1 text-xs text-[#737373]">
              Enable budget limits and alerts for API costs
            </p>
          </div>
          <button
            onClick={() => setLocal({ ...local, enabled: !local.enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              local.enabled ? "bg-[#7c3aed]" : "bg-[#1f1f1f]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                local.enabled ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Spending limits */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
        <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
          Spending Limits
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#737373]">
              Daily Limit ($)
            </label>
            <input
              type="number"
              value={local.limits.daily ?? ""}
              onChange={(e) =>
                setLocal({
                  ...local,
                  limits: {
                    ...local.limits,
                    daily: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] outline-none focus:border-[#7c3aed]"
              placeholder="10.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs text-[#737373]">
              Weekly Limit ($)
            </label>
            <input
              type="number"
              value={local.limits.weekly ?? ""}
              onChange={(e) =>
                setLocal({
                  ...local,
                  limits: {
                    ...local.limits,
                    weekly: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] outline-none focus:border-[#7c3aed]"
              placeholder="50.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-xs text-[#737373]">
              Monthly Limit ($)
            </label>
            <input
              type="number"
              value={local.limits.monthly ?? ""}
              onChange={(e) =>
                setLocal({
                  ...local,
                  limits: {
                    ...local.limits,
                    monthly: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] outline-none focus:border-[#7c3aed]"
              placeholder="150.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Per-agent overrides */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
        <button
          onClick={() => setShowPerAgent(!showPerAgent)}
          className="flex w-full items-center justify-between"
        >
          <h3 className="text-sm font-medium text-[#d4d4d4]">
            Per-Agent Overrides
          </h3>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`text-[#737373] transition-transform ${
              showPerAgent ? "rotate-180" : ""
            }`}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {showPerAgent && (
          <div className="mt-4 space-y-4">
            {["nyx", "hemera"].map((agentId) => (
              <div
                key={agentId}
                className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#737373]">
                  {agentId.toUpperCase()}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(["daily", "weekly", "monthly"] as const).map((period) => (
                    <div key={period}>
                      <label className="block text-[10px] text-[#525252]">
                        {period} ($)
                      </label>
                      <input
                        type="number"
                        value={local.perAgent?.[agentId]?.[period] ?? ""}
                        onChange={(e) => {
                          const perAgent = { ...local.perAgent };
                          if (!perAgent[agentId]) perAgent[agentId] = {};
                          perAgent[agentId][period] = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          setLocal({ ...local, perAgent });
                        }}
                        className="mt-1 w-full rounded border border-[#1f1f1f] bg-[#141414] px-2 py-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#7c3aed]"
                        placeholder="--"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert thresholds */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
        <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
          Alert Thresholds
        </h3>
        <div className="flex flex-wrap gap-3">
          {thresholdOptions.map((t) => {
            const isChecked = local.alertThresholds.includes(t);
            return (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const thresholds = isChecked
                      ? local.alertThresholds.filter((v) => v !== t)
                      : [...local.alertThresholds, t].sort((a, b) => a - b);
                    setLocal({ ...local, alertThresholds: thresholds });
                  }}
                  className="h-4 w-4 rounded border-[#1f1f1f] bg-[#0a0a0a] accent-[#7c3aed]"
                />
                <span className="text-[#d4d4d4]">{t}%</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
          saved
            ? "bg-[#22c55e]/20 text-[#22c55e]"
            : "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
        }`}
      >
        {saved ? "Saved" : "Save Budget Config"}
      </button>
    </div>
  );
}
