import { AgentStatus } from "@/lib/types";
import { nyxSprite, hemeraSprite, renderSprite, SpriteData } from "./sprites";
import { agentPositions, getStatusColor } from "./office-map";

export interface AgentEntity {
  id: string;
  name: string;
  emoji: string;
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
      emoji: "🜃",
      status: "active",
      sprite: nyxSprite,
      x: agentPositions[0].seatPosition.x,
      y: agentPositions[0].seatPosition.y,
      baseY: agentPositions[0].seatPosition.y,
      bobOffset: 0,
      bobSpeed: 0.025,
      frame: "idle",
      typingTimer: 0,
    },
    {
      id: "hemera",
      name: "HEMERA",
      emoji: "☀️",
      status: "idle",
      sprite: hemeraSprite,
      x: agentPositions[1].seatPosition.x,
      y: agentPositions[1].seatPosition.y,
      baseY: agentPositions[1].seatPosition.y,
      bobOffset: Math.PI,
      bobSpeed: 0.03,
      frame: "idle",
      typingTimer: 0,
    },
  ];
}

export function updateAgent(agent: AgentEntity, time: number): void {
  // Smooth idle bob (sine wave, 1-2px)
  const bobAmount = agent.status === "active" ? 1 : 1.5;
  agent.y = agent.baseY + Math.sin(time * agent.bobSpeed + agent.bobOffset) * bobAmount;

  // Typing animation
  if (agent.status === "active") {
    agent.typingTimer += 1;
    agent.frame = agent.typingTimer % 30 < 18 ? "typing" : "idle";
  } else {
    agent.frame = "idle";
  }
}

export function drawAgent(
  ctx: CanvasRenderingContext2D,
  agent: AgentEntity,
  scale: number = 2
): void {
  // Shadow under agent
  const spriteW = agent.sprite.width * scale;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    agent.x + spriteW / 2,
    agent.y + agent.sprite.height * scale - 2,
    spriteW / 3,
    4,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Draw sprite
  renderSprite(ctx, agent.sprite, agent.frame, agent.x, agent.y, scale);

  // Name label with background
  const nameX = agent.x + spriteW / 2;
  const nameY = agent.y - 14;

  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  const textWidth = ctx.measureText(agent.name).width;

  // Label background
  ctx.fillStyle = "rgba(10, 10, 10, 0.7)";
  ctx.fillRect(nameX - textWidth / 2 - 4, nameY - 7, textWidth + 8, 10);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText(agent.name, nameX, nameY);

  // Status dot with glow
  const dotX = nameX;
  const dotY = nameY - 10;
  const statusColor = getStatusColor(agent.status);

  // Outer glow
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
  ctx.fillStyle = statusColor + "30";
  ctx.fill();
  // Inner dot
  ctx.beginPath();
  ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  ctx.textAlign = "left";
}

export function drawAgentTooltip(
  ctx: CanvasRenderingContext2D,
  agent: AgentEntity,
  scale: number = 2
): void {
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;

  // Highlight border
  ctx.strokeStyle = "rgba(249, 66, 95, 0.4)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(agent.x - 4, agent.y - 20, spriteW + 8, spriteH + 28);
  ctx.setLineDash([]);

  // Tooltip below
  const tipX = agent.x + spriteW / 2;
  const tipY = agent.y + spriteH + 10;
  const statusText = agent.status === "active" ? "Working..." : agent.status === "idle" ? "Standing by" : "Offline";

  ctx.font = "6px monospace";
  ctx.textAlign = "center";
  const tw = ctx.measureText(statusText).width;
  ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
  ctx.fillRect(tipX - tw / 2 - 4, tipY - 6, tw + 8, 10);
  ctx.fillStyle = "rgba(249, 66, 95, 0.8)";
  ctx.fillText(statusText, tipX, tipY + 2);
  ctx.textAlign = "left";
}

export function isAgentHovered(
  agent: AgentEntity,
  mouseX: number,
  mouseY: number,
  scale: number = 2
): boolean {
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;
  return (
    mouseX >= agent.x - 6 &&
    mouseX <= agent.x + spriteW + 6 &&
    mouseY >= agent.y - 20 &&
    mouseY <= agent.y + spriteH + 6
  );
}
