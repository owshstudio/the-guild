"use client";

import { useMemo, useState } from "react";

function computeUptimeDays(since: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(since).getTime()) / 86400000));
}
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
  const { usage: dailyUsage, isLive } = useUsage();
  const { costs } = useCosts();
  const { config, updateConfig } = useBudget(costs);

  // Compute per-agent totals dynamically
  const agentStats = useMemo(() => {
    return agents.map((agent) => {
      const total = dailyUsage.reduce(
        (sum, d) => sum + (typeof d[agent.id] === "number" ? (d[agent.id] as number) : 0),
        0
      );
      const daysActive = dailyUsage.filter(
        (d) => typeof d[agent.id] === "number" && (d[agent.id] as number) > 0
      ).length;
      const avg = daysActive > 0 ? Math.round(total / daysActive) : 0;
      return { agent, total, avg, daysActive };
    });
  }, [agents, dailyUsage]);

  const cumulativeData = useMemo(() => {
    const cumTotals: Record<string, number> = {};
    return dailyUsage.map((d) => {
      const entry: Record<string, string | number> = { date: d.date };
      for (const agent of agents) {
        const val = typeof d[agent.id] === "number" ? (d[agent.id] as number) : 0;
        cumTotals[agent.id] = (cumTotals[agent.id] || 0) + val;
        entry[agent.id] = cumTotals[agent.id];
      }
      return entry;
    });
  }, [dailyUsage, agents]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "tokens", label: "Tokens" },
    { id: "costs", label: "Costs" },
    { id: "budget", label: "Budget" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Usage</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Token usage, model info, and uptime metrics
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            <span className="text-xs font-medium text-[#22c55e]">LIVE</span>
          </div>
        )}
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
          {/* Agent summary cards — dynamic */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {agentStats.map(({ agent, total, avg }) => {
              const statusColor =
                agent.status === "active"
                  ? "#22c55e"
                  : agent.status === "idle"
                  ? "#eab308"
                  : "#ef4444";
              return (
                <div
                  key={agent.id}
                  className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                      style={{ background: agent.color + "20" }}
                    >
                      {agent.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <p className="font-mono text-xs text-[#737373]">
                        {agent.model}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="text-xs capitalize text-[#737373]">
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                        Avg/Day
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatTokens(avg)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {formatTokens(total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                        Uptime
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {agent.uptimeSince
                          ? `${computeUptimeDays(agent.uptimeSince)}d`
                          : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily tokens bar chart — dynamic */}
          <div className="mb-8 rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
            <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
              Daily Token Usage
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                  {agents.map((agent) => (
                    <Bar
                      key={agent.id}
                      dataKey={agent.id}
                      name={agent.name}
                      fill={agent.color}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative line chart — dynamic */}
          <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
            <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
              Cumulative Token Usage
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                  {agents.map((agent) => (
                    <Line
                      key={agent.id}
                      type="monotone"
                      dataKey={agent.id}
                      name={agent.name}
                      stroke={agent.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
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
