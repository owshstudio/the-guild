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
  baseX: number;
  baseY: number;
  bobOffset: number;
  bobSpeed: number;
  frame: string;
  typingTimer: number;
  blinkTimer: number;
  isBlinking: boolean;
  breathePhase: number;
  headTilt: number;
  lookTimer: number;
  isLookingAway: boolean;
}

export function createAgentEntities(): AgentEntity[] {
  return [
    {
      id: "nyx",
      name: "NYX 🜃",
      emoji: "🜃",
      status: "active",
      sprite: nyxSprite,
      x: agentPositions[0].seatPosition.x,
      y: agentPositions[0].seatPosition.y,
      baseX: agentPositions[0].seatPosition.x,
      baseY: agentPositions[0].seatPosition.y,
      bobOffset: 0,
      bobSpeed: 0.025,
      frame: "idle",
      typingTimer: 0,
      blinkTimer: 0,
      isBlinking: false,
      breathePhase: 0,
      headTilt: 0,
      lookTimer: 0,
      isLookingAway: false,
    },
    {
      id: "hemera",
      name: "HEMERA ☀️",
      emoji: "☀️",
      status: "idle",
      sprite: hemeraSprite,
      x: agentPositions[1].seatPosition.x,
      y: agentPositions[1].seatPosition.y,
      baseX: agentPositions[1].seatPosition.x,
      baseY: agentPositions[1].seatPosition.y,
      bobOffset: Math.PI,
      bobSpeed: 0.03,
      frame: "idle",
      typingTimer: 0,
      blinkTimer: 0,
      isBlinking: false,
      breathePhase: Math.PI * 0.7,
      headTilt: 0,
      lookTimer: 200,
      isLookingAway: false,
    },
  ];
}

