// Office layout — wood plank floor, ambient lighting, furniture shadows
// Rooms: main-office, break-room, server-room, meeting-room

export interface Position {
  x: number;
  y: number;
}

export type RoomId = "main-office" | "break-room" | "server-room" | "meeting-room";

export const OFFICE = {
  width: 960,
  height: 640,
  tileSize: 16,
  scale: 3,
  spriteScale: 3,
  floorY: 82,
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

// Wall colors
const WALL = {
  base: "#e8e0cc",
  dark: "#d4cbb4",
  baseboard: "#9e9478",
};

// Wood plank floor palette — subtle variation
const FLOOR = {
  plank1: "#c9bb92",
  plank2: "#c3b58c",
  plank3: "#bdb086",
};
const plankColors = [FLOOR.plank1, FLOOR.plank2, FLOOR.plank3];

// Ambient lighting per room
const AMBIENT: Record<RoomId, string> = {
  "main-office": "rgba(255, 248, 230, 0.04)",
  "break-room": "rgba(255, 220, 180, 0.07)",
  "server-room": "rgba(100, 160, 255, 0.08)",
  "meeting-room": "rgba(255, 255, 240, 0.03)",
};

// Simple deterministic hash for pseudo-random per-tile decisions
function tileHash(col: number, row: number): number {
  return ((col * 2654435761) ^ (row * 2246822519)) >>> 0;
}

function drawTileFloor(ctx: CanvasRenderingContext2D, roomId: RoomId) {
  const { width, height, tileSize, floorY } = OFFICE;
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil((height - floorY) / tileSize);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize;
      const y = floorY + r * tileSize;
      const hash = tileHash(c, r);

      // Base plank color — deterministic per tile, subtle variation
      const plankIdx = (c * 3 + r * 7) % 3;
      ctx.fillStyle = plankColors[plankIdx];
      ctx.fillRect(x, y, tileSize, tileSize);

      // Single subtle grain line per tile (not every tile — ~60%)
      if (hash % 5 < 3) {
        const gy = y + 4 + (hash % (tileSize - 8));
        ctx.fillStyle = "rgba(150, 130, 96, 0.25)";
        ctx.fillRect(x + 2, gy, tileSize - 4, 1);
      }

      // Vertical plank seam every 4 columns (subtler)
      if (c % 4 === 0) {
        ctx.fillStyle = "rgba(140, 120, 80, 0.2)";
        ctx.fillRect(x, y, 1, tileSize);
      }

      // Shadow gradient on first floor row after walls
      if (r === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(x, y, tileSize, tileSize);
      }

      // Room-specific floor additions
      if (roomId === "server-room") {
        if (c % 5 === 2 && r > 2) {
          ctx.fillStyle = "rgba(40, 40, 50, 0.12)";
          ctx.fillRect(x + 7, y, 2, tileSize);
        }
      }
    }
  }
}

