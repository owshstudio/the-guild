import { NextResponse } from "next/server";
import type { DispatchRequest, DispatchResponse } from "@/lib/types";
import { sendGatewayCommand } from "@/lib/gateway/ws-client";
import {
  validateRequired,
  sanitizeErrorMessage,
} from "@/lib/gateway/validate";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DispatchRequest;

    const missing = validateRequired(
      body as unknown as Record<string, unknown>,
      ["agentId", "message"]
    );
    if (missing) {
      return NextResponse.json(
        { data: { success: false, error: missing } as DispatchResponse },
        { status: 400 }
      );
    }

    const { agentId, message, sessionId } = body;

    // Build a Guild-specific session key so messages route to a separate
    // conversation thread — just like WhatsApp/Slack/Discord each get their own.
    // Format: agent:<agentId>:guild:direct:operator
    const guildSessionKey = sessionId
      ? sessionId
      : `agent:${agentId}:guild:direct:operator`;

    const result = await sendGatewayCommand("chat.send", {
      sessionKey: guildSessionKey,
      message,
      idempotencyKey: `guild-${Date.now()}-${crypto.randomUUID()}`,
    });

    if (!result.ok) {
      const response: DispatchResponse = {
        success: false,
        error: result.error?.message || "Dispatch failed",
      };
      return NextResponse.json({ data: response, source: "live" });
    }

    const response: DispatchResponse = {
      success: true,
      sessionId: (result.payload as { sessionId?: string; runId?: string })?.sessionId
        || (result.payload as { runId?: string })?.runId,
    };
    return NextResponse.json({ data: response, source: "live" });
  } catch (error) {
    const response: DispatchResponse = {
      success: false,
      error: sanitizeErrorMessage(error),
    };
    return NextResponse.json({ data: response, source: "live" });
  }
}
