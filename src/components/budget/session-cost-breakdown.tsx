"use client";

import { useState } from "react";
import type { AgentCostEntry } from "@/lib/types";

interface SessionCostBreakdownProps {
  costs: AgentCostEntry[];
}

function formatTokens(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function SessionCostBreakdown({ costs }: SessionCostBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Reverse to show most recent first
  const sorted = [...costs].reverse();

  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
      <h3 className="mb-4 text-sm font-medium text-[#d4d4d4]">
        Session Cost Breakdown
      </h3>
      <div className="space-y-1">
        {sorted.map((entry, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <div key={`${entry.date}-${entry.agentId}-${i}`}>
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#1f1f1f]/50"
              >
                <span className="text-xs text-[#737373]">{entry.date}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-[#7c3aed]/20 text-[#a78bfa]"
                >
                  {entry.agentId}
                </span>
                <span className="rounded bg-[#1f1f1f] px-1.5 py-0.5 font-mono text-[10px] text-[#737373]">
                  {entry.model}
                </span>
                <span className="ml-auto font-mono text-xs text-[#e5e5e5]">
                  ${entry.estimatedCost.toFixed(3)}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className={`text-[#525252] transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M3 5l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isExpanded && (
                <div className="mx-3 mb-2 rounded-lg bg-[#0a0a0a] p-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#525252]">Input tokens:</span>
                      <span className="ml-2 text-[#d4d4d4]">
                        {formatTokens(entry.inputTokens)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#525252]">Output tokens:</span>
                      <span className="ml-2 text-[#d4d4d4]">
                        {formatTokens(entry.outputTokens)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#525252]">Total tokens:</span>
                      <span className="ml-2 text-[#d4d4d4]">
                        {formatTokens(entry.totalTokens)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#525252]">Sessions:</span>
                      <span className="ml-2 text-[#d4d4d4]">
                        {entry.sessionCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="py-4 text-center text-xs text-[#525252]">
            No cost data available
          </p>
        )}
      </div>
    </div>
  );
}
