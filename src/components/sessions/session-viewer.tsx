"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SessionDetail } from "@/lib/types";
import SessionHeader from "./session-header";
import MessageBubble from "./message-bubble";
import ToolCallBlock from "./tool-call-block";

interface SessionViewerProps {
  session: SessionDetail;
  isLive: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function SessionViewer({
  session,
  isLive,
  hasMore,
  onLoadMore,
}: SessionViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (session.messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = session.messages.length;
  }, [session.messages.length]);

  // Load older messages on scroll up
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore || isLoadingMore) return;
    if (scrollRef.current.scrollTop <= 5) {
      setIsLoadingMore(true);
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Reset loading state when messages change (load completed)
  useEffect(() => {
    setIsLoadingMore(false); // eslint-disable-line react-hooks/set-state-in-effect -- reset after data arrives
  }, [session.messages.length]);

  return (
    <div className="flex h-full flex-col">
      <SessionHeader session={session} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        {hasMore && (
          <button
            onClick={() => {
              setIsLoadingMore(true);
              onLoadMore();
            }}
            disabled={isLoadingMore}
            className="mb-4 w-full rounded-lg border border-[#1f1f1f] bg-[#0e0e0e] py-2 text-xs text-[#525252] transition-colors hover:bg-[#141414] hover:text-[#737373] disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load older messages"}
          </button>
        )}

        <AnimatePresence initial={false}>
          {session.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageBubble message={msg} />
              {msg.toolCalls?.map((tc, i) => (
                <div
                  key={`${msg.id}-tool-${i}`}
                  className="ml-4"
                >
                  <ToolCallBlock toolCall={tc} />
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLive && (
          <div className="flex items-center gap-2 py-3 text-xs text-[#525252]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Session is live — auto-refreshing
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
