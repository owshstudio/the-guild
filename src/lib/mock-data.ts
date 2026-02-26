import { Agent, ActivityEntry, Task, AgentUsageDay } from "./types";

export const agents: Agent[] = [
  {
    id: "nyx",
    name: "NYX",
    emoji: "\u{1F703}",
    status: "active",
    role: "Lead Agent / Orchestrator",
    description:
      "Sharp, loyal, mischievous. Named after the Greek goddess of night.",
    machine: "MacBook Pro",
    gateway: "localhost",
    model: "claude-opus-4-6",
    currentTask:
      "Manage OWSH operations, FB outreach orchestration, project builds",
    lastActivity: "Just now",
    skills: [
      "Web Search",
      "Browser Control",
      "File Management",
      "Code Generation",
      "WhatsApp Messaging",
      "Telegram Messaging",
      "Email (IMAP)",
      "Calendar",
      "Memory System",
      "Sub-Agent Spawning",
      "GitHub",
      "Vercel Deploy",
    ],
    color: "#7c3aed",
    accentColor: "#a78bfa",
    uptimeSince: "2026-02-02",
  },
  {
    id: "hemera",
    name: "HEMERA",
    emoji: "\u{2600}\uFE0F",
    status: "idle",
    role: "Outreach Operator",
    description:
      "Quiet, precise, patient. Named after the Greek goddess of day. NYX\u2019s first child.",
    machine: "LOKI PC (Win 11, i7-9700F, RTX 2060S)",
    gateway: "remote (not connected)",
    model: "gpt-4o-mini (pending switch)",
    currentTask: "105 prospects in outreach queue (pending deployment)",
    lastActivity: "Today",
    skills: [
      "FB Messenger Outreach",
      "Browser Relay",
      "Message Queue",
      "Status Reporting",
    ],
    color: "#d97706",
    accentColor: "#fbbf24",
    uptimeSince: "2026-02-26",
  },
];

