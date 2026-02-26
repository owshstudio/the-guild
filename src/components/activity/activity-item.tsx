"use client";

import { ActivityEntry } from "@/lib/types";

interface ActivityItemProps {
  entry: ActivityEntry;
}

const typeColors: Record<string, string> = {
  task: "#3b82f6",
  system: "#8b5cf6",
  communication: "#22c55e",
  error: "#ef4444",
};

export default function ActivityItem({ entry }: ActivityItemProps) {
  const color = typeColors[entry.type] || "#737373";

  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="group flex gap-4 rounded-lg border border-transparent px-4 py-3 transition hover:border-[#1f1f1f] hover:bg-[#141414]">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="mt-1 h-full w-px bg-[#1f1f1f] group-last:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-base">{entry.agentEmoji}</span>
          <span className="text-sm font-medium text-white">
            {entry.agentName}
          </span>
          <span className="text-xs text-[#525252]">{time}</span>
          <span
            className="ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase"
            style={{
              color: color,
              backgroundColor: color + "15",
            }}
          >
            {entry.type}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#d4d4d4]">{entry.action}</p>
        <p className="mt-0.5 text-xs text-[#737373]">{entry.detail}</p>
      </div>
    </div>
  );
}
