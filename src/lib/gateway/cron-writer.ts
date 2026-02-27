import { writeFile, rename, mkdir } from "fs/promises";
import path from "path";
import { getConfig } from "./config";

export async function writeCronJobs(data: { version: number; jobs: unknown[] }) {
  const config = await getConfig();
  const jobsPath = path.join(config.cronPath, "jobs.json");
  const tmpPath = jobsPath + ".tmp";

  await mkdir(config.cronPath, { recursive: true });
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpPath, jobsPath);
}
