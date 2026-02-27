import { createHmac } from "crypto";
import type { WebhookConfig, WebhookDeliveryLog } from "@/lib/types";

export async function fireWebhook(
  webhook: WebhookConfig,
  event: string,
  payload: object
): Promise<WebhookDeliveryLog> {
  const body = JSON.stringify({ event, payload, webhookId: webhook.id });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (webhook.secret) {
    const hmac = createHmac("sha256", webhook.secret);
    hmac.update(body);
    headers["X-Guild-Signature"] = hmac.digest("hex");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    return {
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      event,
      statusCode: res.status,
      success: res.status >= 200 && res.status < 300,
      timestamp: new Date().toISOString(),
      error: res.ok ? undefined : `HTTP ${res.status} ${res.statusText}`,
    };
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      event,
      statusCode: 0,
      success: false,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
