"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { agents as agentData } from "@/lib/mock-data";
import { Agent } from "@/lib/types";
import { OFFICE, drawEnvironment } from "./office-map";
import {
  AgentEntity,
  createAgentEntities,
  updateAgent,
  drawAgent,
  isAgentHovered,
} from "./agent-entity";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
}

export default function PixelOfficeCanvas({ onAgentClick }: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentEntity[]>(createAgentEntities());
  const hoveredRef = useRef<string | null>(null);
  const [, forceRender] = useState(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = OFFICE;
    ctx.clearRect(0, 0, width, height);

    // Floor + walls
    drawEnvironment(ctx);

    // Agents
    const agentEntities = agentsRef.current;
    agentEntities.forEach((agent) => {
      updateAgent(agent);
      drawAgent(ctx, agent, OFFICE.scale);
    });

    // Hover highlight
    if (hoveredRef.current) {
      const agent = agentEntities.find((a) => a.id === hoveredRef.current);
      if (agent) {
        const w = 18 * OFFICE.scale;
        const h = 30 * OFFICE.scale;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(agent.x - 4, agent.y - 4, w + 8, h + 8);
        ctx.setLineDash([]);
      }
    }
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
    return {
      x: (e.clientX - rect.left) * (OFFICE.width / rect.width),
      y: (e.clientY - rect.top) * (OFFICE.height / rect.height),
    };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      for (const agent of agentsRef.current) {
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
      let found = false;
      for (const agent of agentsRef.current) {
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

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)]">
      <canvas
        ref={canvasRef}
        width={OFFICE.width}
        height={OFFICE.height}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          hoveredRef.current = null;
          forceRender((n) => n + 1);
        }}
        className="w-full h-full object-cover"
        style={{
          imageRendering: "pixelated",
          background: "#d4c9a8",
        }}
      />
    </div>
  );
}
