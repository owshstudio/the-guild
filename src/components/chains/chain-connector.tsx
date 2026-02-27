"use client";

import type { ChainStepStatus } from "@/lib/types";

const STATUS_COLORS: Record<ChainStepStatus, string> = {
  completed: "#22c55e",
  active: "#3b82f6",
  pending: "#525252",
  failed: "#ef4444",
  skipped: "#737373",
};

interface ChainConnectorProps {
  fromStatus: ChainStepStatus;
}

export default function ChainConnector({ fromStatus }: ChainConnectorProps) {
  const color = STATUS_COLORS[fromStatus];

  return (
    <div className="flex justify-center py-0.5">
      <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
        <line x1="12" y1="0" x2="12" y2="20" stroke={color} strokeWidth="2" />
        <polygon points="6,18 12,26 18,18" fill={color} />
      </svg>
    </div>
  );
}
