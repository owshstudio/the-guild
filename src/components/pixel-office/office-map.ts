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
  width: 960,
  height: 640,
  tileSize: 16,
  scale: 3,
};

// NYX center-left (command station), HEMERA center-right
export const agentPositions: AgentPosition[] = [
  {
    id: "nyx",
    deskPosition: { x: 280, y: 180 },
    seatPosition: { x: 310, y: 260 },
  },
  {
    id: "hemera",
    deskPosition: { x: 560, y: 220 },
    seatPosition: { x: 590, y: 300 },
  },
];

export const officeElements: OfficeElement[] = [
  // Windows across the top wall
  { type: "window", position: { x: 200, y: 12 }, label: "Night Sky" },
  { type: "window", position: { x: 340, y: 12 }, label: "Night Sky" },
  { type: "window", position: { x: 480, y: 12 }, label: "Night Sky" },
  { type: "window", position: { x: 620, y: 12 }, label: "Night Sky" },
  // Server racks back-left (two)
  { type: "server", position: { x: 30, y: 70 } },
  { type: "server", position: { x: 70, y: 70 } },
  // Bookshelf left wall
  { type: "bookshelf", position: { x: 30, y: 200 } },
  { type: "bookshelf", position: { x: 30, y: 310 } },
  // Coffee station back-right
  { type: "coffee", position: { x: 830, y: 80 }, label: "Coffee" },
  // OWSH logo on the wall (bigger, centered)
  { type: "logo", position: { x: 430, y: 18 } },
  // Plants scattered around
  { type: "plant", position: { x: 130, y: 75 } },
  { type: "plant", position: { x: 900, y: 100 } },
  { type: "plant", position: { x: 160, y: 500 } },
  { type: "plant", position: { x: 880, y: 400 } },
  { type: "plant", position: { x: 750, y: 80 } },
  // Empty desks for future agents (3)
  { type: "empty-desk", position: { x: 280, y: 420 } },
  { type: "empty-desk", position: { x: 560, y: 420 } },
  { type: "empty-desk", position: { x: 420, y: 480 } },
  // Door
  { type: "door", position: { x: 870, y: 500 } },
  // Large center rug
  { type: "rug", position: { x: 250, y: 300 } },
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
  for (let y = 0; y < 65; y++) {
    const t = y / 65;
    const r = Math.floor(8 + t * 12);
    const g = Math.floor(8 + t * 10);
    const b = Math.floor(12 + t * 18);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, width, 1);
  }

  // Wall trim with neon glow
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, 63, width, 4);
  // Neon strip along wall trim
  const glowIntensity = 0.3 + Math.sin(time * 0.015) * 0.1;
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity})`;
  ctx.fillRect(0, 65, width, 2);
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity * 0.3})`;
  ctx.fillRect(0, 62, width, 1);
  ctx.fillStyle = `rgba(163, 38, 181, ${glowIntensity * 0.3})`;
  ctx.fillRect(0, 68, width, 1);

  // Left wall
  for (let x = 0; x < 20; x++) {
    const t = x / 20;
    ctx.fillStyle = `rgba(14, 14, 20, ${1 - t * 0.3})`;
    ctx.fillRect(x, 67, 1, height - 67);
  }

  // Right wall
  for (let x = 0; x < 20; x++) {
    const t = x / 20;
    ctx.fillStyle = `rgba(14, 14, 20, ${1 - t * 0.3})`;
    ctx.fillRect(width - x, 67, 1, height - 67);
  }

  // === FLOOR ===
  for (let y = 67; y < height; y += tileSize) {
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

  // === SERVER RACKS ===
  officeElements.filter(e => e.type === "server").forEach(el => {
    drawServerRack(ctx, el.position, time);
  });

  // === BOOKSHELVES ===
  officeElements.filter(e => e.type === "bookshelf").forEach(el => {
    drawBookshelf(ctx, el.position);
  });

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

  // === WALL CLOCK ===
  drawWallClock(ctx, { x: 780, y: 20 }, time);

  // === WHITEBOARD ===
  drawWhiteboard(ctx, { x: 100, y: 10 }, time);

  // === CEILING LIGHTS ===
  drawCeilingLights(ctx, time);

  // === WALL POSTERS ===
  drawPoster(ctx, { x: 760, y: 14 }, "SHIP IT", "#DF4F15");
  drawPoster(ctx, { x: 850, y: 18 }, "ITERATE", "#A326B5");

  // === COUCH / LOUNGE AREA ===
  drawCouch(ctx, { x: 780, y: 320 });

  // === WATER COOLER ===
  drawWaterCooler(ctx, { x: 130, y: 420 }, time);
}

export function drawDesks(ctx: CanvasRenderingContext2D, time: number) {
  // NYX desk — dual monitors, bigger
  drawAgentDesk(ctx, agentPositions[0].deskPosition, true, time);
  // HEMERA desk — single monitor
  drawAgentDesk(ctx, agentPositions[1].deskPosition, false, time);
}

