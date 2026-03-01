"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WebhookConfig, WebhookEventType } from "@/lib/types";

const ALL_EVENTS: WebhookEventType[] = [
  "session.start",
  "session.end",
  "session.error",
  "task.complete",
  "cron.run",
];

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<WebhookConfig>) => void;
  webhook?: WebhookConfig | null;
}

export function WebhookModal({
  isOpen,
  onClose,
  onSave,
  webhook,
}: WebhookModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [events, setEvents] = useState<WebhookEventType[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [urlError, setUrlError] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    // Sync form state from webhook prop
    /* eslint-disable react-hooks/set-state-in-effect */
    if (webhook) {
      setName(webhook.name);
      setUrl(webhook.url);
      setSecret(webhook.secret || "");
      setEvents([...webhook.events]);
      setEnabled(webhook.enabled);
    } else {
      setName("");
      setUrl("");
      setSecret("");
      setEvents([]);
      setEnabled(true);
    }
    setShowSecret(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [webhook, isOpen]);

  const toggleEvent = (event: WebhookEventType) => {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError("");
      return;
    }
    try {
      const parsed = new URL(value.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        setUrlError("URL must use http:// or https://");
      } else {
        setUrlError("");
      }
    } catch {
      setUrlError("Invalid URL format");
    }
  };

  const handleSave = () => {
    const data: Partial<WebhookConfig> = {
      name: name.trim() || "Untitled Webhook",
      url: url.trim(),
      secret: secret.trim() || undefined,
      events,
      enabled,
    };
    if (webhook) {
      data.id = webhook.id;
    }
    onSave(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={webhook ? "Edit webhook" : "Add webhook"}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2a2a2a] bg-[#141414] p-6 shadow-2xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              {webhook ? "Edit Webhook" : "Add Webhook"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#737373]">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Webhook"
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#737373]">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    validateUrl(e.target.value);
                  }}
                  placeholder="https://example.com/webhook"
                  className={`w-full rounded-lg border bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-[#e5e5e5] placeholder-[#525252] focus:outline-none ${
                    urlError
                      ? "border-red-500/60 focus:border-red-500"
                      : "border-[#2a2a2a] focus:border-[#DF4F15]"
                  }`}
                />
                {urlError && (
                  <p className="mt-1 text-xs text-red-400">{urlError}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#737373]">
                  Events
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_EVENTS.map((event) => (
                    <button
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                        events.includes(event)
                          ? "border-[#DF4F15]/50 bg-[#DF4F15]/10 text-[#DF4F15]"
                          : "border-[#2a2a2a] bg-[#0a0a0a] text-[#737373] hover:border-[#3a3a3a] hover:text-[#a3a3a3]"
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#737373]">
                  Secret (optional)
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="webhook-secret-key"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 pr-16 font-mono text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-0.5 text-[10px] font-medium text-[#737373] transition hover:text-[#a3a3a3]"
                  >
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#737373]">
                  Enabled
                </label>
                <button
                  onClick={() => setEnabled(!enabled)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    enabled ? "bg-[#22c55e]" : "bg-[#2a2a2a]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      enabled ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!url.trim() || !!urlError || events.length === 0}
                className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {webhook ? "Save Changes" : "Create Webhook"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