// Wall decorations per room
function drawWallDecorations(ctx: CanvasRenderingContext2D, roomId: RoomId) {
  const wallY = 10;

  if (roomId === "main-office") {
    // Clock at col 7
    const clockX = 7 * OFFICE.tileSize;
    ctx.fillStyle = "#f0ece0";
    ctx.beginPath();
    ctx.arc(clockX + 8, wallY + 30, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8a7650";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Clock hands
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(clockX + 8, wallY + 30);
    ctx.lineTo(clockX + 8, wallY + 22);
    ctx.moveTo(clockX + 8, wallY + 30);
    ctx.lineTo(clockX + 14, wallY + 30);
    ctx.stroke();

    // Poster at col 12
    const posterX = 12 * OFFICE.tileSize;
    ctx.fillStyle = "#c4b896";
    ctx.fillRect(posterX, wallY + 15, 24, 32);
    ctx.strokeStyle = "#8a7a50";
    ctx.lineWidth = 1;
    ctx.strokeRect(posterX, wallY + 15, 24, 32);
    // Simple lines on poster
    ctx.fillStyle = "#9e8e68";
    ctx.fillRect(posterX + 4, wallY + 22, 16, 2);
    ctx.fillRect(posterX + 4, wallY + 28, 12, 2);
    ctx.fillRect(posterX + 4, wallY + 34, 14, 2);
  }

  if (roomId === "break-room") {
    // Menu board
    const mbX = 20 * OFFICE.tileSize;
    ctx.fillStyle = "#3a3020";
    ctx.fillRect(mbX, wallY + 12, 30, 40);
    ctx.strokeStyle = "#6a5a40";
    ctx.lineWidth = 1;
    ctx.strokeRect(mbX, wallY + 12, 30, 40);
    ctx.fillStyle = "#d4c490";
    ctx.fillRect(mbX + 4, wallY + 18, 22, 2);
    ctx.fillRect(mbX + 4, wallY + 24, 18, 2);
    ctx.fillRect(mbX + 4, wallY + 30, 20, 2);
  }

  if (roomId === "server-room") {
    // Warning sign
    const wsX = 35 * OFFICE.tileSize;
    ctx.fillStyle = "#e8c020";
    ctx.fillRect(wsX, wallY + 20, 20, 16);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(wsX, wallY + 20, 20, 16);
    ctx.fillStyle = "#333";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("!", wsX + 10, wallY + 33);
    ctx.textAlign = "left";
  }

  if (roomId === "meeting-room") {
    // Large poster
    const lpX = 48 * OFFICE.tileSize;
    ctx.fillStyle = "#e0d8c8";
    ctx.fillRect(lpX, wallY + 10, 36, 44);
    ctx.strokeStyle = "#b0a890";
    ctx.lineWidth = 1;
    ctx.strokeRect(lpX, wallY + 10, 36, 44);
    ctx.fillStyle = "#c8b898";
    ctx.fillRect(lpX + 6, wallY + 16, 24, 14);
    ctx.fillStyle = "#a09878";
    ctx.fillRect(lpX + 6, wallY + 36, 20, 2);
    ctx.fillRect(lpX + 6, wallY + 42, 16, 2);
  }
}

// Furniture ground shadows
export function drawFurnitureShadows(ctx: CanvasRenderingContext2D) {
  // Shadow under agent desk positions
  const desks = [
    { x: 300, y: 300, w: 100, h: 20 }, // nyx desk area
    { x: 520, y: 340, w: 100, h: 20 }, // hemera desk area
  ];

  for (const desk of desks) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.beginPath();
    ctx.ellipse(desk.x + desk.w / 2, desk.y + desk.h, desk.w / 2 * 0.9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Ambient lighting overlay for the whole canvas
export function drawAmbientLighting(ctx: CanvasRenderingContext2D, roomId: RoomId) {
  const { width, height } = OFFICE;
  ctx.fillStyle = AMBIENT[roomId];
  ctx.fillRect(0, 0, width, height);

  // Server room bonus: LED glow near server racks
  if (roomId === "server-room") {
    // Green/blue LED rectangles
    const ledPositions = [
      { x: 35 * OFFICE.tileSize + 2, y: OFFICE.floorY + 30 },
      { x: 35 * OFFICE.tileSize + 2, y: OFFICE.floorY + 60 },
      { x: 37 * OFFICE.tileSize + 2, y: OFFICE.floorY + 40 },
    ];
    for (const led of ledPositions) {
      ctx.fillStyle = "rgba(80, 200, 120, 0.12)";
      ctx.fillRect(led.x, led.y, 8, 4);
    }
  }
}

// Particle system
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

let particles: Particle[] = [];
let particleTimer = 0;

export function updateParticles(deltaTime: number) {
  particleTimer += deltaTime;

  // Coffee steam — spawn every ~0.3s
  if (particleTimer > 0.3) {
    particleTimer = 0;
    // Coffee machine approximate position
    const cx = 460;
    const cy = 180;
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * 6,
        y: cy,
        vx: Math.sin(Date.now() * 0.003 + i) * 4,
        vy: -12 - Math.random() * 8,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.4,
        color: i % 2 === 0 ? "rgba(200,200,200,0.3)" : "rgba(240,240,240,0.2)",
        size: 2,
      });
    }
  }

  // Update existing particles
  particles = particles.filter((p) => {
    p.life += deltaTime;
    if (p.life >= p.maxLife) return false;
    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;
    return true;
  });
}

