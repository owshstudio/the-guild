"use client";

import { useState } from "react";
import { useGateway } from "@/components/gateway-provider";
import KanbanBoard from "@/components/tasks/kanban-board";

export default function TasksPage() {
  const { agents, dispatchTask } = useGateway();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAgent, setNewAgent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!newTitle.trim() || !newAgent) return;
    setSubmitting(true);
    await dispatchTask(newAgent, newTitle.trim(), newDesc.trim());
    setSubmitting(false);
    setNewTitle("");
    setNewDesc("");
    setNewAgent("");
    setShowNew(false);
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Tasks</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Kanban board for tracking agent work
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          New Task
        </button>
      </div>

      <KanbanBoard />

      {/* New Task Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowNew(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Dispatch Task
            </h2>

            {/* Agent select */}
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#525252]">
              Assign to
            </label>
            <div className="mb-4 flex gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setNewAgent(agent.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition ${
                    newAgent === agent.id
                      ? "border-white/20 bg-white/[0.08] text-white"
                      : "border-[#1f1f1f] text-[#737373] hover:border-[#2a2a2a] hover:text-[#a3a3a3]"
                  }`}
                >
                  <span>{agent.emoji}</span>
                  {agent.name}
                </button>
              ))}
            </div>

            {/* Title */}
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#525252]">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="mb-4 w-full rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2 text-sm text-white placeholder-[#525252] outline-none focus:border-[#2a2a2a]"
              autoFocus
            />

            {/* Description */}
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#525252]">
              Description
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Details, context, requirements..."
              rows={3}
              className="mb-4 w-full resize-none rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2 text-sm text-white placeholder-[#525252] outline-none focus:border-[#2a2a2a]"
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded-lg px-4 py-2 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newAgent || submitting}
                className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? "Dispatching..." : "Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
