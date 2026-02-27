import type { Agent } from "@/lib/types";
import {
  readIdentity,
  readSoul,
  listSessions,
  listAgentDirs,
  readToolsList,
} from "./filesystem";
import { getConfig } from "./config";

export async function buildAgents(): Promise<Agent[]> {
  const agentDirs = await listAgentDirs();
  if (agentDirs.length === 0) return [];

  const agents: Agent[] = [];
  const config = await getConfig();

  for (const agentId of agentDirs) {
    const agent = await buildSingleAgent(agentId, config.gatewayPort);
    if (agent) agents.push(agent);
  }

  // Sort: active > idle > stopped
  const statusOrder: Record<string, number> = {
    active: 0,
    idle: 1,
    stopped: 2,
  };
  agents.sort(
    (a, b) => (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2)
  );

  return agents;
}

async function buildSingleAgent(
  agentId: string,
  gatewayPort: number
): Promise<Agent | null> {
  const sessions = await listSessions(agentId);

  // Determine status from most recent session
  const latestSession = sessions[0];
  const status = getStatusFromDate(latestSession?.lastModified);
  const lastActivity = latestSession
    ? formatRelativeTime(latestSession.lastModified)
    : "No sessions";

  // Read identity — "main" maps to workspace root, others to workspace/{agentId}/
  const identitySubpath = agentId === "main" ? undefined : agentId;
  const identity = await readIdentity(identitySubpath);

  // Read soul for role extraction
  const soul = await readSoul(identitySubpath);
  const role = extractRole(soul) || identity?.role || "Agent";

  // Read skills from TOOLS.md
  const skills = await readToolsList(identitySubpath);

  // Generate deterministic color from agent name
  const displayName = identity?.name || titleCase(agentId);
  const color = hashColor(displayName);
  const accentColor = lightenColor(color);

  return {
    id: agentId,
    name: displayName,
    emoji: identity?.emoji || defaultEmoji(agentId),
    status,
    role,
    description: identity?.description || `Agent: ${agentId}`,
    machine: "localhost",
    gateway: `localhost:${gatewayPort}`,
    model: "claude-opus-4-6",
    currentTask: status === "active" ? "Active session in progress" : null,
    lastActivity,
    skills:
      skills.length > 0
        ? skills
        : [
            "File Management",
            "Code Generation",
            "Web Search",
            "Memory System",
          ],
    color,
    accentColor,
    uptimeSince:
      sessions.length > 0
        ? sessions[sessions.length - 1].lastModified
            .toISOString()
            .slice(0, 10)
        : new Date().toISOString().slice(0, 10),
  };
}

function getStatusFromDate(
  date: Date | undefined
): "active" | "idle" | "stopped" {
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
  const lines = soul.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("I'm ") ||
      trimmed.startsWith("I am ") ||
      trimmed.startsWith("Role:")
    ) {
      if (
        trimmed.toLowerCase().includes("lead") ||
        trimmed.toLowerCase().includes("orchestrat")
      ) {
        return "Lead Agent / Orchestrator";
      }
      if (trimmed.toLowerCase().includes("outreach")) {
        return "Outreach Operator";
      }
    }
  }
  return null;
}

function titleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function defaultEmoji(agentId: string): string {
  const emojis = [
    "\u{1F916}",
    "\u{1F47E}",
    "\u{1F680}",
    "\u{2728}",
    "\u{1F525}",
    "\u{26A1}",
    "\u{1F30A}",
    "\u{1F308}",
  ];
  const hash = simpleHash(agentId);
  return emojis[hash % emojis.length];
}

function hashColor(name: string): string {
  const knownColors: Record<string, string> = {
    NYX: "#7c3aed",
    HEMERA: "#d97706",
  };
  if (knownColors[name]) return knownColors[name];

  const hash = simpleHash(name);
  const hue = hash % 360;
  const saturation = 55 + (hash % 20);
  const lightness = 40 + (hash % 15);
  return hslToHex(hue, saturation, lightness);
}

function lightenColor(hex: string): string {
  const knownAccents: Record<string, string> = {
    "#7c3aed": "#a78bfa",
    "#d97706": "#fbbf24",
  };
  if (knownAccents[hex]) return knownAccents[hex];

  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 60);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 60);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 60);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
