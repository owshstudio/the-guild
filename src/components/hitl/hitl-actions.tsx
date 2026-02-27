"use client";

import { useState } from "react";
import type { HITLItem, HITLStatus } from "@/lib/types";

interface HITLActionsProps {
  item: HITLItem;
  onRespond: (id: string, response: string, status: HITLStatus) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}

export function HITLActions({ item, onRespond, onDismiss }: HITLActionsProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (item.status !== "pending") {
    return (
      <div className="flex items-center gap-2 pt-2 text-xs text-[#737373]">
        <span className="capitalize">{item.status}</span>
        {item.respondedAt && (
          <span>
            {" "}
            &middot; {new Date(item.respondedAt).toLocaleString()}
          </span>
        )}
      </div>
    );
  }

  const handleAction = async (status: HITLStatus, response?: string) => {
    setLoadingAction(status);
    try {
      await onRespond(item.id, response || "", status);
    } finally {
      setLoadingAction(null);
      setIsResponding(false);
      setResponseText("");
    }
  };

  const handleDismiss = async () => {
    setLoadingAction("dismiss");
    try {
      await onDismiss(item.id);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-2 pt-3">
      {isResponding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 text-sm text-[#e5e5e5] placeholder-[#525252] outline-none focus:border-[#3b82f6]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && responseText.trim()) {
                handleAction("responded", responseText.trim());
              }
            }}
            autoFocus
          />
          <button
            onClick={() => handleAction("responded", responseText.trim())}
            disabled={!responseText.trim() || loadingAction === "responded"}
            className="rounded-lg bg-[#3b82f6] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#2563eb] disabled:opacity-50"
          >
            {loadingAction === "responded" ? "..." : "Send"}
          </button>
          <button
            onClick={() => {
              setIsResponding(false);
              setResponseText("");
            }}
            className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#737373] transition hover:border-[#3a3a3a]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("approved")}
            disabled={loadingAction !== null}
            className="rounded-lg bg-[#22c55e]/15 px-3 py-1.5 text-xs font-medium text-[#22c55e] transition hover:bg-[#22c55e]/25 disabled:opacity-50"
          >
            {loadingAction === "approved" ? "..." : "Approve"}
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={loadingAction !== null}
            className="rounded-lg bg-[#ef4444]/15 px-3 py-1.5 text-xs font-medium text-[#ef4444] transition hover:bg-[#ef4444]/25 disabled:opacity-50"
          >
            {loadingAction === "rejected" ? "..." : "Reject"}
          </button>
          <button
            onClick={() => setIsResponding(true)}
            disabled={loadingAction !== null}
            className="rounded-lg bg-[#3b82f6]/15 px-3 py-1.5 text-xs font-medium text-[#3b82f6] transition hover:bg-[#3b82f6]/25 disabled:opacity-50"
          >
            Respond
          </button>
          <button
            onClick={handleDismiss}
            disabled={loadingAction !== null}
            className="ml-auto rounded-lg px-3 py-1.5 text-xs text-[#525252] transition hover:text-[#737373] disabled:opacity-50"
          >
            {loadingAction === "dismiss" ? "..." : "Dismiss"}
          </button>
        </div>
      )}
    </div>
  );
}
