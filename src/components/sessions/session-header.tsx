"use client";

import { useState } from "react";
import type { SessionDetail } from "@/lib/types";
import { useActions } from "@/lib/data/use-actions";
import { useToasts } from "@/components/toast-provider";

interface SessionHeaderProps {
  session: SessionDetail;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function SessionHeader({ session }: SessionHeaderProps) {
  const { execute, isExecuting } = useActions();
  const { addToast } = useToasts();
  const [aborted, setAborted] = useState(false);

  const handleAbort = async () => {
    const result = await execute({
      action: "abort",
      agentId: "unknown",
      sessionId: session.id,
    });
    if (result.success) {
      setAborted(true);
      addToast("success", "Session aborted", result.message);
    } else {
      addToast("error", "Abort failed", result.error || "Could not abort");
    }
  };

  const duration =
    session.startTime && session.endTime
      ? new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime()
      : null;

  return (
    <div className="flex items-center justify-between border-b border-[#1f1f1f] bg-[#0c0c0c] px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {session.isActive && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </span>
          )}
          <span className="font-mono text-sm text-[#d4d4d4]">
            {session.id.slice(0, 8)}...
          </span>
        </div>
        {session.model && (
          <span className="rounded-md bg-[#1a1a1a] px-2 py-0.5 font-mono text-[11px] text-[#737373]">
            {session.model}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            session.isActive
              ? "bg-[#22c55e]/10 text-[#22c55e]"
              : "bg-[#525252]/10 text-[#525252]"
          }`}
        >
          {session.isActive ? "Active" : "Completed"}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-[#525252]">
        {duration !== null && (
          <span>{formatDuration(duration)}</span>
        )}
        <span>{session.totalTokens.toLocaleString()} tokens</span>
        {session.totalCost > 0 && (
          <span>${session.totalCost.toFixed(4)}</span>
        )}
        {session.isActive && !aborted && (
          <button
            onClick={handleAbort}
            disabled={isExecuting}
            className="flex items-center gap-1 rounded-md border border-[#ef4444]/30 px-2 py-1 text-[11px] font-medium text-[#ef4444] transition hover:bg-[#ef4444]/10 disabled:opacity-40"
          >
            {isExecuting ? (
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            Abort
          </button>
        )}
      </div>
    </div>
  );
}
