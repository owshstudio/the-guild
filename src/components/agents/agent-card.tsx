"use client";

import { Agent } from "@/lib/types";
import { motion } from "framer-motion";

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  const statusColor =
    agent.status === "active"
      ? "#22c55e"
      : agent.status === "idle"
      ? "#eab308"
      : "#ef4444";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(agent)}
      className="w-full rounded-xl border border-[#1f1f1f] bg-[#141414] p-5 text-left transition-colors hover:border-[#2a2a2a] hover:bg-[#1a1a1a]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl leading-none"
            style={{ background: agent.color + "20" }}
          >
            <span className="flex items-center justify-center">{agent.emoji}</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-xs text-[#737373]">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs capitalize text-[#737373]">
            {agent.status}
          </span>
        </div>
      </div>

      {agent.currentTask && (
        <div className="mt-4 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Current Task
          </p>
          <p className="mt-0.5 truncate text-xs text-[#a3a3a3]">
            {agent.currentTask}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          <span className="font-mono text-[11px] text-[#525252]">
            {agent.machine}
          </span>
        </div>
        <span className="text-[11px] text-[#525252]">
          {agent.lastActivity}
        </span>
      </div>
    </motion.button>
  );
}
