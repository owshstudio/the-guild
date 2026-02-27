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

    const result = await sendGatewayCommand("chat.send", {
      agentId,
      message,
      ...(sessionId ? { sessionId } : {}),
    });

    if (result.error) {
      const response: DispatchResponse = {
        success: false,
        error: result.error.message,
      };
      return NextResponse.json({ data: response, source: "mock" });
    }

    const response: DispatchResponse = {
      success: true,
      sessionId: (result.result as { sessionId?: string })?.sessionId,
    };
    return NextResponse.json({ data: response, source: "live" });
  } catch (error) {
    const response: DispatchResponse = {
      success: false,
      error: sanitizeErrorMessage(error),
    };
    return NextResponse.json({ data: response, source: "mock" });
  }
}
