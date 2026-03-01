"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Agent } from "@/lib/types";
import {
  OFFICE,
  drawTileFloor,
  drawFurnitureBack,
} from "./office-map";
import { getFurnitureCanvas } from "./furniture-sprites";
import {
  AgentEntity,
  createAgentEntities,
  updateAgent,
  drawAgent,
  isAgentHovered,
} from "./agent-entity";
import { RoomManager } from "./room-manager";
import { TileType } from "./tiles";
import {
  EditModeState,
  createEditModeState,
  getAvailableDesks,
} from "./edit-mode";
import {
  loadOfficeConfig,
  saveOfficeConfig,
} from "@/lib/gateway/office-config";
import CharacterCreator from "@/components/character-creator/character-creator";
import { loadSettings, GuildSettings } from "@/lib/settings";

interface PixelOfficeCanvasProps {
  onAgentClick: (agent: Agent | null) => void;
  agents?: Agent[];
}

// Edit mode button layout
const EDIT_BTN_W = 60;
const EDIT_BTN_H = 22;
const EDIT_BTN_X = 960 - 60 - 8;
const EDIT_BTN_Y = 8;

export default function PixelOfficeCanvas({
  onAgentClick,
  agents: agentsProp,
}: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomManagerRef = useRef(new RoomManager());
  const agentsRef = useRef<AgentEntity[]>(
    createAgentEntities(roomManagerRef.current.getCurrentTilemap(), agentsProp)
  );
  const hoveredRef = useRef<string | null>(null);
  const lastTimeRef = useRef(performance.now());
  const editModeRef = useRef<EditModeState>(createEditModeState());
  const pulseRef = useRef(0);
  const settingsRef = useRef<GuildSettings["appearance"]>(loadSettings().appearance);
  const [, forceRender] = useState(0);
  const [creatorAgentId, setCreatorAgentId] = useState<string | null>(null);

  // Load settings on mount and listen for storage changes
  useEffect(() => {
    settingsRef.current = loadSettings().appearance;
    const handleStorage = () => {
      settingsRef.current = loadSettings().appearance;
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Initialize agent rooms in room manager
  useEffect(() => {
    const rm = roomManagerRef.current;
    for (const agent of agentsRef.current) {
      rm.setAgentRoom(agent.id, agent.currentRoom);
    }
  }, []);

  // Sync live agents: add new agents, update existing status
  useEffect(() => {
    if (!agentsProp || agentsProp.length === 0) return;
    const current = agentsRef.current;
    const tilemap = roomManagerRef.current.getCurrentTilemap();

    for (const liveAgent of agentsProp.slice(0, 6)) {
      const existing = current.find((a) => a.id === liveAgent.id);
      if (existing) {
        // Update status
        existing.status = liveAgent.status;
        existing.name = liveAgent.name;
      } else if (current.length < 6) {
        // Add new agent entity
        const newEntities = createAgentEntities(tilemap, [liveAgent]);
        if (newEntities.length > 0) {
          const entity = newEntities[0];
          current.push(entity);
          roomManagerRef.current.setAgentRoom(entity.id, entity.currentRoom);
        }
      }
    }

    // Mark agents not in liveAgents as stopped
    for (const entity of current) {
      if (!agentsProp.find((a) => a.id === entity.id)) {
        entity.status = "stopped";
      }
    }
  }, [agentsProp]);

  const drawEditModeOverlays = useCallback(
    (ctx: CanvasRenderingContext2D, deltaTime: number) => {
      const edit = editModeRef.current;
      if (!edit.active) return;

      const rm = roomManagerRef.current;
      const roomDef = rm.getCurrentRoom();
      const ts = OFFICE.tileSize;

      // Update pulse
      pulseRef.current += deltaTime * 3;
      const pulse = 0.3 + Math.sin(pulseRef.current) * 0.2;

      // "EDIT MODE" banner
      ctx.save();
      ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + pulse * 0.4})`;
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("EDIT MODE", OFFICE.width / 2, OFFICE.height - 16);
      ctx.restore();

      // Highlight chair tiles with pulsing border
      const layout = roomDef.layout;
      for (let row = 0; row < layout.length; row++) {
        for (let col = 0; col < (layout[row]?.length ?? 0); col++) {
          if (layout[row][col] === TileType.Chair) {
            const x = col * ts;
            const y = row * ts;

            ctx.save();
            ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
            ctx.setLineDash([]);
            ctx.restore();
          }
        }
      }

      // During drag: highlight valid targets
      if (edit.draggedAgentId && edit.mousePixel) {
        for (const target of edit.validDropTargets) {
          const x = target.col * ts;
          const y = target.row * ts;
          ctx.save();
          ctx.fillStyle = `rgba(34, 197, 94, ${pulse * 0.6})`;
          ctx.fillRect(x, y, ts, ts);
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 + pulse})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, ts - 2, ts - 2);
          ctx.restore();
        }

        // Show red X if mouse is over an invalid tile
        const tileCol = Math.floor(edit.mousePixel.x / ts);
        const tileRow = Math.floor(edit.mousePixel.y / ts);
        const isValid = edit.validDropTargets.some(
          (t) => t.col === tileCol && t.row === tileRow
        );
        if (
          !isValid &&
          tileCol >= 0 && tileCol < 15 &&
          tileRow >= 0 && tileRow < 10
        ) {
          const cx = tileCol * ts + ts / 2;
          const cy = tileRow * ts + ts / 2;
          ctx.save();
          ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - 12, cy - 12);
          ctx.lineTo(cx + 12, cy + 12);
          ctx.moveTo(cx + 12, cy - 12);
          ctx.lineTo(cx - 12, cy + 12);
          ctx.stroke();
          ctx.restore();
        }
      }
    },
    []
  );

  const drawEditButton = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const edit = editModeRef.current;
      const isActive = edit.active;

      ctx.save();
      ctx.fillStyle = isActive
        ? "rgba(59, 130, 246, 0.9)"
        : "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(EDIT_BTN_X, EDIT_BTN_Y, EDIT_BTN_W, EDIT_BTN_H);
      ctx.strokeStyle = isActive
        ? "rgba(37, 99, 235, 1)"
        : "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(EDIT_BTN_X, EDIT_BTN_Y, EDIT_BTN_W, EDIT_BTN_H);

      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = isActive ? "#ffffff" : "#333333";
      ctx.fillText(
        isActive ? "Done" : "Edit",
        EDIT_BTN_X + EDIT_BTN_W / 2,
        EDIT_BTN_Y + EDIT_BTN_H / 2 + 3
      );

      // Pencil icon (simplified)
      if (!isActive) {
        const ix = EDIT_BTN_X + 10;
        const iy = EDIT_BTN_Y + EDIT_BTN_H / 2;
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ix - 4, iy + 3);
        ctx.lineTo(ix + 2, iy - 3);
        ctx.lineTo(ix + 4, iy - 1);
        ctx.lineTo(ix - 2, iy + 5);
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, deltaTime: number) => {
      const { width, height } = OFFICE;
      const rm = roomManagerRef.current;
      const allAgents = agentsRef.current;
      const appearance = settingsRef.current;
      const spriteScale = appearance.pixelScale;

      ctx.clearRect(0, 0, width, height);

      // Update all agents (current room uses pathfinding, off-screen rooms just decrement timers)
      const currentTilemap = rm.getCurrentTilemap();
      for (const agent of allAgents) {
        const agentRoom = rm.agentRooms[agent.id] || "main-office";
        if (agentRoom === rm.currentRoomId) {
          updateAgent(agent, deltaTime, currentTilemap);
        } else {
          // Off-screen: just tick behavior timer
          agent.behaviorTimer -= deltaTime;
          if (agent.behaviorTimer <= 0) {
            agent.behaviorTimer = 5 + Math.random() * 10;
          }
        }
      }

      // Draw current room
      const tilemap = rm.getCurrentTilemap();

      // Pass 1: floor, walls, rugs
      drawTileFloor(ctx, tilemap);

      // Pass 2: furniture behind agents
      drawFurnitureBack(ctx, tilemap);

      // Pass 3+4: agents and front-furniture Y-interleaved
      // Agents sitting at their desk occupy the chair visually, so we skip
      // drawing the furniture chair sprite for occupied seats to avoid
      // double-drawing. For unoccupied chairs and walking agents, Y-sort
      // determines correct layering.
      const visibleAgents = rm.getCurrentAgents(allAgents);
      const edit = editModeRef.current;

      // Build set of chair tiles occupied by sitting agents
      const occupiedChairs = new Set<string>();
      for (const agent of visibleAgents) {
        const isSeated =
          agent.behavior === "working" ||
          agent.behavior === "sitting-idle";
        if (isSeated && agent.state !== "walking") {
          occupiedChairs.add(`${agent.tileCol},${agent.tileRow}`);
        }
      }

      type Drawable =
        | { kind: "agent"; agent: AgentEntity; y: number }
        | { kind: "chair"; col: number; row: number; y: number };

      const drawables: Drawable[] = visibleAgents.map((agent) => ({
        kind: "agent" as const,
        agent,
        y: agent.y,
      }));

      // Add unoccupied chair tiles as drawables
      const ts = OFFICE.tileSize;
      for (let row = 0; row < tilemap.rows; row++) {
        for (let col = 0; col < tilemap.cols; col++) {
          if (tilemap.getTile(col, row) === TileType.Chair) {
            if (!occupiedChairs.has(`${col},${row}`)) {
              drawables.push({
                kind: "chair",
                col,
                row,
                y: row * ts,
              });
            }
          }
        }
      }

      drawables.sort((a, b) => a.y - b.y);
      drawables.forEach((d) => {
        if (d.kind === "agent") {
          if (edit.active && edit.draggedAgentId === d.agent.id && edit.mousePixel) {
            return;
          }
          drawAgent(ctx, d.agent, spriteScale);
        } else {
          const chairCanvas = getFurnitureCanvas("chair");
          ctx.drawImage(chairCanvas, d.col * ts, d.row * ts, ts, ts);
        }
      });

      // Pass 5: overlays (hover highlight) — gated by ambientLighting setting
      if (hoveredRef.current && !edit.active && appearance.ambientLighting) {
        const agent = visibleAgents.find(
          (a) => a.id === hoveredRef.current
        );
        if (agent) {
          const w = 16 * spriteScale;
          const h = 24 * spriteScale;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(agent.x - 4, agent.y - 4, w + 8, h + 8);
          ctx.setLineDash([]);
        }
      }

      // Pass 6: edit mode overlays
      drawEditModeOverlays(ctx, deltaTime);

      // Draw dragged agent at mouse position
      if (edit.active && edit.draggedAgentId && edit.mousePixel) {
        const draggedAgent = visibleAgents.find(
          (a) => a.id === edit.draggedAgentId
        );
        if (draggedAgent) {
          const sw = 16 * spriteScale;
          const sh = 24 * spriteScale;
          ctx.save();
          ctx.globalAlpha = 0.7;
          // Temporarily set agent position for drawing
          const origX = draggedAgent.x;
          const origY = draggedAgent.y;
          draggedAgent.x = edit.mousePixel.x - sw / 2;
          draggedAgent.y = edit.mousePixel.y - sh / 2;
          drawAgent(ctx, draggedAgent, spriteScale);
          draggedAgent.x = origX;
          draggedAgent.y = origY;
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      // Pass 7: edit button
      drawEditButton(ctx);
    },
    [drawEditModeOverlays, drawEditButton]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    lastTimeRef.current = performance.now();

    let animationId: number;
    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      draw(ctx, deltaTime);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (OFFICE.width / rect.width),
        y: (e.clientY - rect.top) * (OFFICE.height / rect.height),
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const edit = editModeRef.current;
      if (!edit.active) return;

      const coords = getCanvasCoords(e);
      if (!coords) return;

      const rm = roomManagerRef.current;
      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      const roomDef = rm.getCurrentRoom();

      // Check if clicking on an agent during edit mode
      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          // Start drag
          const available = getAvailableDesks(
            roomDef,
            roomDef.deskAssignments.filter(
              (d) => d.agentId !== agent.id
            )
          );
          edit.draggedAgentId = agent.id;
          edit.dragStartTile = {
            col: agent.tileCol,
            row: agent.tileRow,
          };
          edit.mousePixel = { x: coords.x, y: coords.y };
          edit.validDropTargets = available;
          forceRender((n) => n + 1);
          return;
        }
      }
    },
    [getCanvasCoords]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const edit = editModeRef.current;
      if (!edit.active || !edit.draggedAgentId) return;

      const coords = getCanvasCoords(e);
      if (!coords) {
        // Cancel drag
        edit.draggedAgentId = undefined;
        edit.dragStartTile = undefined;
        edit.mousePixel = undefined;
        edit.validDropTargets = [];
        forceRender((n) => n + 1);
        return;
      }

      const ts = OFFICE.tileSize;
      const tileCol = Math.floor(coords.x / ts);
      const tileRow = Math.floor(coords.y / ts);

      const isValid = edit.validDropTargets.some(
        (t) => t.col === tileCol && t.row === tileRow
      );

      if (isValid) {
        const rm = roomManagerRef.current;
        const roomDef = rm.getCurrentRoom();
        const tilemap = rm.getCurrentTilemap();
        const agent = agentsRef.current.find(
          (a) => a.id === edit.draggedAgentId
        );

        if (agent) {
          // Find the desk that owns this chair
          const layout = roomDef.layout;
          let deskCol = tileCol;
          const deskRow = tileRow - 1;

          // Check if there's a desk above this chair
          if (
            deskRow >= 0 &&
            (layout[deskRow][tileCol] === TileType.DeskLeft ||
              layout[deskRow][tileCol] === TileType.DeskRight)
          ) {
            // Use the left side of the desk pair
            if (layout[deskRow][tileCol] === TileType.DeskRight && tileCol > 0) {
              deskCol = tileCol - 1;
            }
          }

          // Update agent position
          tilemap.setOccupied(agent.tileCol, agent.tileRow, false);
          agent.tileCol = tileCol;
          agent.tileRow = tileRow;
          const px = tilemap.tileToPixel(tileCol, tileRow);
          agent.x = px.x;
          agent.y = px.y;
          agent.path = [];
          agent.pathIndex = 0;
          agent.state = "typing";
          agent.behavior = "working";
          tilemap.setOccupied(tileCol, tileRow, true);

          // Save to office config
          const config = loadOfficeConfig();
          config.deskAssignments[agent.id] = {
            deskCol,
            deskRow,
            chairCol: tileCol,
            chairRow: tileRow,
          };
          saveOfficeConfig(config);
        }
      }

      // Reset drag state
      edit.draggedAgentId = undefined;
      edit.dragStartTile = undefined;
      edit.mousePixel = undefined;
      edit.validDropTargets = [];
      forceRender((n) => n + 1);
    },
    [getCanvasCoords]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoords(e);
      if (!coords) return;
      const rm = roomManagerRef.current;
      const edit = editModeRef.current;

      // Check edit button click
      if (
        coords.x >= EDIT_BTN_X &&
        coords.x <= EDIT_BTN_X + EDIT_BTN_W &&
        coords.y >= EDIT_BTN_Y &&
        coords.y <= EDIT_BTN_Y + EDIT_BTN_H
      ) {
        edit.active = !edit.active;
        if (!edit.active) {
          edit.draggedAgentId = undefined;
          edit.dragStartTile = undefined;
          edit.mousePixel = undefined;
          edit.validDropTargets = [];
        }
        forceRender((n) => n + 1);
        return;
      }

      // If in edit mode and dragging, don't process clicks
      if (edit.active && edit.draggedAgentId) return;

      // If in edit mode, don't process normal clicks (agent clicks handled by mouseDown/mouseUp)
      if (edit.active) {
        // Check if clicking on an agent to open customizer
        const visibleAgents = rm.getCurrentAgents(agentsRef.current);
        for (const agent of visibleAgents) {
          if (
            isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
          ) {
            setCreatorAgentId(agent.id);
            forceRender((n) => n + 1);
            return;
          }
        }
        return;
      }

      // Check agent clicks — show "Customize" via normal agent click handler
      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          const data = agentsProp?.find((a) => a.id === agent.id) || null;
          onAgentClick(data);
          return;
        }
      }
      onAgentClick(null);
    },
    [onAgentClick, getCanvasCoords, agentsProp]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const coords = getCanvasCoords(e);
      if (!coords) return;

      const rm = roomManagerRef.current;
      const edit = editModeRef.current;

      // Update drag position
      if (edit.active && edit.draggedAgentId) {
        edit.mousePixel = { x: coords.x, y: coords.y };
        canvas.style.cursor = "grabbing";
        return;
      }

      // Check if over edit button
      if (
        coords.x >= EDIT_BTN_X &&
        coords.x <= EDIT_BTN_X + EDIT_BTN_W &&
        coords.y >= EDIT_BTN_Y &&
        coords.y <= EDIT_BTN_Y + EDIT_BTN_H
      ) {
        canvas.style.cursor = "pointer";
        if (hoveredRef.current !== null) {
          hoveredRef.current = null;
          forceRender((n) => n + 1);
        }
        return;
      }

      // Check agent hover
      const visibleAgents = rm.getCurrentAgents(agentsRef.current);
      let found = false;
      for (const agent of visibleAgents) {
        if (
          isAgentHovered(agent, coords.x, coords.y, settingsRef.current.pixelScale)
        ) {
          if (hoveredRef.current !== agent.id) {
            hoveredRef.current = agent.id;
            forceRender((n) => n + 1);
          }
          canvas.style.cursor = edit.active ? "grab" : "pointer";
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
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          hoveredRef.current = null;
          const edit = editModeRef.current;
          if (edit.draggedAgentId) {
            edit.draggedAgentId = undefined;
            edit.dragStartTile = undefined;
            edit.mousePixel = undefined;
            edit.validDropTargets = [];
          }
          forceRender((n) => n + 1);
        }}
        className="w-full h-full object-cover"
        style={{
          imageRendering: "pixelated",
          background: "#d4c9a8",
        }}
      />
      {creatorAgentId && (
        <CharacterCreator
          agentId={creatorAgentId}
          isOpen={!!creatorAgentId}
          onClose={() => setCreatorAgentId(null)}
        />
      )}
    </div>
  );
}
