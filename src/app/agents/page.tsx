"use client";

import { useState } from "react";
import { useGateway } from "@/components/gateway-provider";
import { Agent } from "@/lib/types";
import AgentCard from "@/components/agents/agent-card";
import AgentDetail from "@/components/agents/agent-detail";
import { AnimatePresence } from "framer-motion";

export default function AgentsPage() {
  const { agents, isConnected } = useGateway();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Agents</h1>
          <p className="mt-1 text-sm text-[#737373]">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} in your guild
            {isConnected && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#22c55e]/70">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Live
              </span>
            )}
          </p>
        </div>
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
