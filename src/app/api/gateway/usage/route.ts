import { NextResponse } from "next/server";
import { aggregateUsage } from "@/lib/gateway/usage-aggregator";
import { hasOpenClawInstallation } from "@/lib/gateway/detect";
import { dailyUsage as mockUsage } from "@/lib/mock-data";

export async function GET() {
  try {
    const installed = await hasOpenClawInstallation();
    if (!installed) {
      return NextResponse.json({ data: mockUsage, source: "mock" });
    }

    const usage = await aggregateUsage();
    return NextResponse.json({ data: usage, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: mockUsage,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to aggregate usage",
    });
  }
}
