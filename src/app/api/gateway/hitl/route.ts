import { NextRequest, NextResponse } from "next/server";
import {
  readHITLQueue,
  writeHITLQueue,
} from "@/lib/gateway/hitl-manager";
import type { HITLItem } from "@/lib/types";

export async function GET() {
  try {
    const data = await readHITLQueue();
    return NextResponse.json({ data: data.items, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: [],
      source: "mock",
      error:
        error instanceof Error ? error.message : "Failed to read HITL queue",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const queue = await readHITLQueue();

    const newItem: HITLItem = {
      id: `hitl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: body.type || "input",
      title: body.title || "Untitled request",
      description: body.description || "",
      agentId: body.agentId || "main",
      agentName: body.agentName || "Agent",
      agentEmoji: body.agentEmoji || "\u{1F916}",
      priority: body.priority || "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
      context: body.context || "",
      sessionId: body.sessionId,
    };

    queue.items.push(newItem);
    await writeHITLQueue(queue.items);

    return NextResponse.json({ data: queue.items, source: "live" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create HITL item",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Missing item id" },
        { status: 400 }
      );
    }

    const queue = await readHITLQueue();
    const idx = queue.items.findIndex((item) => item.id === body.id);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    if (body.status) queue.items[idx].status = body.status;
    if (body.response !== undefined) queue.items[idx].response = body.response;
    queue.items[idx].respondedAt = new Date().toISOString();

    await writeHITLQueue(queue.items);
    return NextResponse.json({ data: queue.items, source: "live" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update HITL item",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing item id" },
        { status: 400 }
      );
    }

    const queue = await readHITLQueue();
    queue.items = queue.items.filter((item) => item.id !== id);
    await writeHITLQueue(queue.items);

    return NextResponse.json({ data: queue.items, source: "live" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete HITL item",
      },
      { status: 500 }
    );
  }
}
