#!/usr/bin/env node

import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
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
let tunnel = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port" && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--lan") {
    lan = true;
  } else if (args[i] === "--dev") {
    dev = true;
  } else if (args[i] === "--tunnel") {
    tunnel = true;
  }
}

// Check Node >= 20
const major = parseInt(process.version.slice(1).split(".")[0], 10);
if (major < 20) {
  console.error(`Error: Node.js >= 20 required (current: ${process.version})`);
  process.exit(1);
}

// Auto-generate auth token when tunneling (auth is forced for security)
if (tunnel && !process.env.GUILD_API_TOKEN) {
  process.env.GUILD_API_TOKEN = randomBytes(32).toString("hex");
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
const cyan = "\x1b[36m";

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

// Wait for local server to be ready before starting tunnel
async function waitForServer(targetPort, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(`http://localhost:${targetPort}`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server did not start within ${timeoutMs / 1000}s`);
}

async function startTunnel(targetPort) {
  console.log(`${dim}  Starting tunnel...${reset}`);
  console.log("");

  let cloudflaredModule, qrcode;
  try {
    cloudflaredModule = await import("cloudflared");
    qrcode = (await import("qrcode-terminal")).default;
  } catch (err) {
    console.error(`${bold}  Tunnel error:${reset} Missing dependencies.`);
    console.error(`  Run: npm install cloudflared qrcode-terminal`);
    console.error(`  ${dim}(${err.message})${reset}`);
    console.log("");
    return;
  }

  let t;
  try {
    t = cloudflaredModule.Tunnel.quick(`localhost:${targetPort}`);
  } catch (err) {
    console.error(`${bold}  Tunnel error:${reset} Failed to start cloudflared.`);
    console.error(`  ${dim}${err.message}${reset}`);
    console.error(`  Server is still running locally.`);
    console.log("");
    return;
  }

  // Wait for the tunnel URL via event emitter
  let tunnelUrl;
  try {
    tunnelUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Tunnel URL not received within 30s")), 30_000);
      t.once("url", (url) => {
        clearTimeout(timer);
        resolve(url);
      });
      t.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`cloudflared exited unexpectedly (code ${code})`));
      });
    });
  } catch (err) {
    console.error(`${bold}  Tunnel error:${reset} ${err.message}`);
    console.error(`  Server is still running locally.`);
    console.log("");
    return;
  }

  const token = process.env.GUILD_API_TOKEN;
  const magicLink = `${tunnelUrl}/api/auth/link?token=${token}`;

  // Mask token in terminal: show first8...last4
  const maskedToken = `${token.slice(0, 8)}...${token.slice(-4)}`;

  console.log(`${bold}  Tunnel Active${reset}`);
  console.log(`${dim}  URL:${reset}   ${cyan}${tunnelUrl}${reset}`);
  console.log("");
  console.log(`${dim}  Scan to connect from any device:${reset}`);
  console.log("");

  // Generate QR code pointing to magic auth link
  qrcode.generate(magicLink, { small: true }, (code) => {
    // Indent each line for alignment
    const indented = code
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");
    console.log(indented);
    console.log("");
    console.log(`${dim}  Token:${reset} ${maskedToken}`);
    console.log("");
  });

  // Clean up tunnel on exit signals
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      t.stop();
    });
  }

  // Notify if tunnel drops (server keeps running)
  t.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.log("");
      console.log(`${dim}  Tunnel disconnected (exit code ${code}). Server still running locally.${reset}`);
      console.log("");
    }
  });
}

if (dev) {
  const devArgs = ["next", "dev", "--turbopack", "--port", String(port)];
  if (lan || tunnel) {
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

  if (tunnel) {
    await waitForServer(port);
    await startTunnel(port);
  }
} else {
  process.env.PORT = String(port);
  process.env.HOSTNAME = hostname;

  printStartup(`http://${hostname}:${port}`);

  const standaloneDir = join(__dirname, "..", ".next", "standalone");
  process.chdir(standaloneDir);
  const serverPath = join(standaloneDir, "server.js");
  await import(serverPath);

  if (tunnel) {
    await waitForServer(port);
    await startTunnel(port);
  }
}
