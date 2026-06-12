"use client";

import { useState } from "react";
import { useGateway } from "@/components/gateway-provider";
import ActivityItem from "./activity-item";

export default function ActivityFeed() {
  const { agents, activity, isConnected } = useGateway();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? activity
      : activity.filter((e) => e.agentId === filter);

  return (
    <div>
      {/* Connection indicator */}
      {isConnected && (
        <div className="mb-3 flex items-center gap-2 text-xs text-[#22c55e]/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          </span>
          Live — streaming from gateway
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filter === "all"
              ? "bg-white/[0.1] text-white"
              : "text-[#737373] hover:text-[#a3a3a3]"
          }`}
        >
          All
        </button>
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setFilter(agent.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === agent.id
                ? "bg-white/[0.1] text-white"
                : "text-[#737373] hover:text-[#a3a3a3]"
            }`}
          >
            <span>{agent.emoji}</span>
            {agent.name}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c]">
        {filtered.map((entry) => (
          <ActivityItem key={entry.id} entry={entry} />
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-[#525252]">
            No activity found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
