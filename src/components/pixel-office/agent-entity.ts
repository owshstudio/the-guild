import { AgentStatus } from "@/lib/types";
import { getCharacterSprites, renderSprite, SpriteData } from "./sprites";
import { agentPositions, getStatusColor } from "./office-map";

export interface AgentEntity {
  id: string;
  name: string;
  paletteId: string;
  status: AgentStatus;
  x: number;
  y: number;
  frame: number;
  frameTimer: number;
  state: "idle" | "typing" | "walking";
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
    },
  ];
}

export function updateAgent(agent: AgentEntity): void {
  agent.frameTimer++;

  // Animate based on state
  if (agent.state === "typing") {
    // Swap between typing frames
    if (agent.frameTimer % 20 === 0) {
      agent.frame = agent.frame === 0 ? 1 : 0;
    }
  } else if (agent.state === "idle") {
    agent.frame = 0;
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
  } else {
    sprite = sprites.idle;
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(agent.x + 8 * scale, agent.y + 23 * scale, 7 * scale, 2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw character
  renderSprite(ctx, sprite, agent.x, agent.y, scale);

  // Name label
  const nameX = agent.x + 8 * scale;
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
