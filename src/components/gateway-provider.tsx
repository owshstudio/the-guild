"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Agent, ActivityEntry, Task, AgentStatus } from "@/lib/types";
import {
  getGateway,
  OpenClawGateway,
  GatewayEvent,
  mapGatewayAgent,
  mapGatewayActivity,
  mapGatewayTask,
  checkGatewayHealth,
} from "@/lib/gateway";
import {
  agents as mockAgents,
  activityFeed as mockActivity,
  tasks as mockTasks,
} from "@/lib/mock-data";

// ── Context Shape ──────────────────────────────────────

interface GatewayContextType {
  // Connection
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;

  // Live data (falls back to mock when disconnected)
  agents: Agent[];
  activity: ActivityEntry[];
  tasks: Task[];

  // Actions
  dispatchTask: (agentId: string, title: string, description: string) => Promise<void>;
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
}

const GatewayContext = createContext<GatewayContextType>({
  isConnected: false,
  isChecking: true,
  lastChecked: null,
  agents: mockAgents,
  activity: mockActivity,
  tasks: mockTasks,
  dispatchTask: async () => {},
  updateAgentStatus: () => {},
});

export function useGateway() {
  return useContext(GatewayContext);
}

// ── Provider ───────────────────────────────────────────

export function GatewayProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Live data stores — start with mock, overlay with real
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [activity, setActivity] = useState<ActivityEntry[]>(mockActivity);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const gatewayRef = useRef<OpenClawGateway | null>(null);

  // ── Handle incoming events ─────────────────────────

  const handleEvent = useCallback((event: GatewayEvent) => {
    const { event: eventName, payload } = event;

    // Agent status changes
    if (eventName === "agent.status" || eventName === "agent.update") {
      const agentId = (payload.agentId as string) || (payload.id as string);
      const newStatus = payload.status as string;
      if (agentId && newStatus) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId
              ? { ...a, status: mapStatus(newStatus), lastActivity: "Just now" }
              : a
          )
        );
      }
    }

    // Agent discovered / presence update
    if (eventName === "agent.discovered" || eventName === "system-presence") {
      const agentData = payload as Record<string, unknown>;
      const existing = agents.find((a) => a.id === agentData.id);
      const mapped = mapGatewayAgent(agentData, existing || undefined);
      setAgents((prev) => {
        const idx = prev.findIndex((a) => a.id === mapped.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...mapped };
          return updated;
        }
        return [...prev, mapped];
      });
    }

    // Activity / exec events
    if (
      eventName.startsWith("exec.") ||
      eventName.startsWith("task.") ||
      eventName.startsWith("agent.activity") ||
      eventName === "activity"
    ) {
      const entry = mapGatewayActivity({
        ...payload,
        type: eventName,
      });
      setActivity((prev) => [entry, ...prev].slice(0, 200)); // Keep last 200
    }

    // Task status transitions
    if (eventName === "task.status" || eventName === "task.update") {
      const taskId = payload.taskId as string;
      const newStatus = payload.status as string;
      if (taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: mapGatewayTask({ ...payload, id: taskId }).status }
              : t
          )
        );
      }
      // Also create activity entry for task transitions
      if (taskId && newStatus) {
        const task = tasks.find((t) => t.id === taskId);
        setActivity((prev) => [
          {
            id: `task-evt-${Date.now()}`,
            agentId: (payload.agentId as string) || task?.agentId || "unknown",
            agentName: ((payload.agentName as string) || task?.agentId || "unknown").toUpperCase(),
            agentEmoji: "🤖",
            action: `Task ${newStatus}: ${task?.title || taskId}`,
            detail: (payload.detail as string) || "",
            timestamp: new Date().toISOString(),
            type: "task" as const,
          },
          ...prev,
        ].slice(0, 200));
      }
    }

    // Task created
    if (eventName === "task.created") {
      const newTask = mapGatewayTask(payload);
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    }

    // Approval requests (show as activity)
    if (eventName === "exec.approval.requested") {
      setActivity((prev) => [
        {
          id: `approval-${Date.now()}`,
          agentId: (payload.agentId as string) || "unknown",
          agentName: ((payload.agentName as string) || "AGENT").toUpperCase(),
          agentEmoji: "⚠️",
          action: "Approval requested",
          detail: (payload.description as string) || (payload.tool as string) || "Pending approval",
          timestamp: new Date().toISOString(),
          type: "system" as const,
        },
        ...prev,
      ].slice(0, 200));
    }
  }, [agents, tasks]);

  // ── Connect to gateway ─────────────────────────────

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const gateway = getGateway();
    gatewayRef.current = gateway;

    // Subscribe to connection state
    const unsubConn = gateway.onConnection((connected) => {
      setIsConnected(connected);
      setIsChecking(false);
      setLastChecked(new Date());

      if (connected) {
        // Fetch initial data
        fetchAgents(gateway);
        fetchTasks(gateway);
      }
    });

    // Subscribe to events
    const unsubEvents = gateway.onEvent(handleEvent);

    // Attempt WebSocket connection
    gateway.connect();

    // Also do an HTTP health check as fallback
    checkGatewayHealth().then((healthy) => {
      if (!gateway.connected) {
        setIsChecking(false);
        setLastChecked(new Date());
      }
    });

    return () => {
      unsubConn();
      unsubEvents();
      gateway.disconnect();
    };
  }, [handleEvent]);

  // ── Fetch initial data from gateway ────────────────

  async function fetchAgents(gateway: OpenClawGateway) {
    try {
      const result = await gateway.request("system-presence");
      if (result && typeof result === "object") {
        const devices = (result as Record<string, unknown>).devices as Record<string, unknown>[] | undefined;
        if (Array.isArray(devices)) {
          const liveAgents = devices
            .filter((d) => d.role === "node" || d.capabilities)
            .map((d) => {
              const id = (d.name as string)?.toLowerCase() || (d.id as string);
              const existing = mockAgents.find((a) => a.id === id);
              return mapGatewayAgent(d, existing || undefined);
            });
          if (liveAgents.length > 0) {
            // Merge: keep mock agents that aren't in live, update those that are
            setAgents((prev) => {
              const liveIds = new Set(liveAgents.map((a) => a.id));
              const kept = prev.filter((a) => !liveIds.has(a.id));
              return [...liveAgents, ...kept];
            });
          }
        }
      }
    } catch {
      // Silently fail — mock data remains
    }
  }

  async function fetchTasks(gateway: OpenClawGateway) {
    try {
      const result = await gateway.request("tasks.list");
      if (result && Array.isArray(result)) {
        const liveTasks = (result as Record<string, unknown>[]).map(mapGatewayTask);
        if (liveTasks.length > 0) {
          setTasks((prev) => {
            const liveIds = new Set(liveTasks.map((t) => t.id));
            const kept = prev.filter((t) => !liveIds.has(t.id));
            return [...liveTasks, ...kept];
          });
        }
      }
    } catch {
      // Silently fail — mock data remains
    }
  }

  // ── Actions ────────────────────────────────────────

  const dispatchTask = useCallback(async (agentId: string, title: string, description: string) => {
    const gateway = gatewayRef.current;

    // Create task locally immediately
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      agentId,
      status: "pending",
      priority: "medium",
      createdAt: new Date().toISOString(),
      dueDate: null,
    };
    setTasks((prev) => [...prev, newTask]);

    // Add activity entry
    const agent = agents.find((a) => a.id === agentId);
    setActivity((prev) => [
      {
        id: `dispatch-${Date.now()}`,
        agentId,
        agentName: agent?.name || agentId.toUpperCase(),
        agentEmoji: agent?.emoji || "🤖",
        action: `Task dispatched: ${title}`,
        detail: description,
        timestamp: new Date().toISOString(),
        type: "task" as const,
      },
      ...prev,
    ]);

    // Try to dispatch via gateway
    if (gateway?.connected) {
      try {
        await gateway.request("tasks.create", {
          agentId,
          title,
          description,
          priority: "medium",
        });
      } catch {
        // Already added locally, will sync when reconnected
      }
    }
  }, [agents]);

  const updateAgentStatus = useCallback((agentId: string, status: AgentStatus) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId ? { ...a, status, lastActivity: "Just now" } : a
      )
    );

    const gateway = gatewayRef.current;
    if (gateway?.connected) {
      gateway.request("agent.status", { agentId, status }).catch(() => {});
    }
  }, []);

  return (
    <GatewayContext.Provider
      value={{
        isConnected,
        isChecking,
        lastChecked,
        agents,
        activity,
        tasks,
        dispatchTask,
        updateAgentStatus,
      }}
    >
      {children}
    </GatewayContext.Provider>
  );
}

// ── Helpers ──────────────────────────────────────────

function mapStatus(s: string): AgentStatus {
  const status = s.toLowerCase();
  if (status === "active" || status === "working" || status === "running") return "active";
  if (status === "stopped" || status === "offline" || status === "error") return "stopped";
  return "idle";
}
