"use client";

import { useState } from "react";
import { useActions } from "@/lib/data/use-actions";
import { useToasts } from "@/components/toast-provider";
import { ActionButton } from "./action-button";
import { ConfirmDialog } from "./confirm-dialog";
import { ModelSelector } from "./model-selector";
import Link from "next/link";

interface AgentActionsBarProps {
  agentId: string;
  sessionId?: string;
  currentModel?: string;
}

export function AgentActionsBar({ agentId, sessionId, currentModel }: AgentActionsBarProps) {
  const { execute, isExecuting } = useActions();
  const { addToast } = useToasts();
  const [confirmAction, setConfirmAction] = useState<"kill" | "restart" | null>(null);

  const handleAction = async (action: "abort" | "restart") => {
    setConfirmAction(null);
    const result = await execute({ action, agentId, sessionId });
    if (result.success) {
      addToast("success", result.message, `Action completed for ${agentId}`);
    } else {
      addToast("error", "Action failed", result.error || "Unknown error");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label="Kill Session"
          onClick={() => setConfirmAction("kill")}
          variant="danger"
          loading={isExecuting && confirmAction === "kill"}
          disabled={isExecuting}
        />
        <ActionButton
          icon={
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 0 1 11-3.3M14 8a6 6 0 0 1-11 3.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 2v3h-3M3 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label="Restart"
          onClick={() => setConfirmAction("restart")}
          variant="warning"
          loading={isExecuting && confirmAction === "restart"}
          disabled={isExecuting}
        />
        <ModelSelector agentId={agentId} currentModel={currentModel} />
        <Link
          href="/sessions"
          className="flex items-center gap-1.5 rounded-lg border border-[#1f1f1f] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition hover:border-[#2a2a2a] hover:text-white hover:bg-white/[0.04]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 6h12" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          View Sessions
        </Link>
      </div>

      <ConfirmDialog
        isOpen={confirmAction === "kill"}
        title="Kill Session"
        message={`This will abort the current session for ${agentId}. The agent will stop its current work.`}
        onConfirm={() => handleAction("abort")}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        isOpen={confirmAction === "restart"}
        title="Restart Agent"
        message={`This will abort the current session and start a new one for ${agentId}.`}
        onConfirm={() => handleAction("restart")}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}
