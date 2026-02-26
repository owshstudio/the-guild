// Office layout — positions for furniture and agents
// Canvas is ~800x500, scale=3 for 16px sprites = 48px per character

export interface Position {
  x: number;
  y: number;
}

export interface OfficeElement {
  type: "desk" | "coffee" | "plant" | "door";
  position: Position;
  label?: string;
}

export interface AgentPosition {
  id: string;
  deskPosition: Position; // where their desk is
  seatPosition: Position; // where the agent sits (in front of desk)
}

// Floor tile colors
export const FLOOR_COLORS = {
  primary: "#1a1510",
  secondary: "#1e1812",
  accent: "#221c14",
  wall: "#0d0d0d",
  wallTrim: "#1f1f1f",
};

// Office dimensions
export const OFFICE = {
  width: 800,
  height: 500,
  tileSize: 16,
  scale: 3,
};

// Agent positions
export const agentPositions: AgentPosition[] = [
  {
    id: "nyx",
    deskPosition: { x: 320, y: 160 },  // center desk
    seatPosition: { x: 356, y: 220 },   // sitting in front
  },
  {
    id: "hemera",
    deskPosition: { x: 560, y: 240 },  // right-side desk
    seatPosition: { x: 596, y: 300 },   // sitting in front
  },
];

// Furniture positions
export const officeElements: OfficeElement[] = [
  { type: "coffee", position: { x: 100, y: 100 }, label: "Coffee" },
  { type: "plant", position: { x: 700, y: 80 } },
  { type: "plant", position: { x: 140, y: 380 } },
  { type: "plant", position: { x: 680, y: 400 } },
  { type: "door", position: { x: 50, y: 230 } },
];

export function drawFloor(ctx: CanvasRenderingContext2D) {
  const { width, height, tileSize } = OFFICE;

  // Wall
  ctx.fillStyle = FLOOR_COLORS.wall;
  ctx.fillRect(0, 0, width, 60);

  // Wall trim
  ctx.fillStyle = FLOOR_COLORS.wallTrim;
  ctx.fillRect(0, 58, width, 4);

  // Floor tiles
  for (let y = 60; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? FLOOR_COLORS.primary : FLOOR_COLORS.secondary;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Subtle grid lines
      ctx.fillStyle = FLOOR_COLORS.accent;
      ctx.fillRect(x, y, tileSize, 1);
      ctx.fillRect(x, y, 1, tileSize);
    }
  }
}

export function drawDoor(ctx: CanvasRenderingContext2D, pos: Position) {
  // Door frame
  ctx.fillStyle = "#2d1f14";
  ctx.fillRect(pos.x, pos.y, 36, 60);
  ctx.fillStyle = "#44301e";
  ctx.fillRect(pos.x + 4, pos.y + 4, 28, 52);
  // Door handle
  ctx.fillStyle = "#d4a574";
  ctx.fillRect(pos.x + 24, pos.y + 28, 4, 6);
  // Light coming through
  ctx.fillStyle = "rgba(251, 191, 36, 0.05)";
  ctx.fillRect(pos.x + 6, pos.y + 6, 24, 48);
}

// Status dot colors
export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "#22c55e";
    case "idle": return "#eab308";
    case "stopped": return "#ef4444";
    default: return "#737373";
  }
}
