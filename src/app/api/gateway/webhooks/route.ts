import { NextRequest, NextResponse } from "next/server";
import { readWebhooks, writeWebhooks } from "@/lib/gateway/webhook-store";
import type { WebhookConfig } from "@/lib/types";

export async function GET() {
  try {
    const data = await readWebhooks();
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: { version: 1, webhooks: [], deliveryLog: [] },
      source: "mock",
      error: error instanceof Error ? error.message : "Failed to read webhooks",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await readWebhooks();

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      name: body.name || "Untitled Webhook",
      url: body.url || "",
      secret: body.secret || undefined,
      events: body.events || [],
      enabled: body.enabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.webhooks.push(webhook);
    await writeWebhooks(data);

    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create webhook" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await readWebhooks();

    const idx = data.webhooks.findIndex((w) => w.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    data.webhooks[idx] = {
      ...data.webhooks[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await writeWebhooks(data);
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing webhook id" }, { status: 400 });
    }

    const data = await readWebhooks();
    data.webhooks = data.webhooks.filter((w) => w.id !== id);
    await writeWebhooks(data);

    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete webhook" },
      { status: 500 }
    );
  }
}
