"use client";

import { useState } from "react";
import { useCron } from "@/lib/data/use-cron";
import { useToasts } from "@/components/toast-provider";
import { CronJobList } from "@/components/cron/cron-job-list";
import { CronJobModal } from "@/components/cron/cron-job-modal";
import { CronDeleteConfirm } from "@/components/cron/cron-delete-confirm";
import type { CronJob } from "@/lib/types";

export default function CronPage() {
  const { cron, isLoading, createJob, updateJob, deleteJob, toggleJob } = useCron();
  const { addToast } = useToasts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<CronJob | null>(null);

  const handleCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleSave = async (job: Omit<CronJob, "id" | "createdAt" | "updatedAt"> | CronJob) => {
    if ("id" in job && job.id) {
      const res = await updateJob(job as CronJob);
      if (res.success) {
        addToast("success", "Job updated", `"${job.name}" has been updated`);
      } else {
        addToast("error", "Update failed", res.error || "Unknown error");
      }
    } else {
      const res = await createJob(job);
      if (res.success) {
        addToast("success", "Job created", `"${job.name}" has been scheduled`);
      } else {
        addToast("error", "Create failed", res.error || "Unknown error");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingJob) return;
    const res = await deleteJob(deletingJob.id);
    if (res.success) {
      addToast("success", "Job deleted", `"${deletingJob.name}" has been removed`);
    } else {
      addToast("error", "Delete failed", res.error || "Unknown error");
    }
    setDeletingJob(null);
  };

  const handleToggle = async (id: string) => {
    const job = cron.jobs.find((j) => j.id === id);
    const res = await toggleJob(id);
    if (res.success && job) {
      addToast("info", job.enabled ? "Job disabled" : "Job enabled", `"${job.name}"`);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cron Jobs</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Schedule recurring tasks for your agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="text-xs text-[#525252]">
              {cron.jobs.length} job{cron.jobs.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={handleCreate}
            className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            New Job
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#525252] border-t-white" />
        </div>
      ) : (
        <CronJobList
          jobs={cron.jobs}
          onEdit={handleEdit}
          onDelete={setDeletingJob}
          onToggle={handleToggle}
        />
      )}

      <CronJobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editJob={editingJob}
      />

      <CronDeleteConfirm
        isOpen={!!deletingJob}
        jobName={deletingJob?.name || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeletingJob(null)}
      />
    </div>
  );
}
