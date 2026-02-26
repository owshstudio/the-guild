"use client";

import { tasks } from "@/lib/mock-data";
import TaskCard from "./task-card";

const columns = [
  { id: "backlog" as const, label: "Backlog", color: "#525252" },
  { id: "in-progress" as const, label: "In Progress", color: "#3b82f6" },
  { id: "review" as const, label: "Review", color: "#eab308" },
  { id: "done" as const, label: "Done", color: "#22c55e" },
];

export default function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className="min-w-[280px] flex-1 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-3"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-sm font-medium text-[#d4d4d4]">
                  {col.label}
                </h3>
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.05] text-[11px] text-[#737373]">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {colTasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#1f1f1f] py-8 text-center text-xs text-[#525252]">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
