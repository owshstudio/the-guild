import { readFile, stat } from "fs/promises";
import { listSessions } from "./filesystem";

export interface SessionMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  toolCalls?: { name: string; input: string; output?: string }[];
  usage?: { inputTokens: number; outputTokens: number; cost?: number };
  model?: string;
  thinking?: string;
}

export interface ParsedSession {
  id: string;
  messages: SessionMessage[];
  startTime: string | null;
  endTime: string | null;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  model: string | null;
  isActive: boolean;
}

export async function parseSession(
  filepath: string,
  id?: string,
  options?: { offset?: number; limit?: number }
): Promise<ParsedSession> {
  const sessionId =
    id || filepath.split("/").pop()?.replace(".jsonl", "") || "unknown";
  const allMessages: SessionMessage[] = [];
  let startTime: string | null = null;
  let endTime: string | null = null;
  let totalTokens = 0;
  let totalCost = 0;
  let model: string | null = null;
  let isActive = false;

  const pendingToolUses = new Map<
    string,
    { name: string; input: string; msgIndex: number; callIndex: number }
  >();

  try {
    const fileStat = await stat(filepath);
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    isActive = fileStat.mtime.getTime() > fiveMinAgo;

    const raw = await readFile(filepath, "utf-8");
    const lines = raw.split("\n").filter((l) => l.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        if (entry.timestamp) {
          if (!startTime) startTime = entry.timestamp;
          endTime = entry.timestamp;
        }

        if (entry.type === "message" && entry.message) {
          const msg: SessionMessage = {
            role: entry.message.role || "system",
            content: extractContent(entry.message.content),
            timestamp: entry.timestamp,
          };

          if (entry.message.model) {
            msg.model = entry.message.model;
            if (!model) model = entry.message.model;
          } else if (entry.model) {
            msg.model = entry.model;
            if (!model) model = entry.model;
          }

          if (
            entry.message.role === "assistant" &&
            Array.isArray(entry.message.content)
          ) {
            const thinkingBlocks = entry.message.content.filter(
              (b: { type: string }) => b.type === "thinking"
            );
            if (thinkingBlocks.length > 0) {
              msg.thinking = thinkingBlocks
                .map((b: { thinking?: string; text?: string }) => b.thinking || b.text || "")
                .join("\n");
            }
          }

          if (entry.message.role === "assistant" && entry.message.content) {
            const toolCalls = extractToolCalls(entry.message.content);
            if (toolCalls.length > 0) {
              msg.toolCalls = toolCalls;
              if (Array.isArray(entry.message.content)) {
                for (const block of entry.message.content) {
                  if (block.type === "tool_use" && block.id) {
                    const idx = msg.toolCalls.findIndex(
                      (tc) => tc.name === (block.name || "unknown")
                    );
                    if (idx >= 0) {
                      pendingToolUses.set(block.id, {
                        name: block.name,
                        input: msg.toolCalls[idx].input,
                        msgIndex: allMessages.length,
                        callIndex: idx,
                      });
                    }
                  }
                }
              }
            }
          }

          if (
            entry.message.role === "user" &&
            Array.isArray(entry.message.content)
          ) {
            for (const block of entry.message.content) {
              if (block.type === "tool_result" && block.tool_use_id) {
                const pending = pendingToolUses.get(block.tool_use_id);
                if (pending) {
                  const targetMsg = allMessages[pending.msgIndex];
                  if (targetMsg?.toolCalls?.[pending.callIndex]) {
                    const resultContent =
                      typeof block.content === "string"
                        ? block.content
                        : Array.isArray(block.content)
                          ? block.content
                              .filter((b: { type: string }) => b.type === "text")
                              .map((b: { text?: string }) => b.text || "")
                              .join("\n")
                          : "";
                    targetMsg.toolCalls[pending.callIndex].output =
                      resultContent.slice(0, 500);
                  }
                  pendingToolUses.delete(block.tool_use_id);
                }
              }
            }
          }

          allMessages.push(msg);
        }

        if (entry.type === "usage" || entry.usage) {
          const usage = entry.usage || entry;
          const input = usage.inputTokens || usage.input_tokens || 0;
          const output = usage.outputTokens || usage.output_tokens || 0;
          totalTokens += input + output;
          if (usage.cost?.total) {
            totalCost += usage.cost.total;
          }
          const lastAssistant = [...allMessages]
            .reverse()
            .find((m) => m.role === "assistant");
          if (lastAssistant && !lastAssistant.usage) {
            lastAssistant.usage = {
              inputTokens: input,
              outputTokens: output,
              cost: usage.cost?.total,
            };
          }
        }

        if (entry.type === "result" && entry.result?.usage) {
          const u = entry.result.usage;
          const input = u.inputTokens || u.input_tokens || 0;
          const output = u.outputTokens || u.output_tokens || 0;
          totalTokens += input + output;
          if (u.cost?.total) {
            totalCost += u.cost.total;
          }
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch {
    // File read error
  }

  const offset = options?.offset ?? 0;
  const limit = options?.limit;
  const messages =
    limit !== undefined
      ? allMessages.slice(offset, offset + limit)
      : allMessages.slice(offset);

  return {
    id: sessionId,
    messages,
    startTime,
    endTime,
    totalTokens,
    totalCost,
    messageCount: allMessages.length,
    model,
    isActive,
  };
}

function extractContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((block) => block.type === "text")
      .map((block) => block.text || "")
      .join("\n");
  }
  return "";
}

function extractToolCalls(
  content: unknown
): { name: string; input: string; output?: string }[] {
  if (!Array.isArray(content)) return [];
  return content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      name: block.name || "unknown",
      input:
        typeof block.input === "string"
          ? block.input
          : JSON.stringify(block.input || {}).slice(0, 200),
    }));
}

export async function getRecentSessions(
  limit = 5,
  agentId?: string
): Promise<ParsedSession[]> {
  const metas = await listSessions(agentId);
  const recent = metas.slice(0, limit);
  const parsed = await Promise.all(
    recent.map((m) => parseSession(m.filepath, m.id))
  );
  return parsed;
}
