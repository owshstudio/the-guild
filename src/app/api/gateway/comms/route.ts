import { NextRequest, NextResponse } from "next/server";
import { buildComms, getMockComms } from "@/lib/gateway/comms-builder";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : 50;
  const after = searchParams.get("after") || undefined;

  try {
    const data = await buildComms({ from, to, limit, after });
    if (data.length === 0) {
      return NextResponse.json({
        data: getMockComms(),
        source: "mock",
      });
    }
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: getMockComms(),
      source: "mock",
      error:
        error instanceof Error ? error.message : "Failed to build comms",
    });
  }
}
