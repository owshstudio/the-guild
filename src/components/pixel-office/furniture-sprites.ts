import { Texture } from "pixi.js";

// Pre-rendered pixel art furniture sprites using offscreen canvases

export type FurnitureType =
  | "desk-left"
  | "desk-right"
  | "chair"
  | "plant"
  | "coffee-machine"
  | "bookshelf"
  | "door"
  | "door-left"
  | "door-bottom"
  | "couch"
  | "vending-machine"
  | "small-table"
  | "server-rack"
  | "whiteboard"
  | "large-table"
  | "rug-tl"
  | "rug-t"
  | "rug-tr"
  | "rug-l"
  | "rug-c"
  | "rug-r"
  | "rug-bl"
  | "rug-b"
  | "rug-br"
  | "wall-clock"
  | "poster"
  | "filing-cabinet"
  | "printer"
  | "water-cooler"
  | "trash-can";

const TILE = 64;
const cache = new Map<string, HTMLCanvasElement>();

function createCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = TILE;
  c.height = TILE;
  const ctx = c.getContext("2d")!;
  return [c, ctx];
}

// Helper: fill a rectangle with pixel scale
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawDeskLeft(ctx: CanvasRenderingContext2D) {
  // Desk surface — warm brown wood
  px(ctx, 2, 16, 60, 32, "#8b6f47");
  px(ctx, 2, 16, 60, 4, "#a88a5c"); // top edge highlight
  px(ctx, 2, 44, 60, 4, "#6d5535"); // bottom edge shadow

  // Front panel
  px(ctx, 4, 48, 56, 14, "#7a6340");
  px(ctx, 4, 48, 56, 2, "#6d5535");

  // Left leg
  px(ctx, 4, 48, 4, 14, "#6d5535");
  // Right edge (connects to desk-right)
  px(ctx, 58, 48, 4, 14, "#6d5535");

  // Monitor
  px(ctx, 14, 4, 28, 18, "#1a1a2e");
  px(ctx, 16, 6, 24, 14, "#2a3a5c"); // screen face
  px(ctx, 16, 6, 24, 2, "#4a6a9c"); // screen highlight bar
  // Stand
  px(ctx, 24, 22, 12, 4, "#3a3a3a");
  px(ctx, 26, 26, 8, 2, "#3a3a3a");

  // Keyboard — solid block
  px(ctx, 16, 30, 24, 6, "#4a4a4a");
}

function drawDeskRight(ctx: CanvasRenderingContext2D) {
  // Desk surface
  px(ctx, 2, 16, 60, 32, "#8b6f47");
  px(ctx, 2, 16, 60, 4, "#a88a5c");
  px(ctx, 2, 44, 60, 4, "#6d5535");

  // Front panel
  px(ctx, 4, 48, 56, 14, "#7a6340");
  px(ctx, 4, 48, 56, 2, "#6d5535");

  // Right leg
  px(ctx, 56, 48, 4, 14, "#6d5535");
  // Left edge
  px(ctx, 2, 48, 4, 14, "#6d5535");

  // Mouse pad + mouse
  px(ctx, 12, 28, 16, 12, "#2a2a2a");
  px(ctx, 14, 30, 4, 6, "#5a5a5a");

  // Notepad
  px(ctx, 34, 26, 16, 18, "#f0ead6");
  px(ctx, 36, 28, 12, 14, "#e0dac6");

  // Coffee mug
  px(ctx, 10, 22, 8, 8, "#e8e0cc");
  px(ctx, 18, 24, 3, 4, "#e8e0cc"); // handle
  px(ctx, 12, 22, 4, 2, "#6b4423"); // coffee
}

function drawChair(ctx: CanvasRenderingContext2D) {
  // Backrest — solid dark
  px(ctx, 14, 4, 36, 8, "#2e2e2e");
  px(ctx, 14, 4, 36, 2, "#404040"); // top edge highlight

  // Arms
  px(ctx, 12, 6, 4, 18, "#2e2e2e");
  px(ctx, 48, 6, 4, 18, "#2e2e2e");

  // Seat cushion — 2-tone teal
  px(ctx, 10, 22, 44, 20, "#2d5a5a");
  px(ctx, 10, 22, 44, 4, "#3a6e6e"); // seat highlight

  // Gas cylinder
  px(ctx, 28, 42, 8, 8, "#1e1e1e");
  px(ctx, 30, 42, 4, 8, "#2a2a2a");

  // Star base legs (no wheel detail)
  px(ctx, 14, 50, 10, 4, "#2a2a2a");
  px(ctx, 27, 50, 10, 4, "#2a2a2a");
  px(ctx, 40, 50, 10, 4, "#2a2a2a");
  px(ctx, 16, 54, 6, 4, "#1a1a1a");
  px(ctx, 29, 54, 6, 4, "#1a1a1a");
  px(ctx, 42, 54, 6, 4, "#1a1a1a");
}

