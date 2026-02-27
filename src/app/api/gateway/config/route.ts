import { NextResponse } from "next/server";
import { getSanitizedConfig } from "@/lib/gateway/config";

export async function GET() {
  try {
    const config = await getSanitizedConfig();
    return NextResponse.json({ data: config, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: { workspacePath: "~/.openclaw/workspace", gatewayPort: 18789, hasConfig: false },
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to read config",
    });
  }
}
