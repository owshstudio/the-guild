// Office layout — clean, simple floor for now
// We'll add furniture/details once characters look right

export interface Position {
  x: number;
  y: number;
}

export const OFFICE = {
  width: 960,
  height: 640,
  tileSize: 16,
  scale: 3, // each sprite pixel = 3 canvas pixels
};

// Agent positions on the floor
export const agentPositions = [
  {
    id: "nyx",
    position: { x: 340, y: 240 },
  },
  {
    id: "hemera",
    position: { x: 560, y: 280 },
  },
];

// Floor colors — light modern office
const FLOOR = {
  light: "#d4c9a8",
  mid: "#c9be9d",
  dark: "#beb393",
  grid: "#b8ad8a",
  wall: "#e8e0cc",
  wallDark: "#d4cbb4",
  baseboard: "#9e9478",
};

export function drawEnvironment(ctx: CanvasRenderingContext2D) {
  const { width, height, tileSize } = OFFICE;

  // Wall (top area)
  ctx.fillStyle = FLOOR.wall;
  ctx.fillRect(0, 0, width, 80);
  ctx.fillStyle = FLOOR.wallDark;
  ctx.fillRect(0, 75, width, 5);
  // Baseboard
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, 78, width, 4);

  // Floor tiles — subtle checkerboard
  for (let y = 82; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const isAlt = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? FLOOR.light : FLOOR.mid;
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }

  // Very subtle grid lines
  ctx.fillStyle = FLOOR.grid;
  for (let y = 82; y < height; y += tileSize) {
    ctx.fillRect(0, y, width, 1);
  }
  for (let x = 0; x < width; x += tileSize) {
    ctx.fillRect(x, 82, 1, height - 82);
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "#22c55e";
    case "idle": return "#eab308";
    case "stopped": return "#ef4444";
    default: return "#737373";
  }
}
