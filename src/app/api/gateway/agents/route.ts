import { NextResponse } from "next/server";
import { buildAgents } from "@/lib/gateway/agent-builder";
import { hasOpenClawInstallation } from "@/lib/gateway/detect";
import { agents as mockAgents } from "@/lib/mock-data";

export async function GET() {
  try {
    const installed = await hasOpenClawInstallation();
    if (!installed) {
      return NextResponse.json({ data: mockAgents, source: "mock" });
    }

    const agents = await buildAgents();
    return NextResponse.json({ data: agents, source: "live" });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
            .replace(/\/Users\/[^\s]*/g, "[path]")
            .replace(/\/home\/[^\s]*/g, "[path]")
        : "Failed to build agents";
    return NextResponse.json({
      data: mockAgents,
      source: "mock",
      error: msg,
    });
  }
}
