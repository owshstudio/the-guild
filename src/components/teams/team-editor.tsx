"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Team, Agent } from "@/lib/types";

const COLOR_SWATCHES = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#9333ea",
];

const ICON_OPTIONS = [
  { value: "shield", label: "\u{1F6E1}\uFE0F Shield" },
  { value: "rocket", label: "\u{1F680} Rocket" },
  { value: "gear", label: "\u{2699}\uFE0F Gear" },
  { value: "bolt", label: "\u{26A1} Bolt" },
  { value: "star", label: "\u{2B50} Star" },
  { value: "fire", label: "\u{1F525} Fire" },
  { value: "brain", label: "\u{1F9E0} Brain" },
  { value: "globe", label: "\u{1F310} Globe" },
];

interface TeamEditorProps {
  team?: Team;
  agents: Agent[];
  onSave: (team: Omit<Team, "id" | "createdAt"> | Team) => void;
  onCancel: () => void;
}

export default function TeamEditor({ team, agents, onSave, onCancel }: TeamEditorProps) {
  const [name, setName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [color, setColor] = useState(team?.color || COLOR_SWATCHES[0]);
  const [icon, setIcon] = useState(team?.icon || "shield");
  const [leadAgentId, setLeadAgentId] = useState(team?.leadAgentId || "");
  const [memberAgentIds, setMemberAgentIds] = useState<string[]>(
    team?.memberAgentIds || []
  );

  const toggleMember = (agentId: string) => {
    setMemberAgentIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      leadAgentId,
      memberAgentIds,
    };

    if (team) {
      onSave({ ...payload, id: team.id, createdAt: team.createdAt });
    } else {
      onSave(payload);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-[#1f1f1f] bg-[#141414] p-6"
        >
          <h2 className="text-lg font-semibold text-white">
            {team ? "Edit Team" : "Create Team"}
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Team name"
                className="w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#525252] outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this team do?"
                rows={2}
                className="w-full resize-none rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#525252] outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Color
              </label>
              <div className="flex gap-2">
                {COLOR_SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full border-2 transition"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "#fff" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setIcon(opt.value)}
                    className="rounded-lg border px-2.5 py-1 text-xs transition"
                    style={{
                      borderColor: icon === opt.value ? color : "#1f1f1f",
                      background: icon === opt.value ? color + "20" : "transparent",
                      color: icon === opt.value ? "#e5e5e5" : "#737373",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Lead Agent
              </label>
              <select
                value={leadAgentId}
                onChange={(e) => setLeadAgentId(e.target.value)}
                className="w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#7c3aed]"
              >
                <option value="">Select lead</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.emoji} {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#737373]">
                Members
              </label>
              <div className="space-y-1.5">
                {agents.map((a) => (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 transition hover:border-[#2a2a2a]"
                  >
                    <input
                      type="checkbox"
                      checked={memberAgentIds.includes(a.id)}
                      onChange={() => toggleMember(a.id)}
                      className="h-3.5 w-3.5 rounded border-[#525252] accent-[#7c3aed]"
                    />
                    <span className="text-sm">{a.emoji}</span>
                    <span className="text-sm text-white">{a.name}</span>
                    <span className="text-xs text-[#525252]">{a.role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border border-[#1f1f1f] px-4 py-2 text-sm text-[#737373] transition hover:bg-white/[0.05]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              {team ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
