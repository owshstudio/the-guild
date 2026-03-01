"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Agent, CommandEntry } from "@/lib/types";
import { useAgents } from "@/lib/data/use-agents";
import { useDataSource } from "@/lib/data/data-provider";
import { useDispatchContext } from "@/components/dispatch/dispatch-provider";
import { useActions } from "@/lib/data/use-actions";
import { useToasts } from "@/components/toast-provider";
import { ConfirmDialog } from "@/components/actions/confirm-dialog";
import PixelOfficeCanvas from "@/components/pixel-office/canvas";
import { motion, AnimatePresence } from "framer-motion";
import { OPENCLAW_DOCS_URL } from "@/lib/constants";

const WELCOME_DISMISSED_KEY = "guild-welcome-dismissed";

export default function GuildPage() {
  const { agents } = useAgents();
  const { dataSource } = useDataSource();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { openDispatch } = useDispatchContext();
  const { execute, isExecuting } = useActions();
  const { addToast } = useToasts();
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const activeStreams = useRef<Set<EventSource>>(new Set());

  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(WELCOME_DISMISSED_KEY);
  });

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
  };

  // Clean up all active EventSources on unmount
  useEffect(() => {
    const streams = activeStreams.current;
    return () => {
      streams.forEach((es) => es.close());
      streams.clear();
    };
  }, []);

  const sendCommand = useCallback(
    async (agentId: string, command: string) => {
      const entry: CommandEntry = {
        id: crypto.randomUUID(),
        agentId,
        command,
        timestamp: new Date().toISOString(),
        status: "pending",
      };
      setCommandHistory((prev) => [entry, ...prev]);
      addToast("info", "Command sent", `Sent to ${agentId.toUpperCase()}`);

      try {
        const res = await fetch("/api/gateway/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId, message: command }),
        });
        const { data } = await res.json();

        if (!data?.success || !data.sessionId) {
          setCommandHistory((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? { ...e, status: "error", response: data?.error || "Dispatch failed" }
                : e
            )
          );
          return;
        }

        setCommandHistory((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, response: `Session ${data.sessionId} started...` }
              : e
          )
        );

        const es = new EventSource(`/api/gateway/sessions/${data.sessionId}/stream`);
        activeStreams.current.add(es);

        const closeAndRemove = () => {
          es.close();
          activeStreams.current.delete(es);
        };

        es.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "message" && parsed.message?.role === "assistant") {
              const content = typeof parsed.message.content === "string"
                ? parsed.message.content
                : Array.isArray(parsed.message.content)
                  ? parsed.message.content
                      .filter((b: { type: string }) => b.type === "text")
                      .map((b: { text: string }) => b.text)
                      .join("")
                  : "Done";
              setCommandHistory((prev) =>
                prev.map((e) =>
                  e.id === entry.id
                    ? { ...e, status: "completed", response: content }
                    : e
                )
              );
              closeAndRemove();
            }
          } catch {
            // ignore malformed events
          }
        };

        es.onerror = () => {
          closeAndRemove();
          setCommandHistory((prev) =>
            prev.map((e) =>
              e.id === entry.id && e.status === "pending"
                ? { ...e, status: "error", response: "Stream connection lost" }
                : e
            )
          );
        };
      } catch (err) {
        setCommandHistory((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? { ...e, status: "error", response: err instanceof Error ? err.message : "Unknown error" }
              : e
          )
        );
      }
    },
    [addToast]
  );

  const handleSendCommand = () => {
    if (!commandInput.trim() || !selectedAgent) return;
    sendCommand(selectedAgent.id, commandInput.trim());
    setCommandInput("");
  };

  const agentCommands = commandHistory.filter(
    (c) => c.agentId === selectedAgent?.id
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Office Canvas — FULL PAGE */}
      <div className="flex-1 relative">
        <PixelOfficeCanvas onAgentClick={setSelectedAgent} agents={agents} />

        {/* Overlay header */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-xl font-bold text-white/80 tracking-wide font-mono">THE GUILD</h1>
          <p className="text-[10px] text-white/30 font-mono mt-0.5">
            CLICK AN AGENT TO INSPECT
          </p>
        </div>

        {/* Welcome Overlay */}
        <AnimatePresence>
          {dataSource === "mock" && showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative mx-4 w-full max-w-md rounded-2xl border border-[#1f1f1f] bg-[#0c0c0c] p-6 shadow-2xl"
              >
                {/* Close button */}
                <button
                  onClick={dismissWelcome}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-[#525252] transition hover:bg-white/[0.05] hover:text-[#a3a3a3]"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                <h2 className="text-lg font-semibold text-white">Welcome to The Guild</h2>
                <p className="mt-1.5 text-sm text-[#737373]">
                  You&apos;re viewing demo data. Connect an OpenClaw gateway to see your live agents.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DF4F15] to-[#F9425F] text-xs font-bold text-white">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#e5e5e5]">Install OpenClaw</p>
                      <p className="text-xs text-[#525252]">The agent orchestration gateway</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F9425F] to-[#A326B5] text-xs font-bold text-white">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#e5e5e5]">Start the gateway</p>
                      <code className="mt-1 block rounded-md border border-[#1f1f1f] bg-[#141414] px-2.5 py-1.5 font-mono text-xs text-[#DF4F15]">
                        openclaw gateway start
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A326B5] to-[#DF4F15] text-xs font-bold text-white">
                      3
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[#e5e5e5]">Auto-detects and switches to live</p>
                      <p className="text-xs text-[#525252]">The Guild connects automatically</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={OPENCLAW_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Install OpenClaw
                  </a>
                  <button
                    onClick={dismissWelcome}
                    className="flex-1 rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03]"
                  >
                    Explore Demo
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-5 text-[10px] text-white/30 font-mono bg-black/40 rounded-lg px-3 py-2 backdrop-blur-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#eab308]" />
            IDLE
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
            STOPPED
          </span>
        </div>
      </div>

      {/* Agent slide-out panel */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setSelectedAgent(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-96 border-l border-[#1f1f1f] bg-[#0c0c0c] shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Close */}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-[#525252] transition hover:bg-white/[0.05] hover:text-[#a3a3a3]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {/* Agent info */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ background: selectedAgent.color + "20" }}
                  >
                    {selectedAgent.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selectedAgent.name}
                    </h2>
                    <p className="text-xs text-[#737373]">{selectedAgent.role}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          selectedAgent.status === "active"
                            ? "#22c55e"
                            : selectedAgent.status === "idle"
                            ? "#eab308"
                            : "#ef4444",
                      }}
                    />
                    <span className="text-sm capitalize text-[#d4d4d4]">
                      {selectedAgent.status}
                    </span>
                  </div>
                </div>

                {/* Current Task */}
                {selectedAgent.currentTask && (
                  <div className="mt-6">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                      Current Task
                    </h3>
                    <p className="mt-2 rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2.5 text-sm text-[#d4d4d4]">
                      {selectedAgent.currentTask}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    About
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a3a3a3]">
                    {selectedAgent.description}
                  </p>
                </div>

                {/* Machine */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Machine
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                    <span className="font-mono text-xs text-[#a3a3a3]">
                      {selectedAgent.machine}
                    </span>
                  </div>
                </div>

                {/* Gateway */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Gateway
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedAgent.gateway === "localhost"
                          ? "bg-[#22c55e]"
                          : "bg-[#eab308]"
                      }`}
                    />
                    <span className="font-mono text-xs text-[#a3a3a3]">
                      {selectedAgent.gateway}
                    </span>
                  </div>
                </div>

                {/* Model */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Model
                  </h3>
                  <div className="mt-2 inline-flex items-center rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-1.5">
                    <span className="font-mono text-xs text-[#a3a3a3]">
                      {selectedAgent.model}
                    </span>
                  </div>
                </div>

                {/* Skills preview */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Skills
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedAgent.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-[#1f1f1f] bg-[#141414] px-2 py-1 text-[11px] text-[#a3a3a3]"
                      >
                        {skill}
                      </span>
                    ))}
                    {selectedAgent.skills.length > 4 && (
                      <span className="rounded-md border border-[#1f1f1f] bg-[#141414] px-2 py-1 text-[11px] text-[#525252]">
                        +{selectedAgent.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Command History */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Command History
                  </h3>
                  <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                    {agentCommands.length === 0 ? (
                      <p className="text-xs text-[#525252]">No commands sent yet</p>
                    ) : (
                      agentCommands.slice(0, 10).map((cmd) => (
                        <div
                          key={cmd.id}
                          className="rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cmd.status === "completed"
                                  ? "bg-[#22c55e]"
                                  : cmd.status === "error"
                                  ? "bg-[#ef4444]"
                                  : "bg-[#eab308]"
                              }`}
                            />
                            <span className="font-mono text-xs text-[#e5e5e5] truncate">
                              {cmd.command}
                            </span>
                          </div>
                          {cmd.response && (
                            <p className="mt-1 text-[11px] text-[#737373]">
                              {cmd.response}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Quick Actions
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => sendCommand(selectedAgent.id, "run-task")}
                      className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03]"
                    >
                      Run Task
                    </button>
                    <button
                      onClick={() => sendCommand(selectedAgent.id, "pause")}
                      className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03]"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => sendCommand(selectedAgent.id, "resume")}
                      className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-[#d4d4d4] transition hover:border-[#3a3a3a] hover:bg-white/[0.03]"
                    >
                      Resume
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Actions
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => openDispatch(selectedAgent.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Send Task
                    </button>
                    <button
                      onClick={() => setShowKillConfirm(true)}
                      disabled={isExecuting}
                      className="flex items-center gap-1.5 rounded-lg border border-[#ef4444]/20 px-3 py-1.5 text-xs font-medium text-[#ef4444] transition hover:border-[#ef4444]/40 hover:bg-[#ef4444]/10 disabled:opacity-40"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Kill
                    </button>
                  </div>
                </div>

                {/* Command Input */}
                <div className="mt-6">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                    Command
                  </h3>
                  <div className="mt-2 flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendCommand();
                      }}
                      placeholder="Type a command..."
                      className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 font-mono text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none"
                    />
                    <button
                      onClick={handleSendCommand}
                      disabled={!commandInput.trim()}
                      className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M14 2L7 9M14 2l-5 12-2-5-5-2 12-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                <ConfirmDialog
                  isOpen={showKillConfirm}
                  title="Kill Session"
                  message={`Abort the current session for ${selectedAgent.name}?`}
                  onConfirm={async () => {
                    setShowKillConfirm(false);
                    const result = await execute({ action: "abort", agentId: selectedAgent.id });
                    if (result.success) {
                      addToast("success", "Session killed", result.message);
                    } else {
                      addToast("error", "Failed", result.error || "Could not kill session");
                    }
                  }}
                  onCancel={() => setShowKillConfirm(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