function drawAgentDesk(ctx: CanvasRenderingContext2D, pos: Position, dualMonitor: boolean, time: number) {
  // Desk surface (bigger)
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y + 36, 140, 24);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 3, pos.y + 39, 134, 18);
  // Desk edge highlight
  ctx.fillStyle = "#2a2418";
  ctx.fillRect(pos.x + 3, pos.y + 39, 134, 2);
  // Desk legs
  ctx.fillStyle = "#141010";
  ctx.fillRect(pos.x + 6, pos.y + 60, 6, 20);
  ctx.fillRect(pos.x + 128, pos.y + 60, 6, 20);
  // Cross bar
  ctx.fillStyle = "#121010";
  ctx.fillRect(pos.x + 12, pos.y + 70, 116, 3);

  // Monitor(s)
  const screenGlow = 0.6 + Math.sin(time * 0.02) * 0.1;
  if (dualMonitor) {
    drawMonitor(ctx, pos.x + 10, pos.y, 50, 34, "#7c3aed", screenGlow);
    drawMonitor(ctx, pos.x + 70, pos.y, 50, 34, "#3b82f6", screenGlow);
    // Small third monitor (vertical)
    drawMonitor(ctx, pos.x + 126, pos.y + 6, 20, 28, "#a78bfa", screenGlow * 0.8);
  } else {
    drawMonitor(ctx, pos.x + 30, pos.y + 4, 60, 30, "#f59e0b", screenGlow);
  }

  // Keyboard
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 36, pos.y + 42, 50, 12);
  ctx.fillStyle = "#222222";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.fillRect(pos.x + 38 + i * 6, pos.y + 43 + j * 3, 4, 2);
    }
  }
  // Mouse
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 96, pos.y + 44, 8, 10);
  ctx.fillStyle = "#222222";
  ctx.fillRect(pos.x + 97, pos.y + 45, 6, 4);

  // Coffee mug on desk
  if (dualMonitor) {
    ctx.fillStyle = "#2d1b69";
    ctx.fillRect(pos.x + 110, pos.y + 42, 8, 8);
    ctx.fillStyle = "#3d2b79";
    ctx.fillRect(pos.x + 118, pos.y + 44, 3, 4);
  }

  // Neon edge glow on desk
  const neonColor = dualMonitor ? "163, 38, 181" : "249, 166, 2";
  ctx.fillStyle = `rgba(${neonColor}, ${0.2 + Math.sin(time * 0.01) * 0.08})`;
  ctx.fillRect(pos.x, pos.y + 36, 140, 2);
}

function drawMonitor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, glowColor: string, intensity: number) {
  // Monitor body
  ctx.fillStyle = "#080808";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#111111";
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  // Screen
  ctx.fillStyle = "#080c18";
  ctx.fillRect(x + 3, y + 3, w - 6, h - 8);
  // Screen content — code lines
  const rgb = hexToRgb(glowColor);
  for (let i = 0; i < Math.floor((h - 14) / 4); i++) {
    const lineW = (w - 14) * (0.3 + ((i * 7 + 3) % 10) * 0.07);
    const indent = ((i * 3) % 4) * 4;
    ctx.fillStyle = `rgba(${rgb}, ${0.25 + ((i * 5) % 10) * 0.03})`;
    ctx.fillRect(x + 5 + indent, y + 5 + i * 4, lineW, 2);
  }
  // Monitor stand
  ctx.fillStyle = "#080808";
  ctx.fillRect(x + w / 2 - 4, y + h, 8, 4);
  ctx.fillRect(x + w / 2 - 8, y + h + 3, 16, 3);
  // Screen glow (ambient light cast downward)
  ctx.fillStyle = `rgba(${rgb}, ${intensity * 0.06})`;
  ctx.fillRect(x - 8, y + h + 6, w + 16, 24);
}

function drawWindow(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Window frame
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x, pos.y, 90, 44);
  // Night sky
  ctx.fillStyle = COLORS.windowDark;
  ctx.fillRect(pos.x + 3, pos.y + 3, 84, 38);
  // Gradient sky
  const grad = ctx.createLinearGradient(pos.x, pos.y + 3, pos.x, pos.y + 41);
  grad.addColorStop(0, "#030312");
  grad.addColorStop(0.5, "#05051a");
  grad.addColorStop(1, "#0a0a30");
  ctx.fillStyle = grad;
  ctx.fillRect(pos.x + 3, pos.y + 3, 84, 38);
  // Moon
  ctx.fillStyle = "rgba(200, 200, 255, 0.15)";
  ctx.beginPath();
  ctx.arc(pos.x + 70, pos.y + 14, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(220, 220, 255, 0.25)";
  ctx.beginPath();
  ctx.arc(pos.x + 70, pos.y + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  // Stars
  const stars = [
    { x: 10, y: 8 }, { x: 25, y: 14 }, { x: 45, y: 7 },
    { x: 58, y: 20 }, { x: 15, y: 26 }, { x: 35, y: 30 },
    { x: 50, y: 12 }, { x: 20, y: 34 }, { x: 75, y: 28 },
    { x: 40, y: 22 }, { x: 65, y: 34 }, { x: 8, y: 18 },
  ];
  stars.forEach((s, i) => {
    const twinkle = 0.2 + Math.abs(Math.sin(time * 0.025 + i * 2.1)) * 0.8;
    const size = i % 3 === 0 ? 2 : 1;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(pos.x + 3 + s.x, pos.y + 3 + s.y, size, size);
  });
  // Window frame dividers
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x + 44, pos.y + 3, 2, 38);
  ctx.fillRect(pos.x + 3, pos.y + 22, 84, 2);
}

