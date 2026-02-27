"use client";

import type { WebhookConfig } from "@/lib/types";

const EVENT_COLORS: Record<string, string> = {
  "session.start": "#22c55e",
  "session.end": "#3b82f6",
  "session.error": "#ef4444",
  "task.complete": "#a855f7",
  "cron.run": "#eab308",
};

interface WebhookListProps {
  webhooks: WebhookConfig[];
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onToggle: (webhook: WebhookConfig) => void;
  testingId: string | null;
}

export function WebhookList({
  webhooks,
  onEdit,
  onDelete,
  onTest,
  onToggle,
  testingId,
}: WebhookListProps) {
  if (webhooks.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-8 text-center">
        <p className="text-sm text-[#737373]">
          No webhooks configured. Add one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {webhooks.map((webhook) => (
        <div
          key={webhook.id}
          className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-4 transition-colors hover:border-[#2a2a2a]"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{webhook.name}</h3>
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    webhook.enabled ? "bg-[#22c55e]" : "bg-[#525252]"
                  }`}
                />
              </div>
              <p className="mt-1 truncate font-mono text-xs text-[#737373]">
                {webhook.url.length > 40
                  ? webhook.url.slice(0, 40) + "..."
                  : webhook.url}
              </p>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={() => onToggle(webhook)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  webhook.enabled ? "bg-[#22c55e]" : "bg-[#2a2a2a]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    webhook.enabled ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {webhook.events.map((event) => (
              <span
                key={event}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: (EVENT_COLORS[event] || "#737373") + "20",
                  color: EVENT_COLORS[event] || "#737373",
                }}
              >
                {event}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onTest(webhook.id)}
              disabled={testingId === webhook.id}
              className="rounded-md bg-[#1f1f1f] px-3 py-1 text-xs font-medium text-[#a3a3a3] transition hover:bg-[#2a2a2a] hover:text-white disabled:opacity-50"
            >
              {testingId === webhook.id ? "Testing..." : "Test"}
            </button>
            <button
              onClick={() => onEdit(webhook)}
              className="rounded-md bg-[#1f1f1f] px-3 py-1 text-xs font-medium text-[#a3a3a3] transition hover:bg-[#2a2a2a] hover:text-white"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(webhook.id)}
              className="rounded-md bg-[#1f1f1f] px-3 py-1 text-xs font-medium text-[#ef4444]/70 transition hover:bg-[#2a2a2a] hover:text-[#ef4444]"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
