// OpenClaw Gateway WebSocket client
// Protocol: ws://host:18789 with JSON text frames
// Frame types: req {type:"req",id,method,params}
//              res {type:"res",id,ok,payload|error}
//              event {type:"event",event,payload,seq?,stateVersion?}

import { Agent, ActivityEntry, Task, AgentStatus } from "./types";

const DEFAULT_WS_URL = "ws://localhost:18789";
const DEFAULT_HTTP_URL = "http://localhost:18789";

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_GATEWAY_URL || DEFAULT_HTTP_URL;
}

function getWsUrl(): string {
  const base = getBaseUrl();
  // Convert http(s) to ws(s) if needed
  if (base.startsWith("http://")) return base.replace("http://", "ws://");
  if (base.startsWith("https://")) return base.replace("https://", "wss://");
  if (base.startsWith("ws://") || base.startsWith("wss://")) return base;
  return DEFAULT_WS_URL;
}

function getToken(): string | null {
  return process.env.NEXT_PUBLIC_GATEWAY_TOKEN || null;
}

// ── Types ──────────────────────────────────────────────

export interface GatewayAgent {
  id: string;
  name: string;
  status: AgentStatus;
  role?: string;
  model?: string;
  machine?: string;
  skills?: string[];
  currentTask?: string | null;
  lastActivity?: string;
}

export interface GatewayEvent {
  type: "event";
  event: string;
  payload: Record<string, unknown>;
  seq?: number;
  stateVersion?: number;
}

export type GatewayEventHandler = (event: GatewayEvent) => void;
export type ConnectionHandler = (connected: boolean) => void;

// ── Message ID counter ─────────────────────────────────
let reqId = 0;

// ── WebSocket Client ───────────────────────────────────

export class OpenClawGateway {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private pendingRequests = new Map<number, {
    resolve: (payload: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  private eventHandlers: GatewayEventHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private _connected = false;
  private intentionalClose = false;

  constructor() {
    this.url = getWsUrl();
    this.token = getToken();
  }

  get connected(): boolean {
    return this._connected;
  }

  // ── Connect ──────────────────────────────────────────

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectDelay = 2000;
      // Send connect handshake
      const connectParams: Record<string, unknown> = {
        role: "operator",
        scopes: ["operator.read", "operator.write"],
        client: { name: "the-guild", version: "0.1.0" },
      };
      if (this.token) {
        connectParams.auth = { token: this.token };
      }
      this.send({ type: "req", id: ++reqId, method: "connect", params: connectParams });
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string);
        this.handleMessage(msg);
      } catch {
        // Ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      const wasConnected = this._connected;
      this._connected = false;
      if (wasConnected) {
        this.notifyConnection(false);
      }
      // Reject all pending requests
      for (const [, pending] of this.pendingRequests) {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Connection closed"));
      }
      this.pendingRequests.clear();

      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this.notifyConnection(false);
  }

  // ── Send request and await response ──────────────────

  request(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected"));
        return;
      }

