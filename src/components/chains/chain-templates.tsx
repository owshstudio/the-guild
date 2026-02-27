"use client";

import type { TaskChain, ChainStep } from "@/lib/types";

interface TemplateDefinition {
  name: string;
  description: string;
  steps: Omit<ChainStep, "id">[];
}

const TEMPLATES: TemplateDefinition[] = [
  {
    name: "Daily Outreach Pipeline",
    description: "Check prospects, send DMs, and report results",
    steps: [
      {
        order: 0,
        name: "Check prospects",
        trigger: { type: "manual" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Check prospect queue", taskDescription: "Review and validate outreach prospect list" },
        status: "pending",
        onFailure: "stop",
        maxRetries: 0,
        retryCount: 0,
      },
      {
        order: 1,
        name: "Send DMs",
        trigger: { type: "task-complete" },
        action: { type: "start-task", agentId: "hemera", taskTitle: "Send outreach DMs", taskDescription: "Process and send personalized DMs to verified prospects" },
        status: "pending",
        onFailure: "retry",
        maxRetries: 2,
        retryCount: 0,
      },
      {
        order: 2,
        name: "Report results",
        trigger: { type: "task-complete" },
        action: { type: "notify-human", message: "Outreach batch complete. Check results dashboard." },
        status: "pending",
        onFailure: "skip",
        maxRetries: 0,
        retryCount: 0,
      },
    ],
  },
  {
    name: "Deploy and Verify",
    description: "Run tests, build, deploy, and health check",
    steps: [
      {
        order: 0,
        name: "Run tests",
        trigger: { type: "manual" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Run test suite", taskDescription: "Execute all unit and integration tests" },
        status: "pending",
        onFailure: "stop",
        maxRetries: 0,
        retryCount: 0,
      },
      {
        order: 1,
        name: "Build project",
        trigger: { type: "task-complete" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Build production", taskDescription: "Create production build" },
        status: "pending",
        onFailure: "stop",
        maxRetries: 0,
        retryCount: 0,
      },
      {
        order: 2,
        name: "Deploy",
        trigger: { type: "task-complete" },
        action: { type: "webhook", webhookUrl: "https://api.vercel.com/v1/deploy" },
        status: "pending",
        onFailure: "stop",
        maxRetries: 0,
        retryCount: 0,
      },
      {
        order: 3,
        name: "Health check",
        trigger: { type: "time-based", cronExpression: "2" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Health check", taskDescription: "Verify deployment is healthy and responding" },
        status: "pending",
        onFailure: "retry",
        maxRetries: 3,
        retryCount: 0,
      },
    ],
  },
  {
    name: "Research and Report",
    description: "Web search, compile report, and notify human",
    steps: [
      {
        order: 0,
        name: "Web search",
        trigger: { type: "manual" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Research topic", taskDescription: "Conduct web search and gather information" },
        status: "pending",
        onFailure: "stop",
        maxRetries: 0,
        retryCount: 0,
      },
      {
        order: 1,
        name: "Compile report",
        trigger: { type: "task-complete" },
        action: { type: "start-task", agentId: "nyx", taskTitle: "Compile findings", taskDescription: "Organize and compile research findings into a report" },
        status: "pending",
        onFailure: "retry",
        maxRetries: 1,
        retryCount: 0,
      },
      {
        order: 2,
        name: "Notify human",
        trigger: { type: "task-complete" },
        action: { type: "notify-human", message: "Research report ready for review." },
        status: "pending",
        onFailure: "skip",
        maxRetries: 0,
        retryCount: 0,
      },
    ],
  },
];

interface ChainTemplatesProps {
  onSelect: (chain: TaskChain) => void;
}

export default function ChainTemplates({ onSelect }: ChainTemplatesProps) {
  function createFromTemplate(template: TemplateDefinition) {
    const chain: TaskChain = {
      id: `chain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      description: template.description,
      status: "draft",
      steps: template.steps.map((s, i) => ({
        ...s,
        id: `step-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      createdAt: new Date().toISOString(),
      isTemplate: false,
    };
    onSelect(chain);
  }

  function createBlank() {
    const chain: TaskChain = {
      id: `chain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: "New Chain",
      description: "",
      status: "draft",
      steps: [],
      createdAt: new Date().toISOString(),
      isTemplate: false,
    };
    onSelect(chain);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1f1f1f] bg-[#141414] p-6">
        <h3 className="mb-2 text-lg font-semibold text-white">New Chain</h3>
        <p className="mb-6 text-sm text-[#737373]">
          Start from a template or create a blank chain
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => createFromTemplate(template)}
              className="group rounded-xl border border-[#1f1f1f] p-4 text-left transition hover:border-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(#141414, #141414), linear-gradient(135deg, #DF4F15, #F9425F, #A326B5)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
              }}
            >
              <h4 className="text-sm font-semibold text-[#e5e5e5] group-hover:text-white">
                {template.name}
              </h4>
              <p className="mt-1 text-xs text-[#737373]">
                {template.description}
              </p>
              <p className="mt-2 text-[10px] text-[#525252]">
                {template.steps.length} steps
              </p>
            </button>
          ))}

          <button
            onClick={createBlank}
            className="rounded-xl border border-dashed border-[#2a2a2a] p-4 text-left transition hover:border-[#3a3a3a]"
          >
            <h4 className="text-sm font-semibold text-[#737373]">
              Blank Chain
            </h4>
            <p className="mt-1 text-xs text-[#525252]">
              Start from scratch
            </p>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={createBlank}
            className="rounded-lg border border-[#1f1f1f] px-4 py-2 text-sm text-[#737373] transition hover:bg-[#1f1f1f]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