function drawPlant(ctx: CanvasRenderingContext2D) {
  // Pot body — 2-tone terracotta
  px(ctx, 20, 42, 24, 16, "#b05c3c");
  px(ctx, 22, 50, 20, 8, "#9a4c30");
  px(ctx, 24, 56, 16, 4, "#8a4428");

  // Top rim
  px(ctx, 16, 36, 32, 4, "#c87850");
  px(ctx, 18, 36, 28, 2, "#d08860");
  px(ctx, 16, 40, 32, 2, "#a05030");

  // Soil — solid
  px(ctx, 20, 38, 24, 4, "#4a3020");

  // Leaves — 3-4 distinct blobs in 3 greens
  px(ctx, 14, 20, 10, 12, "#3d6b4a"); // dark back left
  px(ctx, 40, 22, 8, 10, "#3d6b4a"); // dark back right
  px(ctx, 20, 12, 10, 18, "#4a7c59"); // mid left
  px(ctx, 34, 14, 10, 16, "#4a7c59"); // mid right
  px(ctx, 26, 16, 12, 16, "#4a7c59"); // mid center
  px(ctx, 22, 10, 8, 8, "#5d9a6e"); // bright left
  px(ctx, 34, 12, 8, 8, "#5d9a6e"); // bright right
  px(ctx, 28, 6, 8, 10, "#5d9a6e"); // bright top
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D) {
  // Water reservoir top
  px(ctx, 16, 4, 32, 6, "#4a5a6a");
  px(ctx, 16, 4, 32, 2, "#5a6a7a");
  px(ctx, 16, 10, 32, 2, "#1a2a3a");

  // Machine body
  px(ctx, 12, 12, 40, 44, "#303030");
  px(ctx, 12, 12, 3, 44, "#252525");
  px(ctx, 49, 12, 3, 44, "#252525");

  // Display — solid green rect
  px(ctx, 18, 14, 28, 8, "#3c3c3c");
  px(ctx, 20, 15, 24, 6, "#1a2a3a");
  px(ctx, 22, 16, 6, 4, "#4a9a5a");

  // Buttons — 3 solid
  px(ctx, 18, 26, 8, 6, "#505050");
  px(ctx, 28, 26, 8, 6, "#505050");
  px(ctx, 38, 26, 8, 6, "#505050");

  // Brew chamber / nozzle
  px(ctx, 20, 34, 24, 4, "#1a1a1a");
  px(ctx, 28, 38, 8, 4, "#2a2a2a");

  // Drip area + cup
  px(ctx, 20, 42, 24, 10, "#141414");
  px(ctx, 24, 42, 14, 10, "#f0e8d8");
  px(ctx, 24, 42, 14, 2, "#6b4423");
  px(ctx, 38, 44, 4, 4, "#f0e8d8");

  // Drip tray
  px(ctx, 14, 52, 36, 4, "#1a1a1a");
  px(ctx, 16, 53, 32, 2, "#282828");
}

function drawBookshelf(ctx: CanvasRenderingContext2D) {
  // Top surface
  px(ctx, 4, 2, 56, 6, "#8a6c4a");
  px(ctx, 4, 2, 56, 2, "#9a7c5a");
  px(ctx, 4, 8, 56, 2, "#4a3820");

  // Shelf frame
  px(ctx, 4, 10, 56, 52, "#7a5c3a");
  px(ctx, 4, 10, 4, 52, "#6a4c2a");
  px(ctx, 56, 10, 4, 52, "#6a4c2a");

  // Shelf panels with shadow
  px(ctx, 8, 10, 48, 2, "#6d5030");
  px(ctx, 8, 12, 48, 2, "#4a3018");
  px(ctx, 8, 26, 48, 2, "#6d5030");
  px(ctx, 8, 28, 48, 2, "#4a3018");
  px(ctx, 8, 44, 48, 2, "#6d5030");
  px(ctx, 8, 46, 48, 2, "#4a3018");

  // Shelf backs
  px(ctx, 8, 14, 48, 12, "#5c4228");
  px(ctx, 8, 30, 48, 14, "#5c4228");
  px(ctx, 8, 48, 48, 12, "#5c4228");

  // Top shelf books — solid blocks, no spine highlights
  px(ctx, 10, 14, 8, 12, "#3b5998");
  px(ctx, 18, 16, 6, 10, "#b91c1c");
  px(ctx, 24, 14, 8, 12, "#15803d");
  px(ctx, 32, 15, 6, 11, "#7c3aed");
  px(ctx, 38, 14, 8, 12, "#d97706");
  px(ctx, 46, 16, 8, 10, "#0e7490");

  // Mid shelf books — solid blocks
  px(ctx, 10, 30, 10, 14, "#b91c1c");
  px(ctx, 20, 32, 6, 12, "#3b5998");
  px(ctx, 26, 30, 8, 14, "#854d0e");
  px(ctx, 34, 31, 6, 13, "#15803d");
  px(ctx, 40, 30, 8, 14, "#7c3aed");
  px(ctx, 48, 32, 6, 12, "#d97706");

  // Bottom shelf books — solid blocks, no trinket
  px(ctx, 10, 48, 8, 12, "#0e7490");
  px(ctx, 18, 50, 6, 10, "#b91c1c");
  px(ctx, 24, 48, 10, 12, "#3b5998");
}

