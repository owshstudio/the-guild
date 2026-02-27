import { access } from "fs/promises";
import path from "path";
import { getOpenClawDir } from "./config";

export async function hasOpenClawInstallation(): Promise<boolean> {
  try {
    const configPath = path.join(getOpenClawDir(), "openclaw.json");
    await access(configPath);
    return true;
  } catch {
    return false;
  }
}
