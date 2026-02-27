"use client";

import type { TaskChain, ChainStatus, ChainStepStatus } from "@/lib/types";

const STATUS_COLORS: Record<ChainStatus, string> = {
  active: "#22c55e",
  paused: "#eab308",
  completed: "#3b82f6",
  failed: "#ef4444",
  draft: "#525252",
};

const STEP_COLORS: Record<ChainStepStatus, string> = {
  completed: "#22c55e",
  active: "#3b82f6",
  pending: "#525252",
  failed: "#ef4444",
  skipped: "#737373",
};

interface ChainCardProps {
  chain: TaskChain;
  onClick: () => void;
}

export default function ChainCard({ chain, onClick }: ChainCardProps) {
  const statusColor = STATUS_COLORS[chain.status];
  const completedSteps = chain.steps.filter((s) => s.status === "completed").length;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-[#1f1f1f] bg-[#141414] p-4 transition hover:border-[#2a2a2a] hover:bg-[#181818]"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="truncate text-sm font-semibold text-[#e5e5e5]">
          {chain.name}
        </h3>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: statusColor + "15",
            color: statusColor,
          }}
        >
          {chain.status}
        </span>
      </div>

      {/* Step count */}
      <p className="mb-3 text-xs text-[#737373]">
        {completedSteps}/{chain.steps.length} steps completed
      </p>

      {/* Progress dots */}
      <div className="mb-3 flex items-center gap-0">
        {chain.steps
          .sort((a, b) => a.order - b.order)
          .map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STEP_COLORS[step.status] }}
              />
              {idx < chain.steps.length - 1 && (
                <div
                  className="h-0.5 w-4"
                  style={{
                    backgroundColor:
                      step.status === "completed"
                        ? STEP_COLORS.completed
                        : "#2a2a2a",
                  }}
                />
              )}
            </div>
          ))}
      </div>

      {/* Last run */}
      {chain.lastRunAt && (
        <p className="text-[10px] text-[#525252]">
          Last run:{" "}
          {new Date(chain.lastRunAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
