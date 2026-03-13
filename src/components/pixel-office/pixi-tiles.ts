import { Container, Sprite, Texture, Graphics } from "pixi.js";
import { TileMap } from "./tilemap";
import { TileType } from "./tiles";
import { getFurnitureTexture, FurnitureType } from "./furniture-sprites";

// Floor & wall palette
const FLOOR = {
  tileA: "#ddd4be",
  tileB: "#d0c7b0",
  grid: "#c2b99f",
  wall: "#eae6de",
  wallDark: "#d2cec6",
  wallAlt: "#e4e0d8",
  baseboard: "#888070",
  baseboardLight: "#b0a898",
  windowFrame: "#807060",
  windowGlass: "rgba(130, 185, 240, 0.55)",
  windowReflect: "rgba(240, 250, 255, 0.4)",
};

const tileToFurniture: Partial<Record<TileType, string>> = {
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
  [TileType.WallClock]: "wall-clock",
  [TileType.Poster]: "poster",
  [TileType.FilingCabinet]: "filing-cabinet",
  [TileType.Printer]: "printer",
  [TileType.WaterCooler]: "water-cooler",
  [TileType.TrashCan]: "trash-can",
};

// Ground shadow settings per furniture type
const GROUND_SHADOWS: Partial<
  Record<TileType, { dx: number; dy: number; w: number; h: number; alpha: number }>
> = {
  [TileType.DeskLeft]: { dx: 4, dy: 56, w: 56, h: 6, alpha: 0.1 },
  [TileType.DeskRight]: { dx: 4, dy: 56, w: 56, h: 6, alpha: 0.1 },
  [TileType.Bookshelf]: { dx: 6, dy: 58, w: 52, h: 5, alpha: 0.12 },
  [TileType.CoffeeMachine]: { dx: 16, dy: 56, w: 32, h: 5, alpha: 0.08 },
  [TileType.VendingMachine]: { dx: 10, dy: 58, w: 44, h: 5, alpha: 0.12 },
  [TileType.ServerRack]: { dx: 10, dy: 58, w: 44, h: 5, alpha: 0.1 },
  [TileType.Couch]: { dx: 6, dy: 56, w: 52, h: 6, alpha: 0.1 },
  [TileType.Plant]: { dx: 22, dy: 56, w: 20, h: 5, alpha: 0.08 },
  [TileType.SmallTable]: { dx: 18, dy: 54, w: 28, h: 5, alpha: 0.08 },
  [TileType.LargeTable]: { dx: 4, dy: 58, w: 56, h: 5, alpha: 0.1 },
  [TileType.FilingCabinet]: { dx: 12, dy: 58, w: 40, h: 5, alpha: 0.1 },
  [TileType.Printer]: { dx: 10, dy: 52, w: 44, h: 5, alpha: 0.08 },
  [TileType.WaterCooler]: { dx: 18, dy: 56, w: 28, h: 5, alpha: 0.08 },
};

// Cache tile textures by key so we only create each variant once
const tileTextureCache = new Map<string, Texture>();

export function clearAllTileTextures(): void {
  tileTextureCache.clear();
}

function getTileTexture(
  key: string,
  ts: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): Texture {
  const cached = tileTextureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = ts;
  canvas.height = ts;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);

  const texture = Texture.from({ resource: canvas, scaleMode: "nearest" });
  tileTextureCache.set(key, texture);
  return texture;
}


function drawFloorTileA(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.tileA;
  ctx.fillRect(0, 0, ts, ts);
  // Grout lines — 1px on top and left
  ctx.fillStyle = "#c8c0a8";
  ctx.fillRect(0, 0, ts, 1);
  ctx.fillRect(0, 0, 1, ts);
}

function drawFloorTileB(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.tileB;
  ctx.fillRect(0, 0, ts, ts);
  // Grout lines — 1px on top and left
  ctx.fillStyle = "#c8c0a8";
  ctx.fillRect(0, 0, ts, 1);
  ctx.fillRect(0, 0, 1, ts);
}


function drawWall(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.wall;
  ctx.fillRect(0, 0, ts, ts);
  // Crown molding — 2 lines
  ctx.fillStyle = "#d8d4cc";
  ctx.fillRect(0, 24, ts, 1);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, 25, ts, 1);
  ctx.fillStyle = FLOOR.wallDark;
  ctx.fillRect(0, 26, ts, ts - 26);
  ctx.fillRect(0, ts - 1, ts, 1);
}

