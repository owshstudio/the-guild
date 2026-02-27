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
  teamId?: string;
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
  [agentId: string]: string | number;
}

// Agent command interface
export interface CommandEntry {
  id: string;
  agentId: string;
  command: string;
  response?: string;
  timestamp: string;
  status: "pending" | "completed" | "error";
}

// Toast system
export type ToastType = "success" | "error" | "info" | "warning";
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Session viewer (Sprint 2)
export interface SessionMessage {
  id: string;
  parentId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  toolCalls?: ToolCall[];
  usage?: MessageUsage;
  model?: string;
  thinking?: string;
}

export interface ToolCall {
  name: string;
  input: string;
  output?: string;
}

export interface MessageUsage {
  inputTokens: number;
  outputTokens: number;
  cost?: number;
}

export interface SessionDetail {
  id: string;
  messages: SessionMessage[];
  startTime: string | null;
  endTime: string | null;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  model: string | null;
  isActive: boolean;
}

export interface SessionListItem {
  id: string;
  size: number;
  lastModified: string;
  isActive: boolean;
  messageCount?: number;
  duration?: number;
  model?: string;
  preview?: string;
}

// Task dispatch (Sprint 3)
export interface DispatchRequest {
  agentId: string;
  message: string;
  sessionId?: string;
  model?: string;
}

export interface DispatchResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export type QuickActionType = "abort" | "restart" | "change-model";

export interface QuickActionRequest {
  action: QuickActionType;
  agentId: string;
  sessionId?: string;
  payload?: Record<string, string>;
}

export interface QuickActionResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Cron editor (Sprint 4A)
export interface CronScheduleEvery {
  type: "every";
  intervalMs: number;
}

export interface CronScheduleAt {
  type: "at";
  at: string;
}

export type CronSchedule = CronScheduleEvery | CronScheduleAt;

export interface CronPayloadAgentTurn {
  kind: "agentTurn";
  description: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export interface CronPayloadSystemEvent {
  kind: "systemEvent";
  description: string;
  event: { type: string; message: string };
}

export type CronPayload = CronPayloadAgentTurn | CronPayloadSystemEvent;

export interface CronDelivery {
  type: "channel";
  channel: string;
  address: string;
}

export interface CronJobStatus {
  lastRunAt?: string;
  lastRunStatus?: "success" | "error" | "skipped";
  lastRunError?: string;
}

export interface CronJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  schedule: CronSchedule;
  sessionTarget: string;
  wakeMode: string;
  payload: CronPayload;
  delivery?: CronDelivery;
  status?: CronJobStatus;
  deleteAfterRun?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Webhooks (Sprint 4B)
export type WebhookEventType =
  | "session.start"
  | "session.end"
  | "session.error"
  | "task.complete"
  | "cron.run";

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
  error?: string;
}

export interface WebhookData {
  version: number;
  webhooks: WebhookConfig[];
  deliveryLog: WebhookDeliveryLog[];
}

// Multi-room pixel office (Sprint 5)
export type RoomId =
  | "main-office"
  | "break-room"
  | "server-room"
  | "meeting-room";

export interface DoorLink {
  targetRoom: RoomId;
  entryCol: number;
  entryRow: number;
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  layout: number[][];
  deskAssignments: import("@/components/pixel-office/office-layouts").DeskAssignment[];
  coffeeMachine?: { col: number; row: number };
  wanderBounds: { minCol: number; maxCol: number; minRow: number; maxRow: number };
  doors: Record<string, DoorLink>;
}

// Character creator (Sprint 6)
export interface CustomPalette {
  agentId: string;
  skin: string;
  skinShadow: string;
  shirt: string;
  shirtShadow: string;
  shirtAccent: string;
  pants: string;
  pantsShadow: string;
  hair: string;
  hairDark: string;
  hairLight: string;
  shoes: string;
  outline: string;
  hairStyle: "long" | "short" | "puffy" | "spiky";
}

export interface OfficeConfig {
  version: number;
  customPalettes: CustomPalette[];
  deskAssignments: Record<string, { deskCol: number; deskRow: number; chairCol: number; chairRow: number }>;
}

// Teams (Sprint 7A)
export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  leadAgentId: string;
  memberAgentIds: string[];
  createdAt: string;
  icon: string;
}

// Cross-agent comms (Sprint 7B)
export type CommChannel =
  | "whatsapp-group"
  | "git-sync"
  | "session"
  | "alert-file"
  | "delivery-queue";

export type CommDirection = string;

export interface CommMessage {
  id: string;
  timestamp: string;
  fromAgentId: string;
  toAgentId: string;
  channel: CommChannel;
  direction: CommDirection;
  content: string;
  contentPreview: string;
  sessionId?: string;
  deliveryStatus: string;
}

// HITL (Sprint 7C)
export type HITLItemType = "approval" | "decision" | "review" | "input" | "alert";
export type HITLPriority = "critical" | "high" | "medium" | "low";
export type HITLStatus = "pending" | "approved" | "rejected" | "responded" | "expired";

export interface HITLItem {
  id: string;
  type: HITLItemType;
  title: string;
  description: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  priority: HITLPriority;
  status: HITLStatus;
  createdAt: string;
  expiresAt?: string;
  context: string;
  sessionId?: string;
  response?: string;
  respondedAt?: string;
  detectedPattern?: string;
}

// Budget (Sprint 7D)
export type BudgetPeriod = "daily" | "weekly" | "monthly";

export interface ModelCost {
  model: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
}

export interface AgentCostEntry {
  date: string;
  agentId: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
  sessionCount: number;
}

export interface BudgetConfig {
  enabled: boolean;
  limits: { daily?: number; weekly?: number; monthly?: number };
  alertThresholds: number[];
  perAgent?: Record<string, { daily?: number; weekly?: number; monthly?: number }>;
}

export interface BudgetAlert {
  id: string;
  agentId: string;
  period: BudgetPeriod;
  threshold: number;
  currentSpend: number;
  limit: number;
  triggeredAt: string;
  dismissed: boolean;
}

// Task chains (Sprint 8)
export type ChainTriggerType = "task-complete" | "time-based" | "event-based" | "manual";
export type ChainActionType = "start-task" | "send-message" | "run-cron" | "webhook" | "notify-human";
export type ChainStepStatus = "pending" | "active" | "completed" | "failed" | "skipped";
export type ChainStatus = "draft" | "active" | "paused" | "completed" | "failed";

export interface ChainTrigger {
  type: ChainTriggerType;
  taskId?: string;
  cronExpression?: string;
  eventName?: string;
}

export interface ChainAction {
  type: ChainActionType;
  agentId?: string;
  taskTitle?: string;
  taskDescription?: string;
  message?: string;
  cronJobId?: string;
  webhookUrl?: string;
}

export interface ChainStep {
  id: string;
  order: number;
  name: string;
  trigger: ChainTrigger;
  action: ChainAction;
  status: ChainStepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  onFailure: "stop" | "skip" | "retry";
  maxRetries: number;
  retryCount: number;
}

export interface TaskChain {
  id: string;
  name: string;
  description: string;
  status: ChainStatus;
  steps: ChainStep[];
  createdAt: string;
  lastRunAt?: string;
  isTemplate: boolean;
  templateId?: string;
}
