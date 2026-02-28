# The Guild — Agent Management Dashboard

## Overview

A Next.js 16 web app for managing AI agents running on OpenClaw. Dark theme, premium feel. Two layers: functional management pages + a pixel art virtual office where agents are visualized as animated characters.

**Current state**: v0.5.0 — feature-complete with chat interface, CLI/Docker distribution, API auth, and polish pass. 162 source files, 15 page routes, 24 API routes, 20 data hooks. All agents discovered dynamically from `~/.openclaw/agents/` — no hardcoded agent list. Build passes (40 static/dynamic routes).

## Stack

- Next.js 16 (App Router, Turbopack, TypeScript)
- React 19
- Tailwind CSS 4
- Framer Motion (page transitions, UI animations, drag reordering)
- Recharts (usage/cost charts)
- HTML5 Canvas (pixel art office with A* pathfinding)
- No database — reads from OpenClaw filesystem (`~/.openclaw/`) + localStorage for user prefs

## Design

- Dark theme (near-black bg: `#0a0a0a`, cards: `#141414`, borders: `#1f1f1f`, text: `#e5e5e5`, muted: `#737373`)
- Accent gradient: orange `#DF4F15` → magenta `#F9425F` → purple `#A326B5` (OWSH brand)
- Clean sidebar nav with 13 items, modern SaaS aesthetic
- Font: Geist Sans + Geist Mono
- Toast notifications (bottom-right stack, auto-dismiss 4s)

## Pages

### Sidebar Navigation

Logo: "The Guild" with pixel shield icon. Nav items with SVG icons:

| Nav Item | Route | Description |
|----------|-------|-------------|
| Guild | `/guild` | Pixel art office (home/default page) |
| Chat | `/chat` | Chat interface with agent selection + session resume |
| Agents | `/agents` | Agent roster + team grouping |
| Activity | `/activity` | Reverse-chronological event feed |
| Sessions | `/sessions` | Live session viewer (two-panel) |
| Tasks | `/tasks` | Kanban board |
| Comms | `/comms` | Cross-agent communication timeline |
| HITL | `/hitl` | Human-in-the-loop approval queue |
| Skills | `/skills` | Per-agent tool/capability lists |
| Usage | `/usage` | Token usage, costs, budget (3 tabs) |
| Cron | `/cron` | Scheduled job editor |
| Webhooks | `/webhooks` | Webhook configurator + delivery log |
| Chains | `/chains` | Task chain visual builder |

Bottom: Settings link.

### /guild (Pixel Art Office)

- HTML5 Canvas rendering a top-down pixel art office
- **4 rooms**: Main Office, Break Room, Server Room, Meeting Room (each 15x10 tiles)
- **Room navigation**: tab bar (top-right) + minimap (bottom-right) showing agent positions
- **Room transitions**: 400ms fade between rooms, agents walk through doors
- Office elements: desks, chairs, coffee machine, door, plants, couch, vending machine, server racks, whiteboard, large table
- Each agent = a 16x24 pixel character with idle, walking, sitting, typing animations
- A* pathfinding for agent movement
- Agent behaviors: working at desk, coffee breaks, wandering, room transitions (5% chance)
- Status bubble above head (green/yellow/red)
- Click agent → slide-out panel with quick info + Send Task button + Kill button
- **Character creator**: slide-out panel with color pickers (skin, hair, shirt, pants, shoes), 4 hair styles, 5 outfit presets
- **Edit mode**: toggle to drag-and-drop agents to reassign desks

### /chat

- **Agent pill bar** (top): horizontal scroll, emoji + name on desktop, emoji-only on mobile, `aria-label` for accessibility
- **Session drawer**: toggle to see recent sessions sorted by recency, click to resume
- **Message thread**: real-time SSE streaming, auto-scroll, optimistic user messages
- **MessageBubble**: inline markdown rendering (bold, italic, code, links), empty assistant messages (tool-only turns) hidden
- **Loading states**: `isLoadingSession` spinner when resuming a session, streaming indicator with pulse animation
- **Agent switching**: EventSource cleanup on agent change (prevents connection leaks)
- **Input**: auto-resize textarea, `Cmd+Enter` to send, disabled when no agent selected or streaming
- **Mobile**: `h-[calc(100vh-56px)]` to match 56px top bar, `scrollbar-none` on pill bar

### /agents

- Grid of agent cards (emoji, name, status badge, machine)
- **Agents | Teams toggle**: switch between flat list and team-grouped view
- Click → detail page with identity, status, current task, machine info, memory
- **Agent actions bar**: Kill Session, Restart, Change Model, View Sessions
- **Team management**: create/edit teams with name, color, lead agent, member selection

