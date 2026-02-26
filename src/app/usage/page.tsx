"use client";

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
import { agents, dailyUsage } from "@/lib/mock-data";

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

const nyxAgent = agents.find((a) => a.id === "nyx")!;
const hemeraAgent = agents.find((a) => a.id === "hemera")!;

const nyxTotal = dailyUsage.reduce((sum, d) => sum + d.nyx, 0);
const hemeraTotal = dailyUsage.reduce((sum, d) => sum + d.hemera, 0);
const nyxDaysActive = dailyUsage.filter((d) => d.nyx > 0).length;
const nyxAvg = nyxDaysActive > 0 ? Math.round(nyxTotal / nyxDaysActive) : 0;

const cumulativeData = (() => {
  let nyxCum = 0;
  let hemeraCum = 0;
  return dailyUsage.map((d) => {
    nyxCum += d.nyx;
    hemeraCum += d.hemera;
    return { date: d.date, nyx: nyxCum, hemera: hemeraCum };
  });
})();

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

export default function UsagePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Usage</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Token usage, model info, and uptime metrics
        </p>
      </div>

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
              <h3 className="font-semibold text-white">{hemeraAgent.name}</h3>
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
              <p className="mt-1 text-lg font-semibold text-white">&lt;1d</p>
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
    </div>
  );
}
