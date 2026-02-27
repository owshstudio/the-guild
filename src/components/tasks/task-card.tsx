"use client";

import { Task, TaskStatus } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  draggable?: boolean;
  onUpdateTask?: (id: string, patch: Partial<Task>) => Promise<void>;
  onDeleteTask?: (id: string) => Promise<void>;
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

export default function TaskCard({
  task,
  draggable,
  onUpdateTask,
  onDeleteTask,
}: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityColors[task.priority] || priorityColors.low;

  return (
    <div
      className={`group relative rounded-lg border border-[#1f1f1f] bg-[#141414] p-3 transition hover:border-[#2a2a2a] hover:bg-[#1a1a1a] ${
        task.status === "completed" ? "opacity-60" : ""
      }`}
    >
      {/* Delete button */}
      {onDeleteTask && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id);
          }}
          className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded text-[#525252] opacity-0 transition hover:bg-white/[0.06] hover:text-[#ef4444] group-hover:opacity-100"
          title="Delete task"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      )}
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        {draggable && (
          <div className="mt-0.5 flex flex-col gap-[3px] opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
            </div>
            <div className="flex gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
            </div>
            <div className="flex gap-[3px]">
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
              <span className="h-[3px] w-[3px] rounded-full bg-[#525252]" />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
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
      </div>
    </div>
  );
}
