// Office layout definition — 15x10 tile grid

import { TileType } from "./tiles";

const F = TileType.Floor;
const W = TileType.Wall;
const WB = TileType.WallBase;
const WA = TileType.WallBaseAlt;
const DR = TileType.Door;
const DL = TileType.DeskLeft;
const DkR = TileType.DeskRight;
const CH = TileType.Chair;
const PL = TileType.Plant;
const CM = TileType.CoffeeMachine;
const BS = TileType.Bookshelf;
const rTL = TileType.RugTL;
const rT = TileType.RugT;
const rTR = TileType.RugTR;
const rL = TileType.RugL;
const rC = TileType.RugC;
const rR = TileType.RugR;
const rBL = TileType.RugBL;
const rB = TileType.RugB;
const rBR = TileType.RugBR;

// prettier-ignore
export const DEFAULT_OFFICE_LAYOUT: TileType[][] = [
  // col:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14
  [  W,   W,   W,  WA,   W,   W,   W,   W,   W,   W,  WA,   W,   W,   W,   W  ], // row 0
  [ WB,  WB,  WB,  WB,  WB,  WB,  WB,  DR,  WB,  WB,  WB,  WB,  WB,  WB,  WB ], // row 1
  [  F,   F,  PL,   F,   F,   F,   F,   F,   F,   F,   F,   F,  CM,   F,  PL ], // row 2
  [  F,  DL, DkR,   F,   F,  DL, DkR,   F,  DL, DkR,   F,   F,   F,   F,   F ], // row 3
  [  F,  CH,  CH,   F,   F,  CH,  CH,   F,  CH,  CH,   F,   F,   F,   F,   F ], // row 4
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 5
  [  F,   F, rTL,  rT, rTR,   F,   F,   F,   F,   F,   F,  BS,  BS,   F,   F ], // row 6
  [  F,   F,  rL,  rC,  rR,   F,   F,   F,   F,   F,   F,  BS,  BS,   F,   F ], // row 7
  [  F,   F, rBL,  rB, rBR,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 8
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 9
];

export interface DeskAssignment {
  agentId: string;
  deskCol: number; // left side of desk
  deskRow: number;
  chairCol: number;
  chairRow: number;
}

// Default desk positions — dynamically populated from live agents at runtime.
// "main" is the primary agent. Additional agents fill remaining desks.
export const deskAssignments: DeskAssignment[] = [
  { agentId: "main", deskCol: 1, deskRow: 3, chairCol: 1, chairRow: 4 },
];

export const COFFEE_MACHINE = { col: 12, row: 2 };

export const WANDER_BOUNDS = { minCol: 0, maxCol: 14, minRow: 2, maxRow: 9 };
