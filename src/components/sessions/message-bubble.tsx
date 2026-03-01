"use client";

import { useMemo } from "react";
import type { SessionMessage } from "@/lib/types";

// Lightweight inline markdown → JSX (bold, italic, code, links)
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    // Process inline markdown within each line
    const parts: React.ReactNode[] = [];
    // Regex: code, bold, italic, links
    const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
    let lastIndex = 0;
    let match;

    while ((match = re.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      const m = match[0];
      if (m.startsWith("`")) {
        parts.push(
          <code key={`${li}-${match.index}`} className="rounded bg-[#1f1f1f] px-1 py-0.5 font-mono text-xs text-[#e5a0e0]">
            {m.slice(1, -1)}
          </code>
        );
      } else if (m.startsWith("**")) {
        parts.push(
          <strong key={`${li}-${match.index}`} className="font-semibold text-[#e5e5e5]">
            {m.slice(2, -2)}
          </strong>
        );
      } else if (m.startsWith("*")) {
        parts.push(
          <em key={`${li}-${match.index}`} className="italic text-[#d4d4d4]">
            {m.slice(1, -1)}
          </em>
        );
      } else if (m.startsWith("[")) {
        const linkMatch = m.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a key={`${li}-${match.index}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-[#DF4F15] underline">
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

    // Return line with newlines between
    return (
      <span key={li}>
        {parts.length > 0 ? parts : line}
        {li < lines.length - 1 && "\n"}
      </span>
    );
  });
}

interface MessageBubbleProps {
  message: SessionMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
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
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-[#d4d4d4]">
          {rendered || (message.toolCalls?.length ? "[tool calls]" : "[no content]")}
        </p>
        {message.thinking && (
          <details className="mt-2">
            <summary className="cursor-pointer text-[10px] font-medium text-[#525252] hover:text-[#737373]">
              Thinking
            </summary>
            <p className="mt-1 whitespace-pre-wrap text-xs text-[#525252]">
              {message.thinking.slice(0, 500)}
              {message.thinking.length > 500 && "..."}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
