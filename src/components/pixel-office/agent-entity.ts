import { Agent, AgentStatus, RoomId } from "@/lib/types";
import { getCharacterSprites, renderSprite, SpriteData, PALETTES } from "./sprites";
import { getStatusColor } from "./office-map";
import { TileMap } from "./tilemap";
import { PathNode, findPath } from "./pathfinding";
import {
  deskAssignments,
  COFFEE_MACHINE,
  WANDER_BOUNDS,
} from "./office-layouts";
export type BehaviorState =
  | "working"
  | "getting-coffee"
  | "wandering"
  | "sitting-idle"
  | "standing-idle";

export interface AgentEntity {
  id: string;
  name: string;
  paletteId: string;
  status: AgentStatus;
  // Pixel position (for smooth rendering)
  x: number;
  y: number;
  // Tile position
  tileCol: number;
  tileRow: number;
  // Movement
  path: PathNode[];
  pathIndex: number;
  moveProgress: number; // 0-1 interpolation between tiles
  moveSpeed: number; // tiles per second
  // Animation
  frame: number;
  frameTimer: number;
  state: "idle" | "typing" | "walking";
  facing: "down" | "up" | "left" | "right";
  // Behavior
  behavior: BehaviorState;
  behaviorTimer: number; // seconds until next behavior change
  // Room
  currentRoom: RoomId;
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Extra desk positions for dynamic agents beyond the configured two
const EXTRA_POSITIONS: { col: number; row: number }[] = [
  { col: 8, row: 4 },  // 3rd desk chair
  { col: 3, row: 5 },  // open floor
  { col: 6, row: 5 },  // open floor
  { col: 10, row: 5 }, // open floor
  { col: 12, row: 5 }, // open floor
  { col: 4, row: 7 },  // open floor
  { col: 7, row: 7 },  // open floor
  { col: 11, row: 7 }, // open floor
];

const MAX_OFFICE_AGENTS = 10;

export function createAgentEntities(
  tilemap: TileMap,
  liveAgents?: Agent[]
): AgentEntity[] {
  // If no live agents provided, use desk assignments (legacy)
  if (!liveAgents || liveAgents.length === 0) {
    return deskAssignments.map((desk) => {
      const pixel = tilemap.tileToPixel(desk.chairCol, desk.chairRow);
      return {
        id: desk.agentId,
        name: desk.agentId.toUpperCase(),
        paletteId: desk.agentId,
        status: "idle" as AgentStatus,
        x: pixel.x,
        y: pixel.y,
        tileCol: desk.chairCol,
        tileRow: desk.chairRow,
        path: [],
        pathIndex: 0,
        moveProgress: 0,
        moveSpeed: 3,
        frame: 0,
        frameTimer: 0,
        state: "idle" as const,
        facing: "down" as const,
        behavior: "sitting-idle" as BehaviorState,
        behaviorTimer: randomRange(5, 12),
        currentRoom: "main-office" as RoomId,
      };
    });
  }

  // Dynamic: map live agents to positions (capped at MAX_OFFICE_AGENTS)
  const capped = liveAgents.slice(0, MAX_OFFICE_AGENTS);
  return capped.map((agent, i) => {
    const desk = deskAssignments.find((d) => d.agentId === agent.id);
    const pos = desk
      ? { col: desk.chairCol, row: desk.chairRow }
      : EXTRA_POSITIONS[i - deskAssignments.length] || EXTRA_POSITIONS[0];
    const pixel = tilemap.tileToPixel(pos.col, pos.row);

    // Use known palette ID if available, otherwise agent color for generated palette
    const paletteId = PALETTES[agent.id] ? agent.id : agent.color;

    return {
      id: agent.id,
      name: agent.name,
      paletteId,
      status: agent.status,
      x: pixel.x,
      y: pixel.y,
      tileCol: pos.col,
      tileRow: pos.row,
      path: [],
      pathIndex: 0,
      moveProgress: 0,
      moveSpeed: 3,
      frame: 0,
      frameTimer: 0,
      state: agent.status === "active" ? "typing" : "idle",
      facing: "down" as const,
      behavior: agent.status === "active" ? "working" : "sitting-idle",
      behaviorTimer: randomRange(5, 12),
      currentRoom: "main-office" as RoomId,
    };
  });
}

function getDesk(agentId: string) {
  return deskAssignments.find((d) => d.agentId === agentId);
}

/**
 * Attempt to move an agent to a target tile. Only releases the current tile
 * if a valid path is found; re-marks it occupied otherwise.
 * Returns true if a path was set.
 */
function tryMoveTo(
  agent: AgentEntity,
  tilemap: TileMap,
  targetCol: number,
  targetRow: number,
  adjacentMode = false
): boolean {
  tilemap.setOccupied(agent.tileCol, agent.tileRow, false);
  const path = findPath(
    tilemap,
    { col: agent.tileCol, row: agent.tileRow },
    { col: targetCol, row: targetRow },
    adjacentMode
  );
  if (path.length > 1) {
    agent.path = path;
    agent.pathIndex = 1;
    agent.moveProgress = 0;
    return true;
  }
  // No valid path — re-occupy the current tile
  tilemap.setOccupied(agent.tileCol, agent.tileRow, true);
  return false;
}

function facingFromDirection(
  fromCol: number,
  fromRow: number,
  toCol: number,
  toRow: number
): "down" | "up" | "left" | "right" {
  const dc = toCol - fromCol;
  const dr = toRow - fromRow;
  // Prefer vertical when equal
  if (Math.abs(dr) >= Math.abs(dc)) {
    return dr >= 0 ? "down" : "up";
  }
  return dc >= 0 ? "right" : "left";
}

export function pickBehavior(agent: AgentEntity, tilemap: TileMap): void {
  const desk = getDesk(agent.id);
  const roll = Math.random();

  if (agent.status === "stopped") {
    // Always go back to desk and work
    if (desk && (agent.tileCol !== desk.chairCol || agent.tileRow !== desk.chairRow)) {
      tryMoveTo(agent, tilemap, desk.chairCol, desk.chairRow);
    }
    agent.behavior = "working";
    agent.state = "typing";
    agent.behaviorTimer = randomRange(8, 15);
    return;
  }

  if (agent.status === "active") {
    if (roll < 0.7) {
      // Working — go to chair
      agent.behavior = "working";
      if (desk && (agent.tileCol !== desk.chairCol || agent.tileRow !== desk.chairRow)) {
        if (!tryMoveTo(agent, tilemap, desk.chairCol, desk.chairRow)) {
          agent.state = "typing";
        }
      } else {
        agent.state = "typing";
      }
      agent.behaviorTimer = randomRange(8, 15);
    } else if (roll < 0.9) {
      // Getting coffee
      agent.behavior = "getting-coffee";
      tryMoveTo(agent, tilemap, COFFEE_MACHINE.col, COFFEE_MACHINE.row, true);
      agent.behaviorTimer = randomRange(3, 5);
    } else {
      // Wandering
      agent.behavior = "wandering";
      const targetCol =
        WANDER_BOUNDS.minCol +
        Math.floor(Math.random() * (WANDER_BOUNDS.maxCol - WANDER_BOUNDS.minCol + 1));
      const targetRow =
        WANDER_BOUNDS.minRow +
        Math.floor(Math.random() * (WANDER_BOUNDS.maxRow - WANDER_BOUNDS.minRow + 1));

      if (tilemap.isWalkable(targetCol, targetRow)) {
        tryMoveTo(agent, tilemap, targetCol, targetRow);
      }
      agent.behaviorTimer = randomRange(2, 4);
    }
  } else {
    // Idle status
    if (roll < 0.3) {
      // Sitting idle at desk
      agent.behavior = "sitting-idle";
      if (desk && (agent.tileCol !== desk.chairCol || agent.tileRow !== desk.chairRow)) {
        tryMoveTo(agent, tilemap, desk.chairCol, desk.chairRow);
      }
      agent.state = "idle";
      agent.behaviorTimer = randomRange(5, 10);
    } else if (roll < 0.7) {
      // Wandering
      agent.behavior = "wandering";
      const targetCol =
        WANDER_BOUNDS.minCol +
        Math.floor(Math.random() * (WANDER_BOUNDS.maxCol - WANDER_BOUNDS.minCol + 1));
      const targetRow =
        WANDER_BOUNDS.minRow +
        Math.floor(Math.random() * (WANDER_BOUNDS.maxRow - WANDER_BOUNDS.minRow + 1));

      if (tilemap.isWalkable(targetCol, targetRow)) {
        tryMoveTo(agent, tilemap, targetCol, targetRow);
      }
      agent.behaviorTimer = randomRange(2, 4);
    } else {
      // Standing idle
      agent.behavior = "standing-idle";
      agent.state = "idle";
      agent.behaviorTimer = randomRange(5, 10);
    }
  }
}

export function updateAgent(
  agent: AgentEntity,
  deltaTime: number,
  tilemap: TileMap
): void {
  // Walking along path
  if (agent.path.length > 0 && agent.pathIndex < agent.path.length) {
    agent.state = "walking";
    const target = agent.path[agent.pathIndex];
    const targetPixel = tilemap.tileToPixel(target.col, target.row);
    const currentPixel = tilemap.tileToPixel(agent.tileCol, agent.tileRow);

    agent.moveProgress += agent.moveSpeed * deltaTime;

    // Interpolate pixel position
    const t = Math.min(agent.moveProgress, 1);
    agent.x = currentPixel.x + (targetPixel.x - currentPixel.x) * t;
    agent.y = currentPixel.y + (targetPixel.y - currentPixel.y) * t;

    // Update facing
    agent.facing = facingFromDirection(
      agent.tileCol,
      agent.tileRow,
      target.col,
      target.row
    );

    // Animate walk frames
    agent.frameTimer += deltaTime;
    if (agent.frameTimer >= 0.15) {
      agent.frame = (agent.frame + 1) % 4;
      agent.frameTimer = 0;
    }

    // Arrived at next tile
    if (agent.moveProgress >= 1) {
      tilemap.setOccupied(agent.tileCol, agent.tileRow, false);
      agent.tileCol = target.col;
      agent.tileRow = target.row;
      tilemap.setOccupied(agent.tileCol, agent.tileRow, true);
      agent.x = targetPixel.x;
      agent.y = targetPixel.y;
      agent.moveProgress = 0;
      agent.pathIndex++;

      // Path complete
      if (agent.pathIndex >= agent.path.length) {
        agent.path = [];
        agent.pathIndex = 0;

        // Post-arrival behavior
        if (agent.behavior === "working") {
          agent.state = "typing";
          agent.frame = 0;
        } else if (agent.behavior === "getting-coffee") {
          // Stand at coffee machine, then go back to desk
          agent.state = "idle";
          agent.facing = "up";
          // Timer will trigger return to desk
        } else {
          agent.state = "idle";
        }
      }
    }
  } else {
    // Stationary — decrement behavior timer
    agent.behaviorTimer -= deltaTime;

    if (agent.behaviorTimer <= 0) {
      // After coffee, return to desk
      if (agent.behavior === "getting-coffee") {
        const desk = getDesk(agent.id);
        if (desk) {
          tryMoveTo(agent, tilemap, desk.chairCol, desk.chairRow);
          agent.behavior = "working";
          agent.behaviorTimer = randomRange(8, 15);
          return;
        }
      }
      pickBehavior(agent, tilemap);
    }

    // Typing animation
    if (agent.state === "typing") {
      agent.frameTimer += deltaTime;
      if (agent.frameTimer >= 0.35) {
        agent.frame = agent.frame === 0 ? 1 : 0;
        agent.frameTimer = 0;
      }
    } else if (agent.state === "idle") {
      agent.frame = 0;
    }
  }
}

export function drawAgent(
  ctx: CanvasRenderingContext2D,
  agent: AgentEntity,
  scale: number
): void {
  // Stopped agents render at reduced opacity
  const isStopped = agent.status === "stopped";
  if (isStopped) {
    ctx.save();
    ctx.globalAlpha = 0.4;
  }

  const sprites = getCharacterSprites(agent.paletteId);

  // Pick the right sprite frame
  const isSeated =
    (agent.behavior === "working" || agent.behavior === "sitting-idle") &&
    agent.state !== "walking";

  let sprite: SpriteData;
  if (isSeated) {
    // Use sitting sprite (includes chair back/seat from behind)
    sprite = agent.state === "typing"
      ? sprites.sitting[agent.frame % 2]
      : sprites.sitting[0];
  } else if (agent.state === "walking") {
    switch (agent.facing) {
      case "down":
        sprite = sprites.walkDown[agent.frame % 4];
        break;
      case "left":
        sprite = sprites.walkLeft[agent.frame % 4];
        break;
      case "right":
        sprite = sprites.walkRight[agent.frame % 4];
        break;
      case "up":
        // Use idle for now (no back sprite); could add walkUp later
        sprite = sprites.idle;
        break;
      default:
        sprite = sprites.idle;
    }
  } else {
    sprite = sprites.idle;
  }

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
  ctx.beginPath();
  ctx.ellipse(
    agent.x + 8 * scale,
    agent.y + 23 * scale,
    7 * scale,
    2 * scale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw character
  renderSprite(ctx, sprite, agent.x, agent.y, scale);

  // Name label
  const nameX = agent.x + 8 * scale;
  const nameY = agent.y - 14;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";

  // Label background — dark pill with rounded corners
  const tw = ctx.measureText(agent.name).width;
  const lw = tw + 14;
  const lh = 18;
  const lx = nameX - lw / 2;
  const ly = nameY - 11;
  const radius = 5;

  ctx.beginPath();
  ctx.moveTo(lx + radius, ly);
  ctx.lineTo(lx + lw - radius, ly);
  ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + radius);
  ctx.lineTo(lx + lw, ly + lh - radius);
  ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - radius, ly + lh);
  ctx.lineTo(lx + radius, ly + lh);
  ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - radius);
  ctx.lineTo(lx, ly + radius);
  ctx.quadraticCurveTo(lx, ly, lx + radius, ly);
  ctx.closePath();

  ctx.fillStyle = "rgba(20, 20, 20, 0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Status dot inline with name
  const statusColor = getStatusColor(agent.status);
  const dotX = nameX - tw / 2 - 4;
  ctx.beginPath();
  ctx.arc(dotX, nameY, 3, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();

  ctx.fillStyle = "#e5e5e5";
  ctx.fillText(agent.name, nameX + 2, nameY + 3);

  ctx.textAlign = "left";

  if (isStopped) {
    ctx.restore();
  }
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
