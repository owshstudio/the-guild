import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";
import { listSessions, listAgentDirs, readIdentity } from "./filesystem";
import type { HITLItem, HITLPriority } from "@/lib/types";

const MOCK_ITEMS: HITLItem[] = [
  {
    id: "hitl-mock-1",
    type: "approval",
    title: "Deploy production build",
    description:
      "Agent is ready to deploy the latest build to production. This will affect the live site.",
    agentId: "demo",
    agentName: "Demo Agent",
    agentEmoji: "\u{1F916}",
    priority: "critical",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    context:
      "Build completed successfully with 0 errors. All tests passing. Ready for production deployment.",
    sessionId: "mock-session-1",
  },
];

const HITL_PATTERNS = [
  "waiting for approval",
  "need human input",
  "requires your decision",
  "please confirm",
  "should I proceed",
  "awaiting clearance",
  "need your approval",
  "human review needed",
];

async function getHITLPath(): Promise<string> {
  const config = await getConfig();
  return path.join(config.workspacePath, "guild-hitl-queue.json");
}

export async function readHITLQueue(): Promise<{ items: HITLItem[] }> {
  try {
    const filePath = await getHITLPath();
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return { items: data.items || [] };
  } catch {
    return { items: MOCK_ITEMS };
  }
}

export async function writeHITLQueue(items: HITLItem[]): Promise<void> {
  const filePath = await getHITLPath();
  const dir = path.dirname(filePath);
  const tmpPath = filePath + ".tmp";

  await mkdir(dir, { recursive: true });
  await writeFile(tmpPath, JSON.stringify({ items }, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}

function determinePriority(text: string): HITLPriority {
  const lower = text.toLowerCase();
  if (lower.includes("urgent") || lower.includes("asap")) return "critical";
  if (lower.includes("approval") || lower.includes("decision")) return "high";
  return "medium";
}

const TAIL_LINES = 50;

export async function scanSessionsForHITL(): Promise<HITLItem[]> {
  const newItems: HITLItem[] = [];

  // Load existing queue for deduplication
  let existingItems: HITLItem[] = [];
  try {
    const queue = await readHITLQueue();
    existingItems = queue.items;
  } catch {
    // no existing queue
  }

  // Build a set of sessionId+pattern combos that are already pending
  const existingKeys = new Set<string>();
  for (const item of existingItems) {
    if (item.status === "pending" && item.sessionId && item.detectedPattern) {
      existingKeys.add(`${item.sessionId}::${item.detectedPattern}`);
    }
  }

  try {
    const agentDirs = await listAgentDirs();

    for (const agentId of agentDirs) {
      let agentName = agentId.toUpperCase();
      let agentEmoji = "\u{1F916}";
      try {
        const identity = await readIdentity(agentId === "main" ? undefined : agentId);
        if (identity) {
          if (identity.name) agentName = identity.name;
          if (identity.emoji) agentEmoji = identity.emoji;
        }
      } catch { /* use defaults */ }

      try {
        const sessions = await listSessions(agentId);
        const activeSessions = sessions.filter((s) => s.isActive);

        for (const session of activeSessions) {
          try {
            const raw = await readFile(session.filepath, "utf-8");
            // Only process the last N lines to limit memory usage for large session files
            const allLines = raw.split("\n").filter((l) => l.trim());
            const lines = allLines.slice(-TAIL_LINES);

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
                        .join("\n")
                    : "";

                if (!content) continue;
                const lower = content.toLowerCase();

                for (const pattern of HITL_PATTERNS) {
                  if (lower.includes(pattern)) {
                    // Deduplication: skip if same session+pattern already pending
                    const dedupeKey = `${session.id}::${pattern}`;
                    if (existingKeys.has(dedupeKey)) break;

                    const contextStart = Math.max(
                      0,
                      lower.indexOf(pattern) - 100
                    );
                    const contextEnd = Math.min(
                      content.length,
                      lower.indexOf(pattern) + pattern.length + 100
                    );
                    const contextSnippet = content
                      .slice(contextStart, contextEnd)
                      .trim();

                    newItems.push({
                      id: `hitl-scan-${session.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                      type: "approval",
                      title: `Agent requests: "${pattern}"`,
                      description: contextSnippet.slice(0, 200),
                      agentId,
                      agentName,
                      agentEmoji,
                      priority: determinePriority(content),
                      status: "pending",
                      createdAt: entry.timestamp || new Date().toISOString(),
                      context: contextSnippet,
                      sessionId: session.id,
                      detectedPattern: pattern,
                    });

                    // Track newly added keys to prevent duplicates within this scan
                    existingKeys.add(dedupeKey);

                    break; // one match per line
                  }
                }
              } catch {
                // skip malformed line
              }
            }
          } catch {
            // skip unreadable session
          }
        }
      } catch {
        // no sessions for this agent
      }
    }
  } catch {
    // no agents
  }

  return newItems;
}