function drawDoor(ctx: CanvasRenderingContext2D) {
  // Door frame
  px(ctx, 6, 0, 52, 64, "#9e9478");

  // Door panel
  px(ctx, 10, 2, 44, 60, "#a88a5c");
  px(ctx, 10, 2, 44, 2, "#c0a070");

  // Upper panel inset — simplified with 2px shadow edges
  px(ctx, 14, 6, 36, 22, "#8b6f47");
  px(ctx, 14, 6, 36, 2, "#7a5e36");
  px(ctx, 14, 6, 2, 22, "#7a5e36");
  px(ctx, 16, 8, 32, 18, "#9e8050");

  // Lower panel inset
  px(ctx, 14, 32, 36, 26, "#8b6f47");
  px(ctx, 14, 32, 36, 2, "#7a5e36");
  px(ctx, 14, 32, 2, 26, "#7a5e36");
  px(ctx, 16, 34, 32, 22, "#9e8050");

  // Hinges — simple small rects
  px(ctx, 10, 12, 3, 2, "#b0a080");
  px(ctx, 10, 44, 3, 2, "#b0a080");

  // Handle
  px(ctx, 42, 30, 6, 10, "#c0a870");
  px(ctx, 44, 32, 2, 6, "#a89060");
}

// Rug palette — rich Persian, flat top-down (ground-level = no 3/4 perspective)
const R = {
  field: "#6e1e1e",
  dark: "#481010",
  mid: "#882828",
  light: "#a03030",
  gold: "#c89830",
  goldDk: "#9a7420",
  goldLt: "#dab040",
  cream: "#e8d4a0",
};
const BD = 8; // border width (equal on all sides — flat top-down view)

// Helper: 1px drop shadow on south/east rug edges (shows rug thickness)
function rugShadowS(ctx: CanvasRenderingContext2D, x0: number) {
  px(ctx, x0, TILE - 1, TILE - x0, 1, "rgba(0,0,0,0.18)");
}
function rugShadowE(ctx: CanvasRenderingContext2D, y0: number) {
  px(ctx, TILE - 1, y0, 1, TILE - y0, "rgba(0,0,0,0.14)");
}

function drawRugTL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — top + left
  px(ctx, 0, 0, TILE, BD, R.gold);
  px(ctx, 0, 0, BD, TILE, R.gold);
  px(ctx, 0, 0, BD, BD, R.goldDk);
  px(ctx, BD, 1, TILE - BD, 1, R.goldLt);
  px(ctx, 1, BD, 1, TILE - BD, R.goldLt);
  // Inner accent
  px(ctx, BD, BD, TILE - BD, 2, R.dark);
  px(ctx, BD, BD, 2, TILE - BD, R.dark);
  // Corner ornament
  px(ctx, 30, 30, 12, 12, R.mid);
  px(ctx, 33, 33, 6, 6, R.field);
  px(ctx, 35, 35, 2, 2, R.gold);
}

function drawRugT(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — top
  px(ctx, 0, 0, TILE, BD, R.gold);
  px(ctx, 0, 1, TILE, 1, R.goldLt);
  px(ctx, 0, BD, TILE, 2, R.dark);
  // Repeating motif — small diamonds
  px(ctx, 14, 26, 8, 8, R.mid);
  px(ctx, 16, 28, 4, 4, R.gold);
  px(ctx, 38, 26, 8, 8, R.mid);
  px(ctx, 40, 28, 4, 4, R.gold);
  // Center cross
  px(ctx, 28, 32, 8, 8, R.mid);
  px(ctx, 30, 34, 4, 4, R.cream);
}

function drawRugTR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — top + right
  px(ctx, 0, 0, TILE, BD, R.gold);
  px(ctx, TILE - BD, 0, BD, TILE, R.gold);
  px(ctx, TILE - BD, 0, BD, BD, R.goldDk);
  px(ctx, 0, 1, TILE - BD, 1, R.goldLt);
  // Inner accent
  px(ctx, 0, BD, TILE - BD, 2, R.dark);
  px(ctx, TILE - BD - 2, BD, 2, TILE - BD, R.dark);
  // Corner ornament
  px(ctx, 18, 30, 12, 12, R.mid);
  px(ctx, 21, 33, 6, 6, R.field);
  px(ctx, 23, 35, 2, 2, R.gold);
  // East shadow
  rugShadowE(ctx, BD);
}

function drawRugL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — left
  px(ctx, 0, 0, BD, TILE, R.gold);
  px(ctx, 1, 0, 1, TILE, R.goldLt);
  px(ctx, BD, 0, 2, TILE, R.dark);
  // Repeating motifs
  px(ctx, 30, 12, 8, 8, R.mid);
  px(ctx, 32, 14, 4, 4, R.gold);
  px(ctx, 30, 40, 8, 8, R.mid);
  px(ctx, 32, 42, 4, 4, R.gold);
}

function drawRugC(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Central medallion — concentric
  px(ctx, 8, 8, 48, 48, R.mid);
  px(ctx, 12, 12, 40, 40, R.field);
  px(ctx, 18, 18, 28, 28, R.light);
  px(ctx, 22, 22, 20, 20, R.field);
  px(ctx, 26, 26, 12, 12, R.mid);
  px(ctx, 29, 29, 6, 6, R.gold);
  px(ctx, 31, 31, 2, 2, R.cream);
  // Corner accents
  px(ctx, 2, 2, 4, 4, R.gold);
  px(ctx, 58, 2, 4, 4, R.gold);
  px(ctx, 2, 58, 4, 4, R.gold);
  px(ctx, 58, 58, 4, 4, R.gold);
}

function drawRugR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — right
  px(ctx, TILE - BD, 0, BD, TILE, R.gold);
  px(ctx, TILE - BD - 2, 0, 2, TILE, R.dark);
  // East shadow
  rugShadowE(ctx, 0);
  // Repeating motifs
  px(ctx, 18, 12, 8, 8, R.mid);
  px(ctx, 20, 14, 4, 4, R.gold);
  px(ctx, 18, 40, 8, 8, R.mid);
  px(ctx, 20, 42, 4, 4, R.gold);
}

