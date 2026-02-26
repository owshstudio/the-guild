"use client";

import { useState } from "react";
import { agents } from "@/lib/mock-data";
import { Agent } from "@/lib/types";
import AgentCard from "@/components/agents/agent-card";
import AgentDetail from "@/components/agents/agent-detail";
import { AnimatePresence } from "framer-motion";

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Agents</h1>
        <p className="mt-1 text-sm text-[#737373]">
          {agents.length} agents in your guild
        </p>
      </div>

      <AnimatePresence mode="wait">
        {selectedAgent ? (
          <AgentDetail
            key="detail"
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
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
    </div>
  );
}
