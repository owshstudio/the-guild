export type AgentStatus = "active" | "idle" | "stopped";

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  role: string;
  description: string;
  machine: string;
  currentTask: string | null;
  lastActivity: string;
  skills: string[];
  color: string;
  accentColor: string;
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  action: string;
  detail: string;
  timestamp: string;
  type: "task" | "system" | "communication" | "error";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  status: "backlog" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  createdAt: string;
  dueDate: string | null;
}

export interface UsageData {
  date: string;
  tokensUsed: number;
  apiCalls: number;
  cost: number;
}
