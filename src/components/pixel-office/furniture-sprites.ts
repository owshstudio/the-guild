// Pre-rendered pixel art furniture sprites using offscreen canvases

type FurnitureType =
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
  | "rug-br";

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
  px(ctx, 2, 16, 60, 32, "#8b6f47"); // main surface
  px(ctx, 2, 16, 60, 4, "#a88a5c"); // top edge highlight
  px(ctx, 2, 44, 60, 4, "#6d5535"); // bottom edge shadow

  // Front panel
  px(ctx, 4, 48, 56, 14, "#7a6340");
  px(ctx, 4, 48, 56, 2, "#6d5535");

  // Left leg
  px(ctx, 4, 48, 4, 14, "#6d5535");
  // Right edge (connects to desk-right)
  px(ctx, 58, 48, 4, 14, "#6d5535");

  // Monitor on left desk half
  // Screen
  px(ctx, 14, 4, 28, 18, "#1a1a2e");
  px(ctx, 16, 6, 24, 14, "#2a3a5c"); // screen face
  px(ctx, 16, 6, 24, 2, "#4a6a9c"); // screen highlight
  // Stand
  px(ctx, 24, 22, 12, 4, "#3a3a3a");
  px(ctx, 26, 26, 8, 2, "#3a3a3a");
  // Monitor glow on desk
  px(ctx, 12, 20, 32, 2, "rgba(100, 160, 255, 0.15)");

  // Keyboard area hint
  px(ctx, 16, 30, 24, 6, "#4a4a4a");
  px(ctx, 18, 32, 20, 2, "#5a5a5a");
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

  // Mouse pad
  px(ctx, 12, 28, 16, 12, "#2a2a2a");
  px(ctx, 14, 30, 4, 6, "#5a5a5a"); // mouse

  // Notepad
  px(ctx, 34, 26, 16, 18, "#f0ead6");
  px(ctx, 36, 28, 12, 14, "#e0dac6");
  // Pen
  px(ctx, 36, 30, 2, 10, "#3a3a6a");

  // Coffee mug
  px(ctx, 10, 22, 8, 8, "#e8e0cc");
  px(ctx, 18, 24, 3, 4, "#e8e0cc"); // handle
  px(ctx, 12, 22, 4, 2, "#6b4423"); // coffee
}

function drawChair(ctx: CanvasRenderingContext2D) {
  // Chair back
  px(ctx, 14, 4, 36, 8, "#3a3a3a");
  px(ctx, 14, 4, 36, 2, "#4a4a4a"); // highlight
  px(ctx, 16, 6, 32, 4, "#2a2a2a"); // back shadow

  // Backrest sides
  px(ctx, 12, 6, 4, 18, "#3a3a3a");
  px(ctx, 48, 6, 4, 18, "#3a3a3a");

  // Seat cushion
  px(ctx, 10, 22, 44, 20, "#4a4a4a");
  px(ctx, 10, 22, 44, 4, "#5a5a5a"); // seat highlight
  px(ctx, 12, 24, 40, 16, "#3a3a3a"); // seat depth

  // Base/wheel post
  px(ctx, 26, 42, 12, 8, "#2a2a2a");

  // Wheels — 5 point star base
  px(ctx, 16, 50, 8, 6, "#2a2a2a");
  px(ctx, 28, 50, 8, 6, "#2a2a2a");
  px(ctx, 40, 50, 8, 6, "#2a2a2a");
  // Wheel dots
  px(ctx, 18, 54, 4, 4, "#1a1a1a");
  px(ctx, 30, 54, 4, 4, "#1a1a1a");
  px(ctx, 42, 54, 4, 4, "#1a1a1a");
}

