import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

export interface OpenClawConfig {
  workspacePath: string;
  agentsPath: string;
  cronPath: string;
  gatewayPort: number;
}

const OPENCLAW_DIR = path.join(homedir(), ".openclaw");

export function getOpenClawDir(): string {
  return OPENCLAW_DIR;
}

export async function getConfig(): Promise<OpenClawConfig> {
  try {
    const raw = await readFile(
      path.join(OPENCLAW_DIR, "openclaw.json"),
      "utf-8"
    );
    const config = JSON.parse(raw);

    const workspacePath =
      config?.agents?.defaults?.workspace ||
      path.join(OPENCLAW_DIR, "workspace");
    const gatewayPort = config?.gateway?.port || 18789;

    return {
      workspacePath,
      agentsPath: path.join(OPENCLAW_DIR, "agents"),
      cronPath: path.join(OPENCLAW_DIR, "cron"),
      gatewayPort,
    };
  } catch {
    return {
      workspacePath: path.join(OPENCLAW_DIR, "workspace"),
      agentsPath: path.join(OPENCLAW_DIR, "agents"),
      cronPath: path.join(OPENCLAW_DIR, "cron"),
      gatewayPort: 18789,
    };
  }
}

export async function getSanitizedConfig(): Promise<
  Omit<OpenClawConfig, "agentsPath" | "cronPath"> & {
    hasConfig: boolean;
  }
> {
  const config = await getConfig();
  return {
    workspacePath: config.workspacePath,
    gatewayPort: config.gatewayPort,
    hasConfig: true,
  };
}