export function updateAgent(agent: AgentEntity, time: number): void {
  // Breathing — gentle Y oscillation
  agent.breathePhase += 0.02;
  const breathe = Math.sin(agent.breathePhase) * 0.8;
  
  // Idle sway — slight X movement
  const sway = Math.sin(time * 0.012 + agent.bobOffset) * 1.2;

  // Blinking — random intervals
  agent.blinkTimer++;
  if (!agent.isBlinking && agent.blinkTimer > 150 + Math.random() * 200) {
    agent.isBlinking = true;
    agent.blinkTimer = 0;
  }
  if (agent.isBlinking && agent.blinkTimer > 8) {
    agent.isBlinking = false;
    agent.blinkTimer = 0;
  }

  // Looking around (idle agents look away sometimes)
  agent.lookTimer++;
  if (agent.status === "idle" && !agent.isLookingAway && agent.lookTimer > 200 + Math.random() * 300) {
    agent.isLookingAway = true;
    agent.headTilt = (Math.random() > 0.5 ? 1 : -1) * 2;
    agent.lookTimer = 0;
  }
  if (agent.isLookingAway && agent.lookTimer > 80 + Math.random() * 60) {
    agent.isLookingAway = false;
    agent.headTilt = 0;
    agent.lookTimer = 0;
  }

  // Position
  agent.x = agent.baseX + sway + (agent.isLookingAway ? agent.headTilt : 0);
  agent.y = agent.baseY + breathe;

  // Typing animation — active agents type in bursts
  if (agent.status === "active") {
    agent.typingTimer += 1;
    // Type in bursts: type for a while, pause to think, type again
    const cycle = agent.typingTimer % 120;
    if (cycle < 70) {
      // Typing burst — alternate faster
      agent.frame = (agent.typingTimer % 12) < 7 ? "typing" : "idle";
    } else if (cycle < 90) {
      // Thinking pause
      agent.frame = "idle";
    } else {
      // Quick typing burst
      agent.frame = (agent.typingTimer % 8) < 4 ? "typing" : "idle";
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
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;

  // Shadow under agent (larger, softer)
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    agent.x + spriteW / 2,
    agent.y + spriteH - 4,
    spriteW / 2.5,
    5,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Draw sprite
  renderSprite(ctx, agent.sprite, agent.frame, agent.x, agent.y, scale);

  // Blink overlay — draw skin-colored bars over eyes
  if (agent.isBlinking) {
    const eyeColor = agent.id === "nyx" ? "#e0d0ff" : "#fef3c7";
    ctx.fillStyle = eyeColor;
    // Eye positions relative to procedural drawing
    ctx.fillRect(agent.x + 11 * scale, agent.y + 7 * scale, 3 * scale, 2 * scale);
    ctx.fillRect(agent.x + 16 * scale, agent.y + 7 * scale, 3 * scale, 2 * scale);
  }

  // Typing sparkle particles
  if (agent.status === "active" && agent.frame === "typing") {
    const sparkle = Math.sin(agent.typingTimer * 0.3) > 0.5;
    if (sparkle) {
      const sparkColor = agent.id === "nyx" ? "rgba(124, 58, 237, 0.5)" : "rgba(251, 191, 36, 0.5)";
      ctx.fillStyle = sparkColor;
      const sx = agent.x + spriteW / 2 - 10 + Math.random() * 20;
      const sy = agent.y + spriteH * 0.62 + Math.random() * 4;
      ctx.fillRect(sx, sy, 2, 2);
    }
  }

  // Name label with background pill
  const nameX = agent.x + spriteW / 2;
  const nameY = agent.y - 20;

  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  const textWidth = ctx.measureText(agent.name).width;

  // Pill background
  const pillW = textWidth + 12;
  const pillH = 14;
  const pillX = nameX - pillW / 2;
  const pillY = nameY - 10;
  ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
  roundRect(ctx, pillX, pillY, pillW, pillH, 4);
  ctx.fill();
  // Pill border
  const borderColor = agent.id === "nyx" ? "rgba(124, 58, 237, 0.3)" : "rgba(251, 191, 36, 0.3)";
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  roundRect(ctx, pillX, pillY, pillW, pillH, 4);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText(agent.name, nameX, nameY);

  // Status dot with animated pulse
  const dotX = nameX;
  const dotY = pillY - 6;
  const statusColor = getStatusColor(agent.status);
  const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.3;

  // Pulse ring
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = statusColor + "20";
  ctx.fill();
  // Outer glow
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
  ctx.fillStyle = statusColor + "60";
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
  scale: number = 3
): void {
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;

  // Glowing highlight box
  const hlColor = agent.id === "nyx" ? "124, 58, 237" : "251, 191, 36";
  ctx.strokeStyle = `rgba(${hlColor}, 0.4)`;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  roundRect(ctx, agent.x - 6, agent.y - 30, spriteW + 12, spriteH + 40, 6);
  ctx.stroke();
  ctx.setLineDash([]);

  // Soft glow fill
  ctx.fillStyle = `rgba(${hlColor}, 0.04)`;
  roundRect(ctx, agent.x - 6, agent.y - 30, spriteW + 12, spriteH + 40, 6);
  ctx.fill();

  // Info tooltip below
  const tipX = agent.x + spriteW / 2;
  const tipY = agent.y + spriteH + 14;
  const statusText = agent.status === "active" ? "⚡ Working..." : agent.status === "idle" ? "💤 Standing by" : "🔴 Offline";
  const taskText = agent.id === "nyx" ? "Building The Guild" : "Awaiting deployment";

  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  const tw = Math.max(ctx.measureText(statusText).width, ctx.measureText(taskText).width);
  
  // Tooltip background
  const tooltipW = tw + 16;
  const tooltipH = 28;
  ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
  roundRect(ctx, tipX - tooltipW / 2, tipY - 4, tooltipW, tooltipH, 4);
  ctx.fill();
  ctx.strokeStyle = `rgba(${hlColor}, 0.3)`;
  ctx.lineWidth = 1;
  roundRect(ctx, tipX - tooltipW / 2, tooltipW, tooltipW, tooltipH, 4);
  ctx.stroke();

  ctx.fillStyle = `rgba(${hlColor.split(",").map(Number).map(n => Math.min(255, n + 80)).join(",")}, 0.9)`;
  ctx.fillText(statusText, tipX, tipY + 6);
  ctx.font = "6px monospace";
  ctx.fillStyle = "rgba(150, 150, 150, 0.7)";
  ctx.fillText(taskText, tipX, tipY + 17);
  ctx.textAlign = "left";
}

export function isAgentHovered(
  agent: AgentEntity,
  mouseX: number,
  mouseY: number,
  scale: number = 3
): boolean {
  const spriteW = agent.sprite.width * scale;
  const spriteH = agent.sprite.height * scale;
  return (
    mouseX >= agent.x - 10 &&
    mouseX <= agent.x + spriteW + 10 &&
    mouseY >= agent.y - 30 &&
    mouseY <= agent.y + spriteH + 10
  );
}

// Helper for rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