function drawPlant(ctx: CanvasRenderingContext2D) {
  // Pot
  px(ctx, 18, 40, 28, 20, "#b05c3c");
  px(ctx, 20, 38, 24, 4, "#c06840"); // pot rim
  px(ctx, 22, 58, 20, 4, "#8a4428"); // pot base

  // Soil
  px(ctx, 22, 40, 20, 4, "#4a3020");

  // Leaves — layered for volume
  // Back leaves
  px(ctx, 14, 18, 12, 14, "#3d6b4a");
  px(ctx, 38, 20, 12, 12, "#3d6b4a");
  // Mid leaves
  px(ctx, 20, 12, 10, 18, "#4a7c59");
  px(ctx, 34, 14, 10, 16, "#4a7c59");
  px(ctx, 26, 16, 12, 16, "#4a7c59");
  // Front/bright leaves
  px(ctx, 22, 10, 8, 10, "#5d9a6e");
  px(ctx, 34, 12, 8, 8, "#5d9a6e");
  px(ctx, 28, 8, 8, 10, "#5d9a6e");

  // Stem hints
  px(ctx, 30, 30, 4, 12, "#3d6b4a");
  px(ctx, 26, 28, 4, 8, "#3d6b4a");
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D) {
  // Machine body
  px(ctx, 14, 12, 36, 44, "#2a2a2a");
  px(ctx, 14, 12, 36, 4, "#3a3a3a"); // top highlight

  // Top reservoir
  px(ctx, 18, 8, 28, 8, "#3a3a3a");
  px(ctx, 18, 8, 28, 2, "#4a4a4a");

  // Front panel
  px(ctx, 18, 20, 28, 24, "#353535");

  // Drip area
  px(ctx, 22, 34, 20, 14, "#1a1a1a");
  // Cup
  px(ctx, 26, 38, 12, 10, "#e8e0cc");
  px(ctx, 28, 38, 8, 2, "#6b4423"); // coffee

  // Buttons
  px(ctx, 20, 22, 6, 6, "#4a4a4a"); // button 1
  px(ctx, 28, 22, 6, 6, "#4a4a4a"); // button 2
  px(ctx, 36, 22, 6, 6, "#4a4a4a"); // button 3

  // Power light
  px(ctx, 22, 24, 2, 2, "#ef4444");

  // Base/drip tray
  px(ctx, 16, 52, 32, 6, "#1a1a1a");
  px(ctx, 18, 54, 28, 2, "#2a2a2a");
}

function drawBookshelf(ctx: CanvasRenderingContext2D) {
  // Shelf frame
  px(ctx, 4, 2, 56, 60, "#7a5c3a");
  px(ctx, 4, 2, 56, 4, "#8a6c4a"); // top edge

  // Shelf panels (3 shelves)
  px(ctx, 8, 4, 48, 2, "#6d5030"); // top shelf board
  px(ctx, 8, 22, 48, 2, "#6d5030"); // mid shelf board
  px(ctx, 8, 42, 48, 2, "#6d5030"); // lower shelf board

  // Shelf backs
  px(ctx, 8, 6, 48, 16, "#5c4228");
  px(ctx, 8, 24, 48, 18, "#5c4228");
  px(ctx, 8, 44, 48, 16, "#5c4228");

  // Top shelf books
  px(ctx, 10, 8, 8, 14, "#3b5998"); // blue
  px(ctx, 18, 10, 6, 12, "#b91c1c"); // red
  px(ctx, 24, 8, 8, 14, "#15803d"); // green
  px(ctx, 32, 9, 6, 13, "#7c3aed"); // purple
  px(ctx, 38, 8, 8, 14, "#d97706"); // orange
  px(ctx, 46, 10, 8, 12, "#0e7490"); // teal

  // Mid shelf books
  px(ctx, 10, 26, 10, 16, "#b91c1c"); // red thick
  px(ctx, 20, 28, 6, 14, "#3b5998"); // blue
  px(ctx, 26, 26, 8, 16, "#854d0e"); // brown
  px(ctx, 34, 27, 6, 15, "#15803d"); // green
  px(ctx, 40, 26, 8, 16, "#7c3aed"); // purple
  px(ctx, 48, 28, 6, 14, "#d97706"); // orange

  // Bottom shelf — fewer books, some trinkets
  px(ctx, 10, 46, 8, 14, "#0e7490"); // teal
  px(ctx, 18, 48, 6, 12, "#b91c1c"); // red
  px(ctx, 24, 46, 10, 14, "#3b5998"); // blue
  // Small globe/trinket
  px(ctx, 40, 50, 8, 8, "#d4c9a8");
  px(ctx, 42, 48, 4, 4, "#b8ad8a");
}

