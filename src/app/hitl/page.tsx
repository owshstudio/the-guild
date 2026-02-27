"use client";

import { useState } from "react";
import type { HITLPriority } from "@/lib/types";
import { useHITL } from "@/lib/data/use-hitl";
import { HITLBadge } from "@/components/hitl/hitl-badge";
import { HITLQueue } from "@/components/hitl/hitl-queue";

const FILTERS: { label: string; value: HITLPriority | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const FILTER_COLORS: Record<string, string> = {
  all: "#e5e5e5",
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#6b7280",
};

export default function HITLPage() {
  const { items, pendingCount, isLoading, respond, dismiss } = useHITL();
  const [filter, setFilter] = useState<HITLPriority | "all">("all");

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-white">
          Human-in-the-Loop Queue
        </h1>
        <HITLBadge count={pendingCount} />
      </div>
      <p className="mb-6 text-sm text-[#737373]">
        Items requiring your attention, approval, or input from agents
      </p>

      {/* Priority filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          const color = FILTER_COLORS[f.value];
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              style={{
                borderColor: isActive ? color + "60" : "#1f1f1f",
                backgroundColor: isActive ? color + "15" : "transparent",
                color: isActive ? color : "#737373",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Queue */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#7c3aed]" />
        </div>
      ) : (
        <HITLQueue
          items={items}
          filter={filter}
          onRespond={respond}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}
