// RoomManager — handles multi-room state, transitions, and agent room tracking

import { RoomId, RoomDefinition } from "@/lib/types";
import { TileMap } from "./tilemap";
import { TileType } from "./tiles";
import { AgentEntity } from "./agent-entity";
import { ROOMS, getRoomDefinition } from "./room-layouts";

export interface RoomTransition {
  active: boolean;
  from: RoomId;
  to: RoomId;
  progress: number; // 0-1, 400ms total
}

const TRANSITION_DURATION = 0.4; // 400ms in seconds

export class RoomManager {
  currentRoomId: RoomId;
  tilemaps: Record<RoomId, TileMap>;
  agentRooms: Record<string, RoomId>;
  transition: RoomTransition | null;

  constructor() {
    this.currentRoomId = "main-office";
    this.agentRooms = {};
    this.transition = null;

    // Initialize tilemaps for all rooms
    this.tilemaps = {} as Record<RoomId, TileMap>;
    const roomIds: RoomId[] = [
      "main-office",
      "break-room",
      "server-room",
      "meeting-room",
    ];
    for (const id of roomIds) {
      const room = getRoomDefinition(id);
      this.tilemaps[id] = new TileMap(room.layout as TileType[][]);
    }
  }

  getCurrentRoom(): RoomDefinition {
    return getRoomDefinition(this.currentRoomId);
  }

  getCurrentTilemap(): TileMap {
    return this.tilemaps[this.currentRoomId];
  }

  getTilemap(roomId: RoomId): TileMap {
    return this.tilemaps[roomId];
  }

  getCurrentAgents(allAgents: AgentEntity[]): AgentEntity[] {
    return allAgents.filter(
      (a) => (this.agentRooms[a.id] || "main-office") === this.currentRoomId
    );
  }

  getAllAgentLocations(
    allAgents: AgentEntity[]
  ): Record<RoomId, string[]> {
    const result: Record<RoomId, string[]> = {
      "main-office": [],
      "break-room": [],
      "server-room": [],
      "meeting-room": [],
    };
    for (const agent of allAgents) {
      const room = this.agentRooms[agent.id] || "main-office";
      result[room].push(agent.id);
    }
    return result;
  }

  setAgentRoom(agentId: string, roomId: RoomId): void {
    this.agentRooms[agentId] = roomId;
  }

  switchRoom(targetRoom: RoomId): void {
    if (targetRoom === this.currentRoomId) return;
    if (this.transition?.active) return;

    this.transition = {
      active: true,
      from: this.currentRoomId,
      to: targetRoom,
      progress: 0,
    };
  }

  updateTransition(deltaTime: number): boolean {
    if (!this.transition?.active) return false;

    this.transition.progress += deltaTime / TRANSITION_DURATION;

    if (this.transition.progress >= 1) {
      this.currentRoomId = this.transition.to;
      this.transition = null;
      return false;
    }

    // At halfway, switch the room
    if (
      this.transition.progress >= 0.5 &&
      this.currentRoomId === this.transition.from
    ) {
      this.currentRoomId = this.transition.to;
    }

    return true;
  }

  getTransitionAlpha(): number {
    if (!this.transition?.active) return 1;
    const p = this.transition.progress;
    // Fade out for first half, fade in for second half
    if (p < 0.5) {
      return 1 - p * 2; // 1 -> 0
    }
    return (p - 0.5) * 2; // 0 -> 1
  }

  getDoorAt(col: number, row: number): { targetRoom: RoomId; entryCol: number; entryRow: number } | null {
    const room = this.getCurrentRoom();
    const key = `${col},${row}`;
    const door = room.doors[key];
    if (door) return door;
    return null;
  }

  getRoomNames(): { id: RoomId; name: string }[] {
    return (Object.keys(ROOMS) as RoomId[]).map((id) => ({
      id,
      name: ROOMS[id].name,
    }));
  }
}