function drawDoor(ctx: CanvasRenderingContext2D) {
  // Door frame
  px(ctx, 6, 0, 52, 64, "#9e9478");

  // Door panel
  px(ctx, 10, 2, 44, 60, "#a88a5c");
  px(ctx, 10, 2, 44, 2, "#c0a070"); // top highlight

  // Upper panel inset
  px(ctx, 14, 6, 36, 22, "#8b6f47");
  px(ctx, 16, 8, 32, 18, "#9e8050");

  // Lower panel inset
  px(ctx, 14, 32, 36, 26, "#8b6f47");
  px(ctx, 16, 34, 32, 22, "#9e8050");

  // Handle
  px(ctx, 42, 30, 6, 10, "#c0a870");
  px(ctx, 44, 32, 2, 6, "#a89060");
}

// Rug drawing functions — warm maroon/burgundy with border pattern
const RUG_MAIN = "#8b3a3a";
const RUG_DARK = "#6b2a2a";
const RUG_LIGHT = "#a04a4a";
const RUG_BORDER = "#5a2020";
const RUG_ACCENT = "#c05050";

function drawRugTL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Top border
  px(ctx, 4, 0, TILE - 4, 6, RUG_BORDER);
  px(ctx, 4, 6, TILE - 4, 2, RUG_ACCENT);
  // Left border
  px(ctx, 0, 4, 6, TILE - 4, RUG_BORDER);
  px(ctx, 6, 4, 2, TILE - 4, RUG_ACCENT);
  // Corner
  px(ctx, 0, 0, 6, 6, RUG_DARK);
  // Inner corner accent
  px(ctx, 6, 6, 4, 4, RUG_LIGHT);
}

function drawRugT(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Top border
  px(ctx, 0, 0, TILE, 6, RUG_BORDER);
  px(ctx, 0, 6, TILE, 2, RUG_ACCENT);
  // Pattern diamonds
  px(ctx, 24, 28, 8, 8, RUG_LIGHT);
  px(ctx, 26, 30, 4, 4, RUG_DARK);
}

function drawRugTR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Top border
  px(ctx, 0, 0, TILE - 4, 6, RUG_BORDER);
  px(ctx, 0, 6, TILE - 4, 2, RUG_ACCENT);
  // Right border
  px(ctx, TILE - 6, 4, 6, TILE - 4, RUG_BORDER);
  px(ctx, TILE - 8, 4, 2, TILE - 4, RUG_ACCENT);
  // Corner
  px(ctx, TILE - 6, 0, 6, 6, RUG_DARK);
  px(ctx, TILE - 10, 6, 4, 4, RUG_LIGHT);
}

function drawRugL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Left border
  px(ctx, 0, 0, 6, TILE, RUG_BORDER);
  px(ctx, 6, 0, 2, TILE, RUG_ACCENT);
  // Pattern
  px(ctx, 28, 24, 8, 8, RUG_LIGHT);
  px(ctx, 30, 26, 4, 4, RUG_DARK);
}

function drawRugC(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Center pattern — diamond motif
  px(ctx, 20, 20, 24, 24, RUG_LIGHT);
  px(ctx, 24, 24, 16, 16, RUG_MAIN);
  px(ctx, 28, 28, 8, 8, RUG_DARK);
  // Small corner accents
  px(ctx, 4, 4, 6, 6, RUG_LIGHT);
  px(ctx, 54, 4, 6, 6, RUG_LIGHT);
  px(ctx, 4, 54, 6, 6, RUG_LIGHT);
  px(ctx, 54, 54, 6, 6, RUG_LIGHT);
}

