# The Guild

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A local dashboard for monitoring and managing [OpenClaw](https://github.com/openclaw) AI agents. Reads directly from your `~/.openclaw/` filesystem -- no cloud, no accounts, all local.

## Install

### npx (quickest)

```bash
npx @owshstudio/the-guild
```

### Docker

```bash
docker compose up
```

Or build manually:

```bash
docker build -t the-guild .
docker run -p 3000:3000 -v ~/.openclaw:/data/.openclaw:ro -e OPENCLAW_DIR=/data/.openclaw the-guild
```

### Git clone

```bash
git clone https://github.com/owshstudio/the-guild.git
cd the-guild
npm install
npm run build
npm start
```

For development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### CLI flags

| Flag | Default | Description |
|------|---------|-------------|
| `--port <number>` | `3000` | Port to listen on |
| `--lan` | off | Bind to 0.0.0.0 (accessible from other devices on your network) |
| `--dev` | off | Run in development mode with Turbopack |

```bash
npx @owshstudio/the-guild --port 8080 --lan
```

## Prerequisites

- **Node.js 20+**
- **OpenClaw** installed and configured (`~/.openclaw/` directory exists)

If OpenClaw isn't installed, the dashboard shows generic demo data so you can explore the UI.

## Features

| Route | Feature |
|-------|---------|
| `/guild` | Pixel art office -- 4 rooms with animated agent sprites, minimap, A* pathfinding |
| `/agents` | Agent roster with live status, team grouping, detail cards |
| `/activity` | Reverse-chronological activity feed from real session data |
| `/sessions` | Two-panel session viewer with message pagination and tool call expansion |
| `/chat` | Chat interface for communicating with your agents |
| `/tasks` | Kanban board with columns per agent |
| `/comms` | Cross-agent communication timeline (scans all agents for mentions) |
| `/hitl` | Human-in-the-loop approval queue with browser notifications |
| `/skills` | Per-agent skill/tool lists |
| `/usage` | Token usage charts, cost tracking, budget management |
| `/cron` | Cron job editor with schedule preview |
| `/webhooks` | Webhook configurator with HMAC signing and delivery log |
| `/chains` | Task chain builder with visual step editor and templates |
| `/settings` | Dashboard settings and connection test |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_DIR` | `~/.openclaw` | Path to OpenClaw data directory |
| `GATEWAY_PORT` | Read from `openclaw.json`, fallback `18789` | OpenClaw gateway port (server-side) |
| `NEXT_PUBLIC_GATEWAY_PORT` | `18789` | Gateway port for browser health checks |

Copy `.env.example` to `.env` and uncomment any overrides you need.

## Multi-Machine Setup

The Guild reads directly from `~/.openclaw/` -- run it on the machine where your agents live, then access the dashboard from any browser on your network.

### Same Network (LAN)

On the machine running OpenClaw agents:

```bash
npx @owshstudio/the-guild --lan
```

From any other device on the same network, open `http://<machine-ip>:3000`. The Settings page shows your LAN IP.

### Tailscale (Remote Networks)

If OpenClaw is configured with `tailscale.mode` in `openclaw.json`:

1. Install [Tailscale](https://tailscale.com) on both machines
2. Run `npx @owshstudio/the-guild --lan` on the agent machine
3. Open `http://<tailscale-ip>:3000` from anywhere

### SSH Tunnel

Forward port 3000 from a remote machine:

```bash
ssh -L 3000:localhost:3000 user@agent-machine
```

Then open `http://localhost:3000` on your local machine.

## How It Works

The Guild discovers your agents **dynamically** by scanning `~/.openclaw/agents/`. Each subdirectory (e.g., `agents/main/`) becomes an agent in the dashboard. Works with 1 agent or N agents -- no hardcoded agent list.

**Agent discovery:**
- Scans `~/.openclaw/agents/` for subdirectories (each = one agent)
- Agent ID = directory name (e.g., `main`)
- Display name, emoji, and role read from `IDENTITY.md` and `SOUL.md`
- Skills parsed from `TOOLS.md` section headers
- Status determined from most recent session modification time
- Colors assigned deterministically from agent name (known agents like NYX/HEMERA get signature colors)

**Data sources:**
- `~/.openclaw/agents/{id}/sessions/*.jsonl` -- session transcripts, token usage, tool calls
- `~/.openclaw/workspace/IDENTITY.md` -- primary agent (main) identity
- `~/.openclaw/workspace/{id}/IDENTITY.md` -- additional agent identities
- `~/.openclaw/workspace/SOUL.md` -- agent personality and role
- `~/.openclaw/workspace/TOOLS.md` -- agent skills and capabilities
- `~/.openclaw/openclaw.json` -- gateway port and workspace config
- `~/.openclaw/cron/jobs.json` -- scheduled tasks
- `~/.openclaw/workspace/guild-*.json` -- teams, HITL queue, chains (created by The Guild)

All data stays local. The dashboard polls your filesystem and the OpenClaw gateway health endpoint -- nothing leaves your machine.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **Framer Motion** (page transitions, animations)
- **Recharts** (usage charts, cost visualizations)
- **HTML5 Canvas** (pixel art office with A* pathfinding)

## Architecture

```
src/
  app/                    # 15 page routes + API routes
  components/             # React components (custom + UI primitives)
  lib/
    gateway/              # Server-side: agent discovery, session parsing, cost/usage aggregation
      agent-builder.ts    # Dynamic agent scanner (reads ~/.openclaw/agents/)
      filesystem.ts       # Low-level filesystem readers (sessions, identity, soul, tools)
      config.ts           # OpenClaw config + env var resolution
      detect.ts           # hasOpenClawInstallation() for mock/live decision
      session-parser.ts   # JSONL session parser (messages, tokens, costs)
      usage-aggregator.ts # Per-agent daily token aggregation
      activity-builder.ts # Activity feed from real session messages
      cost-calculator.ts  # Per-agent cost estimation from session data
      comms-builder.ts    # Cross-agent communication scanner
      hitl-manager.ts     # HITL queue persistence + session pattern scanner
      teams-manager.ts    # Team CRUD (JSON file storage)
    data/                 # React hooks (polling-based, 3s-60s intervals)
    types.ts              # Shared TypeScript types
    mock-data.ts          # Generic demo data (shown when OpenClaw not installed)
```

**Key patterns:**
- **Dynamic agent discovery**: no hardcoded agent list -- agents found by scanning the filesystem
- API routes return `{ data, source: "live" | "mock" }` -- live when OpenClaw is found, mock otherwise
- Polling hooks auto-refresh data at configurable intervals
- Server-side WebSocket proxy for dispatch/actions (auth token never exposed to client)
- All storage is filesystem-first -- teams, HITL, chains stored as JSON in `~/.openclaw/workspace/`
- Pixel art sprites: NYX and HEMERA have custom hand-drawn templates; dynamic agents get palette-generated sprites from their agent color

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run the linter (`npm run lint`)
5. Commit your changes (`git commit -m "Add my feature"`)
6. Push to the branch (`git push origin feature/my-feature`)
7. Open a Pull Request

## License

[MIT](LICENSE) -- Copyright (c) 2025 OWSH Studio
