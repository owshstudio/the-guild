"use client";

import { Agent } from "@/lib/types";
import { motion } from "framer-motion";
import { AgentActionsBar } from "@/components/actions/agent-actions-bar";

interface AgentDetailProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const statusColor =
    agent.status === "active"
      ? "#22c55e"
      : agent.status === "idle"
      ? "#eab308"
      : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl"
            style={{ background: agent.color + "20" }}
          >
            {agent.emoji}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
            <p className="text-sm text-[#737373]">{agent.role}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-[#525252] transition hover:bg-white/[0.05] hover:text-[#a3a3a3]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Status
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-sm capitalize text-white">
              {agent.status}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Machine
          </p>
          <p className="mt-1 font-mono text-sm text-white">{agent.machine}</p>
        </div>
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Gateway
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  agent.gateway === "localhost" ? "#22c55e" : "#eab308",
              }}
            />
            <p className="font-mono text-sm text-white">{agent.gateway}</p>
          </div>
        </div>
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Model
          </p>
          <p className="mt-1 font-mono text-sm text-white">{agent.model}</p>
        </div>
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Uptime Since
          </p>
          <p className="mt-1 text-sm text-white">{agent.uptimeSince}</p>
        </div>
        <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
            Last Active
          </p>
          <p className="mt-1 text-sm text-white">{agent.lastActivity}</p>
        </div>
      </div>

      <div className="mt-4">
        <AgentActionsBar agentId={agent.id} currentModel={agent.model} />
      </div>

      {agent.currentTask && (
        <div className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
            Current Task
          </h3>
          <p className="mt-2 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#d4d4d4]">
            {agent.currentTask}
          </p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
          About
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#a3a3a3]">
          {agent.description}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
          Skills
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {agent.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-2.5 py-1 text-xs text-[#a3a3a3]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