### /sessions

- **Two-panel layout**: session list (left 320px) + viewer (right flex-1)
- Session list: search, sorted by recency, active indicator (pulsing green dot)
- Session viewer: full conversation with message pagination (load 100, scroll for more)
- Message bubbles: user (right, blue tint), assistant (left, card bg), system (centered)
- Tool call blocks: collapsible with name header + input/output JSON
- Session header: ID, model badge, status, duration, tokens/cost, abort button for active
- **Polling**: 3s for active sessions, 30s for inactive

### /comms

- Cross-agent communication timeline parsed from session data
- Scans all agent session directories for cross-agent mentions
- Vertical timeline with alternating left/right by message index
- Message cards: avatar, name, time, channel badge, content preview, delivery status
- Filter bar: dynamic sender/receiver dropdowns from live agent list, channel filter
- Channels: whatsapp-group, git-sync, session, alert-file, delivery-queue

### /hitl

- Human-in-the-loop approval queue sorted by priority (critical → low)
- Cards: priority badge, agent emoji+name, time, title, expandable context
- Action buttons: Approve / Reject / Respond (with optional text input)
- **Pattern scanning**: regex detection for "waiting for approval", "need human input", etc.
- **Browser notifications**: fires on new items (with permission request)
- Sidebar badge shows pending count
- **Polling**: 10s for queue, 60s for session scanning

### /usage

Three tabs:
- **Tokens**: daily token bar chart + trends line chart per agent (existing)
- **Costs**: dollar amounts per day/agent, cost breakdown by session/model
- **Budget**: daily/weekly/monthly limits, per-agent overrides, alert threshold config

Budget alert banner appears at page top when spend exceeds configured thresholds.

### /cron

- Job list with cards: name, schedule badge, agent target, enabled toggle, last run status
- Create/edit modal: name, schedule (recurring presets or one-time datetime), agent, session target, wake mode, payload type
- Schedule preview: "Every 30 min" or "Mar 3 at 10:00 AM" with clock icon
- Delete confirmation dialog
- **Storage**: `~/.openclaw/cron/jobs.json` (atomic write via .tmp + rename)

### /webhooks

- Webhook list: name, URL (monospace truncated), event badges, enabled toggle, test button
- Create/edit modal: name, URL, events (multi-select), secret (show/hide), enabled toggle
- Delivery log table: timestamp, event, status code, success dot, error (last 10)
- Test button fires POST and shows result immediately
- **HMAC-SHA256 signing**: `X-Guild-Signature` header when secret is set
- Event types: session.start, session.end, session.error, task.complete, cron.run

### /chains

- Task chain list with status badges and step progress dots
- **Visual chain builder**: vertical step cards with SVG arrow connectors
- **Drag reordering**: Framer Motion Reorder for step repositioning
- Step editor modal: trigger type, action type, on-failure strategy, max retries
- Chain controls: pause, resume, delete
- **3 templates**: "Daily Outreach Pipeline", "Deploy and Verify", "Research and Report"
- Trigger types: task-complete, time-based, event-based, manual
- Action types: start-task, send-message, run-cron, webhook, notify-human

### /tasks

- Kanban board with columns per agent
- Task cards: name, due date, status

### /skills

- Per-agent skill/tool lists

## Pixel Art Specifics

- Sprite size: 16x24 pixels scaled up (chunky pixel look)
- Office tile size: 48x48 pixels on canvas
- Color palette: limited per sprite for authentic pixel feel, palette-swappable
- **Known sprites**: NYX (dark/purple, long hair) and HEMERA (warm/golden, puffy hair) have hand-drawn pixel templates
- **Dynamic agents**: any new agent gets a palette-generated sprite from its agent color using `generatePalette()`
- Palette lookup: `PALETTES[agentId]` for known agents, `generatePalette(agent.color)` for dynamic ones
- 4 hair templates: long, short, puffy, spiky (selectable in character creator)
- Office palette: dark wood floors, warm lighting, cozy but techy
- Canvas is responsive, centered on the page
- Desk assignments: `"main"` agent gets desk 1; additional agents fill remaining desks or stand on open floor

## API Architecture

All routes under `/api/gateway/`. Response format: `{ data, source: "live" | "mock" }`.

