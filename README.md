# The Guild — Agent Management Dashboard

A premium dark-themed dashboard for managing AI agents running on OpenClaw. Features functional management pages alongside a pixel art virtual office where agents are visualized as animated characters.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **Framer Motion** (page transitions, UI animations, drag reordering)
- **Recharts** (usage charts, cost visualizations)
- **HTML5 Canvas** (pixel art office with A* pathfinding)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Stats

- **146 source files** across 16 component directories
- **14 page routes** + **19 API routes**
- **5 runtime dependencies** (next, react, react-dom, framer-motion, recharts)

## Pages

| Route | Feature |
|-------|---------|
| `/guild` | Pixel art office — 4 rooms (Main, Break, Server, Meeting) with animated agents, minimap, room tabs |
| `/agents` | Agent roster with team grouping, detail cards, quick actions |
| `/activity` | Reverse-chronological activity feed with agent filtering |
| `/sessions` | Two-panel live session viewer with message pagination and tool call expansion |
| `/tasks` | Kanban board with columns per agent |
| `/comms` | Cross-agent communication timeline parsed from sessions |
| `/hitl` | Human-in-the-loop approval queue with browser notifications |
| `/skills` | Per-agent skill/tool lists |
| `/usage` | Token usage, cost tracking, and budget management (3 tabs) |
| `/cron` | Cron job editor with schedule preview and enable/disable toggle |
| `/webhooks` | Webhook configurator with HMAC signing, delivery log, and test firing |
| `/chains` | Task chain builder with visual step editor, drag reordering, and templates |
| `/settings` | Dashboard settings |

## API Routes

All API routes live under `/api/gateway/` and follow the `{ data, source: "live" | "mock" }` response pattern. They read from the OpenClaw filesystem (`~/.openclaw/`) when available, falling back to mock data.

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/gateway/health` | GET | Gateway connectivity check |
| `/api/gateway/agents` | GET | Agent list with status |
| `/api/gateway/sessions` | GET | Session list with metadata |
| `/api/gateway/sessions/[id]` | GET | Single session with pagination |
| `/api/gateway/activity` | GET | Activity feed entries |
| `/api/gateway/config` | GET | Gateway configuration |
| `/api/gateway/usage` | GET | Token usage aggregation |
| `/api/gateway/dispatch` | POST | Send task to agent via WebSocket |
| `/api/gateway/actions` | POST | Quick actions (abort, restart, change model) |
| `/api/gateway/cron` | GET/POST/PUT/DELETE | Cron job CRUD |
| `/api/gateway/webhooks` | GET/POST/PUT/DELETE | Webhook CRUD |
| `/api/gateway/webhooks/test` | POST | Test fire a webhook |
| `/api/gateway/teams` | GET/POST/PUT/DELETE | Team CRUD |
| `/api/gateway/comms` | GET | Cross-agent communication log |
| `/api/gateway/hitl` | GET/POST/PUT/DELETE | HITL queue CRUD |
| `/api/gateway/hitl/scan` | POST | Scan sessions for human-input patterns |
| `/api/gateway/costs` | GET | Cost aggregation by period/agent |
| `/api/gateway/chains` | GET/POST/PUT/DELETE | Task chain CRUD |
| `/api/gateway/chains/check` | POST | Advance chain execution |

## Pixel Art Office

The office is a tile-based 2D world rendered on HTML5 Canvas:

- **4 rooms**: Main Office, Break Room, Server Room, Meeting Room (each 15x10 tiles)
- **Furniture**: desks, chairs, coffee machine, plants, couch, vending machine, server racks, whiteboard, large table
- **Agent characters**: 16x24 pixel sprites with idle, walking, sitting, and typing animations
- **Pathfinding**: A* algorithm for agent movement between furniture and rooms
- **Behaviors**: working at desk, coffee breaks, wandering, room transitions
- **Character creator**: custom color palettes, 4 hair styles, outfit presets
- **Edit mode**: drag-and-drop agents to reassign desks
- **Minimap**: bottom-right overlay showing agent positions across all rooms
- **Room tabs**: top-right overlay for switching rooms with fade transitions

## Design

- **Dark theme**: bg `#0a0a0a`, cards `#141414`, borders `#1f1f1f`, text `#e5e5e5`
- **Accent gradient**: `#DF4F15` (orange) → `#F9425F` (magenta) → `#A326B5` (purple)
- **Font**: Geist Sans + Geist Mono
- **Animations**: Framer Motion for modals, toasts, page transitions

## Architecture

```
src/
  app/                    # 14 page routes + 19 API routes
  components/
    actions/              # Quick action buttons, confirm dialogs
    activity/             # Activity feed
    agents/               # Agent cards, detail views
    budget/               # Cost charts, budget config, alert banners
    chains/               # Chain builder, step editor, templates
    character-creator/    # Color pickers, sprite preview
    comms/                # Communication timeline, filters
    cron/                 # Cron job list, editor, schedule preview
    dispatch/             # Cmd+K dispatch modal, agent selector
    hitl/                 # HITL queue, actions, browser notifications
    pixel-office/         # Canvas, sprites, rooms, pathfinding, furniture
    sessions/             # Session viewer, message bubbles, tool blocks
    tasks/                # Kanban board
    teams/                # Team cards, editor, metrics
    webhooks/             # Webhook list, modal, delivery log
  lib/
    data/                 # React hooks (polling-based, 3s-60s intervals)
    gateway/              # Server-side filesystem readers, parsers, writers
    types.ts              # ~350 lines of shared TypeScript types
    mock-data.ts          # Mock data for all features
```

## Key Patterns

- **Polling architecture**: all data hooks use `setInterval` (3s for live sessions, 10s for HITL, 15-60s for everything else)
- **Live/mock fallback**: API routes try filesystem first, fall back to mock data
- **Server-side WebSocket proxy**: dispatch/actions use WS to OpenClaw gateway — auth token never exposed to client
- **Filesystem-first storage**: teams, HITL, chains stored as JSON in `~/.openclaw/workspace/`
- **localStorage**: budget config, custom palettes, office desk assignments (user preferences)
- **Toast notifications**: global context provider with auto-dismiss (4s default)
- **Cmd+K shortcut**: opens dispatch modal from any page
