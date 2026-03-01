"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAgents } from "@/lib/data/use-agents";
import { useChat } from "@/lib/data/use-chat";
import { useSessions } from "@/lib/data/use-sessions";
import MessageBubble from "@/components/sessions/message-bubble";
import ToolCallBlock from "@/components/sessions/tool-call-block";
import { AnimatePresence, motion } from "framer-motion";
import { getModKey } from "@/lib/utils/platform";

export default function ChatPage() {
  const { agents } = useAgents();
  const { sessions } = useSessions();
  const {
    selectedAgentId,
    setSelectedAgentId,
    activeSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    error,
    sendMessage,
    startNewSession,
    loadSession,
  } = useChat();

  const [input, setInput] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevCountRef = useRef(0);

  const copySessionId = useCallback(() => {
    if (!activeSessionId) return;
    navigator.clipboard.writeText(activeSessionId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1500);
    });
  }, [activeSessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    },
    []
  );

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !selectedAgentId || isStreaming) return;
    sendMessage(text);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, selectedAgentId, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const modKey = useMemo(() => getModKey(), []);

  // Show recent sessions sorted by recency (API already returns them sorted)
  const recentSessions = useMemo(() => sessions.slice(0, 8), [sessions]);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Top bar — agent selector */}
      <div className="shrink-0 border-b border-[#1f1f1f] bg-[#0c0c0c]">
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Agent pills — horizontal scroll */}
          <div className="flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-none">
            {agents.map((agent) => (
              <button
                key={agent.id}
                aria-label={agent.name}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  setShowSessions(false);
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedAgentId === agent.id
                    ? "bg-white/[0.12] text-white ring-1 ring-white/[0.15]"
                    : "bg-white/[0.04] text-[#737373] hover:bg-white/[0.08] hover:text-[#a3a3a3]"
                }`}
              >
                <span className="text-sm">{agent.emoji}</span>
                <span className="hidden sm:inline">{agent.name}</span>
              </button>
            ))}
          </div>

          {/* Recent sessions toggle */}
          {selectedAgentId && (
            <button
              onClick={() => setShowSessions(!showSessions)}
              aria-expanded={showSessions}
              className={`shrink-0 rounded-lg p-2 text-[#525252] transition hover:bg-white/[0.05] hover:text-[#a3a3a3] ${
                showSessions ? "bg-white/[0.05] text-[#a3a3a3]" : ""
              }`}
              title="Recent sessions"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 3h12M2 7h8M2 11h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {/* New chat button */}
          <button
            onClick={() => {
              startNewSession();
              setShowSessions(false);
              setInput("");
            }}
            className="shrink-0 rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            New Chat
          </button>
        </div>

        {/* Recent sessions drawer */}
        <AnimatePresence>
          {showSessions && selectedAgentId && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-[#1f1f1f]"
            >
              <div className="max-h-48 overflow-y-auto px-3 py-2">
                {recentSessions.length === 0 ? (
                  <p className="py-3 text-center text-xs text-[#525252]">
                    No recent sessions
                  </p>
                ) : (
                  recentSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        loadSession(s.id);
                        setShowSessions(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.04] ${
                        activeSessionId === s.id
                          ? "bg-white/[0.06]"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-mono text-xs text-[#a3a3a3]">
                          {s.id}
                        </p>
                        <p className="text-[10px] text-[#525252]">
                          {new Date(s.lastModified).toLocaleString()}
                        </p>
                      </div>
                      {s.isActive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        {!selectedAgentId ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-4xl">
                {agents[0]?.emoji || "🏰"}
              </p>
              <h2 className="mt-3 text-lg font-semibold text-white">
                Select an Agent
              </h2>
              <p className="mt-1 text-sm text-[#525252]">
                Choose an agent above to start chatting
              </p>
            </div>
          </div>
        ) : isLoadingSession ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="relative flex h-3 w-3 mx-auto">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DF4F15] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#DF4F15]" />
              </span>
              <p className="mt-3 text-sm text-[#525252]">Loading session...</p>
            </div>
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-4xl">{selectedAgent?.emoji || "🤖"}</p>
              <h2 className="mt-3 text-lg font-semibold text-white">
                Chat with {selectedAgent?.name || "Agent"}
              </h2>
              <p className="mt-1 text-sm text-[#525252]">
                {activeSessionId
                  ? selectedAgent?.role || "Send a message to get started"
                  : "No Guild session found — send a message to start one"}
              </p>
              {activeSessionId && (
                <button
                  onClick={copySessionId}
                  className="mt-2 font-mono text-[10px] text-[#525252] hover:text-[#737373] transition"
                  title="Click to copy full session ID"
                >
                  Session: {activeSessionId.slice(0, 8)}&hellip;
                  {copiedId && <span className="ml-1 text-[#22c55e]">Copied!</span>}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {activeSessionId && (
              <div className="mb-3 flex items-center justify-center">
                <button
                  onClick={copySessionId}
                  className="rounded-full bg-[#141414] px-3 py-1 font-mono text-[10px] text-[#525252] hover:text-[#737373] transition"
                  title="Click to copy full session ID"
                >
                  {activeSessionId.slice(0, 8)}&hellip;
                  {copiedId && <span className="ml-1 text-[#22c55e]">Copied!</span>}
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageBubble message={msg} variant="chat" agentName={selectedAgent?.name} agentEmoji={selectedAgent?.emoji} />
                  {msg.toolCalls?.map((tc, i) => (
                    <div key={`${msg.id}-tool-${i}`} className="ml-4">
                      <ToolCallBlock toolCall={tc} />
                    </div>
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>

            {isStreaming && (
              <div className="flex items-center gap-2 py-3 text-xs text-[#525252]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DF4F15] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#DF4F15]" />
                </span>
                {selectedAgent?.name || "Agent"} is responding...
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 border-t border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-2"
          >
            <p className="text-xs text-[#ef4444]">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="shrink-0 border-t border-[#1f1f1f] bg-[#0c0c0c] px-3 py-3 sm:px-5">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedAgentId
                ? `Message ${selectedAgent?.name || "agent"}... (${modKey}+Enter to send)`
                : "Select an agent first"
            }
            disabled={!selectedAgentId || isStreaming}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3 text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none disabled:opacity-40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !selectedAgentId || isStreaming}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] text-white transition hover:opacity-90 disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