function drawRugR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Right border
  px(ctx, TILE - 6, 0, 6, TILE, RUG_BORDER);
  px(ctx, TILE - 8, 0, 2, TILE, RUG_ACCENT);
  // Pattern
  px(ctx, 24, 24, 8, 8, RUG_LIGHT);
  px(ctx, 26, 26, 4, 4, RUG_DARK);
}

function drawRugBL(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Bottom border
  px(ctx, 4, TILE - 6, TILE - 4, 6, RUG_BORDER);
  px(ctx, 4, TILE - 8, TILE - 4, 2, RUG_ACCENT);
  // Left border
  px(ctx, 0, 0, 6, TILE - 4, RUG_BORDER);
  px(ctx, 6, 0, 2, TILE - 4, RUG_ACCENT);
  // Corner
  px(ctx, 0, TILE - 6, 6, 6, RUG_DARK);
  px(ctx, 6, TILE - 10, 4, 4, RUG_LIGHT);
}

function drawRugB(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Bottom border
  px(ctx, 0, TILE - 6, TILE, 6, RUG_BORDER);
  px(ctx, 0, TILE - 8, TILE, 2, RUG_ACCENT);
  // Pattern
  px(ctx, 24, 20, 8, 8, RUG_LIGHT);
  px(ctx, 26, 22, 4, 4, RUG_DARK);
}

function drawRugBR(ctx: CanvasRenderingContext2D) {
  px(ctx, 0, 0, TILE, TILE, RUG_MAIN);
  // Bottom border
  px(ctx, 0, TILE - 6, TILE - 4, 6, RUG_BORDER);
  px(ctx, 0, TILE - 8, TILE - 4, 2, RUG_ACCENT);
  // Right border
  px(ctx, TILE - 6, 0, 6, TILE - 4, RUG_BORDER);
  px(ctx, TILE - 8, 0, 2, TILE - 4, RUG_ACCENT);
  // Corner
  px(ctx, TILE - 6, TILE - 6, 6, 6, RUG_DARK);
  px(ctx, TILE - 10, TILE - 10, 4, 4, RUG_LIGHT);
}

function drawDoorLeft(ctx: CanvasRenderingContext2D) {
  // Door frame on left wall
  px(ctx, 0, 6, 64, 52, "#9e9478");
  // Door panel
  px(ctx, 2, 10, 60, 44, "#a88a5c");
  px(ctx, 2, 10, 60, 2, "#c0a070"); // top highlight
  // Upper panel inset
  px(ctx, 6, 14, 52, 16, "#8b6f47");
  px(ctx, 8, 16, 48, 12, "#9e8050");
  // Lower panel inset
  px(ctx, 6, 34, 52, 18, "#8b6f47");
  px(ctx, 8, 36, 48, 14, "#9e8050");
  // Handle
  px(ctx, 50, 30, 6, 10, "#c0a870");
  px(ctx, 52, 32, 2, 6, "#a89060");
}

function drawDoorBottom(ctx: CanvasRenderingContext2D) {
  // Door frame on bottom wall
  px(ctx, 6, 0, 52, 64, "#9e9478");
  // Door panel
  px(ctx, 10, 2, 44, 60, "#a88a5c");
  px(ctx, 10, 2, 44, 2, "#c0a070");
  // Upper panel inset
  px(ctx, 14, 6, 36, 22, "#8b6f47");
  px(ctx, 16, 8, 32, 18, "#9e8050");
  // Lower panel inset
  px(ctx, 14, 32, 36, 26, "#8b6f47");
  px(ctx, 16, 34, 32, 22, "#9e8050");
  // Handle
  px(ctx, 42, 30, 6, 10, "#c0a870");
  px(ctx, 44, 32, 2, 6, "#a89060");
}

