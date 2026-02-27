import type { Agent } from "@/lib/types";
import { readIdentity, readSoul, listSessions } from "./filesystem";

export async function buildAgents(): Promise<Agent[]> {
  const agents: Agent[] = [];
  const sessions = await listSessions();

  // Determine NYX status from session recency
  const latestSession = sessions[0];
  const nyxStatus = getStatusFromDate(latestSession?.lastModified);
  const nyxLastActivity = latestSession
    ? formatRelativeTime(latestSession.lastModified)
    : "Unknown";

  // Build NYX from IDENTITY.md and SOUL.md
  const nyxIdentity = await readIdentity();
  const nyxSoul = await readSoul();
  const nyxDescription = nyxIdentity?.description || "Lead AI agent";
  const nyxRole = extractRole(nyxSoul) || nyxIdentity?.role || "Lead Agent / Orchestrator";

  agents.push({
    id: "nyx",
    name: nyxIdentity?.name || "NYX",
    emoji: nyxIdentity?.emoji || "\u{1F703}",
    status: nyxStatus,
    role: nyxRole,
    description: nyxDescription,
    machine: "MacBook Pro",
    gateway: "localhost",
    model: "claude-opus-4-6",
    currentTask: nyxStatus === "active" ? "Active session in progress" : null,
    lastActivity: nyxLastActivity,
    skills: [
      "Web Search",
      "Browser Control",
      "File Management",
      "Code Generation",
      "WhatsApp Messaging",
      "Telegram Messaging",
      "Email (IMAP)",
      "Calendar",
      "Memory System",
      "Sub-Agent Spawning",
      "GitHub",
      "Vercel Deploy",
    ],
    color: "#7c3aed",
    accentColor: "#a78bfa",
    uptimeSince: sessions.length > 0
      ? sessions[sessions.length - 1].lastModified.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });

  // Build HEMERA from workspace/hemera/SOUL.md
  const hemeraSoul = await readSoul("hemera");
  const hemeraDescription = hemeraSoul
    ? "Quiet, precise, patient. Named after the Greek goddess of day. NYX's first child."
    : "Outreach operator (pending deployment)";

  agents.push({
    id: "hemera",
    name: "HEMERA",
    emoji: "\u2600\uFE0F",
    status: "idle",
    role: "Outreach Operator",
    description: hemeraDescription,
    machine: "LOKI PC (Win 11, i7-9700F, RTX 2060S)",
    gateway: "remote (not connected)",
    model: "gpt-4o-mini (pending switch)",
    currentTask: "105 prospects in outreach queue (pending deployment)",
    lastActivity: "Today",
    skills: [
      "FB Messenger Outreach",
      "Browser Relay",
      "Message Queue",
      "Status Reporting",
    ],
    color: "#d97706",
    accentColor: "#fbbf24",
    uptimeSince: new Date().toISOString().slice(0, 10),
  });

  return agents;
}

function getStatusFromDate(date: Date | undefined): "active" | "idle" | "stopped" {
  if (!date) return "stopped";
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 5 * 60 * 1000) return "active";
  if (diff < 60 * 60 * 1000) return "idle";
  return "stopped";
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function extractRole(soul: string | null): string | null {
  if (!soul) return null;
  // Look for a role-like description in SOUL.md
  const lines = soul.split("\n");
  for (const line of lines) {
    if (line.startsWith("I'm NYX") || line.startsWith("I'm NYX")) {
      return "Lead Agent / Orchestrator";
    }
  }
  return null;
}