- **Live mode**: reads from OpenClaw filesystem (`~/.openclaw/agents/`, `~/.openclaw/cron/`, `~/.openclaw/workspace/`). Detected via `hasOpenClawInstallation()` which checks for `openclaw.json`.
- **Mock mode**: returns generic demo data from `src/lib/mock-data.ts` (single "Demo Agent"). Only shown when OpenClaw is not installed — never when installed but empty.
- **Dynamic agent discovery**: `agent-builder.ts` scans `~/.openclaw/agents/` subdirectories, reads identity/soul/tools per agent, generates deterministic colors
- **Configurable**: `OPENCLAW_DIR` env var for non-standard install paths, `GATEWAY_PORT` for port override
- **Auth**: `GUILD_API_TOKEN` env var — when set, all `/api/gateway/*` requests require `Authorization: Bearer <token>` header or `guild_token` cookie (for SSE). When unset, auth is skipped (backwards compatible).
- **Auth middleware**: `src/proxy.ts` (Next.js 16 proxy, not middleware.ts) — checks header then cookie fallback
- **WebSocket proxy**: dispatch and actions use server-side WS to gateway (auth token stays server-side)
- **SSE streaming**: `/api/gateway/sessions/[id]/stream` for real-time session events (used by Chat and Guild pages)
- **Polling**: client hooks use `setInterval` (3s-60s depending on feature urgency)

## CLI & Distribution

- **CLI entry point**: `bin/cli.mjs` — `npx @owshstudio/the-guild` or `node bin/cli.mjs`
- **Flags**: `--port <number>`, `--lan` (bind 0.0.0.0), `--dev` (Turbopack dev mode)
- **Production mode**: `process.chdir()` into `.next/standalone/` before importing `server.js`
- **Dev mode**: spawns `npx next dev` with `env: process.env` for custom env var passthrough
- **Docker**: `Dockerfile` (multi-stage build) + `docker-compose.yml` with `~/.openclaw` volume mount
- **npm publish**: `.npmignore` keeps `bin/`, `.next/standalone/`, `.next/static/`, `public/`, excludes `src/`

## Data Hooks

All hooks in `src/lib/data/` (20 hooks + 2 support files):

| Hook | Poll Interval | Purpose |
|------|--------------|---------|
| `useAgents` | 15s | Agent list with status |
| `useActivity` | 15s | Activity feed |
| `useChat` | SSE stream | Chat with agents (send/receive, session resume) |
| `useSessions` | 15s | Session list |
| `useSessionDetail` | 3s active, 30s inactive | Single session messages |
| `useGatewayStatus` | 30s | Gateway health |
| `useUsage` | 60s | Token usage |
| `useCosts` | 60s | Cost aggregation |
| `useBudget` | localStorage | Budget config + alerts |
| `useTasks` | 15s | Kanban task board |
| `useCron` | 30s | Cron jobs |
| `useWebhooks` | 60s | Webhook configs + delivery log |
| `useTeams` | 30s | Agent teams |
| `useComms` | 15s | Cross-agent messages |
| `useHitl` | 10s | HITL queue |
| `useChains` | 15s (+ 30s check) | Task chains |
| `useDispatch` | on-demand | Dispatch task to agent |
| `useActions` | on-demand | Quick actions (abort, restart, etc.) |
| `useEventSource` | SSE stream | Reusable SSE connection hook |
| `useToasts` | — | Toast notification state |

Support files: `data-provider.tsx` (live/mock context), `sse-manager.ts` (SSE connection lifecycle).

## File Structure

