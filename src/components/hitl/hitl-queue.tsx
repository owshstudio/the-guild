"use client";

import { AnimatePresence } from "framer-motion";
import type { HITLItem, HITLPriority, HITLStatus } from "@/lib/types";
import { HITLItemCard } from "./hitl-item";

const PRIORITY_ORDER: Record<HITLPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

interface HITLQueueProps {
  items: HITLItem[];
  filter: HITLPriority | "all";
  onRespond: (id: string, response: string, status: HITLStatus) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

export function HITLQueue({ items, filter, onRespond, onDismiss }: HITLQueueProps) {
  const filtered =
    filter === "all" ? items : items.filter((i) => i.priority === filter);

  const sorted = [...filtered].sort((a, b) => {
    // Pending items first
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    // Then by priority
    const pa = PRIORITY_ORDER[a.priority] ?? 3;
    const pb = PRIORITY_ORDER[b.priority] ?? 3;
    if (pa !== pb) return pa - pb;
    // Then by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#1f1f1f] bg-[#141414] py-16">
        <div className="text-3xl">--</div>
        <p className="mt-3 text-sm text-[#737373]">
          {filter === "all"
            ? "No items in queue"
            : `No ${filter} priority items`}
        </p>
        <p className="mt-1 text-xs text-[#525252]">
          Items will appear here when agents need your input
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {sorted.map((item) => (
          <HITLItemCard
            key={item.id}
            item={item}
            onRespond={onRespond}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