function drawRugBL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — left + bottom
  px(ctx, 0, 0, BD, TILE, R.gold);
  px(ctx, 0, TILE - BD, TILE, BD, R.gold);
  px(ctx, 0, TILE - BD, BD, BD, R.goldDk);
  px(ctx, 1, 0, 1, TILE - BD, R.goldLt);
  // Inner accent
  px(ctx, BD, 0, 2, TILE - BD, R.dark);
  px(ctx, BD, TILE - BD - 2, TILE - BD, 2, R.dark);
  // South shadow
  rugShadowS(ctx, BD);
  // Corner ornament
  px(ctx, 30, 18, 12, 12, R.mid);
  px(ctx, 33, 21, 6, 6, R.field);
  px(ctx, 35, 23, 2, 2, R.gold);
}

function drawRugB(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — bottom
  px(ctx, 0, TILE - BD, TILE, BD, R.gold);
  px(ctx, 0, TILE - BD - 2, TILE, 2, R.dark);
  // South shadow
  rugShadowS(ctx, 0);
  // Repeating motifs
  px(ctx, 14, 16, 8, 8, R.mid);
  px(ctx, 16, 18, 4, 4, R.gold);
  px(ctx, 38, 16, 8, 8, R.mid);
  px(ctx, 40, 18, 4, 4, R.gold);
  px(ctx, 28, 22, 8, 8, R.mid);
  px(ctx, 30, 24, 4, 4, R.cream);
}

function drawRugBR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, R.field);
  // Gold border — right + bottom
  px(ctx, TILE - BD, 0, BD, TILE, R.gold);
  px(ctx, 0, TILE - BD, TILE, BD, R.gold);
  px(ctx, TILE - BD, TILE - BD, BD, BD, R.goldDk);
  // Inner accent
  px(ctx, TILE - BD - 2, 0, 2, TILE - BD, R.dark);
  px(ctx, 0, TILE - BD - 2, TILE - BD, 2, R.dark);
  // South + east shadow
  rugShadowS(ctx, 0);
  rugShadowE(ctx, 0);
  // Corner ornament
  px(ctx, 18, 18, 12, 12, R.mid);
  px(ctx, 21, 21, 6, 6, R.field);
  px(ctx, 23, 23, 2, 2, R.gold);
}

function drawDoorLeft(ctx: CanvasRenderingContext2D) {
  // Door frame
  px(ctx, 0, 6, 64, 52, "#9e9478");
  // Door panel
  px(ctx, 2, 10, 60, 44, "#a88a5c");
  px(ctx, 2, 10, 60, 2, "#c0a070");
  // Upper panel inset
  px(ctx, 6, 14, 52, 16, "#8b6f47");
  px(ctx, 6, 14, 52, 2, "#7a5e36");
  px(ctx, 6, 14, 2, 16, "#7a5e36");
  px(ctx, 8, 16, 48, 12, "#9e8050");
  // Lower panel inset
  px(ctx, 6, 34, 52, 18, "#8b6f47");
  px(ctx, 6, 34, 52, 2, "#7a5e36");
  px(ctx, 6, 34, 2, 18, "#7a5e36");
  px(ctx, 8, 36, 48, 14, "#9e8050");
  // Hinges — simple rects
  px(ctx, 8, 10, 3, 2, "#b0a080");
  px(ctx, 8, 48, 3, 2, "#b0a080");
  // Handle
  px(ctx, 50, 30, 6, 10, "#c0a870");
  px(ctx, 52, 32, 2, 6, "#a89060");
}

function drawDoorBottom(ctx: CanvasRenderingContext2D) {
  // Door frame
  px(ctx, 6, 0, 52, 64, "#9e9478");
  // Door panel
  px(ctx, 10, 2, 44, 60, "#a88a5c");
  px(ctx, 10, 2, 44, 2, "#c0a070");
  // Upper panel inset
  px(ctx, 14, 6, 36, 22, "#8b6f47");
  px(ctx, 14, 6, 36, 2, "#7a5e36");
  px(ctx, 14, 6, 2, 22, "#7a5e36");
  px(ctx, 16, 8, 32, 18, "#9e8050");
  // Lower panel inset
  px(ctx, 14, 32, 36, 26, "#8b6f47");
  px(ctx, 14, 32, 36, 2, "#7a5e36");
  px(ctx, 14, 32, 2, 26, "#7a5e36");
  px(ctx, 16, 34, 32, 22, "#9e8050");
  // Hinges — simple rects
  px(ctx, 10, 12, 3, 2, "#b0a080");
  px(ctx, 10, 44, 3, 2, "#b0a080");
  // Handle
  px(ctx, 42, 30, 6, 10, "#c0a870");
  px(ctx, 44, 32, 2, 6, "#a89060");
}