function drawCouch(ctx: CanvasRenderingContext2D) {
  // Couch back
  px(ctx, 2, 8, 60, 16, "#5a3a2a");
  px(ctx, 2, 8, 60, 4, "#6b4a38"); // top highlight
  // Armrests
  px(ctx, 2, 8, 10, 40, "#5a3a2a");
  px(ctx, 52, 8, 10, 40, "#5a3a2a");
  px(ctx, 2, 8, 10, 4, "#6b4a38");
  px(ctx, 52, 8, 10, 4, "#6b4a38");
  // Seat cushions
  px(ctx, 12, 24, 18, 20, "#7a5a48");
  px(ctx, 34, 24, 18, 20, "#7a5a48");
  px(ctx, 12, 24, 18, 4, "#8a6a58"); // cushion highlight
  px(ctx, 34, 24, 18, 4, "#8a6a58");
  // Cushion divider
  px(ctx, 30, 26, 4, 16, "#5a3a2a");
  // Front base
  px(ctx, 4, 48, 56, 10, "#4a2a1a");
  // Legs
  px(ctx, 6, 56, 6, 6, "#3a2a1a");
  px(ctx, 52, 56, 6, 6, "#3a2a1a");
}

function drawVendingMachine(ctx: CanvasRenderingContext2D) {
  // Machine body
  px(ctx, 8, 4, 48, 56, "#2a4a6a");
  px(ctx, 8, 4, 48, 4, "#3a5a7a"); // top highlight
  // Display window
  px(ctx, 14, 10, 36, 20, "#1a1a2e");
  px(ctx, 16, 12, 32, 16, "#2a3a5c"); // screen
  // Item rows in display
  px(ctx, 18, 14, 8, 5, "#e05050"); // red can
  px(ctx, 28, 14, 8, 5, "#50a050"); // green can
  px(ctx, 38, 14, 8, 5, "#5050e0"); // blue can
  px(ctx, 18, 21, 8, 5, "#e0a020"); // yellow can
  px(ctx, 28, 21, 8, 5, "#a050a0"); // purple can
  px(ctx, 38, 21, 8, 5, "#50a0a0"); // teal can
  // Button panel
  px(ctx, 14, 34, 20, 12, "#3a3a3a");
  px(ctx, 16, 36, 4, 4, "#5a5a5a");
  px(ctx, 22, 36, 4, 4, "#5a5a5a");
  px(ctx, 28, 36, 4, 4, "#5a5a5a");
  px(ctx, 16, 42, 4, 4, "#5a5a5a");
  px(ctx, 22, 42, 4, 4, "#5a5a5a");
  // Coin slot
  px(ctx, 40, 36, 6, 10, "#1a1a1a");
  px(ctx, 42, 38, 2, 6, "#3a3a3a");
  // Dispenser slot
  px(ctx, 14, 50, 36, 8, "#1a1a1a");
  px(ctx, 16, 52, 32, 4, "#2a2a2a");
}

function drawSmallTable(ctx: CanvasRenderingContext2D) {
  // Table top (round-ish)
  px(ctx, 12, 16, 40, 24, "#8b7355");
  px(ctx, 16, 14, 32, 2, "#a08868"); // top edge
  px(ctx, 12, 16, 40, 4, "#a08868"); // surface highlight
  px(ctx, 16, 38, 32, 2, "#6d5535"); // bottom edge
  // Pedestal
  px(ctx, 26, 40, 12, 8, "#6d5535");
  // Base
  px(ctx, 18, 48, 28, 6, "#5c4428");
  px(ctx, 22, 54, 20, 4, "#5c4428");
  // Items on table
  px(ctx, 20, 20, 8, 8, "#e8e0cc"); // cup
  px(ctx, 28, 20, 4, 2, "#e8e0cc"); // cup handle
  px(ctx, 22, 20, 4, 2, "#6b4423"); // coffee
  px(ctx, 36, 22, 10, 8, "#f0ead6"); // napkin
}

