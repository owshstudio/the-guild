import { NextRequest, NextResponse } from "next/server";
import { readWebhooks, writeWebhooks } from "@/lib/gateway/webhook-store";
import type { WebhookConfig } from "@/lib/types";
import {
  validateRequired,
  validateUrl,
  sanitizeErrorMessage,
} from "@/lib/gateway/validate";

export async function GET() {
  try {
    const data = await readWebhooks();
    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json({
      data: { version: 1, webhooks: [], deliveryLog: [] },
      source: "mock",
      error: sanitizeErrorMessage(error),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const missing = validateRequired(body, ["name", "url", "events"]);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    if (!Array.isArray(body.events)) {
      return NextResponse.json(
        { error: "events must be an array" },
        { status: 400 }
      );
    }

    if (!validateUrl(body.url)) {
      return NextResponse.json(
        { error: "Invalid webhook URL: must be http/https and not target internal addresses" },
        { status: 400 }
      );
    }

    const data = await readWebhooks();

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      name: body.name,
      url: body.url,
      secret: body.secret || undefined,
      events: body.events,
      enabled: body.enabled ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.webhooks.push(webhook);
    await writeWebhooks(data);

    return NextResponse.json({ data, source: "live" });
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(error) },
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

    // If url is being updated, validate it
    if (body.url !== undefined && !validateUrl(body.url)) {
      return NextResponse.json(
        { error: "Invalid webhook URL: must be http/https and not target internal addresses" },
        { status: 400 }
      );
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
      { error: sanitizeErrorMessage(error) },
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
      { error: sanitizeErrorMessage(error) },
      { status: 500 }
    );
  }
}