function drawCouch(ctx: CanvasRenderingContext2D) {
  // Back
  px(ctx, 2, 8, 60, 16, "#5a3a2a");
  px(ctx, 2, 8, 60, 4, "#6b4a38");
  // Arms — solid
  px(ctx, 2, 8, 10, 40, "#5a3a2a");
  px(ctx, 52, 8, 10, 40, "#5a3a2a");
  // Seat cushions
  px(ctx, 12, 24, 18, 20, "#7a5a48");
  px(ctx, 34, 24, 18, 20, "#7a5a48");
  px(ctx, 12, 24, 18, 4, "#8a6a58"); // highlight
  px(ctx, 34, 24, 18, 4, "#8a6a58");
  // Cushion divider
  px(ctx, 30, 26, 4, 16, "#5a3a2a");
  // Front base
  px(ctx, 4, 46, 56, 2, "#3a1a0a");
  px(ctx, 4, 48, 56, 10, "#4a2a1a");
  px(ctx, 4, 48, 56, 2, "#5a3a2a");
  // Legs
  px(ctx, 6, 56, 6, 6, "#3a2a1a");
  px(ctx, 52, 56, 6, 6, "#3a2a1a");
}

function drawVendingMachine(ctx: CanvasRenderingContext2D) {
  // Top surface
  px(ctx, 8, 2, 48, 6, "#3a5a7a");
  px(ctx, 8, 2, 48, 2, "#4a6a8a");
  px(ctx, 8, 8, 48, 2, "#1a2a3a");

  // Machine body
  px(ctx, 8, 10, 48, 50, "#2a4a6a");

  // Display window with colored item blocks (no labels)
  px(ctx, 14, 14, 36, 20, "#1a1a2e");
  px(ctx, 16, 16, 32, 16, "#2a3a5c");
  px(ctx, 18, 18, 8, 5, "#e05050");
  px(ctx, 28, 18, 8, 5, "#50a050");
  px(ctx, 38, 18, 8, 5, "#5050e0");
  px(ctx, 18, 25, 8, 5, "#e0a020");
  px(ctx, 28, 25, 8, 5, "#a050a0");
  px(ctx, 38, 25, 8, 5, "#50a0a0");
  // Button panel
  px(ctx, 14, 38, 20, 12, "#3a3a3a");
  px(ctx, 16, 40, 4, 4, "#5a5a5a");
  px(ctx, 22, 40, 4, 4, "#5a5a5a");
  px(ctx, 28, 40, 4, 4, "#5a5a5a");
  px(ctx, 16, 46, 4, 4, "#5a5a5a");
  px(ctx, 22, 46, 4, 4, "#5a5a5a");
  // Coin slot
  px(ctx, 40, 40, 6, 10, "#1a1a1a");
  px(ctx, 42, 42, 2, 6, "#3a3a3a");
  // Dispenser
  px(ctx, 14, 52, 36, 8, "#1a1a1a");
  px(ctx, 16, 54, 32, 4, "#2a2a2a");
}

function drawSmallTable(ctx: CanvasRenderingContext2D) {
  // Table top — 2-tone
  px(ctx, 10, 12, 44, 6, "#a08868");
  px(ctx, 14, 10, 36, 2, "#b09878");
  px(ctx, 10, 18, 44, 2, "#5c4428");
  px(ctx, 12, 20, 40, 18, "#8b7355");
  // Front edge
  px(ctx, 12, 36, 40, 2, "#6d5535");
  // Pedestal
  px(ctx, 26, 38, 12, 4, "#6d5535");
  px(ctx, 28, 42, 8, 4, "#5c4428");
  // Base
  px(ctx, 18, 46, 28, 6, "#5c4428");
  px(ctx, 22, 52, 20, 4, "#4a3820");
  // Ground shadow
  px(ctx, 20, 56, 24, 2, "rgba(0,0,0,0.08)");
}

function drawServerRack(ctx: CanvasRenderingContext2D) {
  // Top surface
  px(ctx, 8, 0, 48, 6, "#2a2a3e");
  px(ctx, 8, 0, 48, 2, "#3a3a4e");
  px(ctx, 8, 6, 48, 2, "#0e0e1a");

  // Rack frame
  px(ctx, 8, 8, 48, 54, "#1a1a2e");
  // Side rails
  px(ctx, 8, 8, 4, 54, "#2a2a3e");
  px(ctx, 52, 8, 4, 54, "#2a2a3e");
  // 4 server units with LEDs
  const ledColors = [
    ["#22c55e", "#22c55e", "#22c55e"],
    ["#4ade80", "#22c55e", "#eab308"],
    ["#22c55e", "#eab308", "#ef4444"],
    ["#4ade80", "#22c55e", "#22c55e"],
  ];
  for (let i = 0; i < 4; i++) {
    const y = 12 + i * 12;
    px(ctx, 14, y, 36, 10, "#2a2a3e");
    px(ctx, 16, y + 2, 32, 6, "#353545");
    px(ctx, 18, y + 3, 3, 3, ledColors[i][0]);
    px(ctx, 23, y + 3, 3, 3, ledColors[i][1]);
    px(ctx, 28, y + 3, 3, 3, ledColors[i][2]);
    px(ctx, 34, y + 2, 12, 6, "#1a1a2e");
    px(ctx, 36, y + 3, 3, 4, "#2a2a3e");
    px(ctx, 40, y + 3, 3, 4, "#2a2a3e");
    px(ctx, 44, y + 3, 3, 4, "#2a2a3e");
  }
  // Cable area — solid dark block
  px(ctx, 14, 56, 36, 4, "#1a1a1a");
}

