"use client";

import { motion } from "framer-motion";
import type { CronJob } from "@/lib/types";
import { SchedulePreview } from "./schedule-preview";
import { useAgents } from "@/lib/data/use-agents";

interface CronJobListProps {
  jobs: CronJob[];
  onEdit: (job: CronJob) => void;
  onDelete: (job: CronJob) => void;
  onToggle: (id: string) => void;
}

function StatusDot({ status }: { status?: CronJob["status"] }) {
  if (!status?.lastRunStatus) {
    return <span className="h-2 w-2 rounded-full bg-[#525252]" title="Never run" />;
  }
  const color =
    status.lastRunStatus === "success"
      ? "#22c55e"
      : status.lastRunStatus === "error"
      ? "#ef4444"
      : "#eab308";
  return <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} title={status.lastRunStatus} />;
}

export function CronJobList({ jobs, onEdit, onDelete, onToggle }: CronJobListProps) {
  const { agents } = useAgents();
  const getAgent = (agentId: string) => agents.find((a) => a.id === agentId);

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1f1f1f] bg-[#141414]/50 py-16">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 text-[#525252]">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
          <path d="M20 12v8h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-[#737373]">No cron jobs yet</p>
        <p className="mt-1 text-xs text-[#525252]">Create one to schedule recurring agent tasks</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {jobs.map((job, i) => {
        const agent = getAgent(job.agentId);
        return (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusDot status={job.status} />
                <div>
                  <h3 className="text-sm font-semibold text-white">{job.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <SchedulePreview schedule={job.schedule} />
                    {agent && (
                      <span className="text-xs text-[#525252]">
                        {agent.emoji} {agent.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Toggle switch */}
                <button
                  onClick={() => onToggle(job.id)}
                  className="relative h-5 w-9 rounded-full transition-colors"
                  style={{ backgroundColor: job.enabled ? "#22c55e" : "#2a2a2a" }}
                  title={job.enabled ? "Enabled" : "Disabled"}
                >
                  <span
                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                    style={{ left: job.enabled ? "18px" : "2px" }}
                  />
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEdit(job)}
                  className="rounded-md p-1.5 text-[#525252] transition hover:bg-white/[0.06] hover:text-[#a3a3a3]"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(job)}
                  className="rounded-md p-1.5 text-[#525252] transition hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M5 4V2.5h4V4M3.5 4v8a1 1 0 001 1h5a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Meta row */}
            {job.status?.lastRunAt && (
              <div className="mt-3 border-t border-[#1f1f1f] pt-2">
                <span className="text-[11px] text-[#525252]">
                  Last run: {new Date(job.status.lastRunAt).toLocaleString()}
                  {job.status.lastRunError && (
                    <span className="ml-2 text-red-400">- {job.status.lastRunError}</span>
                  )}
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
