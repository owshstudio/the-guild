import { NextResponse } from "next/server";
import type { DispatchRequest, DispatchResponse } from "@/lib/types";
import { sendGatewayCommand } from "@/lib/gateway/ws-client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DispatchRequest;
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
      error: error instanceof Error ? error.message : "Dispatch failed",
    };
    return NextResponse.json({ data: response, source: "mock" });
  }
}
