"use client";

import { useCallback } from "react";
import KanbanBoard from "@/components/tasks/kanban-board";
import { useTasks } from "@/lib/data/use-tasks";
import { useAgents } from "@/lib/data/use-agents";
import type { Task } from "@/lib/types";

export default function TasksPage() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const { agents } = useAgents();

  const handleNewTask = useCallback(async () => {
    const defaultAgentId = agents[0]?.id || "demo";
    await createTask({
      title: "New Task",
      description: "Describe this task...",
      agentId: defaultAgentId,
      status: "pending",
      priority: "medium",
    });
  }, [createTask, agents]);

  const handleUpdateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      await updateTask(id, patch);
    },
    [updateTask]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
    },
    [deleteTask]
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Kanban board for tracking agent work
          </p>
        </div>
        <button
          onClick={handleNewTask}
          className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          New Task
        </button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#525252] border-t-white" />
          <span className="ml-3 text-sm text-[#737373]">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1f1f1f] py-20">
          <p className="text-sm text-[#737373]">No tasks yet</p>
          <button
            onClick={handleNewTask}
            className="mt-3 rounded-lg bg-white/[0.06] px-4 py-2 text-sm text-[#d4d4d4] transition hover:bg-white/[0.1]"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          agents={agents}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}
