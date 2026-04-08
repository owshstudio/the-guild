// Office constants and utility functions

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
  get scale() {
    return this.spriteScale;
  },
};

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
