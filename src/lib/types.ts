export type AgentStatus = "active" | "idle" | "stopped";

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  role: string;
  description: string;
  machine: string;
  gateway: string;
  model: string;
  currentTask: string | null;
  lastActivity: string;
  skills: string[];
  color: string;
  accentColor: string;
  uptimeSince: string;
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

export type TaskStatus =
  | "completed"
  | "in-progress"
  | "blocked"
  | "pending"
  | "upcoming"
  | "recurring";

export interface Task {
  id: string;
  title: string;
  description: string;
  agentId: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  dueDate: string | null;
}

export interface AgentUsageDay {
  date: string;
  nyx: number;
  hemera: number;
}