function drawServerRack(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Rack body (bigger)
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(pos.x, pos.y, 36, 110);
  ctx.fillStyle = "#141414";
  ctx.fillRect(pos.x + 2, pos.y + 2, 32, 106);
  // Server units
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(pos.x + 4, pos.y + 4 + i * 15, 28, 13);
    ctx.fillStyle = "#181818";
    ctx.fillRect(pos.x + 5, pos.y + 5 + i * 15, 26, 11);
    // Vent lines
    for (let v = 0; v < 4; v++) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(pos.x + 6, pos.y + 6 + i * 15 + v * 3, 16, 1);
    }
    // LED indicators (blinking)
    const ledOn = Math.sin(time * 0.05 + i * 1.3) > 0;
    ctx.fillStyle = ledOn ? "#22c55e" : "#0a2a0a";
    ctx.fillRect(pos.x + 26, pos.y + 7 + i * 15, 3, 3);
    const led2On = Math.sin(time * 0.07 + i * 0.9) > 0;
    ctx.fillStyle = led2On ? "#f59e0b" : "#2a1a0a";
    ctx.fillRect(pos.x + 26, pos.y + 12 + i * 15, 3, 3);
  }
  // Cables coming out bottom
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 8, pos.y + 108, 3, 14);
  ctx.fillRect(pos.x + 16, pos.y + 108, 3, 18);
  ctx.fillRect(pos.x + 24, pos.y + 108, 3, 10);
  // Cable running along floor
  ctx.fillStyle = "#141414";
  ctx.fillRect(pos.x + 16, pos.y + 124, 80, 2);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, pos: Position) {
  // Shelf frame (taller)
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y, 50, 90);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 3, pos.y + 3, 44, 84);
  // Shelves
  for (let s = 0; s < 4; s++) {
    const sy = pos.y + 3 + s * 22;
    ctx.fillStyle = "#1a1410";
    ctx.fillRect(pos.x + 3, sy + 19, 44, 3);
    // Books
    const bookColors = ["#7c3aed", "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];
    let bx = pos.x + 5;
    for (let b = 0; b < 5 + (s % 2); b++) {
      const bw = 5 + (b % 3);
      const bh = 12 + (b % 4) * 2;
      ctx.fillStyle = bookColors[(s * 5 + b) % bookColors.length];
      ctx.fillRect(bx, sy + 19 - bh, bw, bh);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(bx, sy + 19 - bh, 1, bh);
      // Spine detail
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(bx + 1, sy + 19 - bh + 2, bw - 2, 1);
      bx += bw + 1;
    }
  }
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Counter (bigger)
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x - 8, pos.y + 50, 60, 18);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x - 5, pos.y + 53, 54, 12);
  ctx.fillStyle = "#2a2418";
  ctx.fillRect(pos.x - 5, pos.y + 53, 54, 2);
  // Counter legs
  ctx.fillStyle = "#141010";
  ctx.fillRect(pos.x - 2, pos.y + 68, 5, 16);
  ctx.fillRect(pos.x + 41, pos.y + 68, 5, 16);
  // Machine body
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 4, pos.y, 36, 50);
  ctx.fillStyle = "#222222";
  ctx.fillRect(pos.x + 6, pos.y + 2, 32, 46);
  // Display
  ctx.fillStyle = "#0a2a0a";
  ctx.fillRect(pos.x + 8, pos.y + 4, 28, 14);
  ctx.fillStyle = "#22c55e";
  ctx.font = "8px monospace";
  ctx.fillText("READY", pos.x + 10, pos.y + 14);
  // Buttons
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(pos.x + 10, pos.y + 22, 6, 5);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(pos.x + 20, pos.y + 22, 6, 5);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(pos.x + 30, pos.y + 22, 6, 5);
  // Drip area
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(pos.x + 10, pos.y + 32, 24, 14);
  // Coffee mug
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(pos.x + 16, pos.y + 36, 10, 8);
  ctx.fillStyle = "#d4d4d4";
  ctx.fillRect(pos.x + 26, pos.y + 38, 3, 5);
  // Coffee in mug
  ctx.fillStyle = "#3d1f0a";
  ctx.fillRect(pos.x + 17, pos.y + 37, 8, 3);
  // Steam particles (bigger, more visible)
  for (let s = 0; s < 5; s++) {
    const steamY = pos.y + 32 - s * 5 + Math.sin(time * 0.035 + s * 1.5) * 3;
    const steamX = pos.x + 20 + Math.sin(time * 0.025 + s * 2) * 3;
    const alpha = 0.25 - s * 0.04;
    ctx.fillStyle = `rgba(200, 200, 220, ${alpha})`;
    ctx.fillRect(steamX, steamY, 3, 2);
  }
  // "COFFEE" label
  ctx.font = "6px monospace";
  ctx.fillStyle = "rgba(150, 150, 150, 0.5)";
  ctx.textAlign = "center";
  ctx.fillText("☕ COFFEE", pos.x + 22, pos.y + 90);
  ctx.textAlign = "left";
}

