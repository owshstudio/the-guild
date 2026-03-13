import { Container, Graphics } from "pixi.js";
import { TileMap } from "./tilemap";
import { TileType } from "./tiles";
import { AgentEntity } from "./agent-entity";

// ── TYPES ────────────────────────────────────────────

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  phase: number;
  alpha: number;
  size: number;
}

interface ServerLED {
  x: number;
  y: number;
  color: number;
  timer: number;
  on: boolean;
}

interface SteamParticle {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  life: number;
  maxLife: number;
  swayPhase: number;
}

export interface EffectsState {
  ambientOverlay: Graphics;
  lightShafts: Graphics;
  monitorGlows: Graphics;
  dustParticles: DustParticle[];
  dustGraphics: Graphics;
  hoverGlow: Graphics;
  // Layer 2 additions
  serverLEDs: ServerLED[];
  serverLEDGraphics: Graphics;
  steamParticles: SteamParticle[];
  steamOrigins: { x: number; y: number }[];
  steamGraphics: Graphics;
  steamSpawnTimer: number;
  monitorShimmerTimer: number;
  lightShaftTimer: number;
  // Ceiling lights
  ceilingLights: Graphics;
  ceilingLightPositions: { x: number; y: number; phase: number }[];
}

// ── CREATE ───────────────────────────────────────────

export function createEffects(container: Container): EffectsState {
  const ambientOverlay = new Graphics();
  const lightShafts = new Graphics();
  const monitorGlows = new Graphics();
  const dustGraphics = new Graphics();
  const hoverGlow = new Graphics();
  const serverLEDGraphics = new Graphics();
  const steamGraphics = new Graphics();
  const ceilingLights = new Graphics();

  container.addChild(ceilingLights, ambientOverlay, lightShafts, monitorGlows, dustGraphics, serverLEDGraphics, steamGraphics, hoverGlow);

  // Dust particles — disabled for clean look
  const dustParticles: DustParticle[] = [];

  return {
    ambientOverlay, lightShafts, monitorGlows, dustParticles, dustGraphics, hoverGlow,
    serverLEDs: [],
    serverLEDGraphics,
    steamParticles: [],
    steamOrigins: [],
    steamGraphics,
    steamSpawnTimer: 0,
    monitorShimmerTimer: 0,
    lightShaftTimer: 0,
    ceilingLights,
    ceilingLightPositions: [],
  };
}

// ── REBUILD STATIC EFFECTS ──────────────────────────
// Called when room changes — recomputes light shafts and monitor glows

export function rebuildStaticEffects(state: EffectsState, tilemap: TileMap): void {
  const ts = tilemap.tileSize;

  // ── Ambient overlay: warm tint over entire scene
  state.ambientOverlay.clear();
  state.ambientOverlay.rect(0, 0, tilemap.cols * ts, tilemap.rows * ts);
  state.ambientOverlay.fill({ color: 0xfff8e0, alpha: 0.04 });

  // ── Light shafts from windows
  state.lightShafts.clear();
  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      if (tilemap.getTile(col, row) === TileType.WallBaseAlt) {
        const cx = col * ts + ts / 2;
        const topY = (row + 1) * ts;
        const botY = Math.min((row + 3) * ts, tilemap.rows * ts);
        const topHalf = ts * 0.5;
        const botHalf = ts * 0.75;

        // Trapezoidal light shaft
        state.lightShafts.moveTo(cx - topHalf, topY);
        state.lightShafts.lineTo(cx + topHalf, topY);
        state.lightShafts.lineTo(cx + botHalf, botY);
        state.lightShafts.lineTo(cx - botHalf, botY);
        state.lightShafts.closePath();
        state.lightShafts.fill({ color: 0xfff4d0, alpha: 0.06 });
      }
    }
  }

  // ── Monitor glows on desks
  state.monitorGlows.clear();
  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      if (tilemap.getTile(col, row) === TileType.DeskLeft) {
        const dx = col * ts + ts / 2;
        const dy = row * ts + ts * 0.45;
        // Soft blue ellipse glow
        state.monitorGlows.ellipse(dx, dy, 24, 12);
        state.monitorGlows.fill({ color: 0x4488ff, alpha: 0.03 });
      }
    }
  }

  // ── Server rack LED positions
  state.serverLEDs = [];
  const ledColors = [0x22c55e, 0xeab308, 0xef4444]; // green, amber, red
  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      if (tilemap.getTile(col, row) === TileType.ServerRack) {
        const bx = col * ts;
        const by = row * ts;
        // 4 server units, 3 LEDs each
        for (let u = 0; u < 4; u++) {
          const uy = by + 12 + u * 12;
          for (let li = 0; li < 3; li++) {
            state.serverLEDs.push({
              x: bx + 18 + li * 5,
              y: uy + 3,
              color: ledColors[Math.floor(Math.random() * ledColors.length)],
              timer: 0.5 + Math.random() * 1.5,
              on: Math.random() > 0.3,
            });
          }
        }
      }
    }
  }

  // ── Ceiling light pools
  state.ceilingLightPositions = [];
  state.ceilingLights.clear();
  // Place lights every 3rd column on floor rows 3 and 6
  const lightRows = [3, 6];
  for (const lr of lightRows) {
    if (lr >= tilemap.rows) continue;
    for (let col = 1; col < tilemap.cols; col += 3) {
      // Only on walkable floor tiles
      const tile = tilemap.getTile(col, lr);
      if (tile === TileType.Floor || (tile >= TileType.RugTL && tile <= TileType.RugBR)) {
        const lx = col * ts + ts / 2;
        const ly = lr * ts + ts / 2;
        state.ceilingLightPositions.push({
          x: lx,
          y: ly,
          phase: Math.random() * Math.PI * 2,
        });
        // Draw base elliptical pool
        state.ceilingLights.ellipse(lx, ly, 48, 32);
        state.ceilingLights.fill({ color: 0xfffff0, alpha: 0.04 });
      }
    }
  }

  // ── Coffee machine steam origins
  state.steamOrigins = [];
  state.steamParticles = [];
  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      if (tilemap.getTile(col, row) === TileType.CoffeeMachine) {
        state.steamOrigins.push({
          x: col * ts + 30,
          y: row * ts + 36,
        });
      }
    }
  }
}

