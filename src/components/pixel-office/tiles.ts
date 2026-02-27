// Tile type definitions and properties for the office grid

export enum TileType {
  Floor,
  Wall,
  WallBase,
  WallBaseAlt,
  Door,
  DeskLeft,
  DeskRight,
  Chair,
  Plant,
  CoffeeMachine,
  Bookshelf,
  RugTL,
  RugT,
  RugTR,
  RugL,
  RugC,
  RugR,
  RugBL,
  RugB,
  RugBR,
  DoorLeft,
  DoorBottom,
  Couch,
  VendingMachine,
  SmallTable,
  ServerRack,
  Whiteboard,
  LargeTable,
}

export interface TileProperties {
  walkable: boolean;
  zLayer: "floor" | "furniture-back" | "furniture-front";
  label: string;
}

const TILE_PROPERTIES: Record<TileType, TileProperties> = {
  [TileType.Floor]: { walkable: true, zLayer: "floor", label: "Floor" },
  [TileType.Wall]: { walkable: false, zLayer: "floor", label: "Wall" },
  [TileType.WallBase]: { walkable: false, zLayer: "floor", label: "Wall Base" },
  [TileType.WallBaseAlt]: {
    walkable: false,
    zLayer: "floor",
    label: "Wall Base Alt",
  },
  [TileType.Door]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Door",
  },
  [TileType.DeskLeft]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Desk Left",
  },
  [TileType.DeskRight]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Desk Right",
  },
  [TileType.Chair]: {
    walkable: false,
    zLayer: "furniture-front",
    label: "Chair",
  },
  [TileType.Plant]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Plant",
  },
  [TileType.CoffeeMachine]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Coffee Machine",
  },
  [TileType.Bookshelf]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Bookshelf",
  },
  [TileType.RugTL]: { walkable: true, zLayer: "floor", label: "Rug TL" },
  [TileType.RugT]: { walkable: true, zLayer: "floor", label: "Rug T" },
  [TileType.RugTR]: { walkable: true, zLayer: "floor", label: "Rug TR" },
  [TileType.RugL]: { walkable: true, zLayer: "floor", label: "Rug L" },
  [TileType.RugC]: { walkable: true, zLayer: "floor", label: "Rug C" },
  [TileType.RugR]: { walkable: true, zLayer: "floor", label: "Rug R" },
  [TileType.RugBL]: { walkable: true, zLayer: "floor", label: "Rug BL" },
  [TileType.RugB]: { walkable: true, zLayer: "floor", label: "Rug B" },
  [TileType.RugBR]: { walkable: true, zLayer: "floor", label: "Rug BR" },
  [TileType.DoorLeft]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Door Left",
  },
  [TileType.DoorBottom]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Door Bottom",
  },
  [TileType.Couch]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Couch",
  },
  [TileType.VendingMachine]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Vending Machine",
  },
  [TileType.SmallTable]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Small Table",
  },
  [TileType.ServerRack]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Server Rack",
  },
  [TileType.Whiteboard]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Whiteboard",
  },
  [TileType.LargeTable]: {
    walkable: false,
    zLayer: "furniture-back",
    label: "Large Table",
  },
};

export function getTileProperties(type: TileType): TileProperties {
  return TILE_PROPERTIES[type];
}
