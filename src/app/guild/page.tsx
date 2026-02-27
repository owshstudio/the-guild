"use client";

import { useState } from "react";
import { Agent } from "@/lib/types";
import PixelOfficeCanvas from "@/components/pixel-office/canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function GuildPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Office Canvas — FULL PAGE */}
      <div className="flex-1 relative">
        <PixelOfficeCanvas onAgentClick={setSelectedAgent} />

        {/* Overlay header */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-xl font-bold text-white/80 tracking-wide font-mono">THE GUILD</h1>
          <p className="text-[10px] text-white/30 font-mono mt-0.5">
            CLICK AN AGENT TO INSPECT
          </p>
        </div>

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
          <span className="text-white/15">|</span>
          <span>🐱 LOKI</span>
          <span>🜃 NYX</span>
          <span>☀️ HEMERA</span>
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
              className="fixed right-0 top-0 z-50 h-full w-96 border-l border-[#1f1f1f] bg-[#0c0c0c] p-6 shadow-2xl"
            >
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

              {/* Last Activity */}
              <div className="mt-6">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[#525252]">
                  Last Activity
                </h3>
                <p className="mt-2 text-sm text-[#737373]">
                  {selectedAgent.lastActivity}
                </p>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
