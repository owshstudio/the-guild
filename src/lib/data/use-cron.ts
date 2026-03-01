"use client";

import { useState, useCallback } from "react";
import { usePoll } from "./use-poll";
import type { CronJob, CronSchedule, CronPayload, CronDelivery, CronJobStatus } from "@/lib/types";

interface CronData {
  version: number;
  jobs: CronJob[];
}

function msToIso(ms: number | undefined): string {
  if (!ms) return "";
  return new Date(ms).toISOString();
}

/**
 * Normalize a raw job from the backend into the UI's CronJob shape.
 * The backend uses a different schema (createdAtMs, schedule.kind, state, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw backend data
function normalizeJob(raw: any): CronJob {
  // Schedule: backend uses { kind: "cron", expr, tz }
  let schedule: CronSchedule;
  const rs = raw.schedule || {};
  if (rs.type === "every" || rs.type === "at" || rs.type === "cron") {
    schedule = rs;
  } else if (rs.kind === "cron") {
    schedule = { type: "cron", expr: rs.expr, tz: rs.tz };
  } else if (rs.kind === "interval" || rs.intervalMs) {
    schedule = { type: "every", intervalMs: rs.intervalMs };
  } else {
    schedule = { type: "cron", expr: rs.expr || "unknown" };
  }

  // Payload: backend uses { kind, message/text } instead of { kind, description }
  let payload: CronPayload;
  const rp = raw.payload || {};
  if (rp.kind === "systemEvent") {
    payload = {
      kind: "systemEvent",
      description: rp.description || rp.text || rp.message || "",
      event: rp.event,
    };
  } else {
    payload = {
      kind: "agentTurn",
      description: rp.description || rp.message || "",
      systemPrompt: rp.systemPrompt,
      userPrompt: rp.userPrompt,
    };
  }

  // Delivery: backend uses { mode, channel } instead of { type, channel, address }
  let delivery: CronDelivery | undefined;
  if (raw.delivery) {
    delivery = {
      type: raw.delivery.type || raw.delivery.mode || "channel",
      channel: raw.delivery.channel || "",
      address: raw.delivery.address,
    };
  }

  // Status: backend uses `state` with Ms timestamps and "ok" instead of "success"
  let status: CronJobStatus | undefined;
  const st = raw.state || raw.status;
  if (st) {
    const runStatus = st.lastRunStatus || st.lastStatus;
    status = {
      lastRunAt: st.lastRunAt || msToIso(st.lastRunAtMs),
      lastRunStatus: runStatus === "ok" ? "success" : runStatus,
      lastRunError: st.lastRunError || st.lastError,
      consecutiveErrors: st.consecutiveErrors,
      nextRunAt: st.nextRunAt || msToIso(st.nextRunAtMs),
    };
  }

  return {
    id: raw.id,
    agentId: raw.agentId || "",
    name: raw.name || "Unnamed Job",
    enabled: raw.enabled ?? true,
    schedule,
    sessionTarget: raw.sessionTarget || "new",
    wakeMode: raw.wakeMode || "auto",
    payload,
    delivery,
    status,
    deleteAfterRun: raw.deleteAfterRun,
    createdAt: raw.createdAt || msToIso(raw.createdAtMs),
    updatedAt: raw.updatedAt || msToIso(raw.updatedAtMs),
  };
}

function normalizeJobs(data: { version: number; jobs: unknown[] }): CronData {
  return {
    version: data.version || 1,
    jobs: (data.jobs || []).map(normalizeJob),
  };
}

export function useCron() {
  const [cron, setCron] = useState<CronData>({ version: 1, jobs: [] });
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCron = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/cron");
      const json = await res.json();
      setCron(normalizeJobs(json.data || { version: 1, jobs: [] }));
      setIsLive(json.source === "live");
      setError(json.error || null);
    } catch (e) {
      setCron({ version: 1, jobs: [] });
      setIsLive(false);
      setError(e instanceof Error ? e.message : "Failed to load cron jobs");
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

  return { cron, isLive, isLoading, error, createJob, updateJob, deleteJob, toggleJob };
}
