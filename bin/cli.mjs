#!/usr/bin/env node

import { spawn } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI flags
const args = process.argv.slice(2);
let port = 3000;
let lan = false;
let dev = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--lan") {
    lan = true;
  } else if (args[i] === "--dev") {
    dev = true;
  }
}

// Check Node >= 20
const major = parseInt(process.version.slice(1).split(".")[0], 10);
if (major < 20) {
  console.error(`Error: Node.js >= 20 required (current: ${process.version})`);
  process.exit(1);
}

// Check for ~/.openclaw/
const openclawDir = join(homedir(), ".openclaw");
if (!existsSync(openclawDir)) {
  console.warn("Warning: ~/.openclaw/ not found — continuing without it");
}

const hostname = lan ? "0.0.0.0" : "localhost";

if (dev) {
  const devArgs = ["next", "dev", "--turbopack", "--port", String(port)];
  if (lan) {
    devArgs.push("--hostname", "0.0.0.0");
  }

  const child = spawn("npx", devArgs, {
    stdio: "inherit",
    cwd: join(__dirname, ".."),
    env: process.env,
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
} else {
  process.env.PORT = String(port);
  process.env.HOSTNAME = hostname;

  console.log(`The Guild running at http://${hostname}:${port}`);

  const standaloneDir = join(__dirname, "..", ".next", "standalone");
  process.chdir(standaloneDir);
  const serverPath = join(standaloneDir, "server.js");
  await import(serverPath);
}