function drawOwshLogo(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Bigger frame
  ctx.fillStyle = "#1a1a28";
  ctx.fillRect(pos.x, pos.y, 80, 32);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(pos.x + 3, pos.y + 3, 74, 26);
  // OWSH text with animated gradient glow
  const glow = 0.7 + Math.sin(time * 0.02) * 0.3;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "center";
  // Text shadow
  ctx.fillStyle = `rgba(163, 38, 181, ${glow * 0.5})`;
  ctx.fillText("OWSH", pos.x + 41, pos.y + 22);
  // Main text
  ctx.fillStyle = `rgba(223, 79, 21, ${glow})`;
  ctx.fillText("OWSH", pos.x + 40, pos.y + 21);
  ctx.textAlign = "left";
  // Glow halo
  ctx.fillStyle = `rgba(249, 66, 95, ${glow * 0.08})`;
  ctx.fillRect(pos.x - 10, pos.y - 5, 100, 42);
}

function drawPlant(ctx: CanvasRenderingContext2D, pos: Position) {
  // Pot (bigger)
  ctx.fillStyle = "#5c2d0a";
  ctx.fillRect(pos.x, pos.y + 24, 22, 3);
  ctx.fillStyle = "#78350f";
  ctx.fillRect(pos.x + 2, pos.y + 27, 18, 14);
  ctx.fillStyle = "#92400e";
  ctx.fillRect(pos.x + 3, pos.y + 28, 16, 12);
  // Soil
  ctx.fillStyle = "#3d1f0a";
  ctx.fillRect(pos.x + 3, pos.y + 26, 16, 3);
  // Stem
  ctx.fillStyle = "#166534";
  ctx.fillRect(pos.x + 10, pos.y + 6, 3, 20);
  // Leaf clusters (bushier)
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(pos.x + 5, pos.y + 4, 5, 6);
  ctx.fillRect(pos.x + 13, pos.y + 5, 5, 5);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(pos.x + 6, pos.y + 1, 10, 5);
  ctx.fillStyle = "#166534";
  ctx.fillRect(pos.x + 2, pos.y + 8, 5, 5);
  ctx.fillRect(pos.x + 16, pos.y + 8, 5, 5);
  ctx.fillStyle = "#14532d";
  ctx.fillRect(pos.x + 7, pos.y, 8, 3);
  ctx.fillStyle = "#4ade80";
  ctx.fillRect(pos.x + 4, pos.y + 12, 4, 4);
  ctx.fillRect(pos.x + 15, pos.y + 11, 4, 4);
}

function drawEmptyDesk(ctx: CanvasRenderingContext2D, pos: Position) {
  // Dimmer, bigger desk
  ctx.fillStyle = "#0e0c0a";
  ctx.fillRect(pos.x, pos.y + 36, 120, 20);
  ctx.fillStyle = "#141210";
  ctx.fillRect(pos.x + 3, pos.y + 39, 114, 14);
  // Desk legs
  ctx.fillStyle = "#0c0a08";
  ctx.fillRect(pos.x + 6, pos.y + 56, 5, 16);
  ctx.fillRect(pos.x + 109, pos.y + 56, 5, 16);
  // Monitor (off)
  ctx.fillStyle = "#080808";
  ctx.fillRect(pos.x + 35, pos.y + 4, 50, 28);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(pos.x + 37, pos.y + 6, 46, 24);
  // Stand
  ctx.fillStyle = "#080808";
  ctx.fillRect(pos.x + 57, pos.y + 32, 6, 5);
  ctx.fillRect(pos.x + 53, pos.y + 36, 14, 3);
  // Empty chair
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(pos.x + 42, pos.y + 76, 28, 20);
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(pos.x + 44, pos.y + 78, 24, 16);
  // "AVAILABLE" label with dim glow
  ctx.font = "7px monospace";
  ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
  ctx.textAlign = "center";
  ctx.fillText("AVAILABLE", pos.x + 60, pos.y + 104);
  ctx.textAlign = "left";
}