```
bin/
  cli.mjs                              # CLI entry point (npx @owshstudio/the-guild)
src/
  proxy.ts                             # Next.js 16 auth proxy (Bearer token + cookie fallback)
  app/
    layout.tsx                          # Root layout: providers + sidebar + banners
    page.tsx                            # Redirects to /guild
    guild/page.tsx                      # Pixel art office
    chat/page.tsx                       # Chat interface with agent selection
    agents/page.tsx                     # Agent roster + teams toggle
    activity/page.tsx                   # Activity feed
    sessions/page.tsx                   # Two-panel session viewer
    tasks/page.tsx                      # Kanban board
    comms/page.tsx                      # Communication timeline
    hitl/page.tsx                       # HITL approval queue
    skills/page.tsx                     # Agent skills
    usage/page.tsx                      # Tokens + Costs + Budget tabs
    cron/page.tsx                       # Cron editor
    webhooks/page.tsx                   # Webhook configurator
    chains/page.tsx                     # Task chain builder
    settings/page.tsx                   # Settings + auth token + network info
    api/gateway/                        # 24 API routes (18 feature endpoints + 6 action routes)
    api/auth/                           # Login endpoint (sets guild_token cookie)
  components/
    sidebar.tsx                         # 13-item navigation sidebar
    gateway-banner.tsx                  # Gateway status banner
    gateway-provider.tsx                # Live/mock data source provider
    toast-provider.tsx                  # Toast context + auto-dismiss
    toast-container.tsx                 # Fixed bottom-right toast stack
    actions/                            # Quick action buttons, confirm dialogs
    activity/                           # Activity feed components
    agents/                             # Agent cards, detail views
    budget/                             # Cost charts, budget config, alert banners
    chains/                             # Chain builder, step editor, templates
    character-creator/                  # Color pickers, sprite preview
    comms/                              # Communication timeline, filters
    cron/                               # Cron job list, editor, schedule preview
    dispatch/                           # Cmd+K modal, agent selector
    hitl/                               # HITL queue, actions, notifications
    pixel-office/                       # Canvas, sprites, rooms, pathfinding
    sessions/                           # Session viewer, message bubbles, tool blocks
    tasks/                              # Kanban board
    teams/                              # Team cards, editor, metrics
    webhooks/                           # Webhook list, modal, delivery log
  lib/
    data/                               # 20 React hooks + 2 support files (see Data Hooks)
      data-provider.tsx                 # Live/mock context provider
      sse-manager.ts                    # SSE connection lifecycle manager
      use-chat.ts                       # Chat hook (SSE streaming, session resume)
      use-agents.ts                     # Agent list with polling
      use-tasks.ts                      # Kanban task state
      ...                               # 17 more hooks (see Data Hooks table)
    gateway/                            # Server-side readers, parsers, writers (22 files)
      agent-builder.ts                  # Dynamic agent discovery from ~/.openclaw/agents/
      filesystem.ts                     # Low-level filesystem readers (sessions, identity, tools)
      config.ts                         # OpenClaw config + OPENCLAW_DIR/GATEWAY_PORT env vars
      detect.ts                         # hasOpenClawInstallation() check
      session-parser.ts                 # JSONL session parser
      usage-aggregator.ts              # Per-agent daily token aggregation
      activity-builder.ts              # Activity feed from sessions (all agents)
      cost-calculator.ts               # Per-agent cost estimation
      model-costs.ts                   # Model pricing table for cost calculation
      comms-builder.ts                 # Cross-agent communication scanner (all agents)
      hitl-manager.ts                  # HITL queue + pattern scanner (all agents)
      teams-manager.ts                 # Team CRUD (JSON file storage)
      task-store.ts                    # Kanban task persistence
      chain-engine.ts                  # Task chain execution engine
      cron-writer.ts                   # Cron job file writer (atomic .tmp + rename)
      webhook-store.ts                 # Webhook config persistence
      webhook-dispatcher.ts            # Webhook delivery + HMAC-SHA256 signing
      ws-client.ts                     # Server-side WebSocket client for gateway
      health.ts                        # Gateway health check
      validate.ts                      # Input validation helpers
      file-watcher.ts                  # Filesystem change detection
      office-config.ts                 # Pixel office desk/room configuration
    types.ts                            # ~350 lines of shared TypeScript types
    mock-data.ts                        # Generic demo data (single "Demo Agent")
    settings.ts                         # Settings load/save (localStorage)
    gateway.ts                          # Client-side gateway health check
    constants.ts                        # Colors, config
```

## Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open dispatch modal (send task to any agent) |
| `Cmd+Enter` | Send message in dispatch modal |

## Phase History

- **v0.1 (Phases 1-3)**: Core shell, pixel office (single room), gateway integration, sprite polish
- **v0.2 (Phases 4-5)**: Toast system, sessions, dispatch, cron, webhooks, multi-room office, character creator, teams, comms, HITL, budget, chains
- **v0.3 (Make It Real)**: Dynamic N-agent discovery, removed all hardcoded NYX/HEMERA references, env configuration (`OPENCLAW_DIR`, `GATEWAY_PORT`), mock/live detection, README + `.env.example`, generic demo data fallback
- **v0.4 (Chat + Mobile)**: Chat page with SSE streaming, agent pill bar, session resume drawer, inline markdown rendering (bold/italic/code/links), mobile-responsive layout, kanban task board, guild page wiring
- **v0.5 (Ship-Ready)**: CLI distribution (`bin/cli.mjs` with `--port`, `--lan`, `--dev`), Docker support, API auth (`GUILD_API_TOKEN` + `proxy.ts`), `.npmignore` for npm publish, EventSource leak fixes (chat agent switch + guild page unmount), session load error handling, `isLoadingSession` state, accessibility (aria-labels, viewBox fix), `scrollbar-none` CSS utility, mobile height fix (56px top bar), sessions page flex fix, message bubble polish (empty message filtering, markdown rendering), version bump to 0.5.0
