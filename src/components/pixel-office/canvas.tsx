"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { agents as agentData } from "@/lib/mock-data";
import { Agent } from "@/lib/types";
import {
  OFFICE,
  drawFloor,
  drawDoor,
  officeElements,
  agentPositions,
} from "./office-map";
import {
  deskSprite,
  coffeeSprite,
  plantSprite,
  renderSprite,
} from "./sprites";
import {
  AgentEntity,
  createAgentEntities,
  updateAgent,
  drawAgent,
  isAgentClicked,
} from "./agent-entity";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
}

export default function PixelOfficeCanvas({ onAgentClick }: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentEntity[]>(createAgentEntities());
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, scale } = OFFICE;
    ctx.clearRect(0, 0, width, height);

    // Draw floor
    drawFloor(ctx);

    // Draw door
    const doorEl = officeElements.find((e) => e.type === "door");
    if (doorEl) drawDoor(ctx, doorEl.position);

    // Draw plants
    officeElements
      .filter((e) => e.type === "plant")
      .forEach((el) => {
        renderSprite(ctx, plantSprite, "default", el.position.x, el.position.y, scale);
      });

    // Draw coffee machine
    const coffeeEl = officeElements.find((e) => e.type === "coffee");
    if (coffeeEl) {
      renderSprite(ctx, coffeeSprite, "default", coffeeEl.position.x, coffeeEl.position.y, scale);
      // Label
      ctx.font = "8px var(--font-geist-sans), system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#525252";
      ctx.fillText("COFFEE", coffeeEl.position.x + 12, coffeeEl.position.y - 4);
    }

    // Draw desks
    agentPositions.forEach((ap) => {
      renderSprite(ctx, deskSprite, "default", ap.deskPosition.x, ap.deskPosition.y, scale);
    });

    // Update and draw agents
    const agentEntities = agentsRef.current;
    timeRef.current += 1;
    agentEntities.forEach((agent) => {
      updateAgent(agent, timeRef.current);
      drawAgent(ctx, agent, scale);
    });

    // Draw hover highlight
    if (hoveredAgent) {
      const agent = agentEntities.find((a) => a.id === hoveredAgent);
      if (agent) {
        const spriteW = agent.sprite.width * scale;
        const spriteH = agent.sprite.height * scale;
        ctx.strokeStyle = "rgba(249, 66, 95, 0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          agent.x - 6,
          agent.y - 32,
          spriteW + 12,
          spriteH + 40
        );
        ctx.setLineDash([]);

        // "Click to view" hint
        ctx.font = "9px var(--font-geist-sans), system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(249, 66, 95, 0.6)";
        ctx.fillText(
          "click to view",
          agent.x + spriteW / 2,
          agent.y + spriteH + 16
        );
      }
    }

    // Ambient particles
    drawParticles(ctx, timeRef.current);
  }, [hoveredAgent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable image smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    let animationId: number;
    const animate = () => {
      draw(ctx);
      frameRef.current += 1;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = OFFICE.width / rect.width;
      const scaleY = OFFICE.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const agents = agentsRef.current;
      for (const agent of agents) {
        if (isAgentClicked(agent, clickX, clickY, OFFICE.scale)) {
          const data = agentData.find((a) => a.id === agent.id) || null;
          onAgentClick(data);
          return;
        }
      }
      onAgentClick(null);
    },
    [onAgentClick]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = OFFICE.width / rect.width;
      const scaleY = OFFICE.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const agents = agentsRef.current;
      let found = false;
      for (const agent of agents) {
        if (isAgentClicked(agent, mouseX, mouseY, OFFICE.scale)) {
          setHoveredAgent(agent.id);
          canvas.style.cursor = "pointer";
          found = true;
          break;
        }
      }
      if (!found) {
        setHoveredAgent(null);
        canvas.style.cursor = "default";
      }
    },
    []
  );

  return (
    <canvas
      ref={canvasRef}
      width={OFFICE.width}
      height={OFFICE.height}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="w-full rounded-xl border border-[#1f1f1f]"
      style={{ imageRendering: "pixelated", maxWidth: "800px" }}
    />
  );
}

// Floating ambient particles for atmosphere
function drawParticles(ctx: CanvasRenderingContext2D, time: number) {
  const particles = [
    { x: 200, y: 100, speed: 0.5 },
    { x: 450, y: 300, speed: 0.3 },
    { x: 650, y: 150, speed: 0.4 },
    { x: 350, y: 400, speed: 0.35 },
    { x: 120, y: 350, speed: 0.45 },
  ];

  particles.forEach((p, i) => {
    const float = Math.sin(time * p.speed * 0.02 + i * 1.5);
    const alpha = 0.1 + Math.abs(float) * 0.15;
    ctx.beginPath();
    ctx.arc(p.x + float * 3, p.y + float * 5, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
    ctx.fill();
  });
}