function drawWhiteboard(ctx: CanvasRenderingContext2D) {
  // Board frame
  px(ctx, 4, 4, 56, 40, "#9e9478");
  // Whiteboard surface
  px(ctx, 8, 8, 48, 32, "#f0f0f0");
  px(ctx, 8, 8, 48, 2, "#e0e0e0");
  // Flowchart — 3 boxes + 2 connector lines
  px(ctx, 12, 12, 10, 8, "#3b5998");
  px(ctx, 13, 13, 8, 6, "#4a6aaa");
  px(ctx, 22, 15, 6, 1, "#333333");
  px(ctx, 27, 14, 1, 3, "#333333");
  px(ctx, 28, 12, 10, 8, "#22c55e");
  px(ctx, 29, 13, 8, 6, "#3ddf78");
  px(ctx, 38, 15, 6, 1, "#333333");
  px(ctx, 43, 14, 1, 3, "#333333");
  px(ctx, 44, 12, 10, 8, "#ea580c");
  px(ctx, 45, 13, 8, 6, "#fb923c");
  // 3 sticky notes — solid squares
  px(ctx, 12, 26, 4, 4, "#fde047");
  px(ctx, 18, 26, 4, 4, "#f9a8d4");
  px(ctx, 24, 26, 4, 4, "#93c5fd");
  // Marker tray
  px(ctx, 12, 44, 40, 2, "#b0a888");
  px(ctx, 12, 46, 40, 2, "#8a8068");
  px(ctx, 12, 48, 40, 4, "#9e9478");
}

function drawLargeTable(ctx: CanvasRenderingContext2D) {
  // Top surface — 2-tone wood
  px(ctx, 2, 8, 60, 4, "#a08868");
  px(ctx, 2, 8, 60, 2, "#b09878");

  // Front face
  px(ctx, 2, 12, 60, 34, "#8b6f47");
  // Front edge depth
  px(ctx, 2, 43, 60, 3, "#5c4228");
  // Right edge depth
  px(ctx, 59, 10, 3, 36, "#5c4228");

  // Legs — simplified
  px(ctx, 4, 46, 8, 16, "#5c4228");
  px(ctx, 52, 46, 8, 16, "#5c4228");
  px(ctx, 4, 6, 8, 4, "#5c4228");
  px(ctx, 52, 6, 8, 4, "#5c4228");
}

function drawWallClock(ctx: CanvasRenderingContext2D) {
  // Wall background
  px(ctx, 0, 0, TILE, TILE, "#eae6de");
  // Crown molding (match wall)
  px(ctx, 0, 24, TILE, 1, "#d8d4cc");
  px(ctx, 0, 25, TILE, 1, "#f0ece4");
  px(ctx, 0, 26, TILE, 1, "#888070");
  px(ctx, 0, 27, TILE, TILE - 27 - 8, "#d2cec6");
  px(ctx, 0, TILE - 8, TILE, 2, "#b0a898");
  px(ctx, 0, TILE - 6, TILE, 6, "#888070");

  // Clock face — circle approximated with rectangles
  const cx = 32;
  const cy = 18;
  const r = 10;
  // Outer ring (dark outline)
  px(ctx, cx - r, cy - 2, r * 2, 1, "#333333");
  px(ctx, cx - r, cy + 1, r * 2, 1, "#333333");
  px(ctx, cx - 2, cy - r, 1, r * 2, "#333333");
  px(ctx, cx + 1, cy - r, 1, r * 2, "#333333");
  // Clock face (white)
  px(ctx, cx - 8, cy - 8, 16, 16, "#f8f8f0");
  px(ctx, cx - 9, cy - 6, 18, 12, "#f8f8f0");
  px(ctx, cx - 6, cy - 9, 12, 18, "#f8f8f0");
  // Dark outline
  px(ctx, cx - 9, cy - 4, 1, 8, "#333333");
  px(ctx, cx + 8, cy - 4, 1, 8, "#333333");
  px(ctx, cx - 4, cy - 9, 8, 1, "#333333");
  px(ctx, cx - 4, cy + 8, 8, 1, "#333333");
  // Hour markers (4 dots at 12/3/6/9)
  px(ctx, cx - 1, cy - 7, 2, 2, "#333333"); // 12
  px(ctx, cx + 5, cy - 1, 2, 2, "#333333"); // 3
  px(ctx, cx - 1, cy + 5, 2, 2, "#333333"); // 6
  px(ctx, cx - 7, cy - 1, 2, 2, "#333333"); // 9
  // Center dot
  px(ctx, cx - 1, cy - 1, 2, 2, "#222222");
  // Hour hand (~10 o'clock: up-left)
  px(ctx, cx - 1, cy - 1, 1, 1, "#222222");
  px(ctx, cx - 2, cy - 2, 1, 1, "#222222");
  px(ctx, cx - 3, cy - 3, 1, 1, "#222222");
  px(ctx, cx - 4, cy - 4, 1, 1, "#222222");
  // Minute hand (~2 o'clock: up-right)
  px(ctx, cx, cy - 1, 1, 1, "#444444");
  px(ctx, cx + 1, cy - 2, 1, 1, "#444444");
  px(ctx, cx + 2, cy - 3, 1, 1, "#444444");
  px(ctx, cx + 3, cy - 4, 1, 1, "#444444");
  px(ctx, cx + 4, cy - 5, 1, 1, "#444444");
}