export function drawParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// Server LED blinkers
let ledBlinkState = false;
let ledBlinkTimer = 0;

export function updateServerLEDs(deltaTime: number) {
  ledBlinkTimer += deltaTime;
  if (ledBlinkTimer > 0.5) {
    ledBlinkTimer = 0;
    ledBlinkState = !ledBlinkState;
  }
}

export function drawServerLEDs(ctx: CanvasRenderingContext2D, roomId: RoomId) {
  if (roomId !== "server-room") return;

  const rackX = 35 * OFFICE.tileSize;
  const baseY = OFFICE.floorY + 20;

  const leds = [
    { x: rackX + 4, y: baseY + 8, color: ledBlinkState ? "#22c55e" : "#166534" },
    { x: rackX + 8, y: baseY + 8, color: !ledBlinkState ? "#eab308" : "#854d0e" },
    { x: rackX + 4, y: baseY + 24, color: "#22c55e" },
    { x: rackX + 8, y: baseY + 24, color: ledBlinkState ? "#22c55e" : "#166534" },
    { x: rackX + 4, y: baseY + 40, color: !ledBlinkState ? "#eab308" : "#854d0e" },
  ];

  for (const led of leds) {
    ctx.fillStyle = led.color;
    ctx.fillRect(led.x, led.y, 3, 2);
  }
}

// Dust motes — rare 1px light particles near windows
let dustMotes: Particle[] = [];
let dustTimer = 0;

export function updateDustMotes(deltaTime: number) {
  dustTimer += deltaTime;
  if (dustTimer > 2 && dustMotes.length < 5) {
    dustTimer = 0;
    dustMotes.push({
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      vx: 2 + Math.random() * 3,
      vy: -1 + Math.random() * 2,
      life: 0,
      maxLife: 3 + Math.random() * 2,
      color: "rgba(255, 250, 220, 0.4)",
      size: 1,
    });
  }

  dustMotes = dustMotes.filter((m) => {
    m.life += deltaTime;
    if (m.life >= m.maxLife) return false;
    m.x += m.vx * deltaTime;
    m.y += m.vy * deltaTime;
    return true;
  });
}

export function drawDustMotes(ctx: CanvasRenderingContext2D) {
  for (const m of dustMotes) {
    const alpha = 1 - m.life / m.maxLife;
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = m.color;
    ctx.fillRect(m.x, m.y, m.size, m.size);
  }
  ctx.globalAlpha = 1;
}


export function drawEnvironment(ctx: CanvasRenderingContext2D, roomId: RoomId = "main-office") {
  const { width } = OFFICE;

  // Wall (top area)
  ctx.fillStyle = WALL.base;
  ctx.fillRect(0, 0, width, 80);
  ctx.fillStyle = WALL.dark;
  ctx.fillRect(0, 75, width, 5);
  // Baseboard
  ctx.fillStyle = WALL.baseboard;
  ctx.fillRect(0, 78, width, 4);

  // Wall decorations
  drawWallDecorations(ctx, roomId);

  // Floor tiles — wood plank
  drawTileFloor(ctx, roomId);

  // Furniture ground shadows
  drawFurnitureShadows(ctx);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "#22c55e";
    case "idle": return "#eab308";
    case "stopped": return "#ef4444";
    default: return "#737373";
  }
}
