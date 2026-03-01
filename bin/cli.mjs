#!/usr/bin/env node

import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
const version = pkg.version;

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
const hasOpenClaw = existsSync(openclawDir);

if (!hasOpenClaw) {
  console.warn(
    "\x1b[33m⚠ OpenClaw not found\x1b[0m — Install it to connect live agents:"
  );
  console.warn("  https://docs.openclaw.dev/install\n");
}

const hostname = lan ? "0.0.0.0" : "localhost";
const mode = hasOpenClaw ? "LIVE" : "DEMO";
const modeColor = hasOpenClaw ? "\x1b[32m" : "\x1b[33m";
const reset = "\x1b[0m";
const dim = "\x1b[2m";
const bold = "\x1b[1m";

function printStartup(url) {
  console.log("");
  console.log(`${bold}  The Guild${reset} ${dim}v${version}${reset}`);
  console.log(`${dim}  Mode:${reset}  ${modeColor}${mode}${reset}`);
  console.log(`${dim}  URL:${reset}   ${url}`);
  if (!hasOpenClaw) {
    console.log(`${dim}  Docs:${reset}  https://docs.openclaw.dev/install`);
  }
  console.log("");
}

if (dev) {
  const devArgs = ["next", "dev", "--turbopack", "--port", String(port)];
  if (lan) {
    devArgs.push("--hostname", "0.0.0.0");
  }

  printStartup(`http://${hostname}:${port}`);

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

  printStartup(`http://${hostname}:${port}`);

  const standaloneDir = join(__dirname, "..", ".next", "standalone");
  process.chdir(standaloneDir);
  const serverPath = join(standaloneDir, "server.js");
  await import(serverPath);
}
