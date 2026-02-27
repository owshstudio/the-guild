// Office rendering — tile-based floor, walls, and furniture layers

import { TileMap } from "./tilemap";
import { TileType } from "./tiles";
import { getFurnitureCanvas } from "./furniture-sprites";

export interface Position {
  x: number;
  y: number;
}

export const OFFICE = {
  width: 960,
  height: 640,
  cols: 15,
  rows: 10,
  tileSize: 64,
  spriteScale: 4,
  // Keep backward-compat alias
  get scale() {
    return this.spriteScale;
  },
};

// Floor colors — light modern office
const FLOOR = {
  light: "#d4c9a8",
  mid: "#c9be9d",
  dark: "#beb393",
  grid: "#b8ad8a",
  wall: "#e8e0cc",
  wallDark: "#d4cbb4",
  wallAlt: "#ddd5be",
  baseboard: "#9e9478",
};

const tileToFurniture: Partial<
  Record<TileType, Parameters<typeof getFurnitureCanvas>[0]>
> = {
  [TileType.DeskLeft]: "desk-left",
  [TileType.DeskRight]: "desk-right",
  [TileType.Chair]: "chair",
  [TileType.Plant]: "plant",
  [TileType.CoffeeMachine]: "coffee-machine",
  [TileType.Bookshelf]: "bookshelf",
  [TileType.Door]: "door",
  [TileType.DoorLeft]: "door-left",
  [TileType.DoorBottom]: "door-bottom",
  [TileType.Couch]: "couch",
  [TileType.VendingMachine]: "vending-machine",
  [TileType.SmallTable]: "small-table",
  [TileType.ServerRack]: "server-rack",
  [TileType.Whiteboard]: "whiteboard",
  [TileType.LargeTable]: "large-table",
  [TileType.RugTL]: "rug-tl",
  [TileType.RugT]: "rug-t",
  [TileType.RugTR]: "rug-tr",
  [TileType.RugL]: "rug-l",
  [TileType.RugC]: "rug-c",
  [TileType.RugR]: "rug-r",
  [TileType.RugBL]: "rug-bl",
  [TileType.RugB]: "rug-b",
  [TileType.RugBR]: "rug-br",
};

// Pass 1: floor tiles, walls, wall bases, rug tiles (ground-level)
export function drawTileFloor(
  ctx: CanvasRenderingContext2D,
  tilemap: TileMap
): void {
  const ts = tilemap.tileSize;

  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      const tile = tilemap.getTile(col, row);
      const x = col * ts;
      const y = row * ts;

      switch (tile) {
        case TileType.Wall:
          ctx.fillStyle = FLOOR.wall;
          ctx.fillRect(x, y, ts, ts);
          break;

        case TileType.WallBaseAlt:
          ctx.fillStyle = FLOOR.wallAlt;
          ctx.fillRect(x, y, ts, ts);
          // Subtle window hint
          ctx.fillStyle = "rgba(180, 210, 240, 0.3)";
          ctx.fillRect(x + 12, y + 10, ts - 24, ts - 20);
          ctx.fillStyle = FLOOR.wallDark;
          ctx.fillRect(x + 10, y + 8, ts - 20, 2);
          ctx.fillRect(x + 10, y + 8, 2, ts - 16);
          ctx.fillRect(x + ts - 12, y + 8, 2, ts - 16);
          break;

        case TileType.WallBase:
          ctx.fillStyle = FLOOR.wall;
          ctx.fillRect(x, y, ts, ts);
          // Baseboard stripe at bottom
          ctx.fillStyle = FLOOR.wallDark;
          ctx.fillRect(x, y + ts - 10, ts, 4);
          ctx.fillStyle = FLOOR.baseboard;
          ctx.fillRect(x, y + ts - 6, ts, 6);
          break;

        case TileType.Door:
        case TileType.DoorLeft:
        case TileType.DoorBottom:
          // Floor behind the door
          ctx.fillStyle = FLOOR.wall;
          ctx.fillRect(x, y, ts, ts);
          // Door frame baseboard
          ctx.fillStyle = FLOOR.baseboard;
          ctx.fillRect(x, y + ts - 6, ts, 6);
          break;

        default: {
          // Floor checkerboard
          const isAlt = (col + row) % 2 === 0;
          ctx.fillStyle = isAlt ? FLOOR.light : FLOOR.mid;
          ctx.fillRect(x, y, ts, ts);

          // Subtle grid lines
          ctx.fillStyle = FLOOR.grid;
          ctx.fillRect(x, y, ts, 1);
          ctx.fillRect(x, y, 1, ts);

          // Rug tiles rendered as floor-level sprites
          const rugType = tileToFurniture[tile];
          if (
            rugType &&
            tile >= TileType.RugTL &&
            tile <= TileType.RugBR
          ) {
            const canvas = getFurnitureCanvas(rugType);
            ctx.drawImage(canvas, x, y, ts, ts);
          }
          break;
        }
      }
    }
  }
}

// Pass 2: furniture that renders BEHIND agents (desks, bookshelves, plants, coffee machine, door)
export function drawFurnitureBack(
  ctx: CanvasRenderingContext2D,
  tilemap: TileMap
): void {
  const ts = tilemap.tileSize;
  const backTypes = new Set([
    TileType.DeskLeft,
    TileType.DeskRight,
    TileType.Plant,
    TileType.CoffeeMachine,
    TileType.Bookshelf,
    TileType.Door,
    TileType.DoorLeft,
    TileType.DoorBottom,
    TileType.Couch,
    TileType.VendingMachine,
    TileType.SmallTable,
    TileType.ServerRack,
    TileType.Whiteboard,
    TileType.LargeTable,
  ]);

  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      const tile = tilemap.getTile(col, row);
      if (!backTypes.has(tile)) continue;

      const furnitureType = tileToFurniture[tile];
      if (!furnitureType) continue;

      const canvas = getFurnitureCanvas(furnitureType);
      ctx.drawImage(canvas, col * ts, row * ts, ts, ts);
    }
  }
}

// Pass 4: furniture that renders IN FRONT of agents (chairs)
export function drawFurnitureFront(
  ctx: CanvasRenderingContext2D,
  tilemap: TileMap
): void {
  const ts = tilemap.tileSize;

  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      const tile = tilemap.getTile(col, row);
      if (tile !== TileType.Chair) continue;

      const canvas = getFurnitureCanvas("chair");
      ctx.drawImage(canvas, col * ts, row * ts, ts, ts);
    }
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "#22c55e";
    case "idle":
      return "#eab308";
    case "stopped":
      return "#ef4444";
    default:
      return "#737373";
  }
}
