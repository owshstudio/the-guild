"use client";

import { useState } from "react";
import type {
  ChainStep,
  ChainTriggerType,
  ChainActionType,
} from "@/lib/types";

const TRIGGER_TYPES: { value: ChainTriggerType; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "task-complete", label: "Task Complete" },
  { value: "time-based", label: "Time-Based" },
  { value: "event-based", label: "Event-Based" },
];

const ACTION_TYPES: { value: ChainActionType; label: string }[] = [
  { value: "start-task", label: "Start Task" },
  { value: "send-message", label: "Send Message" },
  { value: "run-cron", label: "Run Cron" },
  { value: "webhook", label: "Webhook" },
  { value: "notify-human", label: "Notify Human" },
];

const AGENTS = [
  { id: "nyx", name: "NYX" },
  { id: "hemera", name: "HEMERA" },
];

interface ChainStepEditorProps {
  step: ChainStep;
  onSave: (step: ChainStep) => void;
  onCancel: () => void;
}

export default function ChainStepEditor({
  step,
  onSave,
  onCancel,
}: ChainStepEditorProps) {
  const [name, setName] = useState(step.name);
  const [triggerType, setTriggerType] = useState<ChainTriggerType>(step.trigger.type);
  const [taskId, setTaskId] = useState(step.trigger.taskId || "");
  const [delay, setDelay] = useState(step.trigger.cronExpression || "");
  const [eventName, setEventName] = useState(step.trigger.eventName || "");
  const [actionType, setActionType] = useState<ChainActionType>(step.action.type);
  const [agentId, setAgentId] = useState(step.action.agentId || "nyx");
  const [taskTitle, setTaskTitle] = useState(step.action.taskTitle || "");
  const [taskDescription, setTaskDescription] = useState(step.action.taskDescription || "");
  const [message, setMessage] = useState(step.action.message || "");
  const [cronJobId, setCronJobId] = useState(step.action.cronJobId || "");
  const [webhookUrl, setWebhookUrl] = useState(step.action.webhookUrl || "");
  const [onFailure, setOnFailure] = useState<"stop" | "skip" | "retry">(step.onFailure);
  const [maxRetries, setMaxRetries] = useState(step.maxRetries);

  function handleSave() {
    onSave({
      ...step,
      name,
      trigger: {
        type: triggerType,
        ...(triggerType === "task-complete" && { taskId }),
        ...(triggerType === "time-based" && { cronExpression: delay }),
        ...(triggerType === "event-based" && { eventName }),
      },
      action: {
        type: actionType,
        ...(["start-task", "send-message"].includes(actionType) && { agentId }),
        ...(actionType === "start-task" && { taskTitle, taskDescription }),
        ...(actionType === "send-message" && { message }),
        ...(actionType === "notify-human" && { message }),
        ...(actionType === "run-cron" && { cronJobId }),
        ...(actionType === "webhook" && { webhookUrl }),
      },
      onFailure,
      maxRetries: onFailure === "retry" ? maxRetries : 0,
    });
  }

  const inputCls =
    "w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#525252] focus:border-[#2a2a2a] focus:outline-none";
  const labelCls = "mb-1 block text-xs font-medium text-[#737373]";
  const selectCls =
    "w-full rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2 text-sm text-[#e5e5e5] focus:border-[#2a2a2a] focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#1f1f1f] bg-[#141414] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Edit Step</h3>

        {/* Name */}
        <div className="mb-4">
          <label className={labelCls}>Step Name</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Step name..."
          />
        </div>

        {/* Trigger */}
        <div className="mb-4">
          <label className={labelCls}>Trigger Type</label>
          <select
            className={selectCls}
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as ChainTriggerType)}
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {triggerType === "task-complete" && (
          <div className="mb-4">
            <label className={labelCls}>Task ID</label>
            <input
              className={inputCls}
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="e.g. t1"
            />
          </div>
        )}

        {triggerType === "time-based" && (
          <div className="mb-4">
            <label className={labelCls}>Delay (minutes)</label>
            <input
              className={inputCls}
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>
        )}

        {triggerType === "event-based" && (
          <div className="mb-4">
            <label className={labelCls}>Event Name</label>
            <input
              className={inputCls}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. deploy.success"
            />
          </div>
        )}

        {/* Action */}
        <div className="mb-4">
          <label className={labelCls}>Action Type</label>
          <select
            className={selectCls}
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ChainActionType)}
          >
            {ACTION_TYPES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {["start-task", "send-message"].includes(actionType) && (
          <div className="mb-4">
            <label className={labelCls}>Agent</label>
            <select
              className={selectCls}
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {actionType === "start-task" && (
          <>
            <div className="mb-4">
              <label className={labelCls}>Task Title</label>
              <input
                className={inputCls}
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title..."
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Task Description</label>
              <textarea
                className={inputCls + " resize-none"}
                rows={2}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task description..."
              />
            </div>
          </>
        )}

        {(actionType === "send-message" || actionType === "notify-human") && (
          <div className="mb-4">
            <label className={labelCls}>Message</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message content..."
            />
          </div>
        )}

        {actionType === "run-cron" && (
          <div className="mb-4">
            <label className={labelCls}>Cron Job ID</label>
            <input
              className={inputCls}
              value={cronJobId}
              onChange={(e) => setCronJobId(e.target.value)}
              placeholder="e.g. cron-001"
            />
          </div>
        )}

        {actionType === "webhook" && (
          <div className="mb-4">
            <label className={labelCls}>Webhook URL</label>
            <input
              className={inputCls}
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        {/* On Failure */}
        <div className="mb-4">
          <label className={labelCls}>On Failure</label>
          <div className="flex gap-4">
            {(["stop", "skip", "retry"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-[#a3a3a3]">
                <input
                  type="radio"
                  name="onFailure"
                  checked={onFailure === opt}
                  onChange={() => setOnFailure(opt)}
                  className="accent-[#7c3aed]"
                />
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {onFailure === "retry" && (
          <div className="mb-4">
            <label className={labelCls}>Max Retries</label>
            <input
              className={inputCls}
              type="number"
              min={1}
              max={10}
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#1f1f1f] px-4 py-2 text-sm text-[#737373] transition hover:bg-[#1f1f1f]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-gradient-to-r from-[#DF4F15] via-[#F9425F] to-[#A326B5] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Save Step
          </button>
        </div>
      </div>
    </div>
  );
}
