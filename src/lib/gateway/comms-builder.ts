import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import type { CommChannel, CommDirection, CommMessage } from "@/lib/types";
import { getConfig } from "./config";
import { listAgentDirs, readIdentity } from "./filesystem";

interface AgentInfo {
  name: string;
  emoji: string;
  color: string;
}

async function getAgentMeta(): Promise<Record<string, AgentInfo>> {
  const meta: Record<string, AgentInfo> = {
    noah: { name: "NOAH", emoji: "\u{1F468}\u200D\u{1F4BB}", color: "#3b82f6" },
  };

  try {
    const dirs = await listAgentDirs();
    for (const agentId of dirs) {
      let name = agentId.toUpperCase();
      let emoji = "\u{1F916}";
      try {
        const identity = await readIdentity(agentId === "main" ? undefined : agentId);
        if (identity) {
          if (identity.name) name = identity.name;
          if (identity.emoji) emoji = identity.emoji;
        }
      } catch { /* use defaults */ }
      meta[agentId] = { name, emoji, color: "#7c3aed" };
    }
  } catch { /* no agents */ }

  return meta;
}

function resolveDirection(from: string, to: string): CommDirection {
  return `${from}-to-${to}`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

interface BuildCommsOptions {
  from?: string;
  to?: string;
  limit?: number;
  after?: string;
}

export async function buildComms(options?: BuildCommsOptions): Promise<CommMessage[]> {
  const messages: CommMessage[] = [];
  let idCounter = 0;

  try {
    const config = await getConfig();
    const agentDirs = await listAgentDirs();
    const agentMeta = await getAgentMeta();

    // 1. Scan session files for cross-agent mentions
    for (const agentId of agentDirs) {
      await scanAgentSessions(config.agentsPath, agentId, agentDirs, agentMeta, messages, idCounter);
      idCounter = messages.length;
    }

    // 2. Check delivery queue
    const deliveryQueuePath = path.join(
      path.dirname(config.agentsPath),
      "delivery-queue"
    );
    await scanDeliveryQueue(deliveryQueuePath, messages, idCounter);
    idCounter = messages.length;

    // 3. Check workspace alert files for all agents
    for (const agentId of agentDirs) {
      await scanAlertFiles(config.workspacePath, agentId, messages, idCounter);
      idCounter = messages.length;
    }
  } catch {
    // Directories may not exist — fall through to mock
  }

  // Apply filters
  let filtered = messages;

  if (options?.from) {
    filtered = filtered.filter((m) => m.fromAgentId === options.from);
  }
  if (options?.to) {
    filtered = filtered.filter((m) => m.toAgentId === options.to);
  }
  if (options?.after) {
    const afterTime = new Date(options.after).getTime();
    filtered = filtered.filter(
      (m) => new Date(m.timestamp).getTime() > afterTime
    );
  }

  // Sort by timestamp descending
  filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const limit = options?.limit ?? 50;
  return filtered.slice(0, limit);
}

async function scanAgentSessions(
  agentsPath: string,
  agentId: string,
  allAgentIds: string[],
  agentMeta: Record<string, AgentInfo>,
  messages: CommMessage[],
  startId: number
): Promise<void> {
  let idCounter = startId;

  try {
    const sessionsDir = path.join(agentsPath, agentId, "sessions");
    const dirStat = await stat(sessionsDir);
    if (!dirStat.isDirectory()) return;

    const files = await readdir(sessionsDir);
    const jsonlFiles = files
      .filter((f) => f.endsWith(".jsonl") && !f.includes(".deleted"))
      .slice(0, 5); // Only scan recent sessions

    for (const file of jsonlFiles) {
      try {
        const filepath = path.join(sessionsDir, file);
        const sessionId = file.replace(".jsonl", "");
        const raw = await readFile(filepath, "utf-8");
        const lines = raw.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type !== "message" || !entry.message) continue;

            const content =
              typeof entry.message.content === "string"
                ? entry.message.content
                : Array.isArray(entry.message.content)
                ? entry.message.content
                    .filter((b: { type: string }) => b.type === "text")
                    .map((b: { text?: string }) => b.text || "")
                    .join(" ")
                : "";

            if (!content) continue;

            // Check for mentions of other agents or noah
            const contentLower = content.toLowerCase();
            const targets = [...allAgentIds.filter((id) => id !== agentId), "noah"];
            for (const targetAgent of targets) {
              const targetName = agentMeta[targetAgent]?.name?.toLowerCase() || targetAgent;
              if (
                contentLower.includes(targetAgent) ||
                contentLower.includes(targetName)
              ) {
                messages.push({
                  id: `comm-session-${idCounter++}`,
                  timestamp:
                    entry.timestamp || new Date().toISOString(),
                  fromAgentId: agentId,
                  toAgentId: targetAgent,
                  channel: "session",
                  direction: resolveDirection(agentId, targetAgent),
                  content: content.slice(0, 500),
                  contentPreview: truncate(content, 200),
                  sessionId,
                  deliveryStatus: "delivered",
                });
                break; // One message per line
              }
            }
          } catch {
            // Skip malformed lines
          }
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Sessions directory doesn't exist
  }
}

async function scanDeliveryQueue(
  queuePath: string,
  messages: CommMessage[],
  startId: number
): Promise<void> {
  let idCounter = startId;

  try {
    const dirStat = await stat(queuePath);
    if (!dirStat.isDirectory()) return;

    const files = await readdir(queuePath);
    for (const file of files) {
      try {
        const filepath = path.join(queuePath, file);
        const raw = await readFile(filepath, "utf-8");
        const entry = JSON.parse(raw);

        const from = entry.from || "main";
        const to = entry.to || "noah";

        messages.push({
          id: `comm-queue-${idCounter++}`,
          timestamp: entry.timestamp || entry.createdAt || new Date().toISOString(),
          fromAgentId: from,
          toAgentId: to,
          channel: "delivery-queue",
          direction: resolveDirection(from, to),
          content: entry.message || entry.content || "",
          contentPreview: truncate(
            entry.message || entry.content || "",
            200
          ),
          deliveryStatus: entry.status || "pending",
        });
      } catch {
        // Skip malformed queue entries
      }
    }
  } catch {
    // Delivery queue doesn't exist
  }
}

async function scanAlertFiles(
  workspacePath: string,
  agentId: string,
  messages: CommMessage[],
  startId: number
): Promise<void> {
  let idCounter = startId;

  try {
    const agentDir = path.join(workspacePath, agentId);
    const dirStat = await stat(agentDir);
    if (!dirStat.isDirectory()) return;

    const files = await readdir(agentDir);
    const alertFiles = files.filter(
      (f) =>
        f.toLowerCase().includes("alert") || f.toLowerCase().includes("status")
    );

    for (const file of alertFiles) {
      try {
        const filepath = path.join(agentDir, file);
        const fileStat = await stat(filepath);
        const raw = await readFile(filepath, "utf-8");

        messages.push({
          id: `comm-alert-${idCounter++}`,
          timestamp: fileStat.mtime.toISOString(),
          fromAgentId: agentId,
          toAgentId: "noah",
          channel: "alert-file",
          direction: resolveDirection(agentId, "noah"),
          content: raw.slice(0, 500),
          contentPreview: truncate(raw, 200),
          deliveryStatus: "delivered",
        });
      } catch {
        // Skip unreadable alert files
      }
    }
  } catch {
    // Agent workspace doesn't exist
  }
}

export function getMockComms(): CommMessage[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
      fromAgentId: "demo",
      toAgentId: "noah",
      channel: "session",
      direction: "demo-to-noah",
      content:
        "Task batch complete. 15 items processed successfully. Awaiting further instructions.",
      contentPreview:
        "Task batch complete. 15 items processed successfully. Awaiting further instructions.",
      sessionId: "demo-session",
      deliveryStatus: "delivered",
    },
  ];
}
