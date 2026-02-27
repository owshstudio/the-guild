// Office layout — cyberpunk hacker den
// Native canvas: 480x320, displayed at 2x with pixelated rendering

export interface Position {
  x: number;
  y: number;
}

export interface OfficeElement {
  type: "desk" | "coffee" | "plant" | "door" | "server" | "bookshelf" | "window" | "logo" | "empty-desk" | "rug";
  position: Position;
  label?: string;
}

export interface AgentPosition {
  id: string;
  deskPosition: Position;
  seatPosition: Position;
}

export const OFFICE = {
  width: 480,
  height: 320,
  tileSize: 16,
  scale: 2,
};

// NYX center, HEMERA right side
export const agentPositions: AgentPosition[] = [
  {
    id: "nyx",
    deskPosition: { x: 170, y: 100 },
    seatPosition: { x: 185, y: 150 },
  },
  {
    id: "hemera",
    deskPosition: { x: 330, y: 140 },
    seatPosition: { x: 345, y: 190 },
  },
];

export const officeElements: OfficeElement[] = [
  // Window at the top wall showing night sky
  { type: "window", position: { x: 160, y: 8 }, label: "Night Sky" },
  { type: "window", position: { x: 260, y: 8 }, label: "Night Sky" },
  // Server rack back-left
  { type: "server", position: { x: 20, y: 50 } },
  // Bookshelf left wall
  { type: "bookshelf", position: { x: 20, y: 130 } },
  // Coffee machine back-right
  { type: "coffee", position: { x: 420, y: 55 }, label: "Coffee" },
  // OWSH logo on the wall
  { type: "logo", position: { x: 365, y: 14 } },
  // Plants
  { type: "plant", position: { x: 70, y: 55 } },
  { type: "plant", position: { x: 450, y: 130 } },
  { type: "plant", position: { x: 130, y: 275 } },
  // Empty desks for future agents
  { type: "empty-desk", position: { x: 170, y: 230 } },
  { type: "empty-desk", position: { x: 330, y: 230 } },
  // Door
  { type: "door", position: { x: 430, y: 260 } },
  // Center rug
  { type: "rug", position: { x: 190, y: 170 } },
];

// Color palette for the environment
const COLORS = {
  wallDark: "#08080c",
  wallMid: "#0e0e14",
  wallLight: "#14141e",
  wallTrim: "#1a1a28",
  floorDark: "#0c0a08",
  floorMid: "#100e0b",
  floorLight: "#141210",
  floorAccent: "#0a0908",
  neonPurple: "#A326B5",
  neonMagenta: "#F9425F",
  neonOrange: "#DF4F15",
  windowDark: "#0a0a2e",
  windowMid: "#0f1040",
  starWhite: "#ffffff",
  starDim: "#8888cc",
};