function drawWallBase(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.wall;
  ctx.fillRect(0, 0, ts, ts);
  // Crown molding — 2 lines
  ctx.fillStyle = "#d8d4cc";
  ctx.fillRect(0, 24, ts, 1);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, 25, ts, 1);
  ctx.fillStyle = FLOOR.wallDark;
  ctx.fillRect(0, 26, ts, ts - 26 - 8);
  ctx.fillStyle = FLOOR.baseboardLight;
  ctx.fillRect(0, ts - 8, ts, 2);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, ts - 6, ts, 6);
}

function drawWallBaseAlt(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.wallAlt;
  ctx.fillRect(0, 0, ts, ts);
  ctx.fillStyle = FLOOR.windowFrame;
  ctx.fillRect(8, 4, ts - 16, 3);
  ctx.fillRect(8, 4, 3, ts - 12);
  ctx.fillRect(ts - 11, 4, 3, ts - 12);
  ctx.fillRect(8, ts - 11, ts - 16, 3);
  ctx.fillStyle = FLOOR.windowGlass;
  ctx.fillRect(11, 7, ts - 22, ts - 18);
  ctx.fillStyle = FLOOR.windowFrame;
  ctx.fillRect(11, 30, ts - 22, 2);
  // Window sill depth
  ctx.fillStyle = "#9a8a78";
  ctx.fillRect(8, ts - 13, ts - 16, 2);
  ctx.fillStyle = "#5a4a3a";
  ctx.fillRect(8, ts - 9, ts - 16, 1);
  // Single subtle highlight on glass
  ctx.fillStyle = "rgba(240, 250, 255, 0.2)";
  ctx.fillRect(13, 9, 10, 6);
  ctx.fillStyle = FLOOR.baseboardLight;
  ctx.fillRect(6, ts - 8, ts - 12, 2);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(6, ts - 6, ts - 12, 6);
}

function drawDoorWall(ctx: CanvasRenderingContext2D, ts: number) {
  ctx.fillStyle = FLOOR.wall;
  ctx.fillRect(0, 0, ts, ts);
  // Crown molding — 2 lines
  ctx.fillStyle = "#d8d4cc";
  ctx.fillRect(0, 24, ts, 1);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, 25, ts, 1);
  ctx.fillStyle = FLOOR.wallDark;
  ctx.fillRect(0, 26, ts, ts - 26 - 8);
  ctx.fillStyle = FLOOR.baseboardLight;
  ctx.fillRect(0, ts - 8, ts, 2);
  ctx.fillStyle = FLOOR.baseboard;
  ctx.fillRect(0, ts - 6, ts, 6);
}

