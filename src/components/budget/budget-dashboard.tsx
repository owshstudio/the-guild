"use client";

import type { AgentCostEntry } from "@/lib/types";

interface BudgetDashboardProps {
  costs: AgentCostEntry[];
}

export function BudgetDashboard({ costs }: BudgetDashboardProps) {
  const now = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const today = `${months[now.getMonth()]} ${now.getDate()}`;

  const todaySpend = costs
    .filter((c) => c.date === today)
    .reduce((s, c) => s + c.estimatedCost, 0);

  // Compute week window (last 7 days)
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekKeys = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    weekKeys.add(`${months[d.getMonth()]} ${d.getDate()}`);
  }

  const weeklySpend = costs
    .filter((c) => weekKeys.has(c.date))
    .reduce((s, c) => s + c.estimatedCost, 0);

  // Monthly: all entries whose month matches current month
  const currentMonth = months[now.getMonth()];
  const monthlySpend = costs
    .filter((c) => c.date.startsWith(currentMonth))
    .reduce((s, c) => s + c.estimatedCost, 0);

  const yesterdayKey = (() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return `${months[d.getMonth()]} ${d.getDate()}`;
  })();

  const yesterdaySpend = costs
    .filter((c) => c.date === yesterdayKey)
    .reduce((s, c) => s + c.estimatedCost, 0);

  const dailyTrend =
    yesterdaySpend > 0
      ? ((todaySpend - yesterdaySpend) / yesterdaySpend) * 100
      : 0;

  const cards = [
    { label: "Today's Spend", amount: todaySpend, trend: dailyTrend },
    { label: "This Week", amount: weeklySpend, trend: null },
    { label: "This Month", amount: monthlySpend, trend: null },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            {card.label}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-2xl font-semibold text-white">
              ${card.amount.toFixed(2)}
            </p>
            {card.trend !== null && card.trend !== 0 && (
              <span
                className={`mb-1 text-xs font-medium ${
                  card.trend > 0 ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}
              >
                {card.trend > 0 ? "+" : ""}
                {card.trend.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