export function drawEnvironment(ctx: CanvasRenderingContext2D, time: number) {
  const { width, height, tileSize } = OFFICE;

  // === WALLS ===
  // Top wall with gradient
  for (let y = 0; y < 44; y++) {
    const t = y / 44;
    const r = Math.floor(8 + t * 12);
    const g = Math.floor(8 + t * 10);
    const b = Math.floor(12 + t * 18);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, width, 1);
  }

  // Wall trim with neon glow
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, 42, width, 3);
  // Neon strip along wall trim
  const glowIntensity = 0.3 + Math.sin(time * 0.015) * 0.1;
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity})`;
  ctx.fillRect(0, 43, width, 1);
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity * 0.3})`;
  ctx.fillRect(0, 41, width, 1);
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity * 0.3})`;
  ctx.fillRect(0, 45, width, 1);

  // === FLOOR ===
  for (let y = 45; y < height; y += tileSize) {
    for (let x = 0; x < width; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? COLORS.floorDark : COLORS.floorMid;
      ctx.fillRect(x, y, tileSize, tileSize);
      // Subtle grid
      ctx.fillStyle = COLORS.floorAccent;
      ctx.fillRect(x, y, tileSize, 1);
      ctx.fillRect(x, y, 1, tileSize);
    }
  }

  // === WINDOWS (night sky) ===
  officeElements.filter(e => e.type === "window").forEach(el => {
    drawWindow(ctx, el.position, time);
  });

  // === SERVER RACK ===
  const server = officeElements.find(e => e.type === "server");
  if (server) drawServerRack(ctx, server.position, time);

  // === BOOKSHELF ===
  const shelf = officeElements.find(e => e.type === "bookshelf");
  if (shelf) drawBookshelf(ctx, shelf.position);

  // === COFFEE MACHINE ===
  const coffee = officeElements.find(e => e.type === "coffee");
  if (coffee) drawCoffeeMachine(ctx, coffee.position, time);

  // === OWSH LOGO ===
  const logo = officeElements.find(e => e.type === "logo");
  if (logo) drawOwshLogo(ctx, logo.position, time);

  // === RUG ===
  const rug = officeElements.find(e => e.type === "rug");
  if (rug) drawRug(ctx, rug.position);

  // === PLANTS ===
  officeElements.filter(e => e.type === "plant").forEach(el => {
    drawPlant(ctx, el.position);
  });

  // === EMPTY DESKS ===
  officeElements.filter(e => e.type === "empty-desk").forEach(el => {
    drawEmptyDesk(ctx, el.position);
  });

  // === DOOR ===
  const door = officeElements.find(e => e.type === "door");
  if (door) drawDoor(ctx, door.position);
}

export function drawDesks(ctx: CanvasRenderingContext2D, time: number) {
  // NYX desk — dual monitors, bigger
  drawAgentDesk(ctx, agentPositions[0].deskPosition, true, time);
  // HEMERA desk — single monitor
  drawAgentDesk(ctx, agentPositions[1].deskPosition, false, time);
}

function drawAgentDesk(ctx: CanvasRenderingContext2D, pos: Position, dualMonitor: boolean, time: number) {
  // Desk surface
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y + 22, 80, 16);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 2, pos.y + 24, 76, 12);
  // Desk legs
  ctx.fillStyle = "#141010";
  ctx.fillRect(pos.x + 4, pos.y + 38, 4, 14);
  ctx.fillRect(pos.x + 72, pos.y + 38, 4, 14);

  // Monitor(s)
  const screenGlow = 0.6 + Math.sin(time * 0.02) * 0.1;
  if (dualMonitor) {
    // Left monitor
    drawMonitor(ctx, pos.x + 8, pos.y, 28, 20, "#7c3aed", screenGlow);
    // Right monitor
    drawMonitor(ctx, pos.x + 42, pos.y, 28, 20, "#3b82f6", screenGlow);
  } else {
    // Single monitor centered
    drawMonitor(ctx, pos.x + 22, pos.y + 2, 34, 20, "#f59e0b", screenGlow);
  }

  // Keyboard
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 24, pos.y + 26, 30, 8);
  ctx.fillStyle = "#222222";
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.fillRect(pos.x + 26 + i * 6, pos.y + 27 + j * 2, 4, 1);
    }
  }

  // Neon edge glow on desk
  ctx.fillStyle = `rgba(163, 38, 181, ${0.15 + Math.sin(time * 0.01) * 0.05})`;
  ctx.fillRect(pos.x, pos.y + 22, 80, 1);
}

function drawMonitor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, glowColor: string, intensity: number) {
  // Monitor body
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#141414";
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  // Screen
  ctx.fillStyle = "#0a0f1a";
  ctx.fillRect(x + 2, y + 2, w - 4, h - 5);
  // Screen content lines
  for (let i = 0; i < 4; i++) {
    const lineW = (w - 10) * (0.5 + Math.random() * 0.5);
    ctx.fillStyle = `rgba(${hexToRgb(glowColor)}, ${0.3 + Math.random() * 0.2})`;
    ctx.fillRect(x + 4, y + 4 + i * 3, lineW, 1);
  }
  // Monitor stand
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(x + w / 2 - 2, y + h, 4, 3);
  ctx.fillRect(x + w / 2 - 4, y + h + 2, 8, 2);
  // Screen glow (ambient light cast)
  ctx.fillStyle = `rgba(${hexToRgb(glowColor)}, ${intensity * 0.08})`;
  ctx.fillRect(x - 4, y + h + 4, w + 8, 16);
}

function drawWindow(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Window frame
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x, pos.y, 60, 30);
  // Night sky
  ctx.fillStyle = COLORS.windowDark;
  ctx.fillRect(pos.x + 2, pos.y + 2, 56, 26);
  // Gradient sky
  const grad = ctx.createLinearGradient(pos.x, pos.y + 2, pos.x, pos.y + 28);
  grad.addColorStop(0, "#05051a");
  grad.addColorStop(1, "#0a0a30");
  ctx.fillStyle = grad;
  ctx.fillRect(pos.x + 2, pos.y + 2, 56, 26);
  // Stars
  const stars = [
    { x: 8, y: 6 }, { x: 20, y: 10 }, { x: 35, y: 5 },
    { x: 45, y: 14 }, { x: 12, y: 18 }, { x: 50, y: 8 },
    { x: 28, y: 20 }, { x: 40, y: 22 }, { x: 15, y: 12 },
  ];
  stars.forEach((s, i) => {
    const twinkle = 0.3 + Math.abs(Math.sin(time * 0.03 + i * 2.1)) * 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(pos.x + 2 + s.x, pos.y + 2 + s.y, 1, 1);
  });
  // Window frame divider
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x + 29, pos.y + 2, 2, 26);
  ctx.fillRect(pos.x + 2, pos.y + 14, 56, 2);
}

function drawServerRack(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Rack body
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(pos.x, pos.y, 30, 60);
  ctx.fillStyle = "#141414";
  ctx.fillRect(pos.x + 2, pos.y + 2, 26, 56);
  // Server units
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(pos.x + 4, pos.y + 4 + i * 11, 22, 9);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(pos.x + 5, pos.y + 5 + i * 11, 20, 7);
    // Vent lines
    for (let v = 0; v < 3; v++) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(pos.x + 6, pos.y + 6 + i * 11 + v * 2, 12, 1);
    }
    // LED indicators (blinking)
    const ledOn = Math.sin(time * 0.05 + i * 1.3) > 0;
    ctx.fillStyle = ledOn ? "#22c55e" : "#0a2a0a";
    ctx.fillRect(pos.x + 22, pos.y + 6 + i * 11, 2, 2);
    const led2On = Math.sin(time * 0.07 + i * 0.9) > 0;
    ctx.fillStyle = led2On ? "#f59e0b" : "#2a1a0a";
    ctx.fillRect(pos.x + 22, pos.y + 9 + i * 11, 2, 2);
  }
  // Cables coming out bottom
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 8, pos.y + 58, 2, 8);
  ctx.fillRect(pos.x + 14, pos.y + 58, 2, 10);
  ctx.fillRect(pos.x + 20, pos.y + 58, 2, 6);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, pos: Position) {
  // Shelf frame
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y, 36, 70);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 2, pos.y + 2, 32, 66);
  // Shelves
  const shelfColors = ["#221c14", "#1a1410"];
  for (let s = 0; s < 4; s++) {
    const sy = pos.y + 2 + s * 17;
    ctx.fillStyle = shelfColors[0];
    ctx.fillRect(pos.x + 2, sy + 15, 32, 2);
    // Books
    const bookColors = ["#7c3aed", "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6"];
    let bx = pos.x + 4;
    for (let b = 0; b < 4 + Math.floor(s * 0.5); b++) {
      const bw = 4 + (b % 3);
      const bh = 10 + (b % 4) * 2;
      ctx.fillStyle = bookColors[(s * 4 + b) % bookColors.length];
      ctx.fillRect(bx, sy + 15 - bh, bw, bh);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(bx, sy + 15 - bh, 1, bh);
      bx += bw + 1;
    }
  }
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Counter
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x - 4, pos.y + 30, 40, 12);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x - 2, pos.y + 32, 36, 8);
  // Counter legs
  ctx.fillStyle = "#141010";
  ctx.fillRect(pos.x, pos.y + 42, 3, 10);
  ctx.fillRect(pos.x + 29, pos.y + 42, 3, 10);
  // Machine body
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 4, pos.y, 24, 30);
  ctx.fillStyle = "#222222";
  ctx.fillRect(pos.x + 6, pos.y + 2, 20, 26);
  // Display
  ctx.fillStyle = "#0a2a0a";
  ctx.fillRect(pos.x + 8, pos.y + 4, 16, 8);
  ctx.fillStyle = "#22c55e";
  ctx.font = "5px monospace";
  ctx.fillText("BREW", pos.x + 10, pos.y + 10);
  // Buttons
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(pos.x + 10, pos.y + 15, 4, 3);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(pos.x + 18, pos.y + 15, 4, 3);
  // Drip area
  ctx.fillStyle = "#111111";
  ctx.fillRect(pos.x + 10, pos.y + 22, 12, 6);
  // Coffee mug
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(pos.x + 13, pos.y + 23, 6, 5);
  ctx.fillStyle = "#d4d4d4";
  ctx.fillRect(pos.x + 19, pos.y + 24, 2, 3);
  // Steam particles
  for (let s = 0; s < 3; s++) {
    const steamY = pos.y + 20 - s * 4 + Math.sin(time * 0.04 + s * 1.5) * 2;
    const steamX = pos.x + 15 + Math.sin(time * 0.03 + s * 2) * 2;
    const alpha = 0.2 - s * 0.05;
    ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
    ctx.fillRect(steamX, steamY, 2, 1);
  }
}

function drawOwshLogo(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Frame
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x, pos.y, 40, 20);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(pos.x + 2, pos.y + 2, 36, 16);
  // OWSH text with gradient glow
  const glow = 0.7 + Math.sin(time * 0.02) * 0.3;
  ctx.font = "bold 8px monospace";
  ctx.fillStyle = `rgba(223, 79, 21, ${glow})`;
  ctx.textAlign = "center";
  ctx.fillText("OWSH", pos.x + 20, pos.y + 13);
  ctx.textAlign = "left";
  // Glow effect
  ctx.fillStyle = `rgba(249, 66, 95, ${glow * 0.15})`;
  ctx.fillRect(pos.x + 2, pos.y + 2, 36, 16);
}

function drawPlant(ctx: CanvasRenderingContext2D, pos: Position) {
  // Pot
  ctx.fillStyle = "#78350f";
  ctx.fillRect(pos.x + 2, pos.y + 14, 12, 8);
  ctx.fillStyle = "#92400e";
  ctx.fillRect(pos.x + 3, pos.y + 15, 10, 6);
  ctx.fillStyle = "#5c2d0a";
  ctx.fillRect(pos.x + 1, pos.y + 13, 14, 2);
  // Soil
  ctx.fillStyle = "#3d1f0a";
  ctx.fillRect(pos.x + 3, pos.y + 13, 10, 2);
  // Leaves
  const greens = ["#14532d", "#166534", "#22c55e", "#4ade80"];
  // Stem
  ctx.fillStyle = "#166534";
  ctx.fillRect(pos.x + 7, pos.y + 4, 2, 10);
  // Leaf clusters
  ctx.fillStyle = greens[2];
  ctx.fillRect(pos.x + 4, pos.y + 2, 3, 4);
  ctx.fillRect(pos.x + 9, pos.y + 3, 3, 3);
  ctx.fillStyle = greens[3];
  ctx.fillRect(pos.x + 5, pos.y + 1, 6, 3);
  ctx.fillStyle = greens[1];
  ctx.fillRect(pos.x + 3, pos.y + 5, 3, 3);
  ctx.fillRect(pos.x + 10, pos.y + 5, 3, 3);
  ctx.fillStyle = greens[0];
  ctx.fillRect(pos.x + 6, pos.y, 4, 2);
}

function drawEmptyDesk(ctx: CanvasRenderingContext2D, pos: Position) {
  // Dimmer desk — same as agent desk but darker, no monitor on
  ctx.fillStyle = "#12100c";
  ctx.fillRect(pos.x, pos.y + 22, 80, 16);
  ctx.fillStyle = "#181410";
  ctx.fillRect(pos.x + 2, pos.y + 24, 76, 12);
  // Desk legs
  ctx.fillStyle = "#0e0c0a";
  ctx.fillRect(pos.x + 4, pos.y + 38, 4, 14);
  ctx.fillRect(pos.x + 72, pos.y + 38, 4, 14);
  // Monitor (off)
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(pos.x + 24, pos.y + 2, 30, 18);
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(pos.x + 26, pos.y + 4, 26, 14);
  // Stand
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(pos.x + 37, pos.y + 20, 4, 3);
  // Chair outline (empty)
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(pos.x + 30, pos.y + 46, 18, 14);
  // "Available" label
  ctx.font = "5px monospace";
  ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("EMPTY", pos.x + 40, pos.y + 62);
  ctx.textAlign = "left";
}

function drawDoor(ctx: CanvasRenderingContext2D, pos: Position) {
  // Door frame
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y, 30, 50);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 3, pos.y + 3, 24, 44);
  // Door surface
  ctx.fillStyle = "#181412";
  ctx.fillRect(pos.x + 4, pos.y + 4, 22, 42);
  // Panels
  ctx.fillStyle = "#1e1810";
  ctx.fillRect(pos.x + 6, pos.y + 6, 18, 16);
  ctx.fillRect(pos.x + 6, pos.y + 26, 18, 16);
  // Handle
  ctx.fillStyle = "#d4a574";
  ctx.fillRect(pos.x + 22, pos.y + 24, 3, 5);
  // Light from outside
  ctx.fillStyle = "rgba(255, 200, 100, 0.03)";
  ctx.fillRect(pos.x + 4, pos.y + 4, 22, 42);
  // "EXIT" sign above
  ctx.fillStyle = "#0a1a0a";
  ctx.fillRect(pos.x + 6, pos.y - 8, 18, 7);
  ctx.fillStyle = "#22c55e";
  ctx.font = "5px monospace";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", pos.x + 15, pos.y - 3);
  ctx.textAlign = "left";
}

function drawRug(ctx: CanvasRenderingContext2D, pos: Position) {
  // Dark rug with subtle pattern
  ctx.fillStyle = "rgba(163, 38, 181, 0.04)";
  ctx.fillRect(pos.x, pos.y, 100, 60);
  // Border
  ctx.fillStyle = "rgba(163, 38, 181, 0.08)";
  ctx.fillRect(pos.x, pos.y, 100, 1);
  ctx.fillRect(pos.x, pos.y + 59, 100, 1);
  ctx.fillRect(pos.x, pos.y, 1, 60);
  ctx.fillRect(pos.x + 99, pos.y, 1, 60);
}

export function drawAmbientEffects(ctx: CanvasRenderingContext2D, time: number) {
  // Floating dust particles
  const particles = [
    { x: 100, y: 80, speed: 0.3, size: 1 },
    { x: 250, y: 200, speed: 0.2, size: 1 },
    { x: 380, y: 100, speed: 0.25, size: 1 },
    { x: 180, y: 260, speed: 0.35, size: 1 },
    { x: 420, y: 180, speed: 0.15, size: 1 },
    { x: 60, y: 160, speed: 0.28, size: 1 },
    { x: 300, y: 280, speed: 0.22, size: 1 },
    { x: 350, y: 70, speed: 0.18, size: 1 },
  ];

  particles.forEach((p, i) => {
    const floatX = Math.sin(time * p.speed * 0.01 + i * 2.1) * 3;
    const floatY = Math.cos(time * p.speed * 0.008 + i * 1.7) * 4;
    const alpha = 0.05 + Math.abs(Math.sin(time * 0.01 + i)) * 0.08;
    ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
    ctx.fillRect(p.x + floatX, p.y + floatY, p.size, p.size);
  });

  // Neon glow reflections on floor (very subtle)
  ctx.fillStyle = "rgba(163, 38, 181, 0.015)";
  ctx.fillRect(0, 280, OFFICE.width, 40);
  ctx.fillStyle = "rgba(249, 66, 95, 0.01)";
  ctx.fillRect(0, 290, OFFICE.width, 30);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": return "#22c55e";
    case "idle": return "#eab308";
    case "stopped": return "#ef4444";
    default: return "#737373";
  }
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
