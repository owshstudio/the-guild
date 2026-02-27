import type { ActivityEntry } from "@/lib/types";
import { listAgentDirs, readIdentity } from "./filesystem";
import { getRecentSessions } from "./session-parser";

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
}

export async function buildActivity(limit = 50): Promise<ActivityEntry[]> {
  const agentDirs = await listAgentDirs();
  const entries: ActivityEntry[] = [];
  let idCounter = 0;

  for (const agentId of agentDirs) {
    const info = await getAgentInfo(agentId);
    const sessions = await getRecentSessions(3, agentId);

    for (const session of sessions) {
      for (const msg of session.messages) {
        if (entries.length >= limit) break;

        if (msg.role === "assistant" && msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tool of msg.toolCalls) {
            entries.push({
              id: `live-${idCounter++}`,
              agentId: info.id,
              agentName: info.name,
              agentEmoji: info.emoji,
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
            agentId: info.id,
            agentName: info.name,
            agentEmoji: info.emoji,
            action: isError ? "Error detected" : summarizeAction(content),
            detail: content.slice(0, 150),
            timestamp: msg.timestamp || session.startTime || new Date().toISOString(),
            type: isError ? "error" : "task",
          });
        } else if (msg.role === "system") {
          entries.push({
            id: `live-${idCounter++}`,
            agentId: info.id,
            agentName: info.name,
            agentEmoji: info.emoji,
            action: "System event",
            detail: msg.content.slice(0, 150),
            timestamp: msg.timestamp || session.startTime || new Date().toISOString(),
            type: "system",
          });
        }
      }
    }
  }

  entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return entries.slice(0, limit);
}

async function getAgentInfo(agentId: string): Promise<AgentInfo> {
  const subpath = agentId === "main" ? undefined : agentId;
  const identity = await readIdentity(subpath);
  return {
    id: agentId,
    name: identity?.name || titleCase(agentId),
    emoji: identity?.emoji || "\u{1F916}",
  };
}

function titleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
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