function drawDoor(ctx: CanvasRenderingContext2D, pos: Position) {
  // Door frame (bigger)
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x, pos.y, 44, 80);
  ctx.fillStyle = "#221c14";
  ctx.fillRect(pos.x + 4, pos.y + 4, 36, 72);
  // Door surface
  ctx.fillStyle = "#181412";
  ctx.fillRect(pos.x + 6, pos.y + 6, 32, 68);
  // Panels
  ctx.fillStyle = "#1e1810";
  ctx.fillRect(pos.x + 9, pos.y + 9, 26, 26);
  ctx.fillRect(pos.x + 9, pos.y + 40, 26, 26);
  // Handle
  ctx.fillStyle = "#d4a574";
  ctx.fillRect(pos.x + 32, pos.y + 38, 4, 8);
  ctx.fillStyle = "#c49a64";
  ctx.fillRect(pos.x + 32, pos.y + 38, 4, 2);
  // Light from crack
  ctx.fillStyle = "rgba(255, 200, 100, 0.04)";
  ctx.fillRect(pos.x + 6, pos.y + 6, 32, 68);
  // "EXIT" sign above with glow
  ctx.fillStyle = "#0a1a0a";
  ctx.fillRect(pos.x + 6, pos.y - 14, 30, 12);
  ctx.fillStyle = "#22c55e";
  ctx.font = "8px monospace";
  ctx.textAlign = "center";
  ctx.fillText("EXIT", pos.x + 22, pos.y - 5);
  ctx.textAlign = "left";
  // Exit sign glow
  ctx.fillStyle = "rgba(34, 197, 94, 0.06)";
  ctx.fillRect(pos.x - 4, pos.y - 18, 50, 20);
}

function drawRug(ctx: CanvasRenderingContext2D, pos: Position) {
  // Large dark rug with subtle gradient pattern
  const rugW = 460;
  const rugH = 200;
  ctx.fillStyle = "rgba(163, 38, 181, 0.03)";
  ctx.fillRect(pos.x, pos.y, rugW, rugH);
  // Border
  ctx.fillStyle = "rgba(163, 38, 181, 0.07)";
  ctx.fillRect(pos.x, pos.y, rugW, 2);
  ctx.fillRect(pos.x, pos.y + rugH - 2, rugW, 2);
  ctx.fillRect(pos.x, pos.y, 2, rugH);
  ctx.fillRect(pos.x + rugW - 2, pos.y, 2, rugH);
  // Inner border
  ctx.fillStyle = "rgba(249, 66, 95, 0.04)";
  ctx.fillRect(pos.x + 6, pos.y + 6, rugW - 12, 1);
  ctx.fillRect(pos.x + 6, pos.y + rugH - 7, rugW - 12, 1);
  ctx.fillRect(pos.x + 6, pos.y + 6, 1, rugH - 12);
  ctx.fillRect(pos.x + rugW - 7, pos.y + 6, 1, rugH - 12);
}

function drawWallClock(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Clock face
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(pos.x + 14, pos.y + 14, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222222";
  ctx.beginPath();
  ctx.arc(pos.x + 14, pos.y + 14, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0e0e0e";
  ctx.beginPath();
  ctx.arc(pos.x + 14, pos.y + 14, 12, 0, Math.PI * 2);
  ctx.fill();
  // Hour markers
  for (let h = 0; h < 12; h++) {
    const angle = (h / 12) * Math.PI * 2 - Math.PI / 2;
    const mx = pos.x + 14 + Math.cos(angle) * 10;
    const my = pos.y + 14 + Math.sin(angle) * 10;
    ctx.fillStyle = "#444444";
    ctx.fillRect(mx, my, 2, 2);
  }
  // Hour hand (slow)
  const hourAngle = (time * 0.0002) % (Math.PI * 2) - Math.PI / 2;
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pos.x + 14, pos.y + 14);
  ctx.lineTo(pos.x + 14 + Math.cos(hourAngle) * 6, pos.y + 14 + Math.sin(hourAngle) * 6);
  ctx.stroke();
  // Minute hand
  const minAngle = (time * 0.002) % (Math.PI * 2) - Math.PI / 2;
  ctx.strokeStyle = "#aaaaaa";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x + 14, pos.y + 14);
  ctx.lineTo(pos.x + 14 + Math.cos(minAngle) * 9, pos.y + 14 + Math.sin(minAngle) * 9);
  ctx.stroke();
  // Second hand (red, ticking)
  const secAngle = (time * 0.02) % (Math.PI * 2) - Math.PI / 2;
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x + 14, pos.y + 14);
  ctx.lineTo(pos.x + 14 + Math.cos(secAngle) * 10, pos.y + 14 + Math.sin(secAngle) * 10);
  ctx.stroke();
  // Center dot
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(pos.x + 14, pos.y + 14, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, pos: Position, _time: number) {
  // Board
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(pos.x, pos.y, 50, 36);
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(pos.x + 3, pos.y + 3, 44, 30);
  // Content — scribbles
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x + 8, pos.y + 10);
  ctx.lineTo(pos.x + 30, pos.y + 10);
  ctx.stroke();
  ctx.strokeStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(pos.x + 8, pos.y + 16);
  ctx.lineTo(pos.x + 24, pos.y + 16);
  ctx.stroke();
  ctx.strokeStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(pos.x + 8, pos.y + 22);
  ctx.lineTo(pos.x + 36, pos.y + 22);
  ctx.stroke();
  // Checkbox
  ctx.strokeStyle = "#7c3aed";
  ctx.strokeRect(pos.x + 34, pos.y + 8, 6, 6);
  ctx.strokeRect(pos.x + 34, pos.y + 18, 6, 6);
  // Checkmark
  ctx.strokeStyle = "#22c55e";
  ctx.beginPath();
  ctx.moveTo(pos.x + 35, pos.y + 11);
  ctx.lineTo(pos.x + 37, pos.y + 13);
  ctx.lineTo(pos.x + 39, pos.y + 9);
  ctx.stroke();
  // Marker tray
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x + 5, pos.y + 34, 40, 4);
  // Colored markers
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(pos.x + 8, pos.y + 34, 8, 3);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(pos.x + 18, pos.y + 34, 8, 3);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(pos.x + 28, pos.y + 34, 8, 3);
}

