"use client";

import { Task, TaskStatus } from "@/lib/types";

interface TaskCardProps {
  task: Task;
}

const statusConfig: Record<
  TaskStatus,
  { bg: string; text: string; label: string }
> = {
  completed: { bg: "#22c55e20", text: "#22c55e", label: "Completed" },
  "in-progress": { bg: "#3b82f620", text: "#3b82f6", label: "In Progress" },
  blocked: { bg: "#ef444420", text: "#ef4444", label: "Blocked" },
  pending: { bg: "#eab30820", text: "#eab308", label: "Pending" },
  upcoming: { bg: "#52525220", text: "#737373", label: "Upcoming" },
  recurring: { bg: "#8b5cf620", text: "#8b5cf6", label: "Recurring" },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "#ef444420", text: "#ef4444" },
  medium: { bg: "#eab30820", text: "#eab308" },
  low: { bg: "#52525220", text: "#737373" },
};

export default function TaskCard({ task }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityColors[task.priority] || priorityColors.low;

  return (
    <div
      className={`rounded-lg border border-[#1f1f1f] bg-[#141414] p-3 transition hover:border-[#2a2a2a] hover:bg-[#1a1a1a] ${
        task.status === "completed" ? "opacity-60" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          {status.label}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
          style={{ backgroundColor: priority.bg, color: priority.text }}
        >
          {task.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium text-[#e5e5e5]">{task.title}</h4>
      <p className="mt-1.5 line-clamp-2 text-xs text-[#737373]">
        {task.description}
      </p>
    </div>
  );
}
