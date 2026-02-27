"use client";

import type { WebhookDeliveryLog as DeliveryLogEntry } from "@/lib/types";

interface WebhookDeliveryLogProps {
  entries: DeliveryLogEntry[];
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WebhookDeliveryLogTable({ entries }: WebhookDeliveryLogProps) {
  const recent = entries.slice(-10).reverse();

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-[#1f1f1f] bg-[#141414] p-6 text-center">
        <p className="text-sm text-[#737373]">No delivery attempts yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#141414]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#1f1f1f] text-xs text-[#525252]">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Result</th>
            <th className="px-4 py-3 font-medium">Error</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-[#1f1f1f] last:border-0"
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#737373]">
                {formatRelativeTime(entry.timestamp)}
              </td>
              <td className="px-4 py-3 text-xs text-[#a3a3a3]">
                {entry.event}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-xs font-medium ${
                    entry.statusCode >= 200 && entry.statusCode < 300
                      ? "bg-[#22c55e]/10 text-[#22c55e]"
                      : "bg-[#ef4444]/10 text-[#ef4444]"
                  }`}
                >
                  {entry.statusCode || "---"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    entry.success ? "bg-[#22c55e]" : "bg-[#ef4444]"
                  }`}
                />
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-xs text-[#525252]">
                {entry.error || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