// ── UPDATE EFFECTS (per frame) ──────────────────────

export function updateEffects(
  state: EffectsState,
  deltaTime: number,
  tilemap: TileMap,
  hoveredAgent: AgentEntity | null,
  scale: number
): void {
  // ── Timers
  state.lightShaftTimer += deltaTime;

  // ── Dust particles — skipped (empty array)
  state.dustGraphics.clear();

  // ── Server LED blink
  state.serverLEDGraphics.clear();
  for (const led of state.serverLEDs) {
    led.timer -= deltaTime;
    if (led.timer <= 0) {
      led.on = !led.on;
      led.timer = 0.5 + Math.random() * 1.5;
      // Occasionally change color
      if (Math.random() < 0.2) {
        const colors = [0x22c55e, 0xeab308, 0xef4444];
        led.color = colors[Math.floor(Math.random() * colors.length)];
      }
    }
    state.serverLEDGraphics.rect(led.x, led.y, 3, 3);
    state.serverLEDGraphics.fill({ color: led.color, alpha: led.on ? 0.6 : 0.0 });
  }

  // ── Coffee steam particles
  state.steamSpawnTimer += deltaTime;
  if (state.steamSpawnTimer >= 0.3) {
    state.steamSpawnTimer = 0;
    for (const origin of state.steamOrigins) {
      state.steamParticles.push({
        x: origin.x + (Math.random() - 0.5) * 4,
        y: origin.y,
        vy: -(8 + Math.random() * 7), // -8 to -15 px/s
        alpha: 0.25,
        life: 0,
        maxLife: 1 + Math.random() * 0.5, // 1-1.5s
        swayPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  state.steamGraphics.clear();
  for (let i = state.steamParticles.length - 1; i >= 0; i--) {
    const sp = state.steamParticles[i];
    sp.life += deltaTime;
    sp.y += sp.vy * deltaTime;
    sp.x += Math.sin(sp.swayPhase + sp.life * 3) * 0.5;
    sp.alpha = 0.25 * (1 - sp.life / sp.maxLife);

    if (sp.life >= sp.maxLife) {
      state.steamParticles.splice(i, 1);
      continue;
    }

    state.steamGraphics.rect(sp.x, sp.y, 2, 2);
    state.steamGraphics.fill({ color: 0xffffff, alpha: Math.max(0, sp.alpha) });
  }

  // ── Monitor glow — static
  state.monitorGlows.alpha = 1;

  // ── Light shaft animation — oscillate alpha
  const shaftAlpha = Math.sin(state.lightShaftTimer * 0.5) * 0.02 + 0.06;
  state.lightShafts.alpha = shaftAlpha / 0.06; // normalize since base fill is 0.06

  // ── Ceiling light gentle flicker — redraw with per-light alpha variation
  state.ceilingLights.clear();
  for (const cl of state.ceilingLightPositions) {
    const flickerAlpha = 0.04 + Math.sin(state.lightShaftTimer * 0.8 + cl.phase) * 0.01;
    state.ceilingLights.ellipse(cl.x, cl.y, 48, 32);
    state.ceilingLights.fill({ color: 0xfffff0, alpha: Math.max(0.02, flickerAlpha) });
  }

  // ── Hover glow
  state.hoverGlow.clear();
  if (hoveredAgent) {
    const w = 16 * scale * 1.5;
    const h = 24 * scale * 1.5;
    const cx = hoveredAgent.x + 8 * scale;
    const cy = hoveredAgent.y + 12 * scale;

    state.hoverGlow.ellipse(cx, cy, w / 2, h / 2);
    state.hoverGlow.fill({ color: 0xffffff, alpha: 0.06 });
  }
}
