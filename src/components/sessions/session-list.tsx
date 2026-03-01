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
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#141414]">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="#525252" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            {search ? (
              <p className="text-xs text-[#525252]">No matching sessions</p>
            ) : (
              <>
                <p className="text-sm font-medium text-[#737373]">No sessions yet</p>
                <p className="mt-1 text-xs text-[#525252]">
                  Sessions will appear here when your agents start working.
                </p>
              </>
            )}
          </div>
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
