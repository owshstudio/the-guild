"use client";

import { useAgents } from "@/lib/data/use-agents";

export default function SkillsPage() {
  const { agents, isLoading } = useAgents();

  return (
    <div className="min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Skills</h1>
        <p className="mt-1 text-sm text-[#737373]">
          Agent capabilities and tool configurations
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1f1f1f] border-t-[#DF4F15]" />
        </div>
      ) : agents.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-3xl">🛠️</p>
            <p className="mt-3 text-sm text-[#525252]">
              No agents found — start OpenClaw to see agent skills here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] p-6"
            >
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: agent.color + "20" }}
                >
                  {agent.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {agent.name}
                  </h2>
                  <p className="text-xs text-[#737373]">{agent.role}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        agent.status === "active"
                          ? "#22c55e"
                          : agent.status === "idle"
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  />
                  <span className="text-xs capitalize text-[#737373]">
                    {agent.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {agent.skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2.5 rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2.5 transition hover:border-[#2a2a2a] hover:bg-[#1a1a1a]"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: agent.accentColor }}
                    />
                    <span className="text-sm text-[#d4d4d4]">{skill}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-[#525252]">
                {agent.skills.length} skills configured
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
