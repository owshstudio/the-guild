// Room layout definitions — 4 rooms, each 15x10 tiles

import { TileType } from "./tiles";
import { DeskAssignment } from "./office-layouts";
import { RoomId, RoomDefinition } from "@/lib/types";

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
const DLf = TileType.DoorLeft;
const DB = TileType.DoorBottom;
const CO = TileType.Couch;
const VM = TileType.VendingMachine;
const ST = TileType.SmallTable;
const SR = TileType.ServerRack;
const WH = TileType.Whiteboard;
const LT = TileType.LargeTable;

// ——— Main Office (same layout as DEFAULT_OFFICE_LAYOUT, door at (7,1)) ———
// prettier-ignore
const MAIN_OFFICE_LAYOUT: TileType[][] = [
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

// ——— Break Room ———
// Couches along walls, vending machine, small tables, coffee machine
// Door at (7,9) links back to main-office
// prettier-ignore
const BREAK_ROOM_LAYOUT: TileType[][] = [
  // col:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14
  [  W,   W,   W,  WA,   W,   W,   W,   W,   W,   W,  WA,   W,   W,   W,   W  ], // row 0
  [ WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB ], // row 1
  [ CO,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,  VM,   F,  CO ], // row 2
  [ CO,   F,   F,  ST,   F,   F,   F,   F,   F,   F,  ST,   F,   F,   F,  CO ], // row 3
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 4
  [  F,   F,   F,   F,   F, rTL,  rT, rTR,   F,   F,   F,   F,  CM,   F,   F ], // row 5
  [  F,   F,  PL,   F,   F,  rL,  rC,  rR,   F,   F,   F,   F,   F,   F,   F ], // row 6
  [  F,   F,   F,   F,   F, rBL,  rB, rBR,   F,   F,   F,   F,  PL,   F,   F ], // row 7
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 8
  [  F,   F,   F,   F,   F,   F,   F,  DB,   F,   F,   F,   F,   F,   F,   F ], // row 9
];

// ——— Server Room ———
// Server racks along walls, terminal desk in center
// Door at (0,5) links to main-office
// prettier-ignore
const SERVER_ROOM_LAYOUT: TileType[][] = [
  // col:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14
  [  W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W,   W  ], // row 0
  [ WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB,  WB ], // row 1
  [  F,   F,  SR,  SR,   F,  SR,  SR,   F,  SR,  SR,   F,  SR,  SR,   F,   F ], // row 2
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 3
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 4
  [DLf,   F,   F,   F,   F,  DL, DkR,   F,  DL, DkR,   F,   F,   F,   F,   F ], // row 5
  [  F,   F,   F,   F,   F,  CH,  CH,   F,  CH,  CH,   F,   F,   F,   F,   F ], // row 6
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 7
  [  F,   F,  SR,  SR,   F,  SR,  SR,   F,  SR,  SR,   F,  SR,  SR,   F,   F ], // row 8
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 9
];

// ——— Meeting Room ———
// Central large table (4x2), chairs around it, whiteboard on wall
// Door at (7,1) links to main-office
// prettier-ignore
const MEETING_ROOM_LAYOUT: TileType[][] = [
  // col:  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14
  [  W,   W,   W,  WH,  WH,   W,   W,   W,   W,   W,  WH,  WH,   W,   W,   W  ], // row 0
  [ WB,  WB,  WB,  WB,  WB,  WB,  WB,  DR,  WB,  WB,  WB,  WB,  WB,  WB,  WB ], // row 1
  [  F,   F,  PL,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,  PL,   F ], // row 2
  [  F,   F,   F,   F,   F,  CH,  CH,  CH,  CH,   F,   F,   F,   F,   F,   F ], // row 3
  [  F,   F,   F,   F,   F,  LT,  LT,  LT,  LT,   F,   F,   F,   F,   F,   F ], // row 4
  [  F,   F,   F,   F,   F,  LT,  LT,  LT,  LT,   F,   F,   F,   F,   F,   F ], // row 5
  [  F,   F,   F,   F,   F,  CH,  CH,  CH,  CH,   F,   F,   F,   F,   F,   F ], // row 6
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 7
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,  BS,   F,   F ], // row 8
  [  F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F,   F ], // row 9
];

// ——— Room Definitions ———

const MAIN_OFFICE: RoomDefinition = {
  id: "main-office",
  name: "Main Office",
  layout: MAIN_OFFICE_LAYOUT,
  deskAssignments: [
    { agentId: "nyx", deskCol: 1, deskRow: 3, chairCol: 1, chairRow: 4 },
    { agentId: "hemera", deskCol: 5, deskRow: 3, chairCol: 5, chairRow: 4 },
  ],
  coffeeMachine: { col: 12, row: 2 },
  wanderBounds: { minCol: 0, maxCol: 14, minRow: 2, maxRow: 9 },
  doors: {
    "7,1": { targetRoom: "break-room", entryCol: 7, entryRow: 8 },
  },
};

const BREAK_ROOM: RoomDefinition = {
  id: "break-room",
  name: "Break Room",
  layout: BREAK_ROOM_LAYOUT,
  deskAssignments: [],
  coffeeMachine: { col: 12, row: 5 },
  wanderBounds: { minCol: 1, maxCol: 13, minRow: 2, maxRow: 8 },
  doors: {
    "7,9": { targetRoom: "main-office", entryCol: 7, entryRow: 2 },
  },
};

const SERVER_ROOM: RoomDefinition = {
  id: "server-room",
  name: "Server Room",
  layout: SERVER_ROOM_LAYOUT,
  deskAssignments: [
    { agentId: "nyx", deskCol: 5, deskRow: 5, chairCol: 5, chairRow: 6 },
    { agentId: "hemera", deskCol: 8, deskRow: 5, chairCol: 8, chairRow: 6 },
  ],
  wanderBounds: { minCol: 1, maxCol: 13, minRow: 2, maxRow: 9 },
  doors: {
    "0,5": { targetRoom: "main-office", entryCol: 1, entryRow: 5 },
  },
};

const MEETING_ROOM: RoomDefinition = {
  id: "meeting-room",
  name: "Meeting Room",
  layout: MEETING_ROOM_LAYOUT,
  deskAssignments: [],
  wanderBounds: { minCol: 0, maxCol: 14, minRow: 2, maxRow: 9 },
  doors: {
    "7,1": { targetRoom: "main-office", entryCol: 7, entryRow: 2 },
  },
};

export const ROOMS: Record<RoomId, RoomDefinition> = {
  "main-office": MAIN_OFFICE,
  "break-room": BREAK_ROOM,
  "server-room": SERVER_ROOM,
  "meeting-room": MEETING_ROOM,
};

export function getRoomDefinition(id: RoomId): RoomDefinition {
  return ROOMS[id];
}
