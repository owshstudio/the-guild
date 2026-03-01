"use client";

import { useState, useCallback } from "react";
import { usePoll } from "./use-poll";
import type { Task } from "@/lib/types";

const POLL_INTERVAL = 30_000;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/tasks");
      const json = await res.json();
      setTasks(json.data ?? []);
    } catch {
      // Keep previous data on network errors
    }
    setIsLoading(false);
  }, []);

  usePoll(fetchTasks, POLL_INTERVAL);

  const createTask = useCallback(
    async (task: {
      title: string;
      description?: string;
      agentId: string;
      status: Task["status"];
      priority: Task["priority"];
      dueDate?: string | null;
    }) => {
      try {
        const res = await fetch("/api/gateway/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(task),
        });
        const json = await res.json();
        if (json.data) {
          setTasks((prev) => [...prev, json.data]);
        }
        return json.data as Task | undefined;
      } catch {
        return undefined;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      try {
        const res = await fetch("/api/gateway/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...patch }),
        });
        const json = await res.json();
        if (json.data) {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? json.data : t))
          );
        }
        return json.data as Task | undefined;
      } catch {
        return undefined;
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/gateway/tasks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