      const id = ++reqId;
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, 10000);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.send({ type: "req", id, method, params });
    });
  }

  // ── Event subscription ───────────────────────────────

  onEvent(handler: GatewayEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
    };
  }

  onConnection(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  // ── Internals ────────────────────────────────────────

  private send(msg: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private handleMessage(msg: Record<string, unknown>): void {
    if (msg.type === "res") {
      const id = msg.id as number;
      const pending = this.pendingRequests.get(id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(id);
        if (msg.ok) {
          pending.resolve(msg.payload);
        } else {
          pending.reject(new Error((msg.error as string) || "Request failed"));
        }
      }
      // Check if this was our connect response
      if (msg.ok && !this._connected) {
        this._connected = true;
        this.notifyConnection(true);
      }
    }

    if (msg.type === "event") {
      const event = msg as unknown as GatewayEvent;
      for (const handler of this.eventHandlers) {
        try {
          handler(event);
        } catch {
          // Don't let handler errors crash the client
        }
      }

      // Auto-mark connected on first hello/challenge event
      if (!this._connected && (event.event === "hello-ok" || event.event === "connect.challenge")) {
        this._connected = true;
        this.notifyConnection(true);
      }
    }
  }

  private notifyConnection(connected: boolean): void {
    for (const handler of this.connectionHandlers) {
      try {
        handler(connected);
      } catch {
        // Ignore
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
  }
}

// ── Singleton ──────────────────────────────────────────

let gatewayInstance: OpenClawGateway | null = null;

export function getGateway(): OpenClawGateway {
  if (!gatewayInstance) {
    gatewayInstance = new OpenClawGateway();
  }
  return gatewayInstance;
}

// ── Legacy compat ──────────────────────────────────────

export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${getBaseUrl()}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export function getGatewayUrl(): string {
  return getBaseUrl();
}

export function isLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

// ── Helpers: map OpenClaw data → Guild types ───────────

export function mapGatewayAgent(raw: Record<string, unknown>, fallback?: Agent): Agent {
  const id = (raw.id as string) || (raw.name as string)?.toLowerCase() || "unknown";
  return {
    id,
    name: (raw.name as string) || id.toUpperCase(),
    emoji: (raw.emoji as string) || fallback?.emoji || "🤖",
    status: mapAgentStatus(raw.status as string),
    role: (raw.role as string) || fallback?.role || "Agent",
    description: (raw.description as string) || fallback?.description || "",
    machine: (raw.machine as string) || (raw.platform as string) || fallback?.machine || "Unknown",
    gateway: (raw.gateway as string) || "localhost",
    model: (raw.model as string) || fallback?.model || "unknown",
    currentTask: (raw.currentTask as string) || null,
    lastActivity: (raw.lastActivity as string) || "Unknown",
    skills: (raw.skills as string[]) || fallback?.skills || [],
    color: (raw.color as string) || fallback?.color || "#737373",
    accentColor: (raw.accentColor as string) || fallback?.accentColor || "#a3a3a3",
    uptimeSince: (raw.uptimeSince as string) || fallback?.uptimeSince || new Date().toISOString(),
  };
}

function mapAgentStatus(status: string | undefined): AgentStatus {
  if (!status) return "idle";
  const s = status.toLowerCase();
  if (s === "active" || s === "working" || s === "running" || s === "busy") return "active";
  if (s === "stopped" || s === "offline" || s === "error" || s === "dead") return "stopped";
  return "idle";
}

export function mapGatewayActivity(raw: Record<string, unknown>): ActivityEntry {
  return {
    id: (raw.id as string) || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: (raw.agentId as string) || (raw.agent as string) || "unknown",
    agentName: (raw.agentName as string) || (raw.agent as string)?.toUpperCase() || "UNKNOWN",
    agentEmoji: (raw.agentEmoji as string) || "🤖",
    action: (raw.action as string) || (raw.event as string) || "Event",
    detail: (raw.detail as string) || (raw.message as string) || "",
    timestamp: (raw.timestamp as string) || new Date().toISOString(),
    type: mapActivityType(raw.type as string),
  };
}

function mapActivityType(type: string | undefined): "task" | "system" | "communication" | "error" {
  if (!type) return "system";
  const t = type.toLowerCase();
  if (t.includes("task") || t.includes("exec") || t.includes("tool")) return "task";
  if (t.includes("error") || t.includes("fail")) return "error";
  if (t.includes("message") || t.includes("comm") || t.includes("chat")) return "communication";
  return "system";
}

export function mapGatewayTask(raw: Record<string, unknown>): Task {
  return {
    id: (raw.id as string) || `task-${Date.now()}`,
    title: (raw.title as string) || (raw.name as string) || "Untitled Task",
    description: (raw.description as string) || "",
    agentId: (raw.agentId as string) || (raw.agent as string) || "unknown",
    status: mapTaskStatus(raw.status as string),
    priority: mapTaskPriority(raw.priority as string),
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    dueDate: (raw.dueDate as string) || null,
  };
}

function mapTaskStatus(s: string | undefined): Task["status"] {
  if (!s) return "pending";
  const status = s.toLowerCase().replace(/[_\s]/g, "-");
  if (status === "completed" || status === "done") return "completed";
  if (status === "in-progress" || status === "running" || status === "active") return "in-progress";
  if (status === "blocked") return "blocked";
  if (status === "upcoming") return "upcoming";
  if (status === "recurring") return "recurring";
  return "pending";
}

function mapTaskPriority(p: string | undefined): Task["priority"] {
  if (!p) return "medium";
  const prio = p.toLowerCase();
  if (prio === "high" || prio === "critical" || prio === "urgent") return "high";
  if (prio === "low") return "low";
  return "medium";
}
