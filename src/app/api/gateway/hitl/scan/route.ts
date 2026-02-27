import { NextResponse } from "next/server";
import {
  readHITLQueue,
  writeHITLQueue,
  scanSessionsForHITL,
} from "@/lib/gateway/hitl-manager";

export async function POST() {
  try {
    const queue = await readHITLQueue();
    const scanned = await scanSessionsForHITL();

    // Deduplicate: skip items that share sessionId + detectedPattern with existing items
    const existingKeys = new Set(
      queue.items
        .filter((item) => item.sessionId && item.detectedPattern)
        .map((item) => `${item.sessionId}::${item.detectedPattern}`)
    );

    const newItems = scanned.filter((item) => {
      if (!item.sessionId || !item.detectedPattern) return true;
      const key = `${item.sessionId}::${item.detectedPattern}`;
      if (existingKeys.has(key)) return false;
      existingKeys.add(key);
      return true;
    });

    if (newItems.length > 0) {
      queue.items.push(...newItems);
      await writeHITLQueue(queue.items);
    }

    return NextResponse.json({
      data: queue.items,
      newCount: newItems.length,
      source: "live",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to scan sessions",
      },
      { status: 500 }
    );
  }
}
