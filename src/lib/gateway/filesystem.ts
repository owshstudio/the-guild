import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import { getConfig } from "./config";

export interface AgentIdentity {
  name: string;
  emoji: string;
  description: string;
  role: string;
}

export async function readIdentity(
  subpath?: string
): Promise<AgentIdentity | null> {
  try {
    const config = await getConfig();
    const identityPath = subpath
      ? path.join(config.workspacePath, subpath, "IDENTITY.md")
      : path.join(config.workspacePath, "IDENTITY.md");

    const content = await readFile(identityPath, "utf-8");

    let name = "Unknown";
    let emoji = "";
    let description = "";
    let role = "";

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- **Name:**")) {
        name = trimmed.replace("- **Name:**", "").trim();
      } else if (trimmed.startsWith("- **Emoji:**")) {
        emoji = trimmed.replace("- **Emoji:**", "").trim();
      } else if (trimmed.startsWith("- **Creature:**")) {
        description = trimmed.replace("- **Creature:**", "").trim();
      } else if (trimmed.startsWith("- **Vibe:**")) {
        role = trimmed.replace("- **Vibe:**", "").trim();
      }
    }

    return { name, emoji, description, role };
  } catch {
    return null;
  }
}

export async function readSoul(subpath?: string): Promise<string | null> {
  try {
    const config = await getConfig();
    const soulPath = subpath
      ? path.join(config.workspacePath, subpath, "SOUL.md")
      : path.join(config.workspacePath, "SOUL.md");

    return await readFile(soulPath, "utf-8");
  } catch {
    return null;
  }
}

export interface SessionMeta {
  id: string;
  filepath: string;
  size: number;
  lastModified: Date;
  isActive: boolean;
}

export async function listSessions(): Promise<SessionMeta[]> {
  try {
    const config = await getConfig();
    const sessionsDir = path.join(config.agentsPath, "main", "sessions");
    const files = await readdir(sessionsDir);

    const sessions: SessionMeta[] = [];

    for (const file of files) {
      if (!file.endsWith(".jsonl") || file.includes(".deleted")) continue;

      const filepath = path.join(sessionsDir, file);
      const fileStat = await stat(filepath);
      const id = file.replace(".jsonl", "");
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;

      sessions.push({
        id,
        filepath,
        size: fileStat.size,
        lastModified: fileStat.mtime,
        isActive: fileStat.mtime.getTime() > fiveMinAgo,
      });
    }

    sessions.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    return sessions;
  } catch {
    return [];
  }
}

export async function findSessionById(id: string): Promise<string | null> {
  try {
    const config = await getConfig();
    const sessionsDir = path.join(config.agentsPath, "main", "sessions");
    const filepath = path.join(sessionsDir, `${id}.jsonl`);
    const fileStat = await stat(filepath);
    return fileStat.isFile() ? filepath : null;
  } catch {
    return null;
  }
}

export interface SessionQuickMeta {
  model: string | null;
  preview: string | null;
  messageCount: number;
  startTime: string | null;
  endTime: string | null;
  duration: number | null;
}

export async function getSessionQuickMeta(
  filepath: string
): Promise<SessionQuickMeta> {
  const meta: SessionQuickMeta = {
    model: null,
    preview: null,
    messageCount: 0,
    startTime: null,
    endTime: null,
    duration: null,
  };

  try {
    const raw = await readFile(filepath, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim());
    meta.messageCount = lines.length;

    const headLines = lines.slice(0, 10);
    const tailLines = lines.slice(-5);
    const sampled = [...headLines, ...tailLines];

    for (const line of sampled) {
      try {
        const entry = JSON.parse(line);

        if (entry.timestamp) {
          if (!meta.startTime) meta.startTime = entry.timestamp;
          meta.endTime = entry.timestamp;
        }

        if (
          !meta.model &&
          entry.type === "message" &&
          entry.message?.role === "assistant" &&
          entry.message?.model
        ) {
          meta.model = entry.message.model;
        }

        if (!meta.model && entry.model) {
          meta.model = entry.model;
        }

        if (
          !meta.preview &&
          entry.type === "message" &&
          entry.message?.role === "user"
        ) {
          const content = entry.message.content;
          const text =
            typeof content === "string"
              ? content
              : Array.isArray(content)
              ? content
                  .filter((b: { type: string }) => b.type === "text")
                  .map((b: { text?: string }) => b.text || "")
                  .join(" ")
              : "";
          if (text) {
            meta.preview = text.slice(0, 80);
          }
        }
      } catch {
        // skip malformed
      }
    }

    if (meta.startTime && meta.endTime) {
      meta.duration =
        new Date(meta.endTime).getTime() - new Date(meta.startTime).getTime();
    }
  } catch {
    // file read error
  }

  return meta;
}

export async function readCronJobs(): Promise<unknown> {
  try {
    const config = await getConfig();
    const cronPath = path.join(config.cronPath, "jobs.json");
    const raw = await readFile(cronPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { version: 1, jobs: [] };
  }
}