export function buildFloorLayer(container: Container, tilemap: TileMap): void {
  container.removeChildren();
  const ts = tilemap.tileSize;

  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      const tile = tilemap.getTile(col, row);
      let texture: Texture;

      switch (tile) {
        case TileType.Wall:
          texture = getTileTexture("wall", ts, (ctx) => drawWall(ctx, ts));
          break;
        case TileType.WallBase:
          texture = getTileTexture("wallBase", ts, (ctx) => drawWallBase(ctx, ts));
          break;
        case TileType.WallBaseAlt:
          texture = getTileTexture("wallBaseAlt", ts, (ctx) => drawWallBaseAlt(ctx, ts));
          break;
        case TileType.Door:
        case TileType.DoorLeft:
        case TileType.DoorBottom:
          texture = getTileTexture("doorWall", ts, (ctx) => drawDoorWall(ctx, ts));
          break;
        case TileType.WallClock:
        case TileType.Poster: {
          // Wall-mounted items: render the furniture sprite directly as the tile
          const wallFurnitureType = tileToFurniture[tile];
          if (wallFurnitureType) {
            texture = getFurnitureTexture(wallFurnitureType as FurnitureType);
          } else {
            texture = getTileTexture("wall", ts, (ctx) => drawWall(ctx, ts));
          }
          break;
        }
        default: {
          const isAlt = (col + row) % 2 === 0;
          texture = getTileTexture(isAlt ? "floorA" : "floorB", ts, (ctx) =>
            isAlt ? drawFloorTileA(ctx, ts) : drawFloorTileB(ctx, ts)
          );
          break;
        }
      }

      const sprite = new Sprite(texture);
      sprite.x = col * ts;
      sprite.y = row * ts;
      container.addChild(sprite);

      // Floor-wall shadow gradient: if the tile above is a wall type, add shadow
      if (
        row > 0 &&
        tile !== TileType.Wall &&
        tile !== TileType.WallBase &&
        tile !== TileType.WallBaseAlt &&
        tile !== TileType.Door &&
        tile !== TileType.DoorLeft &&
        tile !== TileType.DoorBottom &&
        tile !== TileType.WallClock &&
        tile !== TileType.Poster
      ) {
        const above = tilemap.getTile(col, row - 1);
        if (
          above === TileType.Wall ||
          above === TileType.WallBase ||
          above === TileType.WallBaseAlt ||
          above === TileType.Door ||
          above === TileType.DoorLeft ||
          above === TileType.DoorBottom ||
          above === TileType.WallClock ||
          above === TileType.Poster ||
          above === TileType.Whiteboard
        ) {
          const shadowTexture = getTileTexture("wallShadow", ts, (ctx) => {
            // Step 1: top 8px at 0.06 alpha
            ctx.fillStyle = "rgba(0,0,0,0.06)";
            ctx.fillRect(0, 0, ts, 8);
            // Step 2: next 8px at 0.03 alpha
            ctx.fillStyle = "rgba(0,0,0,0.03)";
            ctx.fillRect(0, 8, ts, 8);
          });
          const shadowSprite = new Sprite(shadowTexture);
          shadowSprite.x = col * ts;
          shadowSprite.y = row * ts;
          container.addChild(shadowSprite);
        }
      }

      // Rug tiles rendered on top of floor
      if (tile >= TileType.RugTL && tile <= TileType.RugBR) {
        const rugType = tileToFurniture[tile];
        if (rugType) {
          const rugSprite = new Sprite(
            getFurnitureTexture(rugType as FurnitureType)
          );
          rugSprite.x = col * ts;
          rugSprite.y = row * ts;
          container.addChild(rugSprite);
        }
      }

      // TrashCan rendered on top of floor (walkable floor-level item)
      if (tile === TileType.TrashCan) {
        const tcSprite = new Sprite(
          getFurnitureTexture("trash-can")
        );
        tcSprite.x = col * ts;
        tcSprite.y = row * ts;
        container.addChild(tcSprite);
      }
    }
  }
}

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
  TileType.FilingCabinet,
  TileType.Printer,
  TileType.WaterCooler,
]);

export interface ChairSprite {
  sprite: Sprite;
  col: number;
  row: number;
}

export function buildFurnitureLayer(
  container: Container,
  tilemap: TileMap
): ChairSprite[] {
  container.removeChildren();
  const ts = tilemap.tileSize;
  const chairs: ChairSprite[] = [];

  for (let row = 0; row < tilemap.rows; row++) {
    for (let col = 0; col < tilemap.cols; col++) {
      const tile = tilemap.getTile(col, row);

      // Back furniture (desks, plants, etc.)
      if (backTypes.has(tile)) {
        const furnitureType = tileToFurniture[tile];
        if (!furnitureType) continue;

        const x = col * ts;
        const y = row * ts;

        // Ground shadow
        const shadow = GROUND_SHADOWS[tile];
        if (shadow) {
          const g = new Graphics();
          g.rect(x + shadow.dx, y + shadow.dy, shadow.w, shadow.h);
          g.fill({ color: 0x000000, alpha: shadow.alpha });
          container.addChild(g);
        }

        const sprite = new Sprite(
          getFurnitureTexture(furnitureType as FurnitureType)
        );
        sprite.x = x;
        sprite.y = y;
        container.addChild(sprite);
      }

      // Chairs — tracked separately for show/hide based on seated agents
      if (tile === TileType.Chair) {
        const sprite = new Sprite(getFurnitureTexture("chair"));
        sprite.x = col * ts;
        sprite.y = row * ts;
        container.addChild(sprite);
        chairs.push({ sprite, col, row });
      }
    }
  }

  return chairs;
}
