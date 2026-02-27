// Edit mode logic — pure TypeScript, no React

import { RoomDefinition } from "@/lib/types";
import { DeskAssignment } from "./office-layouts";
import { TileType } from "./tiles";

export interface EditModeState {
  active: boolean;
  draggedAgentId?: string;
  dragStartTile?: { col: number; row: number };
  mousePixel?: { x: number; y: number };
  validDropTargets: { col: number; row: number }[];
}

export function createEditModeState(): EditModeState {
  return {
    active: false,
    validDropTargets: [],
  };
}

export function getAvailableDesks(
  roomDef: RoomDefinition,
  currentAssignments: DeskAssignment[]
): { col: number; row: number }[] {
  const layout = roomDef.layout;
  const assignedChairs = new Set(
    currentAssignments.map((a) => `${a.chairCol},${a.chairRow}`)
  );

  const desks: { col: number; row: number }[] = [];
  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[row].length; col++) {
      if (layout[row][col] === TileType.Chair) {
        if (!assignedChairs.has(`${col},${row}`)) {
          desks.push({ col, row });
        }
      }
    }
  }
  return desks;
}

export function isOverDesk(
  col: number,
  row: number,
  roomDef: RoomDefinition
): DeskAssignment | null {
  for (const desk of roomDef.deskAssignments) {
    if (desk.chairCol === col && desk.chairRow === row) {
      return desk;
    }
  }
  return null;
}

export function isChairTile(
  col: number,
  row: number,
  roomDef: RoomDefinition
): boolean {
  const layout = roomDef.layout;
  if (row < 0 || row >= layout.length || col < 0 || col >= layout[0].length) {
    return false;
  }
  return layout[row][col] === TileType.Chair;
}
