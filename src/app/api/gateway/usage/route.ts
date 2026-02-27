import { NextResponse } from "next/server";
import { aggregateUsage } from "@/lib/gateway/usage-aggregator";
import { dailyUsage as mockUsage } from "@/lib/mock-data";

export async function GET() {
  try {
    const usage = await aggregateUsage();
    if (usage.length === 0) {
      return NextResponse.json({ data: mockUsage, source: "mock", error: "No usage data" });
    }
    return NextResponse.json({ data: usage, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: mockUsage,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to aggregate usage",
    });
  }
}
