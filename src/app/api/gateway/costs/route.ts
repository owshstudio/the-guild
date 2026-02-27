import { NextRequest, NextResponse } from "next/server";
import { aggregateCosts } from "@/lib/gateway/cost-calculator";
import type { BudgetPeriod } from "@/lib/types";

const MOCK_COSTS = [
  { date: "Feb 22", agentId: "nyx", inputTokens: 32400, outputTokens: 21600, totalTokens: 54000, estimatedCost: 2.11, model: "claude-opus-4-6", sessionCount: 3 },
  { date: "Feb 23", agentId: "nyx", inputTokens: 21540, outputTokens: 14360, totalTokens: 35900, estimatedCost: 1.40, model: "claude-opus-4-6", sessionCount: 2 },
  { date: "Feb 24", agentId: "nyx", inputTokens: 34980, outputTokens: 23320, totalTokens: 58300, estimatedCost: 2.27, model: "claude-opus-4-6", sessionCount: 4 },
  { date: "Feb 25", agentId: "nyx", inputTokens: 43260, outputTokens: 28840, totalTokens: 72100, estimatedCost: 2.81, model: "claude-opus-4-6", sessionCount: 5 },
  { date: "Feb 26", agentId: "nyx", inputTokens: 29100, outputTokens: 19400, totalTokens: 48500, estimatedCost: 1.89, model: "claude-opus-4-6", sessionCount: 3 },
  { date: "Feb 26", agentId: "hemera", inputTokens: 1920, outputTokens: 1280, totalTokens: 3200, estimatedCost: 0.001, model: "gpt-4o-mini", sessionCount: 1 },
];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = (params.get("period") || "weekly") as BudgetPeriod;
  const agentFilter = params.get("agent");

  try {
    let costs = await aggregateCosts(period);

    if (agentFilter) {
      costs = costs.filter((c) => c.agentId === agentFilter);
    }

    if (costs.length === 0) {
      let mockFiltered = MOCK_COSTS;
      if (agentFilter) {
        mockFiltered = mockFiltered.filter((c) => c.agentId === agentFilter);
      }
      return NextResponse.json({ data: mockFiltered, source: "mock" });
    }

    return NextResponse.json({ data: costs, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: MOCK_COSTS,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to aggregate costs",
    });
  }
}
