import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";
import type { TaskChain } from "@/lib/types";

async function getChainsPath(): Promise<string> {
  const config = await getConfig();
  return path.join(config.workspacePath, "guild-chains.json");
}

export async function getChains(): Promise<TaskChain[]> {
  try {
    const filePath = await getChainsPath();
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as TaskChain[];
  } catch {
    return [];
  }
}

async function writeChains(chains: TaskChain[]): Promise<void> {
  const filePath = await getChainsPath();
  const dir = path.dirname(filePath);
  const tmpPath = filePath + ".tmp";

  await mkdir(dir, { recursive: true });
  await writeFile(tmpPath, JSON.stringify(chains, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}

export async function createChain(chain: TaskChain): Promise<TaskChain[]> {
  const chains = await getChains();
  chains.push(chain);
  await writeChains(chains);
  return chains;
}

export async function updateChain(chain: TaskChain): Promise<TaskChain[]> {
  const chains = await getChains();
  const idx = chains.findIndex((c) => c.id === chain.id);
  if (idx !== -1) {
    chains[idx] = chain;
  }
  await writeChains(chains);
  return chains;
}

export async function deleteChain(id: string): Promise<TaskChain[]> {
  let chains = await getChains();
  chains = chains.filter((c) => c.id !== id);
  await writeChains(chains);
  return chains;
}

export function checkTriggers(chains: TaskChain[]): TaskChain[] {
  const now = Date.now();

  return chains.map((chain) => {
    if (chain.status !== "active") return chain;

    const currentStep = chain.steps.find((s) => s.status === "active");
    if (!currentStep) return chain;

    const trigger = currentStep.trigger;

    switch (trigger.type) {
      case "manual":
        // Manual triggers are skipped — require explicit advance
        break;

      case "task-complete":
        // In a real system, check if the referenced task is done
        // For now, this is a no-op placeholder
        break;

      case "time-based": {
        if (currentStep.startedAt) {
          const elapsed = now - new Date(currentStep.startedAt).getTime();
          const delayMs = (trigger.cronExpression ? parseInt(trigger.cronExpression, 10) : 0) * 60_000;
          if (delayMs > 0 && elapsed >= delayMs) {
            currentStep.status = "completed";
            currentStep.completedAt = new Date().toISOString();
          }
        }
        break;
      }

      case "event-based":
        // Would check event bus — no-op for now
        break;
    }

    return chain;
  });
}

export async function advanceChain(chainId: string): Promise<TaskChain[]> {
  const chains = await getChains();
  const chain = chains.find((c) => c.id === chainId);
  if (!chain || chain.status !== "active") {
    await writeChains(chains);
    return chains;
  }

  const sorted = [...chain.steps].sort((a, b) => a.order - b.order);
  const currentIdx = sorted.findIndex((s) => s.status === "active");

  if (currentIdx !== -1) {
    sorted[currentIdx].status = "completed";
    sorted[currentIdx].completedAt = new Date().toISOString();
  }

  const nextIdx = currentIdx + 1;
  if (nextIdx < sorted.length) {
    sorted[nextIdx].status = "active";
    sorted[nextIdx].startedAt = new Date().toISOString();
  } else {
    chain.status = "completed";
  }

  chain.steps = sorted;
  chain.lastRunAt = new Date().toISOString();

  const idx = chains.findIndex((c) => c.id === chainId);
  if (idx !== -1) chains[idx] = chain;

  await writeChains(chains);
  return chains;
}
