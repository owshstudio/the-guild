"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Agent } from "@/lib/types";
import { useGateway } from "@/components/gateway-provider";
import {
  OFFICE,
  drawEnvironment,
  drawAmbientLighting,
  updateParticles,
  drawParticles,
  updateServerLEDs,
  drawServerLEDs,
  updateDustMotes,
  drawDustMotes,
  RoomId,
} from "./office-map";
import {
  AgentEntity,
  AgentState,
  createAgentEntities,
  updateAgent,
  drawAgent,
  isAgentHovered,
} from "./agent-entity";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
}

// Map agent status to pixel office character state
function statusToState(status: string, currentState: AgentState): AgentState {
  switch (status) {
    case "active":
      return "typing";
    case "stopped":
      return "idle"; // stopped agents just stand still
    case "idle":
    default:
      return "idle";
  }
}

export default function PixelOfficeCanvas({ onAgentClick }: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<AgentEntity[]>(createAgentEntities());
  const hoveredRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [, forceRender] = useState(0);

  const { agents: liveAgents } = useGateway();
  const currentRoom: RoomId = "main-office";

  // Sync live agent status → pixel office character state
  useEffect(() => {
    const entities = agentsRef.current;
    for (const liveAgent of liveAgents) {
      const entity = entities.find((e) => e.id === liveAgent.id);
      if (entity) {
        const newState = statusToState(liveAgent.status, entity.state);
        if (entity.state !== newState) {
          entity.state = newState;
          entity.frame = 0;
          entity.frameTimer = 0;
        }
        entity.status = liveAgent.status;
      }
    }
  }, [liveAgents]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, timestamp: number) => {
    const { width, height } = OFFICE;

    // Calculate delta time in seconds
    const deltaTime = lastTimeRef.current === 0
      ? 0.016
      : Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, width, height);

    // ── Pass 1: Floor + walls + furniture shadows ──
    drawEnvironment(ctx, currentRoom);

    // ── Pass 2: Particles (under agents) ──
    updateParticles(deltaTime);
    drawParticles(ctx);

    // Dust motes
    updateDustMotes(deltaTime);
    drawDustMotes(ctx);

    // ── Pass 3: Agents ──
    const agentEntities = agentsRef.current;
    agentEntities.forEach((agent) => {
      updateAgent(agent, deltaTime);
      drawAgent(ctx, agent, OFFICE.scale);
    });

    // ── Pass 4: Server LEDs (over furniture) ──
    updateServerLEDs(deltaTime);
    drawServerLEDs(ctx, currentRoom);

    // ── Pass 5: Ambient lighting overlay ──
    drawAmbientLighting(ctx, currentRoom);

    // ── Pass 6: Hover highlight (UI overlay) ──
    if (hoveredRef.current) {
      const agent = agentEntities.find((a) => a.id === hoveredRef.current);
      if (agent) {
        const w = 16 * OFFICE.scale;
        const h = 24 * OFFICE.scale;
        const xOff = (OFFICE.tileSize - 16 * OFFICE.scale) / 2;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(agent.x + xOff - 4, agent.y - 4, w + 8, h + 8);
        ctx.setLineDash([]);
      }
    }
  }, [currentRoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let animationId: number;
    const animate = (timestamp: number) => {
      draw(ctx, timestamp);
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
      for (const entity of agentsRef.current) {
        if (isAgentHovered(entity, coords.x, coords.y, OFFICE.scale)) {
          // Find matching live agent data for the panel
          const data = liveAgents.find((a) => a.id === entity.id) || null;
          onAgentClick(data);
          return;
        }
      }
      onAgentClick(null);
    },
    [onAgentClick, getCanvasCoords, liveAgents]
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
          background: "#c8b88a",
        }}
      />
    </div>
  );
}
