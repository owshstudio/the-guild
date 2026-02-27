# The Guild — Agent Management Dashboard

## Overview

A Next.js 16 web app for managing AI agents running on OpenClaw. Dark theme, premium feel. Two layers: functional management pages + a pixel art virtual office where agents are visualized as animated characters.

**Current state**: Feature-complete through Phase 5. 146 source files, 14 page routes, 19 API routes. Build passes.

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
- Clean sidebar nav with 12 items, modern SaaS aesthetic
- Font: Geist Sans + Geist Mono
- Toast notifications (bottom-right stack, auto-dismiss 4s)

## Pages

### Sidebar Navigation

Logo: "The Guild" with pixel shield icon. Nav items with SVG icons:

| Nav Item | Route | Description |
|----------|-------|-------------|
| Guild | `/guild` | Pixel art office (home/default page) |
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
- Vertical timeline with alternating left/right by sender
- Message cards: avatar, name, time, channel badge, content preview, delivery status
- Filter bar: sender/receiver dropdowns, channel filter
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
- NYX sprite: dark/purple theme (goddess of night)
- HEMERA sprite: warm/golden theme (goddess of day)
- 4 hair templates: long, short, puffy, spiky
- Office palette: dark wood floors, warm lighting, cozy but techy
- Canvas is responsive, centered on the page

## API Architecture

All routes under `/api/gateway/`. Response format: `{ data, source: "live" | "mock" }`.

- **Live mode**: reads from OpenClaw filesystem (`~/.openclaw/agents/`, `~/.openclaw/cron/`, `~/.openclaw/workspace/`)
- **Mock mode**: returns data from `src/lib/mock-data.ts`
- **WebSocket proxy**: dispatch and actions use server-side WS to gateway (auth token stays server-side)
- **Polling**: client hooks use `setInterval` (3s-60s depending on feature urgency)

## Data Hooks

All hooks in `src/lib/data/`:

| Hook | Poll Interval | Purpose |
|------|--------------|---------|
| `useAgents` | 15s | Agent list with status |
| `useActivity` | 15s | Activity feed |
| `useSessions` | 15s | Session list |
| `useSessionDetail` | 3s active, 30s inactive | Single session messages |
| `useGatewayStatus` | 30s | Gateway health |
| `useUsage` | 60s | Token usage |
| `useCron` | 30s | Cron jobs |
| `useWebhooks` | 60s | Webhook configs + delivery log |
| `useTeams` | 30s | Agent teams |
| `useComms` | 15s | Cross-agent messages |
| `useHitl` | 10s | HITL queue |
| `useCosts` | 60s | Cost aggregation |
| `useBudget` | localStorage | Budget config + alerts |
| `useChains` | 15s (+ 30s check) | Task chains |
| `useDispatch` | on-demand | Dispatch task to agent |
| `useActions` | on-demand | Quick actions (abort, restart, etc.) |

## File Structure

```
src/
  app/
    layout.tsx                          # Root layout: providers + sidebar + banners
    page.tsx                            # Redirects to /guild
    guild/page.tsx                      # Pixel art office
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
    settings/page.tsx                   # Settings
    api/gateway/                        # 19 API routes (see API section)
  components/
    sidebar.tsx                         # 12-item navigation sidebar
    gateway-banner.tsx                  # Gateway status banner
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
    sessions/                           # Session viewer, messages, tool blocks
    tasks/                              # Kanban board
    teams/                              # Team cards, editor, metrics
    webhooks/                           # Webhook list, modal, delivery log
  lib/
    data/                               # 17 React hooks (polling-based)
    gateway/                            # Server-side readers, parsers, writers
    types.ts                            # ~350 lines of shared TypeScript types
    mock-data.ts                        # Mock data for all features
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
