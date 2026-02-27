import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

export interface OpenClawConfig {
  workspacePath: string;
  agentsPath: string;
  cronPath: string;
  gatewayPort: number;
}

function resolveOpenClawDir(): string {
  const envDir = process.env.OPENCLAW_DIR;
  if (envDir) {
    // Expand ~ to homedir
    if (envDir.startsWith("~")) {
      return path.join(homedir(), envDir.slice(1));
    }
    return envDir;
  }
  return path.join(homedir(), ".openclaw");
}

const OPENCLAW_DIR = resolveOpenClawDir();

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
    const gatewayPort =
      parseInt(process.env.GATEWAY_PORT || "", 10) ||
      config?.gateway?.port ||
      18789;

    return {
      workspacePath,
      agentsPath: path.join(OPENCLAW_DIR, "agents"),
      cronPath: path.join(OPENCLAW_DIR, "cron"),
      gatewayPort,
    };
  } catch {
    const gatewayPort =
      parseInt(process.env.GATEWAY_PORT || "", 10) || 18789;

    return {
      workspacePath: path.join(OPENCLAW_DIR, "workspace"),
      agentsPath: path.join(OPENCLAW_DIR, "agents"),
      cronPath: path.join(OPENCLAW_DIR, "cron"),
      gatewayPort,
    };
  }
}

export async function getSanitizedConfig(): Promise<
  Omit<OpenClawConfig, "agentsPath" | "cronPath"> & { hasConfig: boolean }
> {
  const config = await getConfig();
  return {
    workspacePath: config.workspacePath,
    gatewayPort: config.gatewayPort,
    hasConfig: true,
  };
}
