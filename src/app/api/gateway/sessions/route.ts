import { NextResponse } from "next/server";
import { listSessions, getSessionQuickMeta } from "@/lib/gateway/filesystem";

export async function GET() {
  try {
    const sessions = await listSessions();
    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const meta = await getSessionQuickMeta(s.filepath);
        return {
          id: s.id,
          size: s.size,
          lastModified: s.lastModified.toISOString(),
          isActive: s.isActive,
          messageCount: meta.messageCount,
          duration: meta.duration,
          model: meta.model,
          preview: meta.preview,
        };
      })
    );
    return NextResponse.json({ data: enriched, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error:
        error instanceof Error ? error.message : "Failed to list sessions",
    });
  }
}
