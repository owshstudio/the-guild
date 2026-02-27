"use client";

import { motion } from "framer-motion";
import type { SessionListItem } from "@/lib/types";

interface SessionListItemProps {
  session: SessionListItem;
  isSelected: boolean;
  onClick: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function SessionListItemComponent({
  session,
  isSelected,
  onClick,
}: SessionListItemProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
        isSelected
          ? "border-[#2a2a2a] bg-[#1a1a1a]"
          : "border-transparent hover:bg-[#141414]"
      }`}
    >
      <div className="flex items-center gap-2">
        {session.isActive && (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
          </span>
        )}
        <span className="truncate font-mono text-xs text-[#d4d4d4]">
          {session.id.slice(0, 12)}...
        </span>
      </div>

      {session.preview && (
        <p className="mt-1.5 truncate text-xs text-[#737373]">
          {session.preview}
        </p>
      )}

      <div className="mt-2 flex items-center gap-3 text-[10px] text-[#525252]">
        {session.duration !== undefined && session.duration !== null && (
          <span>{formatDuration(session.duration)}</span>
        )}
        {session.messageCount !== undefined && (
          <span>{session.messageCount} msgs</span>
        )}
        {session.model && (
          <span className="truncate font-mono">{session.model}</span>
        )}
      </div>
    </motion.button>
  );
}
