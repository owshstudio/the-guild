"use client";

import { useState } from "react";
import { useWebhooks } from "@/lib/data/use-webhooks";
import { WebhookList } from "@/components/webhooks/webhook-list";
import { WebhookModal } from "@/components/webhooks/webhook-modal";
import { WebhookDeliveryLogTable } from "@/components/webhooks/webhook-delivery-log";
import type { WebhookConfig } from "@/lib/types";

export default function WebhooksPage() {
  const {
    webhooks,
    deliveryLog,
    isLoading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  } = useWebhooks();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(
    null
  );
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingWebhook(null);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<WebhookConfig>) => {
    if (data.id) {
      await updateWebhook(data as Partial<WebhookConfig> & { id: string });
    } else {
      await createWebhook(data);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      await testWebhook(id);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (webhook: WebhookConfig) => {
    await updateWebhook({ id: webhook.id, enabled: !webhook.enabled });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2a2a2a] border-t-[#DF4F15]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Webhooks</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Configure HTTP callbacks for guild events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-[#1f1f1f] px-2.5 py-1 text-xs font-medium text-[#737373]">
            {webhooks.length} webhook{webhooks.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleAdd}
            className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Add Webhook
          </button>
        </div>
      </div>

      <WebhookList
        webhooks={webhooks}
        onEdit={handleEdit}
        onDelete={deleteWebhook}
        onTest={handleTest}
        onToggle={handleToggle}
        testingId={testingId}
      />

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-white">
          Delivery Log
        </h2>
        <WebhookDeliveryLogTable entries={deliveryLog} />
      </div>

      <WebhookModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        webhook={editingWebhook}
      />
    </div>
  );
}
