import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";

interface StoredTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  status:
    | "completed"
    | "in-progress"
    | "blocked"
    | "pending"
    | "upcoming"
    | "recurring";
  priority: "low" | "medium" | "high";
  createdAt: string;
  dueDate: string | null;
}

interface TaskStore {
  version: number;
  tasks: StoredTask[];
}

async function getTasksPath(): Promise<string> {
  const config = await getConfig();
  return path.join(config.workspacePath, "guild-tasks.json");
}

async function readStore(): Promise<TaskStore> {
  try {
    const filePath = await getTasksPath();
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as TaskStore;
  } catch {
    return { version: 1, tasks: [] };
  }
}

async function writeStore(store: TaskStore): Promise<void> {
  const filePath = await getTasksPath();
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2), "utf-8");
}

export async function loadTasks(): Promise<StoredTask[]> {
  const store = await readStore();
  return store.tasks;
}

export async function saveTasks(tasks: StoredTask[]): Promise<void> {
  await writeStore({ version: 1, tasks });
}

export async function createTask(
  task: Omit<StoredTask, "id" | "createdAt">
): Promise<StoredTask> {
  const store = await readStore();
  const newTask: StoredTask = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.tasks.push(newTask);
  await writeStore(store);
  return newTask;
}

export async function updateTask(
  id: string,
  patch: Partial<StoredTask>
): Promise<StoredTask | null> {
  const store = await readStore();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  store.tasks[idx] = { ...store.tasks[idx], ...patch, id };
  await writeStore(store);
  return store.tasks[idx];
}

export async function deleteTask(id: string): Promise<boolean> {
  const store = await readStore();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.tasks.splice(idx, 1);
  await writeStore(store);
  return true;
}
