import { NextRequest, NextResponse } from "next/server";
import { findGuildSession } from "@/lib/gateway/filesystem";

export async function GET(request: NextRequest) {
  const agentId =
    request.nextUrl.searchParams.get("agentId") || "main";

  try {
    const result = await findGuildSession(agentId);

    if (result) {
      return NextResponse.json({ data: result, source: "live" });
    }

    return NextResponse.json({ data: null, source: "live" });
  } catch {
    return NextResponse.json({ data: null, source: "live" });
  }
}
