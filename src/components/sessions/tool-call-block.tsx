"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolCall } from "@/lib/types";

interface ToolCallBlockProps {
  toolCall: ToolCall;
}

export default function ToolCallBlock({ toolCall }: ToolCallBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-1 rounded-lg border border-[#1f1f1f] bg-[#0e0e0e]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-[#141414]"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`text-[#525252] transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <span className="font-mono text-xs font-medium text-[#a3a3a3]">
          {toolCall.name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#1f1f1f] px-3 py-2">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                Input
              </p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[#0a0a0a] p-2 font-mono text-[11px] text-[#737373]">
                {toolCall.input}
              </pre>
              {toolCall.output && (
                <>
                  <p className="mb-1 mt-2 text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                    Output
                  </p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-[#0a0a0a] p-2 font-mono text-[11px] text-[#737373]">
                    {toolCall.output}
                  </pre>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
