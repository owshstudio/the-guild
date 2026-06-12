import { AgentStatus } from "@/lib/types";
import { getCharacterSprites, renderSprite, SpriteData } from "./sprites";
import { agentPositions, getStatusColor, OFFICE } from "./office-map";

export type AgentState =
  | "idle"
  | "typing"
  | "walking-down"
  | "walking-up"
  | "walking-left"
  | "walking-right"
  | "drinking-coffee"
  | "conversing";

export interface AgentEntity {
  id: string;
  name: string;
  paletteId: string;
  status: AgentStatus;
  x: number;
  y: number;
  frame: number;
  frameTimer: number;
  state: AgentState;
  // Breathing
  breathPhase: number;
  breathTimer: number;
  // Blinking
  blinkTimer: number;
  blinkFrame: number; // 0=open, 1=half, 2=closed, -1=not blinking
  nextBlinkIn: number;
}

// Walk frame durations in seconds: contact/push-off slightly longer than passing
const WALK_FRAME_DURATIONS = [0.12, 0.10, 0.12, 0.12, 0.10, 0.12];

function randomBlinkDelay(): number {
  return 2 + Math.random() * 4; // 2-6 seconds
}

export function createAgentEntities(): AgentEntity[] {
  return [
    {
      id: "nyx",
      name: "NYX",
      paletteId: "nyx",
      status: "active",
      x: agentPositions[0].position.x,
      y: agentPositions[0].position.y,
      frame: 0,
      frameTimer: 0,
      state: "typing",
      breathPhase: 0,
      breathTimer: 0,
      blinkTimer: 0,
      blinkFrame: -1,
      nextBlinkIn: randomBlinkDelay(),
    },
    {
      id: "hemera",
      name: "HEMERA",
      paletteId: "hemera",
      status: "idle",
      x: agentPositions[1].position.x,
      y: agentPositions[1].position.y,
      frame: 0,
      frameTimer: 0,
      state: "idle",
      breathPhase: 0,
      breathTimer: 0,
      blinkTimer: 0,
      blinkFrame: -1,
      nextBlinkIn: randomBlinkDelay(),
    },
  ];
}

export function updateAgent(agent: AgentEntity, deltaTime: number): void {
  // Update frame timer with real delta
  agent.frameTimer += deltaTime;

  // ── Typing animation ──
  if (agent.state === "typing") {
    if (agent.frameTimer > 0.33) {
      agent.frameTimer = 0;
      agent.frame = agent.frame === 0 ? 1 : 0;
    }
  }

  // ── Idle breathing (4-phase cycle, 0.8s per phase) ──
  if (agent.state === "idle") {
    agent.breathTimer += deltaTime;
    if (agent.breathTimer > 0.8) {
      agent.breathTimer = 0;
      agent.breathPhase = (agent.breathPhase + 1) % 4;
    }
  }

  // ── Coffee / Conversation animation ──
  if (agent.state === "drinking-coffee" || agent.state === "conversing") {
    if (agent.frameTimer > 0.6) {
      agent.frameTimer = 0;
      agent.frame = agent.frame === 0 ? 1 : 0;
    }
  }

  // ── Walking animation (6-frame) ──
  if (agent.state.startsWith("walking")) {
    const frameDuration = WALK_FRAME_DURATIONS[agent.frame % 6];
    if (agent.frameTimer > frameDuration) {
      agent.frameTimer = 0;
      agent.frame = (agent.frame + 1) % 6;
    }
  }

  // ── Eye blinking ──
  // Only blink when facing front or side (not walking-up)
  if (agent.state !== "walking-up") {
    if (agent.blinkFrame === -1) {
      // Not blinking — countdown to next blink
      agent.blinkTimer += deltaTime;
      if (agent.blinkTimer >= agent.nextBlinkIn) {
        agent.blinkFrame = 0;
        agent.blinkTimer = 0;
      }
    } else {
      // In a blink — 3 phases at 70ms each
      agent.blinkTimer += deltaTime;
      if (agent.blinkTimer > 0.07) {
        agent.blinkTimer = 0;
        agent.blinkFrame++;
        if (agent.blinkFrame > 2) {
          // Blink done
          agent.blinkFrame = -1;
          agent.nextBlinkIn = randomBlinkDelay();
        }
      }
    }
  }
}

