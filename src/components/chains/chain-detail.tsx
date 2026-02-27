"use client";

import type { TaskChain, ChainStatus } from "@/lib/types";
import ChainBuilder from "./chain-builder";

const STATUS_COLORS: Record<ChainStatus, string> = {
  active: "#22c55e",
  paused: "#eab308",
  completed: "#3b82f6",
  failed: "#ef4444",
  draft: "#525252",
};

interface ChainDetailProps {
  chain: TaskChain;
  onUpdate: (chain: TaskChain) => void;
  onDelete: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onClose: () => void;
}

export default function ChainDetail({
  chain,
  onUpdate,
  onDelete,
  onPause,
  onResume,
  onClose,
}: ChainDetailProps) {
  const statusColor = STATUS_COLORS[chain.status];

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#141414] p-6">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{chain.name}</h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: statusColor + "15",
                color: statusColor,
              }}
            >
              {chain.status}
            </span>
          </div>
          {chain.description && (
            <p className="mt-1 text-sm text-[#737373]">{chain.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#525252] transition hover:bg-[#1f1f1f] hover:text-[#a3a3a3]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        {chain.status === "active" && (
          <button
            onClick={() => onPause(chain.id)}
            className="rounded-lg border border-[#eab308]/30 bg-[#eab308]/10 px-3 py-1.5 text-xs font-medium text-[#eab308] transition hover:bg-[#eab308]/20"
          >
            Pause
          </button>
        )}
        {chain.status === "paused" && (
          <button
            onClick={() => onResume(chain.id)}
            className="rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-[#22c55e] transition hover:bg-[#22c55e]/20"
          >
            Resume
          </button>
        )}
        {chain.status === "draft" && (
          <button
            onClick={() => onUpdate({ ...chain, status: "active" })}
            className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            Activate
          </button>
        )}
        <button
          onClick={() => onDelete(chain.id)}
          className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-1.5 text-xs font-medium text-[#ef4444] transition hover:bg-[#ef4444]/20"
        >
          Delete
        </button>
      </div>

      {/* Step builder */}
      <div className="mb-4">
        <h3 className="mb-3 text-sm font-medium text-[#a3a3a3]">
          Steps ({chain.steps.length})
        </h3>
        <ChainBuilder
          steps={chain.steps}
          onStepsChange={(steps) => onUpdate({ ...chain, steps })}
        />
      </div>

      {/* Metadata */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-[#1f1f1f] pt-4 text-[10px] text-[#525252]">
        <span>
          Created:{" "}
          {new Date(chain.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {chain.lastRunAt && (
          <span>
            Last run:{" "}
            {new Date(chain.lastRunAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
        <span>ID: {chain.id}</span>
      </div>
    </div>
  );
}
