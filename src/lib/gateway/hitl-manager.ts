import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";
import { listSessions } from "./filesystem";
import type { HITLItem, HITLPriority } from "@/lib/types";

const MOCK_ITEMS: HITLItem[] = [
  {
    id: "hitl-mock-1",
    type: "approval",
    title: "Deploy production build to Vercel",
    description:
      "NYX is ready to deploy the latest build to production. This will affect the live site.",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    priority: "critical",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    context:
      "Build completed successfully with 0 errors. All tests passing. Ready for production deployment to collegeclassreviews.com.",
    sessionId: "mock-session-1",
  },
  {
    id: "hitl-mock-2",
    type: "decision",
    title: "Choose outreach message template",
    description:
      "HEMERA needs a decision on which template to use for the next batch of 50 outreach messages.",
    agentId: "hemera",
    agentName: "HEMERA",
    agentEmoji: "\u2600\uFE0F",
    priority: "high",
    status: "pending",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    context:
      'Template A: Professional intro with case study link. Template B: Casual opener with free audit offer. Template C: Referral-based warm intro.',
    sessionId: "mock-session-2",
  },
  {
    id: "hitl-mock-3",
    type: "review",
    title: "Review generated email content",
    description:
      "NYX drafted a follow-up email to a prospect. Needs human review before sending.",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    priority: "medium",
    status: "pending",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    context:
      "Subject: Quick follow-up on your website audit. Body: Hi [Name], I wanted to follow up on the website audit we discussed...",
    sessionId: "mock-session-3",
    detectedPattern: "need your approval",
  },
  {
    id: "hitl-mock-4",
    type: "input",
    title: "Provide API key for new integration",
    description:
      "NYX needs the Stripe API key to set up payment processing for Studio.",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    priority: "low",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    context:
      "Setting up Stripe integration for OWSH Studio. Need the live API key (sk_live_...) to configure the payment flow.",
    sessionId: "mock-session-4",
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

export async function scanSessionsForHITL(): Promise<HITLItem[]> {
  const newItems: HITLItem[] = [];

  try {
    const sessions = await listSessions();
    const activeSessions = sessions.filter((s) => s.isActive);

    for (const session of activeSessions) {
      try {
        const raw = await readFile(session.filepath, "utf-8");
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
                    .join("\n")
                : "";

            if (!content) continue;
            const lower = content.toLowerCase();

            for (const pattern of HITL_PATTERNS) {
              if (lower.includes(pattern)) {
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
                  agentId: "nyx",
                  agentName: "NYX",
                  agentEmoji: "\u{1F703}",
                  priority: determinePriority(content),
                  status: "pending",
                  createdAt: entry.timestamp || new Date().toISOString(),
                  context: contextSnippet,
                  sessionId: session.id,
                  detectedPattern: pattern,
                });

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
    // no sessions
  }

  return newItems;
}
