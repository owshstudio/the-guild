import { NextRequest, NextResponse } from "next/server";
import { aggregateCosts } from "@/lib/gateway/cost-calculator";
import { hasOpenClawInstallation } from "@/lib/gateway/detect";
import { mockCostEntries } from "@/lib/mock-data";
import type { BudgetPeriod } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = (params.get("period") || "weekly") as BudgetPeriod;
  const agentFilter = params.get("agent");

  try {
    const installed = await hasOpenClawInstallation();
    if (!installed) {
      return NextResponse.json({ data: mockCostEntries, source: "mock" });
    }

    let costs = await aggregateCosts(period);

    if (agentFilter) {
      costs = costs.filter((c) => c.agentId === agentFilter);
    }

    return NextResponse.json({ data: costs, source: "live" });
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
            .replace(/\/Users\/[^\s]*/g, "[path]")
            .replace(/\/home\/[^\s]*/g, "[path]")
        : "Failed to aggregate costs";
    return NextResponse.json({
      data: mockCostEntries,
      source: "mock",
      error: msg,
    });
  }
}
