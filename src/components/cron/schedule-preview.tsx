"use client";

import type { CronSchedule } from "@/lib/types";

function describeCronExpr(expr: string, tz?: string): string {
  const parts = expr.split(/\s+/);
  if (parts.length < 5) return expr;

  const [min, hour, , , dow] = parts;

  // Common patterns
  if (min.startsWith("*/")) {
    const interval = parseInt(min.slice(2), 10);
    if (hour === "*") return `Every ${interval} min`;
    return `Every ${interval} min (${hour}h)`;
  }
  if (hour.startsWith("*/")) {
    const interval = parseInt(hour.slice(2), 10);
    return `Every ${interval} hr${interval > 1 ? "s" : ""}`;
  }

  // Specific time
  const h = parseInt(hour, 10);
  const m = parseInt(min, 10);
  if (!isNaN(h) && !isNaN(m)) {
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const mStr = String(m).padStart(2, "0");
    const dayPart = dow === "0" ? " Sun" : dow === "1-5" ? " weekdays" : dow !== "*" ? ` (dow ${dow})` : "";
    const tzLabel = tz ? ` ${tz.split("/").pop()}` : "";
    return `${h12}:${mStr} ${period}${dayPart}${tzLabel}`;
  }

  return expr;
}

function formatSchedule(schedule: CronSchedule): string {
  if (schedule.type === "every") {
    const ms = schedule.intervalMs;
    if (ms <= 0) return "Invalid interval";
    if (ms < 60_000) return `Every ${Math.round(ms / 1000)}s`;
    if (ms < 3_600_000) return `Every ${Math.round(ms / 60_000)} min`;
    if (ms < 86_400_000) {
      const hrs = Math.round(ms / 3_600_000);
      return `Every ${hrs} hr${hrs > 1 ? "s" : ""}`;
    }
    const days = Math.round(ms / 86_400_000);
    return `Every ${days} day${days > 1 ? "s" : ""}`;
  }

  if (schedule.type === "cron") {
    return describeCronExpr(schedule.expr, schedule.tz);
  }

  // type: "at"
  if (!schedule.at) return "No date set";
  const date = new Date(schedule.at);
  if (isNaN(date.getTime())) return "Invalid date";
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
