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
    return NextResponse.json({
      data: mockAgents,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to build agents",
    });
  }
}
