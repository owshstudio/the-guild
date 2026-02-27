"use client";

import { useState } from "react";
import { useActions } from "@/lib/data/use-actions";
import { useToasts } from "@/components/toast-provider";

const MODELS = [
  "claude-opus-4-6",
  "claude-sonnet-4-5",
  "gpt-4o",
  "gpt-4o-mini",
];

interface ModelSelectorProps {
  agentId: string;
  currentModel?: string;
}

export function ModelSelector({ agentId, currentModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { execute, isExecuting } = useActions();
  const { addToast } = useToasts();

  const handleSelect = async (model: string) => {
    setIsOpen(false);
    const result = await execute({
      action: "change-model",
      agentId,
      payload: { model },
    });
    if (result.success) {
      addToast("success", "Model changed", result.message);
    } else {
      addToast("error", "Failed", result.error || "Could not change model");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExecuting}
        className="flex items-center gap-1.5 rounded-lg border border-[#1f1f1f] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition hover:border-[#2a2a2a] hover:text-white hover:bg-white/[0.04] disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 3v10M5 6l3-3 3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Model
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#2a2a2a] bg-[#141414] py-1 shadow-xl">
            {MODELS.map((model) => (
              <button
                key={model}
                onClick={() => handleSelect(model)}
                className={`w-full px-3 py-2 text-left text-xs font-mono transition hover:bg-white/[0.04] ${
                  model === currentModel
                    ? "text-[#DF4F15]"
                    : "text-[#a3a3a3]"
                }`}
              >
                {model}
                {model === currentModel && (
                  <span className="ml-2 text-[10px] text-[#525252]">(current)</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
