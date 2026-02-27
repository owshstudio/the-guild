"use client";

import type { Agent } from "@/lib/types";

interface AgentSelectorProps {
  agents: Agent[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AgentSelector({ agents, selectedId, onSelect }: AgentSelectorProps) {
  return (
    <div className="flex gap-2">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => onSelect(agent.id)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
            selectedId === agent.id
              ? "border-[#DF4F15]/50 bg-[#DF4F15]/10 text-white"
              : "border-[#1f1f1f] text-[#737373] hover:border-[#2a2a2a] hover:text-[#a3a3a3]"
          }`}
        >
          <span>{agent.emoji}</span>
          <span className="font-medium">{agent.name}</span>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor:
                agent.status === "active"
                  ? "#22c55e"
                  : agent.status === "idle"
                  ? "#eab308"
                  : "#ef4444",
            }}
          />
        </button>
      ))}
    </div>
  );
}
