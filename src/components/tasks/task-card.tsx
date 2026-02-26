"use client";

import { Task } from "@/lib/types";
import { agents } from "@/lib/mock-data";

interface TaskCardProps {
  task: Task;
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "#ef444420", text: "#ef4444" },
  medium: { bg: "#eab30820", text: "#eab308" },
  low: { bg: "#525252", text: "#737373" },
};

export default function TaskCard({ task }: TaskCardProps) {
  const agent = agents.find((a) => a.id === task.agentId);
  const priority = priorityColors[task.priority] || priorityColors.low;

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#141414] p-3 transition hover:border-[#2a2a2a] hover:bg-[#1a1a1a]">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-[#e5e5e5]">{task.title}</h4>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
          style={{ backgroundColor: priority.bg, color: priority.text }}
        >
          {task.priority}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-[#737373] line-clamp-2">
        {task.description}
      </p>
      <div className="mt-3 flex items-center justify-between">
        {agent && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{agent.emoji}</span>
            <span className="text-[11px] text-[#525252]">{agent.name}</span>
          </div>
        )}
        {dueLabel && (
          <span className="text-[11px] text-[#525252]">{dueLabel}</span>
        )}
      </div>
    </div>
  );
}
