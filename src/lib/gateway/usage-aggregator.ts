import type { AgentUsageDay } from "@/lib/types";
import { listSessions, listAgentDirs } from "./filesystem";
import { parseSession } from "./session-parser";

export async function aggregateUsage(): Promise<AgentUsageDay[]> {
  const agentDirs = await listAgentDirs();
  const dayMap = new Map<string, Record<string, number>>();

  for (const agentId of agentDirs) {
    const sessions = await listSessions(agentId);
    const recent = sessions.slice(0, 20);

    for (const meta of recent) {
      try {
        const parsed = await parseSession(meta.filepath, meta.id);
        if (!parsed.startTime) continue;

        const date = new Date(parsed.startTime);
        const dateKey = formatDateKey(date);

        const existing = dayMap.get(dateKey) || {};
        existing[agentId] = (existing[agentId] || 0) + parsed.totalTokens;
        dayMap.set(dateKey, existing);
      } catch {
        // Skip on parse error
      }
    }
  }

  const entries: AgentUsageDay[] = Array.from(dayMap.entries())
    .map(([date, usage]) => ({ date, ...usage }))
    .sort((a, b) => {
      const dateA = parseDateKey(a.date);
      const dateB = parseDateKey(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  return entries;
}

function formatDateKey(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function parseDateKey(key: string): Date {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [month, day] = key.split(" ");
  const year = new Date().getFullYear();
  return new Date(year, months[month] || 0, parseInt(day) || 1);
}