export const activityFeed: ActivityEntry[] = [
  {
    id: "a1",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Built The Guild dashboard",
    detail:
      "Deployed The Guild v0.1 \u2014 full dashboard with pixel office, agent management, and task kanban.",
    timestamp: "2026-02-26T15:30:00Z",
    type: "task",
  },
  {
    id: "a2",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Sent 11 FB outreach DMs",
    detail:
      "Completed batch outreach to 11 prospects via Facebook Messenger. 9 delivered, 2 failed.",
    timestamp: "2026-02-26T14:15:00Z",
    type: "communication",
  },
  {
    id: "a3",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Managed HEMERA setup",
    detail:
      "Initialized HEMERA gateway on LOKI PC. Created identity files and SOUL.md.",
    timestamp: "2026-02-26T12:45:00Z",
    type: "system",
  },
  {
    id: "a4",
    agentId: "hemera",
    agentName: "HEMERA",
    agentEmoji: "\u{2600}\uFE0F",
    action: "Gateway initialized",
    detail:
      "OpenClaw gateway process started on LOKI PC. Awaiting model configuration.",
    timestamp: "2026-02-26T12:30:00Z",
    type: "system",
  },
  {
    id: "a5",
    agentId: "hemera",
    agentName: "HEMERA",
    agentEmoji: "\u{2600}\uFE0F",
    action: "Identity files created",
    detail:
      "SOUL.md and skill configurations generated. Awaiting model switch from gpt-4o-mini.",
    timestamp: "2026-02-26T12:35:00Z",
    type: "system",
  },
  {
    id: "a6",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Built Forge v0.1",
    detail:
      "Completed Forge build system \u2014 project scaffolding, template engine, and deployment pipeline.",
    timestamp: "2026-02-26T11:00:00Z",
    type: "task",
  },
  {
    id: "a7",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Checked emails",
    detail:
      "Processed inbox via IMAP. 3 new messages, 1 requiring action. Forwarded summary to admin.",
    timestamp: "2026-02-26T09:30:00Z",
    type: "task",
  },
  {
    id: "a8",
    agentId: "nyx",
    agentName: "NYX",
    agentEmoji: "\u{1F703}",
    action: "Verified prospects",
    detail:
      "Cross-referenced 15 outreach prospects against LinkedIn and company databases. 12 verified.",
    timestamp: "2026-02-26T08:45:00Z",
    type: "task",
  },
  {
    id: "a9",
    agentId: "hemera",
    agentName: "HEMERA",
    agentEmoji: "\u{2600}\uFE0F",
    action: "Awaiting model switch",
    detail:
      "Current model: gpt-4o-mini. Pending switch to claude-sonnet-4-5 for improved outreach quality.",
    timestamp: "2026-02-26T12:40:00Z",
    type: "system",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "The Guild v0.1 build",
    description:
      "Build the full Guild dashboard with pixel office, agent management, activity feed, and task kanban",
    agentId: "nyx",
    status: "completed",
    priority: "high",
    createdAt: "2026-02-25T10:00:00Z",
    dueDate: "2026-02-26T18:00:00Z",
  },
  {
    id: "t2",
    title: "Forge v0.1",
    description:
      "Build Forge scaffolding system \u2014 project templates, build pipeline, and deployment automation",
    agentId: "nyx",
    status: "completed",
    priority: "high",
    createdAt: "2026-02-24T08:00:00Z",
    dueDate: "2026-02-26T12:00:00Z",
  },
  {
    id: "t3",
    title: "Wire Guild to gateway",
    description:
      "Connect The Guild dashboard to OpenClaw gateway for live agent data, status, and task sync",
    agentId: "nyx",
    status: "in-progress",
    priority: "high",
    createdAt: "2026-02-26T14:00:00Z",
    dueDate: null,
  },
  {
    id: "t4",
    title: "HEMERA deployment",
    description:
      "Complete HEMERA agent deployment on LOKI PC \u2014 model switch, skill configs, and gateway connection",
    agentId: "nyx",
    status: "blocked",
    priority: "high",
    createdAt: "2026-02-26T12:00:00Z",
    dueDate: null,
  },
  {
    id: "t5",
    title: "Studio launch prep 3/3",
    description:
      "Final preparation for OWSH Studio launch \u2014 branding assets, landing page, and deployment",
    agentId: "nyx",
    status: "upcoming",
    priority: "medium",
    createdAt: "2026-02-26T08:00:00Z",
    dueDate: "2026-03-03T00:00:00Z",
  },
  {
    id: "t6",
    title: "Process outreach queue \u2014 105 prospects",
    description:
      "Execute Facebook Messenger outreach to 105 prospects in queue. Personalize messages and handle responses.",
    agentId: "hemera",
    status: "pending",
    priority: "high",
    createdAt: "2026-02-26T12:00:00Z",
    dueDate: null,
  },
  {
    id: "t7",
    title: "Send batch 1 retry \u2014 9 failed DMs",
    description:
      "Retry 9 failed Facebook DMs from initial outreach batch. Diagnose delivery failures.",
    agentId: "hemera",
    status: "pending",
    priority: "medium",
    createdAt: "2026-02-26T14:00:00Z",
    dueDate: null,
  },
  {
    id: "t8",
    title: "Daily outreach execution",
    description:
      "Recurring daily task: process outreach queue, send personalized DMs, log results, report status via Telegram.",
    agentId: "hemera",
    status: "recurring",
    priority: "medium",
    createdAt: "2026-02-26T08:00:00Z",
    dueDate: null,
  },
];

export const dailyUsage: AgentUsageDay[] = [
  { date: "Feb 13", nyx: 45200, hemera: 0 },
  { date: "Feb 14", nyx: 52100, hemera: 0 },
  { date: "Feb 15", nyx: 38400, hemera: 0 },
  { date: "Feb 16", nyx: 29800, hemera: 0 },
  { date: "Feb 17", nyx: 61300, hemera: 0 },
  { date: "Feb 18", nyx: 47600, hemera: 0 },
  { date: "Feb 19", nyx: 55100, hemera: 0 },
  { date: "Feb 20", nyx: 43700, hemera: 0 },
  { date: "Feb 21", nyx: 68200, hemera: 0 },
  { date: "Feb 22", nyx: 51400, hemera: 0 },
  { date: "Feb 23", nyx: 35900, hemera: 0 },
  { date: "Feb 24", nyx: 58300, hemera: 0 },
  { date: "Feb 25", nyx: 72100, hemera: 0 },
  { date: "Feb 26", nyx: 48500, hemera: 3200 },
];
