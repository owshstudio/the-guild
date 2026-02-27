"use client";

import type { TaskChain } from "@/lib/types";
import ChainCard from "./chain-card";

interface ChainListProps {
  chains: TaskChain[];
  tab: "all" | "active" | "templates";
  onSelect: (chain: TaskChain) => void;
}

export default function ChainList({ chains, tab, onSelect }: ChainListProps) {
  const filtered =
    tab === "all"
      ? chains.filter((c) => !c.isTemplate)
      : tab === "active"
        ? chains.filter((c) => c.status === "active")
        : chains.filter((c) => c.isTemplate);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-3xl text-[#525252]">
          {tab === "templates" ? "T" : "~"}
        </div>
        <p className="text-sm text-[#737373]">
          {tab === "templates"
            ? "No chain templates yet"
            : tab === "active"
              ? "No active chains"
              : "No chains created yet"}
        </p>
        <p className="mt-1 text-xs text-[#525252]">
          Create a new chain to automate multi-step workflows
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((chain) => (
        <ChainCard key={chain.id} chain={chain} onClick={() => onSelect(chain)} />
      ))}
    </div>
  );
}
