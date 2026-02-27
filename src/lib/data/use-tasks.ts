"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Task } from "@/lib/types";

const POLL_INTERVAL = 30_000;

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

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

  useEffect(() => {
    fetchTasks();
    intervalRef.current = setInterval(fetchTasks, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchTasks]);

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
