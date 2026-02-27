"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HITLItem as HITLItemType, HITLStatus } from "@/lib/types";
import { HITLActions } from "./hitl-actions";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  responded: "Responded",
  expired: "Expired",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface HITLItemProps {
  item: HITLItemType;
  onRespond: (id: string, response: string, status: HITLStatus) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

export function HITLItemCard({ item, onRespond, onDismiss }: HITLItemProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityColor = PRIORITY_COLORS[item.priority] || "#6b7280";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-4"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Priority badge */}
        <span
          className="mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: priorityColor + "20",
            color: priorityColor,
          }}
        >
          {item.priority}
        </span>

        <div className="min-w-0 flex-1">
          {/* Agent info + timestamp */}
          <div className="flex items-center gap-2 text-xs text-[#737373]">
            <span>{item.agentEmoji}</span>
            <span>{item.agentName}</span>
            <span>&middot;</span>
            <span>{timeAgo(item.createdAt)}</span>
            {item.status !== "pending" && (
              <>
                <span>&middot;</span>
                <span
                  className="capitalize"
                  style={{
                    color:
                      item.status === "approved"
                        ? "#22c55e"
                        : item.status === "rejected"
                        ? "#ef4444"
                        : item.status === "responded"
                        ? "#3b82f6"
                        : "#737373",
                  }}
                >
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-1 text-sm font-semibold text-[#e5e5e5]">
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="mt-1 text-xs text-[#a3a3a3]">{item.description}</p>
          )}

          {/* Detected pattern badge */}
          {item.detectedPattern && (
            <span className="mt-2 inline-block rounded-md border border-[#2a2a2a] bg-[#0a0a0a] px-2 py-0.5 text-[10px] text-[#737373]">
              Detected: &quot;{item.detectedPattern}&quot;
            </span>
          )}

          {/* Expandable context */}
          {item.context && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] text-[#525252] transition hover:text-[#737373]"
              >
                {expanded ? "Hide context" : "Show context"}
              </button>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-xs text-[#a3a3a3]"
                >
                  {item.context}
                </motion.div>
              )}
            </div>
          )}

          {/* Response if responded */}
          {item.response && (
            <div className="mt-2 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-xs text-[#a3a3a3]">
              <span className="font-medium text-[#737373]">Response: </span>
              {item.response}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <HITLActions
        item={item}
        onRespond={onRespond}
        onDismiss={onDismiss}
      />
    </motion.div>
  );
}
