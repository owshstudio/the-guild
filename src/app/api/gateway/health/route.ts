import { NextResponse } from "next/server";
import { checkHealth } from "@/lib/gateway/health";

export async function GET() {
  try {
    const status = await checkHealth();
    return NextResponse.json({ data: status, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: { connected: false, gatewayPort: 18789 },
      source: "mock",
      error: error instanceof Error ? error.message : "Health check failed",
    });
  }
}
