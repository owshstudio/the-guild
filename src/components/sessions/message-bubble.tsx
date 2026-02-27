"use client";

import type { SessionMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: SessionMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
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

  const isUser = message.role === "user";

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
          {message.content || (message.toolCalls?.length ? "[tool calls]" : "[empty]")}
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
