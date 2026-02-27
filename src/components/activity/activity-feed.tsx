"use client";

import { useState } from "react";
import { useActivity } from "@/lib/data/use-activity";
import { useAgents } from "@/lib/data/use-agents";
import ActivityItem from "./activity-item";

export default function ActivityFeed() {
  const { activity } = useActivity();
  const { agents } = useAgents();
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? activity
      : activity.filter((e) => e.agentId === filter);

  return (
    <div>
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