function drawCeilingLights(ctx: CanvasRenderingContext2D, time: number) {
  // Light fixtures hanging from ceiling — cast cones of light
  const lights = [
    { x: 200, y: 67 },
    { x: 400, y: 67 },
    { x: 600, y: 67 },
    { x: 800, y: 67 },
  ];
  lights.forEach((l, i) => {
    // Fixture
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(l.x - 6, l.y - 2, 12, 4);
    ctx.fillStyle = "#222222";
    ctx.fillRect(l.x - 4, l.y + 2, 8, 3);
    // Light cone (subtle)
    const flicker = 0.03 + Math.sin(time * 0.008 + i * 1.7) * 0.008;
    const grad = ctx.createLinearGradient(l.x, l.y + 5, l.x, l.y + 120);
    grad.addColorStop(0, `rgba(255, 240, 200, ${flicker * 2})`);
    grad.addColorStop(1, `rgba(255, 240, 200, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(l.x - 4, l.y + 5);
    ctx.lineTo(l.x - 40, l.y + 120);
    ctx.lineTo(l.x + 40, l.y + 120);
    ctx.lineTo(l.x + 4, l.y + 5);
    ctx.closePath();
    ctx.fill();
    // Warm bulb dot
    ctx.fillStyle = `rgba(255, 220, 150, ${0.3 + Math.sin(time * 0.01 + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(l.x, l.y + 4, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPoster(ctx: CanvasRenderingContext2D, pos: Position, text: string, color: string) {
  // Frame
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pos.x, pos.y, 36, 28);
  ctx.fillStyle = "#111111";
  ctx.fillRect(pos.x + 2, pos.y + 2, 32, 24);
  // Text
  ctx.font = "bold 7px monospace";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(text, pos.x + 18, pos.y + 16);
  ctx.textAlign = "left";
  // Subtle glow
  const rgb = hexToRgb(color);
  ctx.fillStyle = `rgba(${rgb}, 0.06)`;
  ctx.fillRect(pos.x - 4, pos.y - 2, 44, 34);
}

function drawCouch(ctx: CanvasRenderingContext2D, pos: Position) {
  // Couch back
  ctx.fillStyle = "#1a1018";
  ctx.fillRect(pos.x, pos.y, 80, 16);
  ctx.fillStyle = "#221828";
  ctx.fillRect(pos.x + 2, pos.y + 2, 76, 12);
  // Seat cushions
  ctx.fillStyle = "#2a1e32";
  ctx.fillRect(pos.x, pos.y + 16, 80, 20);
  ctx.fillStyle = "#32243a";
  ctx.fillRect(pos.x + 2, pos.y + 18, 36, 16);
  ctx.fillRect(pos.x + 42, pos.y + 18, 36, 16);
  // Cushion divider
  ctx.fillStyle = "#1a1018";
  ctx.fillRect(pos.x + 39, pos.y + 18, 2, 16);
  // Armrests
  ctx.fillStyle = "#1a1018";
  ctx.fillRect(pos.x - 4, pos.y + 8, 6, 28);
  ctx.fillRect(pos.x + 78, pos.y + 8, 6, 28);
  // Legs
  ctx.fillStyle = "#111111";
  ctx.fillRect(pos.x + 2, pos.y + 36, 4, 6);
  ctx.fillRect(pos.x + 74, pos.y + 36, 4, 6);
  // Throw pillow
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(pos.x + 6, pos.y + 10, 12, 10);
  ctx.fillStyle = "#8b5cf6";
  ctx.fillRect(pos.x + 7, pos.y + 11, 10, 8);
  // Small side table
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(pos.x + 86, pos.y + 20, 20, 3);
  ctx.fillRect(pos.x + 86, pos.y + 16, 20, 3);
  ctx.fillStyle = "#141010";
  ctx.fillRect(pos.x + 90, pos.y + 23, 3, 14);
  ctx.fillRect(pos.x + 100, pos.y + 23, 3, 14);
  // Mug on side table
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(pos.x + 92, pos.y + 13, 6, 4);
  ctx.fillStyle = "#d97706";
  ctx.fillRect(pos.x + 98, pos.y + 14, 2, 2);
}

function drawWaterCooler(ctx: CanvasRenderingContext2D, pos: Position, time: number) {
  // Base
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(pos.x, pos.y + 30, 16, 24);
  ctx.fillStyle = "#d0d0d0";
  ctx.fillRect(pos.x + 2, pos.y + 32, 12, 20);
  // Water jug on top
  ctx.fillStyle = "#88ccff";
  ctx.fillRect(pos.x + 2, pos.y, 12, 30);
  ctx.fillStyle = "#aaddff";
  ctx.fillRect(pos.x + 4, pos.y + 2, 8, 26);
  // Water level animated
  const waterLevel = 14 + Math.sin(time * 0.005) * 2;
  ctx.fillStyle = "#66bbff";
  ctx.fillRect(pos.x + 4, pos.y + 2 + waterLevel, 8, 26 - waterLevel);
  // Tap
  ctx.fillStyle = "#aaaaaa";
  ctx.fillRect(pos.x + 6, pos.y + 30, 4, 3);
  // Drip catch
  ctx.fillStyle = "#888888";
  ctx.fillRect(pos.x + 2, pos.y + 52, 12, 2);
  // Cup
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(pos.x + 18, pos.y + 46, 5, 6);
  // Bubble animation
  if (Math.sin(time * 0.03) > 0.7) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(pos.x + 8, pos.y + 10 + (time * 0.1 % 8), 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawAmbientEffects(ctx: CanvasRenderingContext2D, time: number) {
  // Floating dust particles (more, spread across bigger canvas)
  const particles = [
    { x: 120, y: 100, speed: 0.3, size: 2 },
    { x: 350, y: 250, speed: 0.2, size: 1 },
    { x: 600, y: 150, speed: 0.25, size: 2 },
    { x: 250, y: 400, speed: 0.35, size: 1 },
    { x: 750, y: 200, speed: 0.15, size: 1 },
    { x: 80, y: 300, speed: 0.28, size: 2 },
    { x: 500, y: 500, speed: 0.22, size: 1 },
    { x: 700, y: 350, speed: 0.18, size: 1 },
    { x: 180, y: 550, speed: 0.2, size: 2 },
    { x: 850, y: 280, speed: 0.3, size: 1 },
    { x: 420, y: 120, speed: 0.25, size: 1 },
    { x: 650, y: 480, speed: 0.15, size: 2 },
    { x: 300, y: 180, speed: 0.32, size: 1 },
    { x: 550, y: 350, speed: 0.22, size: 1 },
  ];

  particles.forEach((p, i) => {
    const floatX = Math.sin(time * p.speed * 0.008 + i * 2.1) * 5;
    const floatY = Math.cos(time * p.speed * 0.006 + i * 1.7) * 6;
    const alpha = 0.04 + Math.abs(Math.sin(time * 0.008 + i)) * 0.06;
    ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
    ctx.fillRect(p.x + floatX, p.y + floatY, p.size, p.size);
  });

  // Neon glow reflections on floor
  ctx.fillStyle = "rgba(163, 38, 181, 0.012)";
  ctx.fillRect(0, 500, OFFICE.width, 140);
  ctx.fillStyle = "rgba(249, 66, 95, 0.008)";
  ctx.fillRect(0, 540, OFFICE.width, 100);
}

// Draw LOKI the cat! 🐱
export function drawLoki(ctx: CanvasRenderingContext2D, time: number) {
  // Loki wanders around the office — bigger patrol area
  const baseX = 380;
  const baseY = 380;
  const wanderX = baseX + Math.sin(time * 0.005) * 80 + Math.sin(time * 0.003) * 30;
  const wanderY = baseY + Math.cos(time * 0.004) * 40 + Math.cos(time * 0.007) * 15;
  const bobY = Math.sin(time * 0.04) * 1;

  // Determine if Loki is walking or sitting
  const speed = Math.abs(Math.cos(time * 0.005)) + Math.abs(Math.cos(time * 0.004));
  const isSitting = speed < 0.6;
  // Determine facing direction
  const facingRight = Math.cos(time * 0.005) > 0;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(wanderX + 12, wanderY + 24 + bobY, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const dx = facingRight ? 1 : -1;
  const ox = facingRight ? 0 : 24; // flip offset

  if (isSitting) {
    // === SITTING POSE ===
    // Body (rounder when sitting)
    ctx.fillStyle = "#333333";
    ctx.fillRect(wanderX + 4, wanderY + 10 + bobY, 16, 12);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(wanderX + 6, wanderY + 11 + bobY, 12, 10);
    // Head
    ctx.fillStyle = "#383838";
    ctx.fillRect(wanderX + 6, wanderY + 2 + bobY, 12, 10);
    // Ears
    ctx.fillStyle = "#333333";
    ctx.fillRect(wanderX + 5, wanderY - 1 + bobY, 4, 4);
    ctx.fillRect(wanderX + 15, wanderY - 1 + bobY, 4, 4);
    ctx.fillStyle = "#e8a0a0";
    ctx.fillRect(wanderX + 6, wanderY + bobY, 2, 2);
    ctx.fillRect(wanderX + 16, wanderY + bobY, 2, 2);
    // Tail wraps around body
    const tailCurl = Math.sin(time * 0.03) * 2;
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(wanderX + 18, wanderY + 16 + bobY, 6, 3);
    ctx.fillRect(wanderX + 22 + tailCurl, wanderY + 14 + bobY, 4, 3);
    // Front paws tucked
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(wanderX + 6, wanderY + 20 + bobY, 5, 3);
    ctx.fillRect(wanderX + 13, wanderY + 20 + bobY, 5, 3);
  } else {
    // === WALKING POSE ===
    const legAnim = Math.sin(time * 0.08) * 2;
    // Body
    ctx.fillStyle = "#333333";
    const bodyX = facingRight ? wanderX + 2 : wanderX + 6;
    ctx.fillRect(bodyX, wanderY + 10 + bobY, 18, 10);
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(bodyX + 2, wanderY + 11 + bobY, 14, 8);
    // Head (offset in facing direction)
    const headX = facingRight ? wanderX + 16 : wanderX - 2;
    ctx.fillStyle = "#383838";
    ctx.fillRect(headX, wanderY + 6 + bobY, 12, 10);
    // Ears
    ctx.fillStyle = "#333333";
    ctx.fillRect(headX - 1, wanderY + 3 + bobY, 4, 4);
    ctx.fillRect(headX + 9, wanderY + 3 + bobY, 4, 4);
    ctx.fillStyle = "#e8a0a0";
    ctx.fillRect(headX, wanderY + 4 + bobY, 2, 2);
    ctx.fillRect(headX + 10, wanderY + 4 + bobY, 2, 2);
    // Tail up (animated)
    const tailWave = Math.sin(time * 0.06) * 3;
    const tailX = facingRight ? wanderX - 2 : wanderX + 22;
    const tailDir = facingRight ? -1 : 1;
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(tailX, wanderY + 11 + bobY, 5, 2);
    ctx.fillRect(tailX + tailDir * 3, wanderY + 8 + bobY + tailWave, 4, 2);
    ctx.fillRect(tailX + tailDir * 5, wanderY + 5 + bobY + tailWave * 1.3, 3, 2);
    // Walking legs (animated)
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(bodyX + 2, wanderY + 19 + bobY + legAnim, 3, 5);
    ctx.fillRect(bodyX + 8, wanderY + 19 + bobY - legAnim, 3, 5);
    ctx.fillRect(bodyX + 12, wanderY + 19 + bobY + legAnim * 0.8, 3, 5);
    // Paws
    ctx.fillStyle = "#444444";
    ctx.fillRect(bodyX + 1, wanderY + 23 + bobY + legAnim, 4, 2);
    ctx.fillRect(bodyX + 7, wanderY + 23 + bobY - legAnim, 4, 2);
    ctx.fillRect(bodyX + 11, wanderY + 23 + bobY + legAnim * 0.8, 4, 2);
  }

  // Eyes (always drawn — green, cat-like)
  const eyeBaseX = isSitting ? wanderX + 7 : (facingRight ? wanderX + 18 : wanderX);
  const eyeBaseY = wanderY + (isSitting ? 5 : 9) + bobY;
  const blink = Math.sin(time * 0.015) > 0.93;
  if (!blink) {
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(eyeBaseX, eyeBaseY, 3, 3);
    ctx.fillRect(eyeBaseX + 6, eyeBaseY, 3, 3);
    // Slit pupils
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(eyeBaseX + 1, eyeBaseY, 1, 3);
    ctx.fillRect(eyeBaseX + 7, eyeBaseY, 1, 3);
    // Eye shine
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(eyeBaseX, eyeBaseY, 1, 1);
    ctx.fillRect(eyeBaseX + 6, eyeBaseY, 1, 1);
  } else {
    ctx.fillStyle = "#383838";
    ctx.fillRect(eyeBaseX, eyeBaseY + 1, 3, 1);
    ctx.fillRect(eyeBaseX + 6, eyeBaseY + 1, 3, 1);
  }
  // Nose
  ctx.fillStyle = "#e8a0a0";
  const noseX = isSitting ? wanderX + 11 : (facingRight ? wanderX + 22 : wanderX + 4);
  const noseY = isSitting ? wanderY + 9 : wanderY + 12;
  ctx.fillRect(noseX, noseY + bobY, 2, 1);
  // Whiskers (tiny lines)
  ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(noseX - 1, noseY + bobY);
  ctx.lineTo(noseX - 5, noseY - 1 + bobY);
  ctx.moveTo(noseX - 1, noseY + 1 + bobY);
  ctx.lineTo(noseX - 5, noseY + 2 + bobY);
  ctx.moveTo(noseX + 3, noseY + bobY);
  ctx.lineTo(noseX + 7, noseY - 1 + bobY);
  ctx.moveTo(noseX + 3, noseY + 1 + bobY);
  ctx.lineTo(noseX + 7, noseY + 2 + bobY);
  ctx.stroke();

  // "LOKI" label
  ctx.font = "7px monospace";
  ctx.fillStyle = "rgba(180, 180, 180, 0.5)";
  ctx.textAlign = "center";
  const labelText = isSitting ? "🐱 LOKI (purring)" : "🐱 LOKI";
  ctx.fillText(labelText, wanderX + 12, wanderY - 6 + bobY);
  ctx.textAlign = "left";
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
