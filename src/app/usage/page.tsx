"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useAgents } from "@/lib/data/use-agents";
import { useUsage } from "@/lib/data/use-usage";
import { useCosts } from "@/lib/data/use-costs";
import { useBudget } from "@/lib/data/use-budget";
import { BudgetDashboard } from "@/components/budget/budget-dashboard";
import { CostChart } from "@/components/budget/cost-chart";
import { ModelComparison } from "@/components/budget/model-comparison";
import { SessionCostBreakdown } from "@/components/budget/session-cost-breakdown";
import { BudgetConfigPanel } from "@/components/budget/budget-config";

type Tab = "tokens" | "costs" | "budget";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#141414] p-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-[#d4d4d4]">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-[#737373]">{p.name}:</span>
          <span className="text-[#d4d4d4]">{formatTokens(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export default function UsagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("tokens");
  const { agents } = useAgents();
  const { usage: dailyUsage } = useUsage();
  const { costs } = useCosts();
  const { config, updateConfig } = useBudget(costs);

  const nyxAgent = agents.find((a) => a.id === "nyx") || agents[0];
  const hemeraAgent = agents.find((a) => a.id === "hemera") || agents[1];

  const nyxTotal = dailyUsage.reduce((sum, d) => sum + d.nyx, 0);
  const hemeraTotal = dailyUsage.reduce((sum, d) => sum + d.hemera, 0);
  const nyxDaysActive = dailyUsage.filter((d) => d.nyx > 0).length;
  const nyxAvg = nyxDaysActive > 0 ? Math.round(nyxTotal / nyxDaysActive) : 0;

  const cumulativeData = useMemo(() => {
    let nyxCum = 0;
    let hemeraCum = 0;
    return dailyUsage.map((d) => {
      nyxCum += d.nyx;
      hemeraCum += d.hemera;
      return { date: d.date, nyx: nyxCum, hemera: hemeraCum };
    });
  }, [dailyUsage]);

  if (!nyxAgent || !hemeraAgent) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "tokens", label: "Tokens" },
    { id: "costs", label: "Costs" },
    { id: "budget", label: "Budget" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Usage</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Token usage, model info, and uptime metrics
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-[#141414] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#1f1f1f] text-white"
                : "text-[#737373] hover:text-[#d4d4d4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tokens tab */}
      {activeTab === "tokens" && (
        <>
          {/* Agent summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* NYX */}
            <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                  style={{ background: nyxAgent.color + "20" }}
                >
                  {nyxAgent.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{nyxAgent.name}</h3>
                  <p className="font-mono text-xs text-[#737373]">
                    {nyxAgent.model}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  <span className="text-xs text-[#737373]">Active</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Avg/Day
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatTokens(nyxAvg)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatTokens(nyxTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Uptime
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">24d</p>
                </div>
              </div>
            </div>

            {/* HEMERA */}
            <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                  style={{ background: hemeraAgent.color + "20" }}
                >
                  {hemeraAgent.emoji}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {hemeraAgent.name}
                  </h3>
                  <p className="font-mono text-xs text-[#737373]">
                    {hemeraAgent.model}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                  <span className="text-xs text-[#737373]">Idle</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Avg/Day
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatTokens(hemeraTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatTokens(hemeraTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Uptime
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    &lt;1d
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily tokens bar chart */}
          <div className="mb-8 rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
            <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
              Daily Token Usage
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUsage} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#525252" }}
                    axisLine={{ stroke: "#1f1f1f" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#525252" }}
                    axisLine={{ stroke: "#1f1f1f" }}
                    tickLine={false}
                    tickFormatter={formatTokens}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="nyx"
                    name="NYX"
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="hemera"
                    name="HEMERA"
                    fill="#d97706"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative line chart */}
          <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
            <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
              Cumulative Token Usage
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#525252" }}
                    axisLine={{ stroke: "#1f1f1f" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#525252" }}
                    axisLine={{ stroke: "#1f1f1f" }}
                    tickLine={false}
                    tickFormatter={formatTokens}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="nyx"
                    name="NYX"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="hemera"
                    name="HEMERA"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Costs tab */}
      {activeTab === "costs" && (
        <div className="space-y-6">
          <BudgetDashboard costs={costs} />
          <CostChart costs={costs} />
          <ModelComparison />
          <SessionCostBreakdown costs={costs} />
        </div>
      )}

      {/* Budget tab */}
      {activeTab === "budget" && (
        <BudgetConfigPanel config={config} onSave={updateConfig} />
      )}
    </div>
  );
}
