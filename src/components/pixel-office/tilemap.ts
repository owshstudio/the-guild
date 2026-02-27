// TileMap — grid management, collision, and coordinate conversion

import { TileType, TileProperties, getTileProperties } from "./tiles";

export class TileMap {
  readonly cols = 15;
  readonly rows = 10;
  readonly tileSize = 64;
  private grid: TileType[][];
  private occupied: Set<string>;

  constructor(layout: TileType[][]) {
    this.grid = layout.map((row) => [...row]);
    this.occupied = new Set();
  }

  private key(col: number, row: number): string {
    return `${col},${row}`;
  }

  private inBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getTile(col: number, row: number): TileType {
    if (!this.inBounds(col, row)) return TileType.Wall;
    return this.grid[row][col];
  }

  getProperties(col: number, row: number): TileProperties {
    return getTileProperties(this.getTile(col, row));
  }

  isWalkable(col: number, row: number): boolean {
    if (!this.inBounds(col, row)) return false;
    return this.getProperties(col, row).walkable && !this.occupied.has(this.key(col, row));
  }

  tileToPixel(col: number, row: number): { x: number; y: number } {
    return { x: col * this.tileSize, y: row * this.tileSize };
  }

  pixelToTile(x: number, y: number): { col: number; row: number } {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize),
    };
  }

  getNeighbors(col: number, row: number): { col: number; row: number }[] {
    const dirs = [
      { dc: -1, dr: -1 },
      { dc: 0, dr: -1 },
      { dc: 1, dr: -1 },
      { dc: -1, dr: 0 },
      { dc: 1, dr: 0 },
      { dc: -1, dr: 1 },
      { dc: 0, dr: 1 },
      { dc: 1, dr: 1 },
    ];
    const result: { col: number; row: number }[] = [];
    for (const { dc, dr } of dirs) {
      const nc = col + dc;
      const nr = row + dr;
      if (this.inBounds(nc, nr)) {
        result.push({ col: nc, row: nr });
      }
    }
    return result;
  }

  setOccupied(col: number, row: number, occupied: boolean): void {
    const k = this.key(col, row);
    if (occupied) {
      this.occupied.add(k);
    } else {
      this.occupied.delete(k);
    }
  }

  isOccupied(col: number, row: number): boolean {
    return this.occupied.has(this.key(col, row));
  }

  getAdjacentWalkable(col: number, row: number): { col: number; row: number }[] {
    return this.getNeighbors(col, row).filter(
      (n) => this.isWalkable(n.col, n.row)
    );
  }
}
