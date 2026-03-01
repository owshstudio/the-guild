"use client";

import { useState } from "react";
import { useAgents } from "@/lib/data/use-agents";
import { useDataSource } from "@/lib/data/data-provider";
import { useTeams } from "@/lib/data/use-teams";
import { Agent, Team } from "@/lib/types";
import AgentCard from "@/components/agents/agent-card";
import AgentDetail from "@/components/agents/agent-detail";
import TeamCard from "@/components/teams/team-card";
import TeamDetail from "@/components/teams/team-detail";
import TeamEditor from "@/components/teams/team-editor";
import { AnimatePresence } from "framer-motion";
import { OPENCLAW_DOCS_URL } from "@/lib/constants";

type ViewTab = "agents" | "teams";

export default function AgentsPage() {
  const { agents } = useAgents();
  const { dataSource } = useDataSource();
  const { teams, createTeam, updateTeam } = useTeams();
  const [tab, setTab] = useState<ViewTab>("agents");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);

  const handleSaveTeam = async (teamData: Omit<Team, "id" | "createdAt"> | Team) => {
    if ("id" in teamData) {
      await updateTeam(teamData);
    } else {
      await createTeam(teamData);
    }
    setShowEditor(false);
    setEditingTeam(undefined);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {tab === "agents" ? "Agents" : "Teams"}
          </h1>
          <p className="mt-1 text-sm text-[#737373]">
            {tab === "agents"
              ? `${agents.length} agents in your guild`
              : `${teams.length} team${teams.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-1">
          {(["agents", "teams"] as ViewTab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setSelectedAgent(null);
                setSelectedTeam(null);
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium capitalize transition"
              style={{
                background: tab === t ? "#1f1f1f" : "transparent",
                color: tab === t ? "#e5e5e5" : "#525252",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "agents" && (
        <AnimatePresence mode="wait">
          {selectedAgent ? (
            <AgentDetail
              key="detail"
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1f1f1f] px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1f1f1f] bg-[#141414]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke="#525252" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="#525252" strokeWidth="1.5" />
                </svg>
              </div>
              {dataSource === "mock" ? (
                <>
                  <p className="text-sm font-medium text-[#737373]">Running in demo mode</p>
                  <p className="mt-1 max-w-sm text-xs text-[#525252]">
                    Install OpenClaw to connect live agents and see them here.
                  </p>
                  <a
                    href={OPENCLAW_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Install OpenClaw
                  </a>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#737373]">No agents detected yet</p>
                  <p className="mt-1 max-w-sm text-xs text-[#525252]">
                    Start an OpenClaw agent session and it will appear here automatically.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={setSelectedAgent}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {tab === "teams" && (
        <>
          <div className="mb-4">
            <button
              onClick={() => {
                setEditingTeam(undefined);
                setShowEditor(true);
              }}
              className="rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-1.5 text-xs text-[#737373] transition hover:border-[#2a2a2a] hover:text-[#a3a3a3]"
            >
              + New Team
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedTeam ? (
              <TeamDetail
                key="team-detail"
                team={selectedTeam}
                agents={agents}
                onClose={() => setSelectedTeam(null)}
                onEdit={(t) => {
                  setEditingTeam(t);
                  setShowEditor(true);
                }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    agents={agents}
                    onClick={setSelectedTeam}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      {showEditor && (
        <TeamEditor
          team={editingTeam}
          agents={agents}
          onSave={handleSaveTeam}
          onCancel={() => {
            setShowEditor(false);
            setEditingTeam(undefined);
          }}
        />
      )}
    </div>
  );
}
