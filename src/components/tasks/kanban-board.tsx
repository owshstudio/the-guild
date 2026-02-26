"use client";

import { tasks, agents } from "@/lib/mock-data";
import { TaskStatus } from "@/lib/types";
import TaskCard from "./task-card";

const statusOrder: TaskStatus[] = [
  "in-progress",
  "blocked",
  "pending",
  "upcoming",
  "recurring",
  "completed",
];

export default function KanbanBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {agents.map((agent) => {
        const agentTasks = [...tasks]
          .filter((t) => t.agentId === agent.id)
          .sort(
            (a, b) =>
              statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          );

        const statusColor =
          agent.status === "active"
            ? "#22c55e"
            : agent.status === "idle"
            ? "#eab308"
            : "#ef4444";

        return (
          <div
            key={agent.id}
            className="min-w-[320px] flex-1 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-3"
          >
            {/* Column header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{agent.emoji}</span>
                <h3 className="text-sm font-medium text-[#d4d4d4]">
                  {agent.name}
                </h3>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.05] text-[11px] text-[#737373]">
                {agentTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {agentTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {agentTasks.length === 0 && (
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
