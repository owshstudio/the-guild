"use client";

import type { Agent } from "@/lib/types";

interface TeamMetricsProps {
  members: Agent[];
}

export default function TeamMetrics({ members }: TeamMetricsProps) {
  const activeCount = members.filter((m) => m.status === "active").length;
  const idleCount = members.filter((m) => m.status === "idle").length;
  const stoppedCount = members.filter((m) => m.status === "stopped").length;

  return (
    <div className="mt-6 grid grid-cols-4 gap-4">
      <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
          Members
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{members.length}</p>
      </div>
      <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
          Active
        </p>
        <p className="mt-1 text-lg font-semibold text-[#22c55e]">{activeCount}</p>
      </div>
      <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
          Idle
        </p>
        <p className="mt-1 text-lg font-semibold text-[#eab308]">{idleCount}</p>
      </div>
      <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
          Stopped
        </p>
        <p className="mt-1 text-lg font-semibold text-[#ef4444]">{stoppedCount}</p>
      </div>
    </div>
  );
}
