import { NextRequest, NextResponse } from "next/server";
import { findSessionById } from "@/lib/gateway/filesystem";
import { parseSession } from "@/lib/gateway/session-parser";
import type { SessionDetail } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  try {
    const filepath = await findSessionById(id);
    if (!filepath) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const parsed = await parseSession(filepath, id, { offset, limit });

    const detail: SessionDetail = {
      id: parsed.id,
      messages: parsed.messages.map((m, i) => ({
        id: `${parsed.id}-${offset + i}`,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        toolCalls: m.toolCalls,
        usage: m.usage,
        model: m.model,
        thinking: m.thinking,
      })),
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      totalTokens: parsed.totalTokens,
      totalCost: parsed.totalCost,
      messageCount: parsed.messageCount,
      model: parsed.model,
      isActive: parsed.isActive,
    };

    return NextResponse.json({ data: detail, source: "live" });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
            .replace(/\/Users\/[^\s]*/g, "[path]")
            .replace(/\/home\/[^\s]*/g, "[path]")
        : "Failed to load session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
