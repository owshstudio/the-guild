import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { EditModeState } from "./edit-mode";
import { TileType } from "./tiles";
import { OFFICE } from "./office-map";
import { AgentEntity } from "./agent-entity";
import { RoomDefinition, RoomId } from "@/lib/types";

// ── EDIT BUTTON ──────────────────────────────────────

const EDIT_BTN_W = 60;
const EDIT_BTN_H = 22;
const EDIT_BTN_X = OFFICE.width - EDIT_BTN_W - 8;
const EDIT_BTN_Y = 8;

export { EDIT_BTN_W, EDIT_BTN_H, EDIT_BTN_X, EDIT_BTN_Y };

const btnLabelStyle = new TextStyle({
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: 10,
  fill: "#333333",
});

export function createEditButton(): Container {
  const container = new Container();
  const bg = new Graphics();
  const label = new Text({ text: "Edit", style: btnLabelStyle });
  label.anchor.set(0.5, 0.5);
  label.x = EDIT_BTN_X + EDIT_BTN_W / 2;
  label.y = EDIT_BTN_Y + EDIT_BTN_H / 2;

  container.addChild(bg, label);
  drawEditButtonState(bg, label, false);
  return container;
}

export function updateEditButton(
  container: Container,
  isActive: boolean
): void {
  const bg = container.getChildAt(0) as Graphics;
  const label = container.getChildAt(1) as Text;
  drawEditButtonState(bg, label, isActive);
}

function drawEditButtonState(
  bg: Graphics,
  label: Text,
  isActive: boolean
): void {
  bg.clear();

  if (isActive) {
    bg.rect(EDIT_BTN_X, EDIT_BTN_Y, EDIT_BTN_W, EDIT_BTN_H);
    bg.fill({ color: 0x3b82f6, alpha: 0.9 });
    bg.stroke({ color: 0x2563eb, width: 1 });
    label.text = "Done";
    label.style.fill = "#ffffff";
  } else {
    bg.rect(EDIT_BTN_X, EDIT_BTN_Y, EDIT_BTN_W, EDIT_BTN_H);
    bg.fill({ color: 0xffffff, alpha: 0.7 });
    bg.stroke({ color: 0x000000, alpha: 0.15, width: 1 });
    label.text = "Edit";
    label.style.fill = "#333333";

    // Pencil icon (simplified)
    const ix = EDIT_BTN_X + 10;
    const iy = EDIT_BTN_Y + EDIT_BTN_H / 2;
    bg.moveTo(ix - 4, iy + 3);
    bg.lineTo(ix + 2, iy - 3);
    bg.lineTo(ix + 4, iy - 1);
    bg.lineTo(ix - 2, iy + 5);
    bg.closePath();
    bg.stroke({ color: 0x555555, width: 1.5 });
  }
}

// ── HOVER OVERLAY ────────────────────────────────────

// Dirty tracking for hover to avoid per-frame Graphics rebuilds
let lastHoverKey = "";

export function updateHoverOverlay(
  graphics: Graphics,
  agent: AgentEntity | null,
  scale: number
): void {
  const key = agent ? `${agent.id}:${agent.x}:${agent.y}:${scale}` : "";
  if (key === lastHoverKey) return;
  lastHoverKey = key;

  graphics.clear();
  if (!agent) return;

  const w = 16 * scale;
  const h = 24 * scale;
  const x = agent.x - 4;
  const y = agent.y - 4;
  const totalW = w + 8;
  const totalH = h + 8;

  // Simulated dashed border with small rectangles
  const dashLen = 4;
  const gapLen = 4;
  const color = 0x000000;
  const alpha = 0.2;

  // Top edge
  for (let dx = 0; dx < totalW; dx += dashLen + gapLen) {
    const segW = Math.min(dashLen, totalW - dx);
    graphics.rect(x + dx, y, segW, 2);
  }
  // Bottom edge
  for (let dx = 0; dx < totalW; dx += dashLen + gapLen) {
    const segW = Math.min(dashLen, totalW - dx);
    graphics.rect(x + dx, y + totalH - 2, segW, 2);
  }
  // Left edge
  for (let dy = 0; dy < totalH; dy += dashLen + gapLen) {
    const segH = Math.min(dashLen, totalH - dy);
    graphics.rect(x, y + dy, 2, segH);
  }
  // Right edge
  for (let dy = 0; dy < totalH; dy += dashLen + gapLen) {
    const segH = Math.min(dashLen, totalH - dy);
    graphics.rect(x + totalW - 2, y + dy, 2, segH);
  }

  graphics.fill({ color, alpha });
}

// ── EDIT MODE OVERLAYS ───────────────────────────────

const bannerStyle = new TextStyle({
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: 14,
  fill: "#3b82f6",
});

export function createEditModeOverlay(): Container {
  const container = new Container();
  container.visible = false;

  // Banner text
  const banner = new Text({ text: "EDIT MODE", style: bannerStyle });
  banner.anchor.set(0.5, 0.5);
  banner.x = OFFICE.width / 2;
  banner.y = OFFICE.height - 16;
  container.addChild(banner);

  // Graphics layer for chair highlights and drop targets
  const highlights = new Graphics();
  container.addChild(highlights);

  return container;
}

