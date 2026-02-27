"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgents } from "@/lib/data/use-agents";
import type {
  CronJob,
  CronSchedule,
  CronPayload,
  CronDelivery,
} from "@/lib/types";

interface CronJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Omit<CronJob, "id" | "createdAt" | "updatedAt"> | CronJob) => void;
  editJob?: CronJob | null;
}

const INTERVAL_PRESETS = [
  { label: "15 min", ms: 15 * 60_000 },
  { label: "30 min", ms: 30 * 60_000 },
  { label: "1 hr", ms: 60 * 60_000 },
  { label: "4 hr", ms: 4 * 60 * 60_000 },
  { label: "12 hr", ms: 12 * 60 * 60_000 },
  { label: "24 hr", ms: 24 * 60 * 60_000 },
];

export function CronJobModal({ isOpen, onClose, onSave, editJob }: CronJobModalProps) {
  const { agents } = useAgents();

  const [name, setName] = useState("");
  const [scheduleType, setScheduleType] = useState<"every" | "at">("every");
  const [intervalMs, setIntervalMs] = useState(30 * 60_000);
  const [atDatetime, setAtDatetime] = useState("");
  const [agentId, setAgentId] = useState(agents[0]?.id || "main");
  const [sessionTarget, setSessionTarget] = useState("new");
  const [wakeMode, setWakeMode] = useState("auto");
  const [payloadKind, setPayloadKind] = useState<"agentTurn" | "systemEvent">("agentTurn");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventMessage, setEventMessage] = useState("");
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryChannel, setDeliveryChannel] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deleteAfterRun, setDeleteAfterRun] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editJob) {
      setName(editJob.name);
      setScheduleType(editJob.schedule.type);
      if (editJob.schedule.type === "every") {
        setIntervalMs(editJob.schedule.intervalMs);
      } else {
        setAtDatetime(editJob.schedule.at);
      }
      setAgentId(editJob.agentId);
      setSessionTarget(editJob.sessionTarget);
      setWakeMode(editJob.wakeMode);
      setPayloadKind(editJob.payload.kind);
      setDescription(editJob.payload.description);
      if (editJob.payload.kind === "agentTurn") {
        setSystemPrompt(editJob.payload.systemPrompt || "");
        setUserPrompt(editJob.payload.userPrompt || "");
      } else {
        setEventType(editJob.payload.event.type);
        setEventMessage(editJob.payload.event.message);
      }
      if (editJob.delivery) {
        setDeliveryEnabled(true);
        setDeliveryChannel(editJob.delivery.channel);
        setDeliveryAddress(editJob.delivery.address);
      } else {
        setDeliveryEnabled(false);
      }
      setDeleteAfterRun(editJob.deleteAfterRun || false);
    } else {
      setName("");
      setScheduleType("every");
      setIntervalMs(30 * 60_000);
      setAtDatetime("");
      setAgentId(agents[0]?.id || "main");
      setSessionTarget("new");
      setWakeMode("auto");
      setPayloadKind("agentTurn");
      setDescription("");
      setSystemPrompt("");
      setUserPrompt("");
      setEventType("");
      setEventMessage("");
      setDeliveryEnabled(false);
      setDeliveryChannel("");
      setDeliveryAddress("");
      setDeleteAfterRun(false);
    }
  }, [editJob, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) return;
    setIsSaving(true);

    const schedule: CronSchedule =
      scheduleType === "every"
        ? { type: "every", intervalMs }
        : { type: "at", at: atDatetime };

    const payload: CronPayload =
      payloadKind === "agentTurn"
        ? {
            kind: "agentTurn",
            description,
            ...(systemPrompt && { systemPrompt }),
            ...(userPrompt && { userPrompt }),
          }
        : {
            kind: "systemEvent",
            description,
            event: { type: eventType, message: eventMessage },
          };

    const delivery: CronDelivery | undefined = deliveryEnabled
      ? { type: "channel", channel: deliveryChannel, address: deliveryAddress }
      : undefined;

    const job = {
      ...(editJob ? { id: editJob.id, createdAt: editJob.createdAt, updatedAt: editJob.updatedAt } : {}),
      agentId,
      name: name.trim(),
      enabled: editJob?.enabled ?? true,
      schedule,
      sessionTarget,
      wakeMode,
      payload,
      delivery,
      deleteAfterRun,
      status: editJob?.status,
    };

    onSave(job as CronJob);
    setIsSaving(false);
    onClose();
  };

  const inputClass =
    "w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#DF4F15] focus:outline-none";
  const labelClass = "mb-1.5 block text-xs font-medium text-[#737373]";

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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#2a2a2a] bg-[#141414] shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-[#141414] border-b border-[#1f1f1f] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {editJob ? "Edit Cron Job" : "New Cron Job"}
              </h2>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Name */}
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily outreach batch"
                  className={inputClass}
                />
              </div>

              {/* Schedule */}
              <div>
                <label className={labelClass}>Schedule</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setScheduleType("every")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      scheduleType === "every"
                        ? "bg-white/10 text-white"
                        : "text-[#737373] hover:text-[#a3a3a3]"
                    }`}
                  >
                    Recurring
                  </button>
                  <button
                    onClick={() => setScheduleType("at")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      scheduleType === "at"
                        ? "bg-white/10 text-white"
                        : "text-[#737373] hover:text-[#a3a3a3]"
                    }`}
                  >
                    One-time
                  </button>
                </div>

                {scheduleType === "every" ? (
                  <div className="flex flex-wrap gap-2">
                    {INTERVAL_PRESETS.map((p) => (
                      <button
                        key={p.ms}
                        onClick={() => setIntervalMs(p.ms)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          intervalMs === p.ms
                            ? "border-[#DF4F15]/50 bg-[#DF4F15]/10 text-white"
                            : "border-[#1f1f1f] text-[#737373] hover:border-[#2a2a2a] hover:text-[#a3a3a3]"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={atDatetime}
                    onChange={(e) => setAtDatetime(e.target.value)}
                    className={inputClass + " [color-scheme:dark]"}
                  />
                )}
              </div>

              {/* Agent */}
              <div>
                <label className={labelClass}>Agent</label>
                <div className="flex gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setAgentId(agent.id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        agentId === agent.id
                          ? "border-[#DF4F15]/50 bg-[#DF4F15]/10 text-white"
                          : "border-[#1f1f1f] text-[#737373] hover:border-[#2a2a2a] hover:text-[#a3a3a3]"
                      }`}
                    >
                      <span>{agent.emoji}</span>
                      <span className="font-medium">{agent.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session target */}
              <div>
                <label className={labelClass}>Session Target</label>
                <input
                  value={sessionTarget}
                  onChange={(e) => setSessionTarget(e.target.value)}
                  placeholder="new, active, or session ID"
                  className={inputClass}
                />
              </div>

              {/* Wake mode */}
              <div>
                <label className={labelClass}>Wake Mode</label>
                <div className="flex gap-2">
                  {["auto", "always", "if-idle"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setWakeMode(mode)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        wakeMode === mode
                          ? "bg-white/10 text-white"
                          : "text-[#737373] hover:text-[#a3a3a3]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payload */}
              <div>
                <label className={labelClass}>Payload Type</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setPayloadKind("agentTurn")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      payloadKind === "agentTurn"
                        ? "bg-white/10 text-white"
                        : "text-[#737373] hover:text-[#a3a3a3]"
                    }`}
                  >
                    Agent Turn
                  </button>
                  <button
                    onClick={() => setPayloadKind("systemEvent")}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      payloadKind === "systemEvent"
                        ? "bg-white/10 text-white"
                        : "text-[#737373] hover:text-[#a3a3a3]"
                    }`}
                  >
                    System Event
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What this job does"
                      className={inputClass}
                    />
                  </div>

                  {payloadKind === "agentTurn" ? (
                    <>
                      <div>
                        <label className={labelClass}>System Prompt (optional)</label>
                        <textarea
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          placeholder="Override system prompt..."
                          className={inputClass + " resize-none"}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>User Prompt (optional)</label>
                        <textarea
                          value={userPrompt}
                          onChange={(e) => setUserPrompt(e.target.value)}
                          placeholder="Message to send to agent..."
                          className={inputClass + " resize-none"}
                          rows={2}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className={labelClass}>Event Type</label>
                        <input
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          placeholder="e.g. health-check"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Event Message</label>
                        <input
                          value={eventMessage}
                          onChange={(e) => setEventMessage(e.target.value)}
                          placeholder="Event payload message"
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Delivery channel */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                    className="relative h-4 w-7 rounded-full transition-colors"
                    style={{ backgroundColor: deliveryEnabled ? "#22c55e" : "#2a2a2a" }}
                  >
                    <span
                      className="absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform"
                      style={{ left: deliveryEnabled ? "13px" : "2px" }}
                    />
                  </button>
                  <span className="text-xs font-medium text-[#737373]">Delivery Channel</span>
                </div>
                {deliveryEnabled && (
                  <div className="flex gap-2">
                    <input
                      value={deliveryChannel}
                      onChange={(e) => setDeliveryChannel(e.target.value)}
                      placeholder="Channel name"
                      className={inputClass}
                    />
                    <input
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Address"
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              {/* Delete after run */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteAfterRun(!deleteAfterRun)}
                  className={`h-4 w-4 rounded border transition ${
                    deleteAfterRun
                      ? "border-[#DF4F15] bg-[#DF4F15]"
                      : "border-[#2a2a2a] bg-transparent"
                  }`}
                >
                  {deleteAfterRun && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-xs text-[#737373]">Delete after run (one-shot)</span>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-[#1f1f1f] bg-[#141414] px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-[#737373] transition hover:text-[#a3a3a3]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !description.trim()}
                className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editJob ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
