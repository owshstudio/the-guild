"use client";

import type { CronSchedule } from "@/lib/types";

function formatSchedule(schedule: CronSchedule): string {
  if (schedule.type === "every") {
    const ms = schedule.intervalMs;
    if (ms < 60_000) return `Every ${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `Every ${Math.round(ms / 60_000)} min`;
    if (ms < 86_400_000) {
      const hrs = Math.round(ms / 3_600_000);
      return `Every ${hrs} hr${hrs > 1 ? "s" : ""}`;
    }
    const days = Math.round(ms / 86_400_000);
    return `Every ${days} day${days > 1 ? "s" : ""}`;
  }

  const date = new Date(schedule.at);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface SchedulePreviewProps {
  schedule: CronSchedule;
}

export function SchedulePreview({ schedule }: SchedulePreviewProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-1 text-xs text-[#a3a3a3]">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 3v3h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {formatSchedule(schedule)}
    </span>
  );
}