export function drawAgent(
  ctx: CanvasRenderingContext2D,
  agent: AgentEntity,
  scale: number
): void {
  const sprites = getCharacterSprites(agent.paletteId);

  // Pick the right frame
  let sprite: SpriteData;
  if (agent.state === "typing") {
    sprite = sprites.typing[agent.frame % 2];
  } else if (agent.state === "drinking-coffee") {
    sprite = sprites.coffee[agent.frame % 2];
  } else if (agent.state === "conversing") {
    sprite = sprites.conversation[agent.frame % 2];
  } else if (agent.state === "idle") {
    sprite = sprites.idleBreath[agent.breathPhase % 4];
  } else if (agent.state === "walking-down") {
    sprite = sprites.walkDown[agent.frame % 6];
  } else if (agent.state === "walking-up") {
    sprite = sprites.walkUp[agent.frame % 6];
  } else if (agent.state === "walking-right") {
    sprite = sprites.walkRight[agent.frame % 6];
  } else if (agent.state === "walking-left") {
    sprite = sprites.walkLeft[agent.frame % 6];
  } else {
    sprite = sprites.idle;
  }

  // Center character in tile
  const xOffset = (OFFICE.tileSize - 16 * scale) / 2;

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(
    agent.x + xOffset + 8 * scale,
    agent.y + 23 * scale,
    7 * scale,
    2 * scale,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Draw character
  renderSprite(ctx, sprite, agent.x + xOffset, agent.y, scale);

  // ── Eye blink overlay ──
  // Only for front-facing or side-facing sprites (not walk-up)
  if (agent.blinkFrame >= 0 && agent.state !== "walking-up") {
    const pal = agent.paletteId === "nyx"
      ? { skin: "#d8c0f0" }
      : { skin: "#fce4b8" };

    // Eye positions in the sprite (row 6, cols 5-6 and 9-10 for front-facing)
    const isFrontFacing = agent.state === "idle" || agent.state === "typing" ||
      agent.state === "walking-down";

    if (isFrontFacing) {
      const eyeRow = 6;
      const eyePositions = [
        { col: 5, w: 2 }, // left eye
        { col: 9, w: 2 }, // right eye
      ];

      if (agent.blinkFrame >= 1) {
        ctx.fillStyle = pal.skin;
        for (const eye of eyePositions) {
          const ex = agent.x + xOffset + eye.col * scale;
          const ey = agent.y + eyeRow * scale;
          // Half blink: cover top half of eye
          const h = agent.blinkFrame >= 2 ? scale : Math.ceil(scale / 2);
          ctx.fillRect(ex, ey, eye.w * scale, h);
        }
      }
    } else if (agent.state === "walking-right" || agent.state === "walking-left") {
      // Side view: single eye
      const eyeRow = 6; // approximate
      const eyeCol = agent.state === "walking-right" ? 6 : 9;

      if (agent.blinkFrame >= 1) {
        ctx.fillStyle = pal.skin;
        const ex = agent.x + xOffset + eyeCol * scale;
        const ey = agent.y + eyeRow * scale;
        const h = agent.blinkFrame >= 2 ? scale : Math.ceil(scale / 2);
        ctx.fillRect(ex, ey, 2 * scale, h);
      }
    }
  }

  // Name label
  const nameX = agent.x + xOffset + 8 * scale;
  const nameY = agent.y - 12;
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";

  // Label background
  const tw = ctx.measureText(agent.name).width;
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(nameX - tw / 2 - 6, nameY - 10, tw + 12, 16);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(nameX - tw / 2 - 6, nameY - 10, tw + 12, 16);

  ctx.fillStyle = "#333333";
  ctx.fillText(agent.name, nameX, nameY + 2);

  // Status dot
  const dotX = nameX;
  const dotY = nameY - 16;
  const statusColor = getStatusColor(agent.status);
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fillStyle = statusColor + "30";
  ctx.fill();

  ctx.textAlign = "left";
}

export function isAgentHovered(
  agent: AgentEntity,
  mouseX: number,
  mouseY: number,
  scale: number
): boolean {
  const w = 16 * scale;
  const h = 24 * scale;
  return (
    mouseX >= agent.x - 8 &&
    mouseX <= agent.x + w + 8 &&
    mouseY >= agent.y - 20 &&
    mouseY <= agent.y + h + 8
  );
}
