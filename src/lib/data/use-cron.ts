"use client";

import { useState, useCallback } from "react";
import { usePoll } from "./use-poll";
import type { CronJob } from "@/lib/types";

interface CronData {
  version: number;
  jobs: CronJob[];
}

export function useCron() {
  const [cron, setCron] = useState<CronData>({ version: 1, jobs: [] });
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCron = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/cron");
      const json = await res.json();
      setCron(json.data || { version: 1, jobs: [] });
      setIsLive(json.source === "live");
    } catch {
      setCron({ version: 1, jobs: [] });
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  usePoll(fetchCron, 60000);

  const createJob = useCallback(async (job: Omit<CronJob, "id" | "createdAt" | "updatedAt">) => {
    const res = await fetch("/api/gateway/cron", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    const json = await res.json();
    if (json.success) {
      await fetchCron();
    }
    return json;
  }, [fetchCron]);

  const updateJob = useCallback(async (job: CronJob) => {
    const res = await fetch("/api/gateway/cron", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    const json = await res.json();
    if (json.success) {
      await fetchCron();
    }
    return json;
  }, [fetchCron]);

  const deleteJob = useCallback(async (id: string) => {
    const res = await fetch(`/api/gateway/cron?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      await fetchCron();
    }
    return json;
  }, [fetchCron]);

  const toggleJob = useCallback(async (id: string) => {
    const job = cron.jobs.find((j) => j.id === id);
    if (!job) return { success: false, error: "Job not found" };

    // Optimistic update
    setCron((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === id ? { ...j, enabled: !j.enabled } : j
      ),
    }));

    const res = await fetch("/api/gateway/cron", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...job, enabled: !job.enabled }),
    });
    const json = await res.json();
    if (!json.success) {
      // Revert on failure
      await fetchCron();
    }
    return json;
  }, [cron.jobs, fetchCron]);

  return { cron, isLive, isLoading, createJob, updateJob, deleteJob, toggleJob };
}
