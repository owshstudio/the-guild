import { NextResponse } from "next/server";
import { buildActivity } from "@/lib/gateway/activity-builder";
import { activityFeed as mockActivity } from "@/lib/mock-data";

export async function GET() {
  try {
    const activity = await buildActivity();
    if (activity.length === 0) {
      return NextResponse.json({ data: mockActivity, source: "mock", error: "No activity found" });
    }
    return NextResponse.json({ data: activity, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: mockActivity,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to build activity",
    });
  }
}
