import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";
import type { WebhookData, WebhookDeliveryLog } from "@/lib/types";

function getDefaultData(): WebhookData {
  return { version: 1, webhooks: [], deliveryLog: [] };
}

async function getWebhookPath(): Promise<string> {
  const config = await getConfig();
  return path.join(config.workspacePath, "guild-webhooks.json");
}

export async function readWebhooks(): Promise<WebhookData> {
  try {
    const filePath = await getWebhookPath();
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as WebhookData;
  } catch {
    return getDefaultData();
  }
}

export async function writeWebhooks(data: WebhookData): Promise<void> {
  const filePath = await getWebhookPath();
  const dir = path.dirname(filePath);
  const tmpPath = filePath + ".tmp";

  await mkdir(dir, { recursive: true });
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}

export async function appendDeliveryLog(
  entry: WebhookDeliveryLog
): Promise<void> {
  const data = await readWebhooks();
  data.deliveryLog.push(entry);
  // Keep last 50 entries
  if (data.deliveryLog.length > 50) {
    data.deliveryLog = data.deliveryLog.slice(-50);
  }
  await writeWebhooks(data);
}
