"use client";

import { useState, useEffect, useCallback } from "react";
import { Reorder } from "framer-motion";
import { tasks as mockTasks, agents } from "@/lib/mock-data";
import { Task, TaskStatus } from "@/lib/types";
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
  // Track task order per agent
  const [taskOrderMap, setTaskOrderMap] = useState<Record<string, string[]>>(
    {}
  );

  // Initialize order from mock data
  useEffect(() => {
    const orderMap: Record<string, string[]> = {};
    for (const agent of agents) {
      const agentTasks = [...mockTasks]
        .filter((t) => t.agentId === agent.id)
        .sort(
          (a, b) =>
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );
      orderMap[agent.id] = agentTasks.map((t) => t.id);
    }
    setTaskOrderMap(orderMap);
  }, []);

  const handleReorder = useCallback(
    (agentId: string, newOrder: string[]) => {
      setTaskOrderMap((prev) => ({ ...prev, [agentId]: newOrder }));
    },
    []
  );

  // Build a task lookup
  const taskMap = new Map<string, Task>();
  for (const t of mockTasks) {
    taskMap.set(t.id, t);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {agents.map((agent) => {
        const orderedIds = taskOrderMap[agent.id] || [];
        const orderedTasks = orderedIds
          .map((id) => taskMap.get(id))
          .filter(Boolean) as Task[];

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
                {orderedTasks.length}
              </span>
            </div>

            {/* Reorderable cards */}
            {orderedTasks.length > 0 ? (
              <Reorder.Group
                axis="y"
                values={orderedIds}
                onReorder={(newOrder) => handleReorder(agent.id, newOrder)}
                className="flex flex-col gap-2"
              >
                {orderedIds.map((taskId) => {
                  const task = taskMap.get(taskId);
                  if (!task) return null;
                  return (
                    <Reorder.Item
                      key={taskId}
                      value={taskId}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard task={task} draggable />
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            ) : (
              <div className="rounded-lg border border-dashed border-[#1f1f1f] py-8 text-center text-xs text-[#525252]">
                No tasks
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
