"use client";

import { useState, useMemo } from "react";
import { useComms } from "@/lib/data/use-comms";
import { useAgents } from "@/lib/data/use-agents";
import CommsFilter from "@/components/comms/comms-filter";
import CommsTimeline from "@/components/comms/comms-timeline";
import type { AgentMeta } from "@/components/comms/comms-message";

export default function CommsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [channel, setChannel] = useState("");
  const { agents } = useAgents();

  const { messages, isLive, isLoading } = useComms({
    from: from || undefined,
    to: to || undefined,
    channel: channel || undefined,
  });

  const agentMeta: AgentMeta = useMemo(() => {
    const meta: AgentMeta = {};
    for (const a of agents) {
      meta[a.id] = { name: a.name, emoji: a.emoji, color: a.color };
    }
    return meta;
  }, [agents]);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Communications</h1>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#22c55e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              LIVE
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-[#737373]">
          {isLoading
            ? "Loading communications..."
            : `${messages.length} message${messages.length !== 1 ? "s" : ""} across all channels`}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-[#1f1f1f] bg-[#141414] p-4">
        <CommsFilter
          from={from}
          to={to}
          channel={channel}
          onFromChange={setFrom}
          onToChange={setTo}
          onChannelChange={setChannel}
        />
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1f1f1f] border-t-[#7c3aed]" />
        </div>
      ) : (
        <CommsTimeline messages={messages} agentMeta={agentMeta} />
      )}
    </div>
  );
}
