import {
  Agent,
  ActivityEntry,
  Task,
  AgentUsageDay,
  Team,
  CommMessage,
  HITLItem,
  AgentCostEntry,
  TaskChain,
} from "./types";

// Generic demo agent shown only when ~/.openclaw/ doesn't exist
export const agents: Agent[] = [
  {
    id: "demo",
    name: "Demo Agent",
    emoji: "\u{1F916}",
    status: "stopped",
    role: "Demo Agent",
    description:
      "This is a demo agent. Install OpenClaw and run it to see your real agents here.",
    machine: "localhost",
    gateway: "localhost",
    model: "claude-opus-4-6",
    currentTask: null,
    lastActivity: "N/A",
    skills: [
      "File Management",
      "Code Generation",
      "Web Search",
      "Memory System",
    ],
    color: "#6b7280",
    accentColor: "#9ca3af",
    uptimeSince: new Date().toISOString().slice(0, 10),
  },
];

export const activityFeed: ActivityEntry[] = [
  {
    id: "demo-a1",
    agentId: "demo",
    agentName: "Demo Agent",
    agentEmoji: "\u{1F916}",
    action: "No activity yet",
    detail:
      "Install OpenClaw and start a session to see real agent activity here.",
    timestamp: new Date().toISOString(),
    type: "system",
  },
];

export const tasks: Task[] = [
  {
    id: "demo-t1",
    title: "Set up OpenClaw",
    description:
      "Install OpenClaw to start using The Guild with your real AI agents.",
    agentId: "demo",
    status: "pending",
    priority: "high",
    createdAt: new Date().toISOString(),
    dueDate: null,
  },
];

export const dailyUsage: AgentUsageDay[] = [
  { date: "Today", demo: 0 },
];

export const mockTeams: Team[] = [];

export const mockComms: CommMessage[] = [];

export const mockHITLItems: HITLItem[] = [];

export const mockCostEntries: AgentCostEntry[] = [];

export const mockChains: TaskChain[] = [];
