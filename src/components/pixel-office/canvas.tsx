"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { agents as agentData } from "@/lib/mock-data";
import { Agent } from "@/lib/types";
import {
  OFFICE,
  drawEnvironment,
  drawDesks,
  drawAmbientEffects,
  drawLoki,
} from "./office-map";
import {
  AgentEntity,
  createAgentEntities,
  updateAgent,
  drawAgent,
  drawAgentTooltip,
  isAgentHovered,
} from "./agent-entity";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
}

export default function PixelOfficeCanvas({ onAgentClick }: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentEntity[]>(createAgentEntities());
  const timeRef = useRef<number>(0);
  const hoveredRef = useRef<string | null>(null);
  const [, forceRender] = useState(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = OFFICE;
    ctx.clearRect(0, 0, width, height);

    const time = timeRef.current;

    // Layer 1: Environment (walls, floor, furniture)
    drawEnvironment(ctx, time);

    // Layer 2: Agent desks (with monitors)
    drawDesks(ctx, time);

    // Layer 3: LOKI the cat 🐱
    drawLoki(ctx, time);

    // Layer 4: Agents
    const agentEntities = agentsRef.current;
    agentEntities.forEach((agent) => {
      updateAgent(agent, time);
      drawAgent(ctx, agent, OFFICE.scale);
    });

    // Layer 5: Hover tooltip (on top of agents)
    if (hoveredRef.current) {
      const agent = agentEntities.find((a) => a.id === hoveredRef.current);
      if (agent) {
        drawAgentTooltip(ctx, agent, OFFICE.scale);
      }
    }

    // Layer 6: Ambient effects (particles, glow)
    drawAmbientEffects(ctx, time);

    timeRef.current += 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationId: number;
    const animate = () => {
      draw(ctx);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = OFFICE.width / rect.width;
    const scaleY = OFFICE.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(e);
      if (!coords) return;

      const agents = agentsRef.current;
      for (const agent of agents) {
        if (isAgentHovered(agent, coords.x, coords.y, OFFICE.scale)) {
          const data = agentData.find((a) => a.id === agent.id) || null;
          onAgentClick(data);
          return;
        }
      }
      onAgentClick(null);
    },
    [onAgentClick, getCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const coords = getCanvasCoords(e);
      if (!coords) return;

      const agents = agentsRef.current;
      let found = false;
      for (const agent of agents) {
        if (isAgentHovered(agent, coords.x, coords.y, OFFICE.scale)) {
          if (hoveredRef.current !== agent.id) {
            hoveredRef.current = agent.id;
            forceRender((n) => n + 1);
          }
          canvas.style.cursor = "pointer";
          found = true;
          break;
        }
      }
      if (!found && hoveredRef.current !== null) {
        hoveredRef.current = null;
        canvas.style.cursor = "default";
        forceRender((n) => n + 1);
      }
    },
    [getCanvasCoords]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoveredRef.current !== null) {
      hoveredRef.current = null;
      forceRender((n) => n + 1);
    }
  }, []);

  return (
    <div className="relative w-full flex justify-center">
      <canvas
        ref={canvasRef}
        width={OFFICE.width}
        height={OFFICE.height}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="rounded-xl border border-[#1f1f1f] w-full"
        style={{
          imageRendering: "pixelated",
          maxWidth: "1440px",
          background: "#08080c",
        }}
      />
    </div>
  );
}
