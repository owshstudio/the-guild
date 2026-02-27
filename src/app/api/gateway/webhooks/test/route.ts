import { NextRequest, NextResponse } from "next/server";
import { readWebhooks, appendDeliveryLog } from "@/lib/gateway/webhook-store";
import { fireWebhook } from "@/lib/gateway/webhook-dispatcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookId } = body;

    if (!webhookId) {
      return NextResponse.json({ error: "Missing webhookId" }, { status: 400 });
    }

    const data = await readWebhooks();
    const webhook = data.webhooks.find((w) => w.id === webhookId);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const entry = await fireWebhook(webhook, "test", {
      test: true,
      timestamp: new Date().toISOString(),
    });

    await appendDeliveryLog(entry);

    return NextResponse.json({ data: entry, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to test webhook" },
      { status: 500 }
    );
  }
}
