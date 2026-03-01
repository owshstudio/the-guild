"use client";

import { useState } from "react";
import type { CommChannel, CommMessage } from "@/lib/types";

export type AgentMeta = Record<string, { name: string; emoji: string; color: string }>;

const CHANNEL_COLORS: Record<CommChannel, string> = {
  "whatsapp-group": "#22c55e",
  "git-sync": "#f97316",
  session: "#8b5cf6",
  "alert-file": "#ef4444",
  "delivery-queue": "#3b82f6",
};

const CHANNEL_LABELS: Record<CommChannel, string> = {
  "whatsapp-group": "WhatsApp",
  "git-sync": "Git Sync",
  session: "Session",
  "alert-file": "Alert",
  "delivery-queue": "Queue",
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DeliveryIndicator({ status }: { status: string }) {
  if (status === "delivered") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]/20">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5L4 7L8 3"
            stroke="#22c55e"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444]/20">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M3 3L7 7M7 3L3 7"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eab308]/20">
      <span className="h-1.5 w-1.5 rounded-full bg-[#eab308]" />
    </span>
  );
}

export default function CommsMessage({
  message,
  align,
  agentMeta,
}: {
  message: CommMessage;
  align: "left" | "right";
  agentMeta?: AgentMeta;
}) {
  const [expanded, setExpanded] = useState(false);
  const agent = agentMeta?.[message.fromAgentId] || {
    name: message.fromAgentId,
    emoji: "?",
    color: "#737373",
  };
  const channelColor = CHANNEL_COLORS[message.channel] || "#737373";
  const channelLabel = CHANNEL_LABELS[message.channel] || message.channel;

  const displayContent = expanded ? message.content : message.contentPreview;

  return (
    <div
      className={`flex w-full ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className="max-w-[480px] rounded-xl border border-[#1f1f1f] bg-[#141414] p-4 transition-colors hover:border-[#2a2a2a]"
        style={{ borderLeftColor: align === "left" ? agent.color : undefined, borderRightColor: align === "right" ? agent.color : undefined, borderLeftWidth: align === "left" ? 3 : undefined, borderRightWidth: align === "right" ? 3 : undefined }}
      >
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
            style={{ backgroundColor: agent.color + "20" }}
          >
            {agent.emoji}
          </span>
          <span className="text-sm font-medium text-[#e5e5e5]">
            {agent.name}
          </span>
          <span className="text-xs text-[#525252]">
            {formatRelativeTime(message.timestamp)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: channelColor + "18",
                color: channelColor,
              }}
            >
              {channelLabel}
            </span>
            <DeliveryIndicator status={message.deliveryStatus} />
          </div>
        </div>

        {/* Content */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <p className="text-sm leading-relaxed text-[#a3a3a3]">
            {displayContent}
          </p>
          {message.content.length > 200 && (
            <span className="mt-1 block text-xs text-[#525252]">
              {expanded ? "Show less" : "Show more"}
            </span>
          )}
        </button>

        {/* Session ID */}
        {message.sessionId && (
          <p className="mt-2 font-mono text-[10px] text-[#3f3f3f]">
            session: {message.sessionId}
          </p>
        )}
      </div>
    </div>
  );
}
