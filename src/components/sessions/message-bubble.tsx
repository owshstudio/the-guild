"use client";

import { useMemo } from "react";
import type { SessionMessage } from "@/lib/types";

// ── Inline markdown renderer ──────────────────────────────────────────────
// Handles: inline `code`, **bold**, *italic*, [links](url)
function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;

  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const m = match[0];
    const k = `${keyPrefix}-${match.index}`;
    if (m.startsWith("`")) {
      parts.push(
        <code key={k} className="rounded bg-[#1f1f1f] px-1 py-0.5 font-mono text-xs text-[#e5a0e0]">
          {m.slice(1, -1)}
        </code>
      );
    } else if (m.startsWith("**")) {
      parts.push(
        <strong key={k} className="font-semibold text-[#e5e5e5]">
          {m.slice(2, -2)}
        </strong>
      );
    } else if (m.startsWith("*")) {
      parts.push(
        <em key={k} className="italic text-[#d4d4d4]">
          {m.slice(1, -1)}
        </em>
      );
    } else if (m.startsWith("[")) {
      const linkMatch = m.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a key={k} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#DF4F15] underline">
            {linkMatch[1]}
          </a>
        );
      }
    }
    lastIndex = match.index + m.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [line];
}

// ── Block-level line renderer ─────────────────────────────────────────────
// Handles: # headers, - / * list items, plain text with inline markdown
function renderLine(line: string, li: number, totalLines: number): React.ReactNode {
  const trimmed = line.trimStart();

  // Headers
  if (trimmed.startsWith("### ")) {
    return (
      <div key={li} className="mt-2 mb-1 text-sm font-semibold text-[#e5e5e5]">
        {renderInline(trimmed.slice(4), `h3-${li}`)}
      </div>
    );
  }
  if (trimmed.startsWith("## ")) {
    return (
      <div key={li} className="mt-3 mb-1 text-sm font-bold text-[#e5e5e5]">
        {renderInline(trimmed.slice(3), `h2-${li}`)}
      </div>
    );
  }
  if (trimmed.startsWith("# ")) {
    return (
      <div key={li} className="mt-3 mb-1 text-base font-bold text-[#f5f5f5]">
        {renderInline(trimmed.slice(2), `h1-${li}`)}
      </div>
    );
  }

  // Unordered list items
  if (/^[-*]\s/.test(trimmed)) {
    return (
      <div key={li} className="flex gap-2 pl-2">
        <span className="shrink-0 text-[#525252]">•</span>
        <span>{renderInline(trimmed.slice(2), `li-${li}`)}</span>
      </div>
    );
  }

  // Ordered list items (1. 2. 3.)
  const olMatch = trimmed.match(/^(\d+)\.\s/);
  if (olMatch) {
    return (
      <div key={li} className="flex gap-2 pl-2">
        <span className="shrink-0 min-w-[1.2em] text-right font-mono text-[#525252]">{olMatch[1]}.</span>
        <span>{renderInline(trimmed.slice(olMatch[0].length), `ol-${li}`)}</span>
      </div>
    );
  }

  // Plain text with inline markdown
  return (
    <span key={li}>
      {renderInline(line, `ln-${li}`)}
      {li < totalLines - 1 && "\n"}
    </span>
  );
}

// ── Two-pass markdown renderer ────────────────────────────────────────────
// Pass 1: split on fenced code blocks (``` ... ```)
// Pass 2: for non-code segments, process line-by-line block elements
function renderMarkdown(text: string): React.ReactNode[] {
  const segments = text.split(/^(```[\s\S]*?^```)/m);
  const result: React.ReactNode[] = [];

  for (let si = 0; si < segments.length; si++) {
    const segment = segments[si];

    // Fenced code block
    if (segment.startsWith("```")) {
      const firstNewline = segment.indexOf("\n");
      const lang = segment.slice(3, firstNewline).trim();
      const code = segment.slice(firstNewline + 1).replace(/```$/, "").trimEnd();
      result.push(
        <div key={`code-${si}`} className="my-2 overflow-x-auto rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
          {lang && (
            <div className="border-b border-[#1f1f1f] px-3 py-1">
              <span className="font-mono text-[10px] text-[#525252]">{lang}</span>
            </div>
          )}
          <pre className="p-3 text-xs leading-relaxed">
            <code className="font-mono text-[#d4d4d4]">{code}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Regular text — process line-by-line
    const lines = segment.split("\n");
    result.push(
      ...lines.map((line, li) => renderLine(line, si * 10000 + li, lines.length))
    );
  }

  return result;
}

// ── Component ─────────────────────────────────────────────────────────────

export type MessageBubbleVariant = "session" | "chat";

interface MessageBubbleProps {
  message: SessionMessage;
  variant?: MessageBubbleVariant;
  agentName?: string;
  agentEmoji?: string;
}

export default function MessageBubble({
  message,
  variant = "session",
  agentName,
  agentEmoji,
}: MessageBubbleProps) {
  const hasContent = message.content && message.content.trim().length > 0;
  const isUser = message.role === "user";
  const rendered = useMemo(
    () => (hasContent ? renderMarkdown(message.content) : null),
    [hasContent, message.content]
  );

  // Skip rendering empty assistant messages (tool-only turns)
  if (!hasContent && message.role === "assistant" && !message.thinking) {
    return null;
  }

  if (message.role === "system") {
    return (
      <div className="flex justify-center py-2">
        <div className="max-w-md rounded-lg px-4 py-2 text-center text-xs text-[#525252]">
          {message.content.slice(0, 200)}
          {message.content.length > 200 && "..."}
        </div>
      </div>
    );
  }

  const isChat = variant === "chat";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} py-1.5`}>
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-[#1a1a2a] border border-[#252540]"
            : "bg-[#141414] border border-[#1f1f1f]"
        }`}
      >
        <div className="mb-1 flex items-center gap-2">
          {isChat ? (
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
              {isUser ? "You" : (
                <>
                  {agentEmoji && <span className="mr-1 text-xs not-italic">{agentEmoji}</span>}
                  {agentName || "Assistant"}
                </>
              )}
            </span>
          ) : (
            <>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#525252]">
                {message.role}
              </span>
              {message.model && (
                <span className="rounded bg-[#1f1f1f] px-1.5 py-0.5 font-mono text-[9px] text-[#737373]">
                  {message.model}
                </span>
              )}
              {message.usage && (
                <span className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[9px] text-[#525252]">
                  {(message.usage.inputTokens + message.usage.outputTokens).toLocaleString()} tok
                </span>
              )}
            </>
          )}
        </div>
        <div className="whitespace-pre-wrap break-words text-sm text-[#d4d4d4]">
          {rendered || (message.toolCalls?.length ? "[tool calls]" : "[no content]")}
        </div>
        {message.thinking && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[10px] font-medium text-[#525252] hover:text-[#737373]">
              Thinking
            </summary>
            <div className="mt-1 whitespace-pre-wrap border-l-2 border-[#252540] pl-3 text-xs text-[#525252]">
              {renderMarkdown(
                message.thinking.slice(0, 2000) +
                (message.thinking.length > 2000 ? "\n\n..." : "")
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
