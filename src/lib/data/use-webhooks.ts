"use client";

import { useState, useEffect, useCallback } from "react";
import type { WebhookConfig, WebhookDeliveryLog } from "@/lib/types";

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [deliveryLog, setDeliveryLog] = useState<WebhookDeliveryLog[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/gateway/webhooks");
      const json = await res.json();
      const data = json.data || { webhooks: [], deliveryLog: [] };
      setWebhooks(data.webhooks || []);
      setDeliveryLog(data.deliveryLog || []);
      setIsLive(json.source === "live");
    } catch {
      setWebhooks([]);
      setDeliveryLog([]);
      setIsLive(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWebhooks();
    const interval = setInterval(fetchWebhooks, 60000);
    return () => clearInterval(interval);
  }, [fetchWebhooks]);

  const createWebhook = useCallback(
    async (data: Partial<WebhookConfig>) => {
      await fetch("/api/gateway/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchWebhooks();
    },
    [fetchWebhooks]
  );

  const updateWebhook = useCallback(
    async (data: Partial<WebhookConfig> & { id: string }) => {
      await fetch("/api/gateway/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await fetchWebhooks();
    },
    [fetchWebhooks]
  );

  const deleteWebhook = useCallback(
    async (id: string) => {
      await fetch(`/api/gateway/webhooks?id=${id}`, { method: "DELETE" });
      await fetchWebhooks();
    },
    [fetchWebhooks]
  );

  const testWebhook = useCallback(
    async (id: string) => {
      const res = await fetch("/api/gateway/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookId: id }),
      });
      const json = await res.json();
      await fetchWebhooks();
      return json.data;
    },
    [fetchWebhooks]
  );

  return {
    webhooks,
    deliveryLog,
    isLive,
    isLoading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
}
