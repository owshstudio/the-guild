"use client";

import { motion } from "framer-motion";
import type { Team, Agent } from "@/lib/types";

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

interface TeamCardProps {
  team: Team;
  agents: Agent[];
  onClick: (team: Team) => void;
}

export default function TeamCard({ team, agents, onClick }: TeamCardProps) {
  const members = agents.filter((a) => team.memberAgentIds.includes(a.id));
  const lead = agents.find((a) => a.id === team.leadAgentId);
  const hasActive = members.some((m) => m.status === "active");
  const statusColor = hasActive ? "#22c55e" : "#eab308";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(team)}
      className="w-full rounded-xl border border-[#1f1f1f] bg-[#141414] p-5 text-left transition-colors hover:border-[#2a2a2a] hover:bg-[#1a1a1a]"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
            style={{ background: team.color + "20" }}
          >
            {TEAM_ICONS[team.icon] || TEAM_ICONS.shield}
          </div>
          <div>
            <h3 className="font-semibold text-white">{team.name}</h3>
            <p className="text-xs text-[#737373]">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs text-[#737373]">
            {hasActive ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      {team.description && (
        <p className="mt-3 line-clamp-2 text-xs text-[#a3a3a3]">
          {team.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        {lead && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{lead.emoji}</span>
            <span className="text-[11px] text-[#525252]">
              {lead.name} (Lead)
            </span>
          </div>
        )}
        <div className="flex -space-x-1.5">
          {members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#141414] text-xs"
              style={{ background: m.color + "30" }}
              title={m.name}
            >
              {m.emoji}
            </div>
          ))}
          {members.length > 4 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#141414] bg-[#1f1f1f] text-[10px] text-[#737373]">
              +{members.length - 4}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
