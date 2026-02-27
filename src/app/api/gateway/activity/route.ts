import { NextResponse } from "next/server";
import { buildActivity } from "@/lib/gateway/activity-builder";
import { hasOpenClawInstallation } from "@/lib/gateway/detect";
import { activityFeed as mockActivity } from "@/lib/mock-data";

export async function GET() {
  try {
    const installed = await hasOpenClawInstallation();
    if (!installed) {
      return NextResponse.json({ data: mockActivity, source: "mock" });
    }

    const activity = await buildActivity();
    return NextResponse.json({ data: activity, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: mockActivity,
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to build activity",
    });
  }
}
