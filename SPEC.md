# The Guild — Agent Management Dashboard

## Overview
A Next.js 15 web app for managing AI agents running on OpenClaw. Dark theme, premium feel. Two layers: functional management pages + a pixel art virtual office where agents are visualized as characters.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 4
- Framer Motion (page transitions, UI animations)
- HTML5 Canvas (pixel art office scene)
- No database for v0.1 — reads from filesystem + OpenClaw gateway

## Design
- Dark theme (near-black bg: #0a0a0a, cards: #141414, borders: #1f1f1f)
- Accent gradient: orange #DF4F15 → magenta #F9425F → purple #A326B5 (OWSH brand)
- Clean sidebar nav, modern SaaS aesthetic
- Font: Inter or Geist

## Pages

### Sidebar Navigation
- Logo: "The Guild" with a small pixel sword or shield icon
- Nav items with icons:
  - Guild (pixel office — the home/default page)
  - Agents
  - Activity
  - Tasks
  - Skills
  - Usage
- Bottom: Settings, user info

### /guild (Pixel Art Office) — v0.1 PRIORITY
- HTML5 Canvas rendering a top-down pixel art office
- Isometric or top-down view (top-down simpler for v0.1)
- Office elements: desks, chairs, coffee machine, door, plants
- Each agent = a pixel character at their desk
- Agent states reflected in animation:
  - Working: typing at desk
  - Idle: leaning back or wandering
  - Reporting: walking to NYX's central desk
  - Spawning: new character walks through the door
  - Coffee: walking to coffee machine
- Status bubble above head: 🟢 active, 🟡 idle, 🔴 stopped
- Click an agent → slide-out panel with quick info (name, status, current task, last activity)
- For v0.1: hardcoded 2 agents (NYX and HEMERA) with mock states, basic sprite animations

### /agents
- Grid of agent cards
- Each card: avatar/pixel art, name, emoji, status badge, machine they run on
- Click → detail page with:
  - Identity (reads from SOUL.md concept)
  - Status (active/idle/stopped)
  - Current task
  - Machine/gateway info
  - Memory (recent activity summary)
- For v0.1: hardcoded NYX + HEMERA data

### /activity
- Reverse-chronological feed
- Each entry: timestamp, agent name + avatar, action description
- Filter by agent
- For v0.1: mock activity data

### /tasks
- Kanban board with columns per agent
- Task cards: name, due date, status
- "New Task" button
- For v0.1: mock tasks (HEMERA: outreach queue, NYX: various management tasks)

### /skills
- Per-agent skill list
- What tools/capabilities each agent has
- For v0.1: hardcoded skill lists

### /usage
- Token costs, API calls, uptime per agent
- Charts (bar chart for daily usage, line chart for trends)
- For v0.1: mock data with Recharts

## Pixel Art Specifics
- Sprite size: 32x32 or 16x16 scaled up (chunky pixel look)
- Office tile size: 16x16
- Color palette: limited (8-16 colors per sprite) for authentic pixel feel
- NYX sprite: dark/purple theme (goddess of night)
- HEMERA sprite: warm/golden theme (goddess of day)
- Office palette: dark wood floors, warm lighting, cozy but techy
- Canvas should be responsive, centered on the page

## File Structure
```
src/
  app/
    layout.tsx          # Root layout with sidebar
    page.tsx            # Redirects to /guild
    guild/
      page.tsx          # Pixel art office
    agents/
      page.tsx          # Agent roster
    activity/
      page.tsx          # Activity feed
    tasks/
      page.tsx          # Kanban board
    skills/
      page.tsx          # Skills per agent
    usage/
      page.tsx          # Usage stats
  components/
    sidebar.tsx         # Navigation sidebar
    pixel-office/
      canvas.tsx        # Main canvas component
      sprites.ts        # Sprite definitions (pixel art data)
      office-map.ts     # Office layout/tilemap
      agent-entity.ts   # Agent character logic
    agents/
      agent-card.tsx
      agent-detail.tsx
    activity/
      activity-feed.tsx
      activity-item.tsx
    tasks/
      kanban-board.tsx
      task-card.tsx
    usage/
      usage-chart.tsx
  lib/
    types.ts            # Shared types
    mock-data.ts        # Mock data for v0.1
    constants.ts        # Colors, config
```

## v0.1 Scope (THIS BUILD)
1. Next.js 15 app with dark theme shell + sidebar nav
2. /guild page with pixel art office (Canvas) — NYX + HEMERA characters with basic animations
3. /agents page with agent cards (hardcoded data)
4. /activity page with mock feed
5. /tasks page with basic kanban
6. All other pages as shells with "Coming Soon"
7. NO auth, NO database, NO real gateway connection yet
8. Must build clean, must look premium

## Reference
- BMHQ screenshots (competitor): clean SaaS kanban, agent columns, sidebar nav
- Pixel Agents VS Code extension: pixel characters reflecting real agent state
- OWSH brand: dark mode + orange/magenta/purple gradient accents
