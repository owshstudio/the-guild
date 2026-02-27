"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { AgentCostEntry } from "@/lib/types";

interface CostChartProps {
  costs: AgentCostEntry[];
}

function CostTooltip({
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
          <span className="text-[#d4d4d4]">${p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

const AGENT_COLORS: Record<string, string> = {
  nyx: "#7c3aed",
  hemera: "#d97706",
  main: "#7c3aed",
};

function getAgentColor(agentId: string, index: number): string {
  if (AGENT_COLORS[agentId]) return AGENT_COLORS[agentId];
  const hues = [210, 340, 160, 30, 280, 50];
  const hue = hues[index % hues.length];
  return `hsl(${hue}, 60%, 50%)`;
}

export function CostChart({ costs }: CostChartProps) {
  // Discover all agent IDs from the data
  const agentIds = [...new Set(costs.map((c) => c.agentId))];

  // Group costs by date, dynamically keyed by agent
  const dateMap = new Map<string, Record<string, string | number>>();

  for (const c of costs) {
    const existing = dateMap.get(c.date) || { date: c.date };
    existing[c.agentId] = ((existing[c.agentId] as number) || 0) + c.estimatedCost;
    dateMap.set(c.date, existing);
  }

  const chartData = Array.from(dateMap.values());

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
      <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
        Daily Cost Breakdown
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2}>
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
              tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            />
            <Tooltip content={<CostTooltip />} />
            {agentIds.map((agentId, i) => (
              <Bar
                key={agentId}
                dataKey={agentId}
                name={agentId.toUpperCase()}
                stackId="costs"
                fill={getAgentColor(agentId, i)}
                radius={i === agentIds.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
