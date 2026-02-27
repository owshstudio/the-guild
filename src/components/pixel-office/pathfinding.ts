// A* pathfinding with 8-directional movement

import { TileMap } from "./tilemap";

export interface PathNode {
  col: number;
  row: number;
}

interface AStarNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: AStarNode | null;
}

function heuristic(a: PathNode, b: PathNode): number {
  // Octile distance for 8-directional movement
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

function nodeKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function findPath(
  tilemap: TileMap,
  start: PathNode,
  goal: PathNode,
  adjacentMode?: boolean
): PathNode[] {
  // In adjacent mode, find valid goal tiles (walkable neighbors of goal)
  let goalTiles: PathNode[];
  if (adjacentMode) {
    goalTiles = tilemap.getAdjacentWalkable(goal.col, goal.row);
    if (goalTiles.length === 0) return [];
  } else {
    if (!tilemap.isWalkable(goal.col, goal.row)) return [];
    goalTiles = [goal];
  }

  // Quick check: start is a valid goal
  for (const gt of goalTiles) {
    if (gt.col === start.col && gt.row === start.row) return [];
  }

  const goalSet = new Set(goalTiles.map((g) => nodeKey(g.col, g.row)));

  const open: AStarNode[] = [];
  const closed = new Set<string>();
  const gScores = new Map<string, number>();

  // Use closest goal tile for heuristic
  function bestH(col: number, row: number): number {
    let min = Infinity;
    for (const gt of goalTiles) {
      const h = heuristic({ col, row }, gt);
      if (h < min) min = h;
    }
    return min;
  }

  const startH = bestH(start.col, start.row);
  const startNode: AStarNode = {
    col: start.col,
    row: start.row,
    g: 0,
    h: startH,
    f: startH,
    parent: null,
  };
  open.push(startNode);
  gScores.set(nodeKey(start.col, start.row), 0);

  while (open.length > 0) {
    // Find node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (
        open[i].f < open[bestIdx].f ||
        (open[i].f === open[bestIdx].f && open[i].h < open[bestIdx].h)
      ) {
        bestIdx = i;
      }
    }
    const current = open[bestIdx];
    open.splice(bestIdx, 1);

    const currentKey = nodeKey(current.col, current.row);

    if (goalSet.has(currentKey)) {
      // Reconstruct path
      const path: PathNode[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.push({ col: node.col, row: node.row });
        node = node.parent;
      }
      path.reverse();
      return path;
    }

    closed.add(currentKey);

    const neighbors = tilemap.getNeighbors(current.col, current.row);
    for (const n of neighbors) {
      const nKey = nodeKey(n.col, n.row);
      if (closed.has(nKey)) continue;
      if (!tilemap.isWalkable(n.col, n.row) && !goalSet.has(nKey)) continue;

      // Diagonal movement cost
      const isDiagonal =
        n.col !== current.col && n.row !== current.row;
      const moveCost = isDiagonal ? Math.SQRT2 : 1;

      // Block diagonal if either adjacent cardinal tile is unwalkable (no corner cutting)
      if (isDiagonal) {
        const dc = n.col - current.col;
        const dr = n.row - current.row;
        if (
          !tilemap.isWalkable(current.col + dc, current.row) &&
          !tilemap.isWalkable(current.col, current.row + dr)
        ) {
          continue;
        }
      }

      const tentativeG = current.g + moveCost;
      const existingG = gScores.get(nKey);

      if (existingG !== undefined && tentativeG >= existingG) continue;

      gScores.set(nKey, tentativeG);
      const h = bestH(n.col, n.row);
      const newNode: AStarNode = {
        col: n.col,
        row: n.row,
        g: tentativeG,
        h,
        f: tentativeG + h,
        parent: current,
      };

      // Remove existing open node if any
      const existingIdx = open.findIndex(
        (o) => o.col === n.col && o.row === n.row
      );
      if (existingIdx !== -1) {
        open.splice(existingIdx, 1);
      }
      open.push(newNode);
    }
  }

  return []; // No path found
}
