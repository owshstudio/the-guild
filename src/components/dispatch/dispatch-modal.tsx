"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents } from "@/lib/data/use-agents";
import { useToasts } from "@/components/toast-provider";
import { AgentSelector } from "./agent-selector";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAgentId: string | null;
}

export function DispatchModal({ isOpen, onClose, targetAgentId }: DispatchModalProps) {
  const { agents } = useAgents();
  const { addToast } = useToasts();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(targetAgentId || agents[0]?.id || "main");
  const [message, setMessage] = useState("");
  const [isNewSession, setIsNewSession] = useState(true);
  const [isDispatching, setIsDispatching] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (targetAgentId) setSelectedAgentId(targetAgentId);
  }, [targetAgentId]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setIsDispatching(true);
    try {
      const res = await fetch("/api/gateway/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId,
          message: message.trim(),
          sessionId: isNewSession ? undefined : "active",
        }),
      });
      const json = await res.json();
      if (json.data?.success) {
        addToast("success", "Task dispatched", `Sent to ${selectedAgentId.toUpperCase()}`);
        setMessage("");
        onClose();
      } else {
        addToast("error", "Dispatch failed", json.data?.error || "Unknown error");
      }
    } catch {
      addToast("error", "Dispatch failed", "Could not reach gateway");
    }
    setIsDispatching(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-1/3 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Dispatch Task</h2>
              <span className="text-xs text-[#525252] font-mono">Cmd+K</span>
            </div>

            <AgentSelector
              agents={agents}
              selectedId={selectedAgentId}
              onSelect={setSelectedAgentId}
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setIsNewSession(true)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isNewSession
                    ? "bg-white/10 text-white"
                    : "text-[#737373] hover:text-[#a3a3a3]"
                }`}
              >
                New Session
              </button>
              <button
                onClick={() => setIsNewSession(false)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  !isNewSession
                    ? "bg-white/10 text-white"
                    : "text-[#737373] hover:text-[#a3a3a3]"
                }`}
              >
                Active Session
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
              placeholder="What should the agent do?"
              className="mt-4 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3 text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none resize-none"
              rows={4}
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#525252]">Cmd+Enter to send</span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isDispatching || !message.trim()}
                  className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {isDispatching ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
