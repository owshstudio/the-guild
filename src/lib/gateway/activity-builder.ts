import type { ActivityEntry } from "@/lib/types";
import { getRecentSessions } from "./session-parser";

export async function buildActivity(limit = 50): Promise<ActivityEntry[]> {
  const sessions = await getRecentSessions(3);
  const entries: ActivityEntry[] = [];
  let idCounter = 0;

  for (const session of sessions) {
    for (const msg of session.messages) {
      if (entries.length >= limit) break;

      if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
        for (const tool of msg.toolCalls) {
          entries.push({
            id: `live-${idCounter++}`,
            agentId: "nyx",
            agentName: "NYX",
            agentEmoji: "\u{1F703}",
            action: `Used ${tool.name}`,
            detail: tool.input.slice(0, 150),
            timestamp: msg.timestamp || session.startTime || new Date().toISOString(),
            type: "task",
          });
          if (entries.length >= limit) break;
        }
      } else if (msg.role === "assistant" && msg.content) {
        const content = msg.content.slice(0, 200);
        const isError =
          content.toLowerCase().includes("error") ||
          content.toLowerCase().includes("failed") ||
          content.toLowerCase().includes("exception");

        entries.push({
          id: `live-${idCounter++}`,
          agentId: "nyx",
          agentName: "NYX",
          agentEmoji: "\u{1F703}",
          action: isError ? "Error detected" : summarizeAction(content),
          detail: content.slice(0, 150),
          timestamp: msg.timestamp || session.startTime || new Date().toISOString(),
          type: isError ? "error" : "task",
        });
      } else if (msg.role === "system") {
        entries.push({
          id: `live-${idCounter++}`,
          agentId: "nyx",
          agentName: "NYX",
          agentEmoji: "\u{1F703}",
          action: "System event",
          detail: msg.content.slice(0, 150),
          timestamp: msg.timestamp || session.startTime || new Date().toISOString(),
          type: "system",
        });
      }
    }
  }

  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return entries.slice(0, limit);
}

function summarizeAction(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes("built") || lower.includes("created") || lower.includes("generated"))
    return "Built something";
  if (lower.includes("sent") || lower.includes("message") || lower.includes("outreach"))
    return "Sent messages";
  if (lower.includes("deployed") || lower.includes("pushed"))
    return "Deployed";
  if (lower.includes("search") || lower.includes("looked up"))
    return "Searched";
  if (lower.includes("file") || lower.includes("wrote") || lower.includes("edited"))
    return "Edited files";
  return "Processed request";
}
