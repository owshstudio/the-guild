"use client";

import { motion } from "framer-motion";
import type { Team, Agent } from "@/lib/types";
import TeamMetrics from "./team-metrics";

const TEAM_ICONS: Record<string, string> = {
  shield: "\u{1F6E1}\uFE0F",
  rocket: "\u{1F680}",
  gear: "\u{2699}\uFE0F",
  bolt: "\u{26A1}",
  star: "\u{2B50}",
  fire: "\u{1F525}",
  brain: "\u{1F9E0}",
  globe: "\u{1F310}",
};

interface TeamDetailProps {
  team: Team;
  agents: Agent[];
  onClose: () => void;
  onEdit: (team: Team) => void;
}

export default function TeamDetail({ team, agents, onClose, onEdit }: TeamDetailProps) {
  const members = agents.filter((a) => team.memberAgentIds.includes(a.id));
  const lead = agents.find((a) => a.id === team.leadAgentId);

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
            style={{ background: team.color + "20" }}
          >
            {TEAM_ICONS[team.icon] || TEAM_ICONS.shield}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{team.name}</h2>
            <p className="text-sm text-[#737373]">{team.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(team)}
            className="rounded-lg px-3 py-1.5 text-xs text-[#737373] transition hover:bg-white/[0.05] hover:text-[#a3a3a3]"
          >
            Edit
          </button>
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
      </div>

      <TeamMetrics members={members} />

      <div className="mt-6">
        <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
          Members ({members.length})
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {members.map((member) => {
            const isLead = member.id === team.leadAgentId;
            const statusColor =
              member.status === "active"
                ? "#22c55e"
                : member.status === "idle"
                ? "#eab308"
                : "#ef4444";

            return (
              <div
                key={member.id}
                className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
                      style={{ background: member.color + "20" }}
                    >
                      {member.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {member.name}
                        </span>
                        {isLead && (
                          <span className="rounded bg-[#7c3aed]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#a78bfa]">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#737373]">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: statusColor }}
                    />
                    <span className="text-xs capitalize text-[#737373]">
                      {member.status}
                    </span>
                  </div>
                </div>

                {member.currentTask && (
                  <p className="mt-2 truncate text-[11px] text-[#525252]">
                    {member.currentTask}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {lead && (
        <div className="mt-4 text-[11px] text-[#525252]">
          Team lead: {lead.emoji} {lead.name} &middot; Created{" "}
          {new Date(team.createdAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