function drawPoster(ctx: CanvasRenderingContext2D) {
  // Wall background
  px(ctx, 0, 0, TILE, TILE, "#eae6de");
  // Crown molding
  px(ctx, 0, 24, TILE, 1, "#d8d4cc");
  px(ctx, 0, 25, TILE, 1, "#f0ece4");
  px(ctx, 0, 26, TILE, 1, "#888070");
  px(ctx, 0, 27, TILE, TILE - 27 - 8, "#d2cec6");
  px(ctx, 0, TILE - 8, TILE, 2, "#b0a898");
  px(ctx, 0, TILE - 6, TILE, 6, "#888070");

  // Poster shadow (slight tilt)
  px(ctx, 20, 5, 28, 36, "rgba(0,0,0,0.08)");
  // Poster frame — thin dark border
  px(ctx, 18, 3, 28, 36, "#333333");
  // Poster content area
  px(ctx, 19, 4, 26, 34, "#2a5a8a"); // blue gradient background
  px(ctx, 19, 4, 26, 12, "#3a6a9a"); // lighter top
  // Content — motivational chart/graphic
  // Bar chart
  px(ctx, 22, 24, 4, 10, "#4ade80"); // bar 1 (green)
  px(ctx, 28, 20, 4, 14, "#22c55e"); // bar 2 (taller)
  px(ctx, 34, 16, 4, 18, "#15803d"); // bar 3 (tallest)
  // Arrow line going up
  px(ctx, 22, 14, 18, 1, "#fbbf24");
  px(ctx, 39, 12, 1, 3, "#fbbf24"); // arrow head
  px(ctx, 38, 13, 1, 1, "#fbbf24");
  // Title text placeholder
  px(ctx, 22, 7, 16, 2, "#ffffff"); // "GROW"
  px(ctx, 22, 10, 12, 1, "#ccddee"); // subtitle
  // Corner highlights on frame
  px(ctx, 18, 3, 1, 1, "#555555");
  px(ctx, 45, 3, 1, 1, "#555555");
  // Push-pin at top
  px(ctx, 31, 2, 3, 3, "#cc3333");
  px(ctx, 32, 1, 1, 1, "#ff4444"); // pin highlight
}

function drawFilingCabinet(ctx: CanvasRenderingContext2D) {
  // Top surface
  px(ctx, 10, 4, 44, 6, "#6a6a6a");
  px(ctx, 10, 4, 44, 2, "#7a7a7a");
  px(ctx, 10, 10, 44, 2, "#3a3a3a");

  // Cabinet body — 3 drawers
  px(ctx, 10, 12, 44, 48, "#555555");
  px(ctx, 10, 12, 3, 48, "#4a4a4a");
  px(ctx, 51, 12, 3, 48, "#4a4a4a");

  // Drawer 1
  px(ctx, 14, 14, 36, 12, "#606060");
  px(ctx, 14, 14, 36, 1, "#707070");
  px(ctx, 14, 25, 36, 1, "#4a4a4a");
  px(ctx, 28, 18, 8, 2, "#8a8a8a"); // handle
  px(ctx, 16, 20, 10, 4, "#4a4a4a"); // label slot

  // Drawer 2
  px(ctx, 14, 28, 36, 12, "#606060");
  px(ctx, 14, 28, 36, 1, "#707070");
  px(ctx, 14, 39, 36, 1, "#4a4a4a");
  px(ctx, 28, 32, 8, 2, "#8a8a8a");
  px(ctx, 16, 34, 10, 4, "#4a4a4a");

  // Drawer 3
  px(ctx, 14, 42, 36, 12, "#606060");
  px(ctx, 14, 42, 36, 1, "#707070");
  px(ctx, 14, 53, 36, 1, "#4a4a4a");
  px(ctx, 28, 46, 8, 2, "#8a8a8a");
  px(ctx, 16, 48, 10, 4, "#4a4a4a");
}

function drawPrinter(ctx: CanvasRenderingContext2D) {
  // Main body — light gray boxy printer in 3/4 view
  // Top surface
  px(ctx, 8, 10, 48, 6, "#c8c8c8"); // top surface
  px(ctx, 8, 10, 48, 2, "#d8d8d8"); // top highlight
  px(ctx, 8, 16, 48, 2, "#999999"); // shadow edge

  // Front body
  px(ctx, 8, 18, 48, 32, "#b0b0b0");
  // Side shadows
  px(ctx, 8, 18, 3, 32, "#9a9a9a");
  px(ctx, 53, 18, 3, 32, "#9a9a9a");

  // Paper tray on top — white sheets
  px(ctx, 16, 6, 32, 6, "#e8e8e8");
  px(ctx, 18, 4, 28, 4, "#f8f8f8"); // sheets sticking out
  px(ctx, 20, 3, 24, 2, "#ffffff"); // top sheet edge
  px(ctx, 22, 2, 20, 1, "#f0f0f0"); // sheet peek

  // Feed slot on front
  px(ctx, 14, 22, 36, 6, "#4a4a4a");
  px(ctx, 16, 23, 32, 4, "#333333");

  // Control panel — top-right buttons
  px(ctx, 38, 12, 14, 4, "#888888");
  px(ctx, 40, 13, 3, 2, "#606060"); // button 1
  px(ctx, 44, 13, 3, 2, "#606060"); // button 2
  px(ctx, 48, 13, 3, 2, "#606060"); // button 3

  // LED indicator (green)
  px(ctx, 40, 10, 2, 2, "#22c55e");
  px(ctx, 39, 9, 4, 4, "rgba(34, 197, 94, 0.15)"); // glow

  // Output tray area
  px(ctx, 14, 32, 36, 10, "#a0a0a0");
  px(ctx, 16, 34, 32, 6, "#959595");
  // Paper coming out
  px(ctx, 18, 30, 28, 4, "#f0f0f0");
  px(ctx, 20, 30, 24, 2, "#ffffff");

  // Bottom base
  px(ctx, 10, 50, 44, 4, "#888888");
  px(ctx, 10, 50, 44, 1, "#999999"); // base highlight
}

