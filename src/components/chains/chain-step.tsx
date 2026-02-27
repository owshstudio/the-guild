"use client";

import type { ChainStep as ChainStepType, ChainActionType, ChainStepStatus } from "@/lib/types";

const ACTION_ICONS: Record<ChainActionType, string> = {
  "start-task": "T",
  "send-message": "M",
  "run-cron": "C",
  webhook: "W",
  "notify-human": "H",
};

const STATUS_COLORS: Record<ChainStepStatus, string> = {
  completed: "#22c55e",
  active: "#3b82f6",
  pending: "#525252",
  failed: "#ef4444",
  skipped: "#737373",
};

const STATUS_BG: Record<ChainStepStatus, string> = {
  completed: "rgba(34,197,94,0.08)",
  active: "rgba(59,130,246,0.08)",
  pending: "transparent",
  failed: "rgba(239,68,68,0.08)",
  skipped: "transparent",
};

interface ChainStepProps {
  step: ChainStepType;
  onClick?: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export default function ChainStepNode({ step, onClick, dragHandleProps }: ChainStepProps) {
  const borderColor = STATUS_COLORS[step.status];
  const bgColor = STATUS_BG[step.status];

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[#1f1f1f] p-4 transition hover:border-[#2a2a2a]"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
        backgroundColor: bgColor || "#141414",
      }}
    >
      {/* Drag handle */}
      <div
        className="flex cursor-grab flex-col gap-0.5 text-[#525252] active:cursor-grabbing"
        {...dragHandleProps}
      >
        <div className="flex gap-0.5">
          <div className="h-1 w-1 rounded-full bg-current" />
          <div className="h-1 w-1 rounded-full bg-current" />
        </div>
        <div className="flex gap-0.5">
          <div className="h-1 w-1 rounded-full bg-current" />
          <div className="h-1 w-1 rounded-full bg-current" />
        </div>
        <div className="flex gap-0.5">
          <div className="h-1 w-1 rounded-full bg-current" />
          <div className="h-1 w-1 rounded-full bg-current" />
        </div>
      </div>

      {/* Action icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
        style={{ backgroundColor: borderColor + "20", color: borderColor }}
      >
        {ACTION_ICONS[step.action.type] || "?"}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#e5e5e5]">{step.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "#1f1f1f", color: "#737373" }}
          >
            {step.trigger.type}
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: borderColor + "15", color: borderColor }}
          >
            {step.action.type}
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: borderColor }}
      />
    </div>
  );
}
