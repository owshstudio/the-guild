import { NextResponse } from "next/server";
import { buildAgents } from "@/lib/gateway/agent-builder";
import { agents as mockAgents } from "@/lib/mock-data";

export async function GET() {
  try {
    const agents = await buildAgents();
    if (agents.length === 0) {
      return NextResponse.json({ data: mockAgents, source: "mock", error: "No agents found" });
    }
    return NextResponse.json({ data: agents, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: mockAgents,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to build agents",
    });
  }
}
