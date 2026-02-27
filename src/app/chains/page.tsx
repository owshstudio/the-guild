"use client";

import { useState } from "react";
import type { TaskChain } from "@/lib/types";
import { useChains } from "@/lib/data/use-chains";
import ChainList from "@/components/chains/chain-list";
import ChainDetail from "@/components/chains/chain-detail";
import ChainTemplates from "@/components/chains/chain-templates";

type Tab = "all" | "active" | "templates";

const TABS: { label: string; value: Tab }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Templates", value: "templates" },
];

export default function ChainsPage() {
  const {
    chains,
    activeChains,
    isLive,
    isLoading,
    createChain,
    updateChain,
    deleteChain,
    pauseChain,
    resumeChain,
  } = useChains();

  const [tab, setTab] = useState<Tab>("all");
  const [selectedChain, setSelectedChain] = useState<TaskChain | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  function handleNewChain(chain: TaskChain) {
    createChain(chain);
    setShowTemplates(false);
    setSelectedChain(chain);
  }

  function handleDelete(id: string) {
    deleteChain(id);
    if (selectedChain?.id === id) setSelectedChain(null);
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Task Chains</h1>
          <span className="rounded-full bg-[#1f1f1f] px-2.5 py-0.5 text-xs font-medium text-[#737373]">
            {chains.length}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-[#22c55e]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#22c55e]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => setShowTemplates(true)}
          className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          New Chain
        </button>
      </div>

      <p className="mb-6 text-sm text-[#737373]">
        Automate multi-step workflows with chained triggers and actions
      </p>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
            style={{
              borderColor: tab === t.value ? "#e5e5e5" + "40" : "#1f1f1f",
              backgroundColor: tab === t.value ? "#e5e5e5" + "10" : "transparent",
              color: tab === t.value ? "#e5e5e5" : "#737373",
            }}
          >
            {t.label}
            {t.value === "active" && activeChains.length > 0 && (
              <span className="ml-1.5 rounded-full bg-[#22c55e]/20 px-1.5 text-[10px] text-[#22c55e]">
                {activeChains.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#7c3aed]" />
        </div>
      ) : selectedChain ? (
        <ChainDetail
          chain={
            chains.find((c) => c.id === selectedChain.id) || selectedChain
          }
          onUpdate={updateChain}
          onDelete={handleDelete}
          onPause={pauseChain}
          onResume={resumeChain}
          onClose={() => setSelectedChain(null)}
        />
      ) : (
        <ChainList
          chains={chains}
          tab={tab}
          onSelect={setSelectedChain}
        />
      )}

      {/* Template picker modal */}
      {showTemplates && (
        <ChainTemplates onSelect={handleNewChain} />
      )}
    </div>
  );
}