function drawWaterCooler(ctx: CanvasRenderingContext2D) {
  // Blue water jug on top — translucent circle
  px(ctx, 20, 0, 24, 4, "#7abaee"); // jug neck
  px(ctx, 16, 4, 32, 20, "#6aadee"); // jug body
  px(ctx, 18, 2, 28, 20, "#6aadee");
  px(ctx, 14, 8, 36, 12, "#6aadee"); // widest part
  // Jug outline/shadow
  px(ctx, 14, 8, 2, 12, "#4a8acc");
  px(ctx, 48, 8, 2, 12, "#8acaff");
  // Water level highlight
  px(ctx, 20, 6, 10, 8, "rgba(180, 220, 255, 0.4)");
  // Jug cap
  px(ctx, 24, 0, 16, 3, "#5a9acc");
  px(ctx, 26, 0, 12, 1, "#7abaea"); // cap highlight

  // Machine body below jug
  px(ctx, 16, 24, 32, 32, "#e0e0e0"); // body
  px(ctx, 16, 24, 32, 2, "#eeeeee"); // top highlight
  // Side shadows
  px(ctx, 16, 24, 3, 32, "#c8c8c8");
  px(ctx, 45, 24, 3, 32, "#c8c8c8");

  // Dispenser area — front recess
  px(ctx, 22, 28, 20, 10, "#b0b0b0");
  // Tap indicators
  px(ctx, 26, 30, 4, 4, "#ef4444"); // hot (red)
  px(ctx, 34, 30, 4, 4, "#3b82f6"); // cold (blue)
  // Nozzle
  px(ctx, 30, 32, 4, 4, "#888888");

  // Drip tray
  px(ctx, 20, 40, 24, 4, "#999999");
  px(ctx, 22, 41, 20, 2, "#888888");

  // Bottom base
  px(ctx, 18, 54, 28, 4, "#c0c0c0");
  px(ctx, 18, 54, 28, 1, "#d0d0d0"); // base highlight
}

function drawTrashCan(ctx: CanvasRenderingContext2D) {
  // Small round waste bin — top-down view, compact ~20x20 centered
  const cx = 32;
  const cy = 34;

  // Shadow underneath
  px(ctx, cx - 12, cy + 8, 24, 4, "rgba(0,0,0,0.08)");

  // Bin body — dark gray, rounded rectangle approximation
  px(ctx, cx - 10, cy - 8, 20, 18, "#4a4a4a");
  px(ctx, cx - 8, cy - 10, 16, 22, "#4a4a4a");
  // Lighter rim
  px(ctx, cx - 10, cy - 8, 20, 2, "#666666");
  px(ctx, cx - 8, cy - 10, 16, 2, "#666666");
  px(ctx, cx - 10, cy - 8, 2, 18, "#5a5a5a"); // left highlight
  // Inner shadow
  px(ctx, cx - 6, cy - 6, 12, 14, "#3a3a3a");

  // Paper scrap peeking out
  px(ctx, cx - 2, cy - 8, 6, 4, "#e8e0d0");
  px(ctx, cx + 2, cy - 6, 4, 3, "#f0ead6");
}

const drawFns: Record<FurnitureType, (ctx: CanvasRenderingContext2D) => void> = {
  "desk-left": drawDeskLeft,
  "desk-right": drawDeskRight,
  chair: drawChair,
  plant: drawPlant,
  "coffee-machine": drawCoffeeMachine,
  bookshelf: drawBookshelf,
  door: drawDoor,
  "door-left": drawDoorLeft,
  "door-bottom": drawDoorBottom,
  couch: drawCouch,
  "vending-machine": drawVendingMachine,
  "small-table": drawSmallTable,
  "server-rack": drawServerRack,
  whiteboard: drawWhiteboard,
  "large-table": drawLargeTable,
  "rug-tl": drawRugTL,
  "rug-t": drawRugT,
  "rug-tr": drawRugTR,
  "rug-l": drawRugL,
  "rug-c": drawRugC,
  "rug-r": drawRugR,
  "rug-bl": drawRugBL,
  "rug-b": drawRugB,
  "rug-br": drawRugBR,
  "wall-clock": drawWallClock,
  poster: drawPoster,
  "filing-cabinet": drawFilingCabinet,
  printer: drawPrinter,
  "water-cooler": drawWaterCooler,
  "trash-can": drawTrashCan,
};

export function getFurnitureCanvas(type: FurnitureType): HTMLCanvasElement {
  const cached = cache.get(type);
  if (cached) return cached;

  const [canvas, ctx] = createCanvas();
  drawFns[type](ctx);
  cache.set(type, canvas);
  return canvas;
}

// ── PIXI TEXTURE WRAPPER ────────────────────────────

const textureCache = new Map<FurnitureType, Texture>();

export function getFurnitureTexture(type: FurnitureType): Texture {
  const cached = textureCache.get(type);
  if (cached) return cached;

  const canvas = getFurnitureCanvas(type);
  const texture = Texture.from({ resource: canvas, scaleMode: "nearest" });
  textureCache.set(type, texture);
  return texture;
}

export function clearAllFurnitureTextures(): void {
  textureCache.clear();
}
