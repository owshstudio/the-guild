import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import type { CommChannel, CommDirection, CommMessage } from "@/lib/types";
import { getConfig } from "./config";

const AGENT_NAMES = ["nyx", "hemera", "noah"] as const;

const AGENT_META: Record<string, { name: string; emoji: string; color: string }> = {
  nyx: { name: "NYX", emoji: "\u{1F703}", color: "#7c3aed" },
  hemera: { name: "HEMERA", emoji: "\u2600\uFE0F", color: "#d97706" },
  noah: { name: "NOAH", emoji: "\u{1F468}\u200D\u{1F4BB}", color: "#3b82f6" },
};

function resolveDirection(from: string, to: string): CommDirection {
  const key = `${from}-to-${to}`;
  const valid: CommDirection[] = [
    "nyx-to-hemera",
    "hemera-to-nyx",
    "nyx-to-noah",
    "hemera-to-noah",
    "system",
  ];
  return (valid.find((d) => d === key) as CommDirection) || "system";
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

    // 1. Scan session files for cross-agent mentions
    await scanSessions(config.agentsPath, messages, idCounter);
    idCounter = messages.length;

    // 2. Check delivery queue
    const deliveryQueuePath = path.join(
      path.dirname(config.agentsPath),
      "delivery-queue"
    );
    await scanDeliveryQueue(deliveryQueuePath, messages, idCounter);
    idCounter = messages.length;

    // 3. Check workspace alert files
    await scanAlertFiles(config.workspacePath, messages, idCounter);
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

async function scanSessions(
  agentsPath: string,
  messages: CommMessage[],
  startId: number
): Promise<void> {
  let idCounter = startId;

  try {
    const sessionsDir = path.join(agentsPath, "main", "sessions");
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

            // Check for mentions of other agents
            const contentLower = content.toLowerCase();
            for (const targetAgent of AGENT_NAMES) {
              if (
                targetAgent !== "nyx" &&
                contentLower.includes(targetAgent)
              ) {
                messages.push({
                  id: `comm-session-${idCounter++}`,
                  timestamp:
                    entry.timestamp || new Date().toISOString(),
                  fromAgentId: "nyx",
                  toAgentId: targetAgent,
                  channel: "session",
                  direction: resolveDirection("nyx", targetAgent),
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

        messages.push({
          id: `comm-queue-${idCounter++}`,
          timestamp: entry.timestamp || entry.createdAt || new Date().toISOString(),
          fromAgentId: entry.from || "nyx",
          toAgentId: entry.to || "hemera",
          channel: "delivery-queue",
          direction: resolveDirection(entry.from || "nyx", entry.to || "hemera"),
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
  messages: CommMessage[],
  startId: number
): Promise<void> {
  let idCounter = startId;

  try {
    const hemeraDir = path.join(workspacePath, "hemera");
    const dirStat = await stat(hemeraDir);
    if (!dirStat.isDirectory()) return;

    const files = await readdir(hemeraDir);
    const alertFiles = files.filter(
      (f) =>
        f.toLowerCase().includes("alert") || f.toLowerCase().includes("status")
    );

    for (const file of alertFiles) {
      try {
        const filepath = path.join(hemeraDir, file);
        const fileStat = await stat(filepath);
        const raw = await readFile(filepath, "utf-8");

        messages.push({
          id: `comm-alert-${idCounter++}`,
          timestamp: fileStat.mtime.toISOString(),
          fromAgentId: "hemera",
          toAgentId: "nyx",
          channel: "alert-file",
          direction: "hemera-to-nyx",
          content: raw.slice(0, 500),
          contentPreview: truncate(raw, 200),
          deliveryStatus: "delivered",
        });
      } catch {
        // Skip unreadable alert files
      }
    }
  } catch {
    // Hemera workspace doesn't exist
  }
}

export function getMockComms(): CommMessage[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      timestamp: new Date(now - 30 * 60 * 1000).toISOString(),
      fromAgentId: "nyx",
      toAgentId: "hemera",
      channel: "session",
      direction: "nyx-to-hemera",
      content:
        "HEMERA, I've updated the outreach queue with 15 new prospects from the LinkedIn scrape. Priority tier: high. Please begin processing batch 3 when you come online.",
      contentPreview:
        "HEMERA, I've updated the outreach queue with 15 new prospects from the LinkedIn scrape. Priority tier: high. Please begin processing batch 3...",
      sessionId: "abc-123",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-2",
      timestamp: new Date(now - 55 * 60 * 1000).toISOString(),
      fromAgentId: "hemera",
      toAgentId: "nyx",
      channel: "delivery-queue",
      direction: "hemera-to-nyx",
      content:
        "Batch 2 complete. 9/11 messages delivered successfully. 2 failures: account restricted. Attaching delivery report.",
      contentPreview:
        "Batch 2 complete. 9/11 messages delivered successfully. 2 failures: account restricted. Attaching delivery report.",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-3",
      timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      fromAgentId: "nyx",
      toAgentId: "noah",
      channel: "whatsapp-group",
      direction: "nyx-to-noah",
      content:
        "Morning brief: The Guild dashboard is live. HEMERA gateway initialized on LOKI. 3 new client inquiries in the pipeline. Waiting on your go for batch 3 outreach.",
      contentPreview:
        "Morning brief: The Guild dashboard is live. HEMERA gateway initialized on LOKI. 3 new client inquiries in the pipeline...",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-4",
      timestamp: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
      fromAgentId: "hemera",
      toAgentId: "noah",
      channel: "alert-file",
      direction: "hemera-to-noah",
      content:
        "ALERT: Facebook Messenger rate limit approaching. 8/10 daily DM slots used. Recommend pausing outreach until tomorrow or switching to backup account.",
      contentPreview:
        "ALERT: Facebook Messenger rate limit approaching. 8/10 daily DM slots used. Recommend pausing outreach until tomorrow...",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-5",
      timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      fromAgentId: "nyx",
      toAgentId: "hemera",
      channel: "git-sync",
      direction: "nyx-to-hemera",
      content:
        "Pushed updated prospect list to shared repo. 105 entries total. Schema: name, company, FB profile URL, tier, status. Pull when ready.",
      contentPreview:
        "Pushed updated prospect list to shared repo. 105 entries total. Schema: name, company, FB profile URL, tier, status...",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-6",
      timestamp: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      fromAgentId: "hemera",
      toAgentId: "nyx",
      channel: "session",
      direction: "hemera-to-nyx",
      content:
        "Acknowledged. Pulling prospect list now. Will begin batch 2 processing. ETA: 45 minutes for 11 messages with 3-5 min spacing.",
      contentPreview:
        "Acknowledged. Pulling prospect list now. Will begin batch 2 processing. ETA: 45 minutes for 11 messages...",
      sessionId: "def-456",
      deliveryStatus: "delivered",
    },
    {
      id: "mock-7",
      timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
      fromAgentId: "nyx",
      toAgentId: "noah",
      channel: "whatsapp-group",
      direction: "nyx-to-noah",
      content:
        "HEMERA is now online and processing. I'll monitor the delivery queue and flag any issues. Current session cost: $0.42.",
      contentPreview:
        "HEMERA is now online and processing. I'll monitor the delivery queue and flag any issues. Current session cost: $0.42.",
      deliveryStatus: "pending",
    },
  ];
}