export function updateEditModeOverlays(
  container: Container,
  editState: EditModeState,
  roomDef: RoomDefinition,
  pulse: number
): void {
  container.visible = editState.active;
  if (!editState.active) return;

  const ts = OFFICE.tileSize;

  // Update banner alpha
  const banner = container.getChildAt(0) as Text;
  banner.alpha = 0.6 + pulse * 0.4;

  // Update highlights
  const highlights = container.getChildAt(1) as Graphics;
  highlights.clear();

  // Pulsing chair borders
  const layout = roomDef.layout;
  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < (layout[row]?.length ?? 0); col++) {
      if (layout[row][col] === TileType.Chair) {
        const x = col * ts;
        const y = row * ts;

        // Simulated dashed border
        const dashLen = 4;
        const gapLen = 4;
        const totalW = ts - 4;
        const totalH = ts - 4;
        const ox = x + 2;
        const oy = y + 2;

        for (let dx = 0; dx < totalW; dx += dashLen + gapLen) {
          const segW = Math.min(dashLen, totalW - dx);
          highlights.rect(ox + dx, oy, segW, 2);
          highlights.rect(ox + dx, oy + totalH - 2, segW, 2);
        }
        for (let dy = 0; dy < totalH; dy += dashLen + gapLen) {
          const segH = Math.min(dashLen, totalH - dy);
          highlights.rect(ox, oy + dy, 2, segH);
          highlights.rect(ox + totalW - 2, oy + dy, 2, segH);
        }
        highlights.fill({ color: 0x3b82f6, alpha: pulse });
      }
    }
  }

  // Valid drop targets during drag
  if (editState.draggedAgentId && editState.mousePixel) {
    for (const target of editState.validDropTargets) {
      const x = target.col * ts;
      const y = target.row * ts;
      highlights.rect(x, y, ts, ts);
      highlights.fill({ color: 0x22c55e, alpha: pulse * 0.6 });
      highlights.rect(x + 1, y + 1, ts - 2, ts - 2);
      highlights.stroke({ color: 0x22c55e, alpha: 0.5 + pulse, width: 2 });
    }

    // Red X on invalid tile at mouse
    const tileCol = Math.floor(editState.mousePixel.x / ts);
    const tileRow = Math.floor(editState.mousePixel.y / ts);
    const isValid = editState.validDropTargets.some(
      (t) => t.col === tileCol && t.row === tileRow
    );
    if (
      !isValid &&
      tileCol >= 0 &&
      tileCol < 15 &&
      tileRow >= 0 &&
      tileRow < 10
    ) {
      const cx = tileCol * ts + ts / 2;
      const cy = tileRow * ts + ts / 2;
      highlights.moveTo(cx - 12, cy - 12);
      highlights.lineTo(cx + 12, cy + 12);
      highlights.moveTo(cx + 12, cy - 12);
      highlights.lineTo(cx - 12, cy + 12);
      highlights.stroke({ color: 0xef4444, alpha: 0.7, width: 3 });
    }
  }
}

// ── ROOM TAB BAR ─────────────────────────────────────

const TAB_W = 56;
const TAB_H = 18;
const TAB_GAP = 4;
const TAB_MARGIN = 8;
const TAB_Y = 8;

export const ROOM_TAB_BOUNDS = {
  x: TAB_MARGIN,
  y: TAB_Y,
  totalW: (TAB_W + TAB_GAP) * 4 - TAB_GAP,
  h: TAB_H,
};

const tabLabelStyle = new TextStyle({
  fontFamily: "monospace",
  fontWeight: "bold",
  fontSize: 8,
  fill: "#aaaaaa",
});

interface TabEntry {
  bg: Graphics;
  label: Text;
  id: RoomId;
  x: number;
}

export interface RoomTabBar {
  container: Container;
  tabs: TabEntry[];
  update: (currentRoom: RoomId) => void;
  hitTest: (px: number, py: number) => RoomId | null;
}

const TAB_LABELS: Record<RoomId, string> = {
  "main-office": "Office",
  "break-room": "Break",
  "server-room": "Server",
  "meeting-room": "Meeting",
};

export function createRoomTabBar(uiLayer: Container): RoomTabBar {
  const container = new Container();
  uiLayer.addChild(container);

  const roomIds: RoomId[] = ["main-office", "break-room", "server-room", "meeting-room"];
  const tabs: TabEntry[] = [];
  let lastRoom: RoomId | null = null;

  for (let i = 0; i < roomIds.length; i++) {
    const id = roomIds[i];
    const x = TAB_MARGIN + i * (TAB_W + TAB_GAP);

    const bg = new Graphics();
    container.addChild(bg);

    const label = new Text({
      text: TAB_LABELS[id],
      style: tabLabelStyle.clone(),
    });
    label.anchor.set(0.5, 0.5);
    label.x = x + TAB_W / 2;
    label.y = TAB_Y + TAB_H / 2;
    container.addChild(label);

    tabs.push({ bg, label, id, x });
  }

  function update(currentRoom: RoomId) {
    if (currentRoom === lastRoom) return;
    lastRoom = currentRoom;

    for (const tab of tabs) {
      const isActive = tab.id === currentRoom;
      tab.bg.clear();
      tab.bg.roundRect(tab.x, TAB_Y, TAB_W, TAB_H, 4);
      if (isActive) {
        tab.bg.fill({ color: 0x3b82f6, alpha: 0.85 });
        tab.label.style.fill = "#ffffff";
      } else {
        tab.bg.fill({ color: 0x1a1a1a, alpha: 0.55 });
        tab.label.style.fill = "#aaaaaa";
      }
    }
  }

  function hitTest(px: number, py: number): RoomId | null {
    if (py < TAB_Y || py > TAB_Y + TAB_H) return null;
    for (const tab of tabs) {
      if (px >= tab.x && px <= tab.x + TAB_W) return tab.id;
    }
    return null;
  }

  // Initial draw
  update("main-office");

  return { container, tabs, update, hitTest };
}
