import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/gateway/health";

export async function GET() {
  try {
    const status = await checkHealth();
    return NextResponse.json({ data: status, source: "live" });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
            .replace(/\/Users\/[^\s]*/g, "[path]")
            .replace(/\/home\/[^\s]*/g, "[path]")
        : "Health check failed";
    return NextResponse.json({
      data: { connected: false, gatewayPort: 18789 },
      source: "mock",
      error: msg,
    });
  }
}
