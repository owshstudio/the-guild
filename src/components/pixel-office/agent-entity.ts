import { AgentStatus } from "@/lib/types";
import { nyxSprite, hemeraSprite, renderSprite, SpriteData } from "./sprites";
import { agentPositions, getStatusColor } from "./office-map";

export interface AgentEntity {
  id: string;
  name: string;
  status: AgentStatus;
  sprite: SpriteData;
  x: number;
  y: number;
  baseY: number;
  bobOffset: number;
  bobSpeed: number;
  frame: string;
  typingTimer: number;
}

export function createAgentEntities(): AgentEntity[] {
  return [
    {
      id: "nyx",
      name: "NYX",
      status: "active",
      sprite: nyxSprite,
      x: agentPositions[0].seatPosition.x,
      y: agentPositions[0].seatPosition.y,
      baseY: agentPositions[0].seatPosition.y,
      bobOffset: 0,
      bobSpeed: 0.03,
      frame: "idle",
      typingTimer: 0,
    },
    {
      id: "hemera",
      name: "HEMERA",
      status: "idle",
      sprite: hemeraSprite,
      x: agentPositions[1].seatPosition.x,
      y: agentPositions[1].seatPosition.y,
      baseY: agentPositions[1].seatPosition.y,
      bobOffset: Math.PI, // offset so they bob out of phase
      bobSpeed: 0.035,
      frame: "idle",
      typingTimer: 0,
    },
  ];
}

export function updateAgent(agent: AgentEntity, time: number): void {
  // Idle bobbing
  const bobAmount = 2;
  agent.y = agent.baseY + Math.sin(time * agent.bobSpeed + agent.bobOffset) * bobAmount;

  // Typing animation — alternate between idle and typing
  if (agent.status === "active") {
    agent.typingTimer += 1;
    // Switch frames for typing effect
    if (agent.typingTimer % 40 < 25) {
      agent.frame = "typing";
    } else {
      agent.frame = "idle";
    }
  } else {
    agent.frame = "idle";
  }
}

export function drawAgent(
  ctx: CanvasRenderingContext2D,
  agent: AgentEntity,
  scale: number = 3
): void {
  // Draw sprite
  renderSprite(ctx, agent.sprite, agent.frame, agent.x, agent.y, scale);

  // Draw name label
  ctx.font = "bold 10px var(--font-geist-sans), system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#a3a3a3";
  const nameX = agent.x + (agent.sprite.width * scale) / 2;
  const nameY = agent.y - 16;
  ctx.fillText(agent.name, nameX, nameY);

  // Draw status dot
  const dotX = nameX;
  const dotY = agent.y - 22;
  const statusColor = getStatusColor(agent.status);

  // Glow
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
  ctx.fillStyle = statusColor + "40";
  ctx.fill();

  // Dot
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
}

export function isAgentClicked(
  agent: AgentEntity,
  clickX: number,
  clickY: number,
  scale: number = 3
): boolean {
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;
  return (
    clickX >= agent.x - 8 &&
    clickX <= agent.x + spriteW + 8 &&
    clickY >= agent.y - 30 &&
    clickY <= agent.y + spriteH + 8
  );
}
