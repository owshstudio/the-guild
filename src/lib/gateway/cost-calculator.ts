import type { AgentCostEntry, BudgetPeriod } from "@/lib/types";
import { listSessions } from "./filesystem";
import { parseSession } from "./session-parser";
import { MODEL_COSTS } from "./model-costs";

export { MODEL_COSTS };

export function calculateSessionCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_COSTS[model] || MODEL_COSTS["claude-opus-4-6"];
  const inputCost = (inputTokens / 1000) * pricing.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * pricing.outputCostPer1k;
  return inputCost + outputCost;
}

export async function aggregateCosts(
  period: BudgetPeriod
): Promise<AgentCostEntry[]> {
  const sessions = await listSessions();
  const now = new Date();
  const cutoff = getCutoffDate(now, period);

  const costMap = new Map<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      estimatedCost: number;
      model: string;
      sessionCount: number;
    }
  >();

  const recent = sessions.slice(0, 50);

  for (const meta of recent) {
    try {
      const parsed = await parseSession(meta.filepath, meta.id);
      if (!parsed.startTime) continue;

      const sessionDate = new Date(parsed.startTime);
      if (sessionDate < cutoff) continue;

      const dateKey = formatDateKey(sessionDate);
      // Default to nyx since sessions are in agents/main
      const agentId = "nyx";
      const model = parsed.model || "claude-opus-4-6";
      const key = `${dateKey}:${agentId}`;

      const existing = costMap.get(key) || {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCost: 0,
        model,
        sessionCount: 0,
      };

      // Estimate input/output split from total tokens (60/40 typical ratio)
      const inputTokens = Math.round(parsed.totalTokens * 0.6);
      const outputTokens = parsed.totalTokens - inputTokens;
      const cost =
        parsed.totalCost > 0
          ? parsed.totalCost
          : calculateSessionCost(inputTokens, outputTokens, model);

      existing.inputTokens += inputTokens;
      existing.outputTokens += outputTokens;
      existing.totalTokens += parsed.totalTokens;
      existing.estimatedCost += cost;
      existing.sessionCount += 1;

      costMap.set(key, existing);
    } catch {
      // Skip on parse error
    }
  }

  const entries: AgentCostEntry[] = [];
  for (const [key, data] of costMap) {
    const [date, agentId] = key.split(":");
    entries.push({
      date,
      agentId,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.totalTokens,
      estimatedCost: data.estimatedCost,
      model: data.model,
      sessionCount: data.sessionCount,
    });
  }

  entries.sort((a, b) => {
    const dateA = parseDateKey(a.date);
    const dateB = parseDateKey(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return entries;
}

function getCutoffDate(now: Date, period: BudgetPeriod): Date {
  const d = new Date(now);
  if (period === "daily") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function formatDateKey(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function parseDateKey(key: string): Date {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const [month, day] = key.split(" ");
  const year = new Date().getFullYear();
  return new Date(year, months[month] || 0, parseInt(day) || 1);
}
