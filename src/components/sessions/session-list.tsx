"use client";

import { useState, useMemo } from "react";
import type { SessionListItem } from "@/lib/types";
import SessionListItemComponent from "./session-list-item";

interface SessionListProps {
  sessions: SessionListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function SessionList({
  sessions,
  selectedId,
  onSelect,
}: SessionListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.preview?.toLowerCase().includes(q) ||
        s.model?.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  return (
    <div className="flex h-full flex-col border-r border-[#1f1f1f] bg-[#0c0c0c]">
      <div className="border-b border-[#1f1f1f] px-3 py-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sessions..."
          className="w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#d4d4d4] placeholder:text-[#525252] focus:border-[#DF4F15] focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-[#525252]">
            {search ? "No matching sessions" : "No sessions found"}
          </p>
        ) : (
          filtered.map((session) => (
            <SessionListItemComponent
              key={session.id}
              session={session}
              isSelected={session.id === selectedId}
              onClick={() => onSelect(session.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
