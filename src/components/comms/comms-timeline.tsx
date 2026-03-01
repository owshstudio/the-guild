"use client";

import { motion } from "framer-motion";
import type { CommMessage } from "@/lib/types";
import CommsMessage, { type AgentMeta } from "./comms-message";

export default function CommsTimeline({
  messages,
  agentMeta,
}: {
  messages: CommMessage[];
  agentMeta?: AgentMeta;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-[#525252]">No communications found</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1100px]">
      {/* Center line */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#1f1f1f]" />

      <div className="flex flex-col gap-6 py-4">
        {messages.map((msg, i) => {
          // Alternate based on index: even = left, odd = right
          const align = i % 2 === 0 ? "left" : "right";

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.5), duration: 0.35 }}
              className="relative flex items-start"
            >
              {/* Dot on the center line */}
              <div
                className="absolute left-1/2 top-5 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#0a0a0a]"
                style={{
                  backgroundColor:
                    i % 2 === 0 ? "#7c3aed" : "#d97706",
                }}
              />

              {/* Message */}
              <div
                className={`w-1/2 ${
                  align === "left" ? "pr-8" : "ml-auto pl-8"
                }`}
              >
                <CommsMessage message={msg} align={align} agentMeta={agentMeta} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
