import { readFile, writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";
import type { Team } from "@/lib/types";

const DEFAULT_TEAMS: Team[] = [
  {
    id: "ops",
    name: "Operations",
    description: "Core operations team",
    color: "#7c3aed",
    leadAgentId: "nyx",
    memberAgentIds: ["nyx", "hemera"],
    createdAt: "2026-02-26T00:00:00Z",
    icon: "shield",
  },
];

async function getTeamsPath(): Promise<string> {
  const config = await getConfig();
  return path.join(config.workspacePath, "guild-teams.json");
}

export async function getTeams(): Promise<Team[]> {
  try {
    const filePath = await getTeamsPath();
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Team[];
  } catch {
    return DEFAULT_TEAMS;
  }
}

async function writeTeams(teams: Team[]): Promise<void> {
  const filePath = await getTeamsPath();
  const dir = path.dirname(filePath);
  const tmpPath = filePath + ".tmp";

  await mkdir(dir, { recursive: true });
  await writeFile(tmpPath, JSON.stringify(teams, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}

export async function createTeam(team: Omit<Team, "id" | "createdAt">): Promise<Team[]> {
  const teams = await getTeams();
  const newTeam: Team = {
    ...team,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  teams.push(newTeam);
  await writeTeams(teams);
  return teams;
}

export async function updateTeam(updated: Team): Promise<Team[]> {
  const teams = await getTeams();
  const idx = teams.findIndex((t) => t.id === updated.id);
  if (idx !== -1) {
    teams[idx] = updated;
  }
  await writeTeams(teams);
  return teams;
}

export async function deleteTeam(id: string): Promise<Team[]> {
  let teams = await getTeams();
  teams = teams.filter((t) => t.id !== id);
  await writeTeams(teams);
  return teams;
}