function drawServerRack(ctx: CanvasRenderingContext2D) {
  // Rack frame
  px(ctx, 8, 2, 48, 60, "#1a1a2e");
  px(ctx, 8, 2, 48, 4, "#2a2a3e"); // top edge
  // Side rails
  px(ctx, 8, 2, 4, 60, "#2a2a3e");
  px(ctx, 52, 2, 4, 60, "#2a2a3e");
  // Server units (4 stacked)
  for (let i = 0; i < 4; i++) {
    const y = 8 + i * 13;
    px(ctx, 14, y, 36, 10, "#2a2a3e");
    px(ctx, 16, y + 2, 32, 6, "#353545");
    // LED indicators (blinking effect via color variation)
    px(ctx, 18, y + 3, 3, 3, i % 2 === 0 ? "#22c55e" : "#4ade80"); // green
    px(ctx, 23, y + 3, 3, 3, "#22c55e"); // green
    px(ctx, 28, y + 3, 3, 3, i === 2 ? "#eab308" : "#22c55e"); // yellow/green
    // Drive bays
    px(ctx, 34, y + 2, 12, 6, "#1a1a2e");
    px(ctx, 36, y + 3, 3, 4, "#2a2a3e");
    px(ctx, 40, y + 3, 3, 4, "#2a2a3e");
    px(ctx, 44, y + 3, 3, 4, "#2a2a3e");
  }
  // Cable management at bottom
  px(ctx, 14, 56, 36, 4, "#1a1a1a");
  px(ctx, 20, 57, 4, 2, "#3a3a5a");
  px(ctx, 30, 57, 4, 2, "#3a5a3a");
  px(ctx, 40, 57, 4, 2, "#5a3a3a");
}

function drawWhiteboard(ctx: CanvasRenderingContext2D) {
  // Board frame
  px(ctx, 4, 4, 56, 40, "#9e9478");
  // Whiteboard surface
  px(ctx, 8, 8, 48, 32, "#f0f0f0");
  px(ctx, 8, 8, 48, 2, "#e0e0e0"); // top shadow
  // Scribbles / content
  px(ctx, 12, 14, 20, 2, "#3b5998"); // blue line
  px(ctx, 12, 20, 16, 2, "#3b5998"); // blue line
  px(ctx, 12, 26, 24, 2, "#3b5998"); // blue line
  // Diagram box
  px(ctx, 36, 14, 14, 10, "#ef4444"); // red box outline
  px(ctx, 38, 16, 10, 6, "#f0f0f0"); // box interior
  // Arrow
  px(ctx, 32, 18, 4, 2, "#ef4444");
  // Marker tray
  px(ctx, 12, 44, 40, 6, "#9e9478");
  px(ctx, 14, 44, 36, 2, "#b0a888");
  // Markers
  px(ctx, 16, 45, 8, 3, "#3b5998"); // blue marker
  px(ctx, 26, 45, 8, 3, "#ef4444"); // red marker
  px(ctx, 36, 45, 8, 3, "#22c55e"); // green marker
}

function drawLargeTable(ctx: CanvasRenderingContext2D) {
  // Large conference table surface
  px(ctx, 2, 10, 60, 40, "#7a5c3a");
  px(ctx, 2, 10, 60, 6, "#8a6c4a"); // top edge highlight
  px(ctx, 2, 44, 60, 6, "#6d5030"); // bottom edge shadow
  // Wood grain lines
  px(ctx, 8, 20, 48, 1, "#6d5030");
  px(ctx, 8, 28, 48, 1, "#6d5030");
  px(ctx, 8, 36, 48, 1, "#6d5030");
  // Legs
  px(ctx, 4, 50, 8, 12, "#5c4228");
  px(ctx, 52, 50, 8, 12, "#5c4228");
  px(ctx, 4, 8, 8, 4, "#5c4228");
  px(ctx, 52, 8, 8, 4, "#5c4228");
  // Center detail
  px(ctx, 24, 24, 16, 8, "#8a6c4a");
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
};

export function getFurnitureCanvas(type: FurnitureType): HTMLCanvasElement {
  const cached = cache.get(type);
  if (cached) return cached;

  const [canvas, ctx] = createCanvas();
  drawFns[type](ctx);
  cache.set(type, canvas);
  return canvas;
}
