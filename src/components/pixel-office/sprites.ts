// Pixel art sprite data — each sprite is a 16x16 grid of color indices
// Colors are defined per-sprite palette

export type SpriteData = {
  width: number;
  height: number;
  palette: string[];
  frames: Record<string, number[][]>;
};

const T = 0; // transparent

// NYX — dark/purple theme, goddess of night
export const nyxSprite: SpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#1a1030",     // 1 - dark purple body
    "#2d1b69",     // 2 - purple robe
    "#7c3aed",     // 3 - bright purple accent
    "#a78bfa",     // 4 - light purple glow
    "#e0d0ff",     // 5 - pale skin
    "#c4b5fd",     // 6 - light purple hair
    "#0f0a1a",     // 7 - very dark outline
    "#4c1d95",     // 8 - mid purple
    "#ffffff",     // 9 - white eyes
    "#6d28d9",     // 10 - purple mid
  ],
  frames: {
    idle: [
      [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
      [T,T,T,T,T,6,6,6,6,6,6,T,T,T,T,T],
      [T,T,T,T,6,6,6,6,6,6,6,6,T,T,T,T],
      [T,T,T,T,7,7,7,7,7,7,7,7,T,T,T,T],
      [T,T,T,7,5,5,9,5,5,9,5,5,7,T,T,T],
      [T,T,T,7,5,5,3,5,5,3,5,5,7,T,T,T],
      [T,T,T,7,5,5,5,5,5,5,5,5,7,T,T,T],
      [T,T,T,T,7,5,5,4,4,5,5,7,T,T,T,T],
      [T,T,T,T,T,7,7,7,7,7,7,T,T,T,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,2,2,8,2,2,2,2,8,2,2,T,T,T],
      [T,T,2,2,2,8,2,3,3,2,8,2,2,2,T,T],
      [T,T,2,5,2,2,2,2,2,2,2,2,5,2,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,T,T,1,1,T,T,1,1,T,T,T,T,T],
      [T,T,T,T,T,7,7,T,T,7,7,T,T,T,T,T],
    ],
    typing: [
      [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
      [T,T,T,T,T,6,6,6,6,6,6,T,T,T,T,T],
      [T,T,T,T,6,6,6,6,6,6,6,6,T,T,T,T],
      [T,T,T,T,7,7,7,7,7,7,7,7,T,T,T,T],
      [T,T,T,7,5,5,9,5,5,9,5,5,7,T,T,T],
      [T,T,T,7,5,5,3,5,5,3,5,5,7,T,T,T],
      [T,T,T,7,5,5,5,5,5,5,5,5,7,T,T,T],
      [T,T,T,T,7,5,5,5,5,5,5,7,T,T,T,T],
      [T,T,T,T,T,7,7,7,7,7,7,T,T,T,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,2,2,8,2,2,2,2,8,2,2,T,T,T],
      [T,T,2,2,2,8,2,3,3,2,8,2,2,2,T,T],
      [T,T,5,T,2,2,2,2,2,2,2,2,T,5,T,T],
      [T,5,T,T,2,2,2,2,2,2,2,2,T,T,5,T],
      [T,T,T,T,T,1,1,T,T,1,1,T,T,T,T,T],
      [T,T,T,T,T,7,7,T,T,7,7,T,T,T,T,T],
    ],
  },
};

// HEMERA — warm/golden theme, goddess of day
export const hemeraSprite: SpriteData = {
  width: 16,
  height: 16,
  palette: [
    "transparent", // 0
    "#78350f",     // 1 - dark brown
    "#d97706",     // 2 - amber
    "#fbbf24",     // 3 - gold
    "#fde68a",     // 4 - light gold
    "#fef3c7",     // 5 - pale warm skin
    "#f59e0b",     // 6 - amber hair
    "#451a03",     // 7 - dark outline
    "#b45309",     // 8 - dark amber
    "#ffffff",     // 9 - white eyes
    "#ea580c",     // 10 - orange accent
  ],
  frames: {
    idle: [
      [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
      [T,T,T,T,T,6,3,3,3,3,6,T,T,T,T,T],
      [T,T,T,T,6,3,3,4,4,3,3,6,T,T,T,T],
      [T,T,T,T,7,7,7,7,7,7,7,7,T,T,T,T],
      [T,T,T,7,5,5,9,5,5,9,5,5,7,T,T,T],
      [T,T,T,7,5,5,2,5,5,2,5,5,7,T,T,T],
      [T,T,T,7,5,5,5,5,5,5,5,5,7,T,T,T],
      [T,T,T,T,7,5,5,3,3,5,5,7,T,T,T,T],
      [T,T,T,T,T,7,7,7,7,7,7,T,T,T,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,2,2,8,2,2,2,2,8,2,2,T,T,T],
      [T,T,2,2,2,8,2,3,3,2,8,2,2,2,T,T],
      [T,T,2,5,2,2,2,2,2,2,2,2,5,2,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,T,T,1,1,T,T,1,1,T,T,T,T,T],
      [T,T,T,T,T,7,7,T,T,7,7,T,T,T,T,T],
    ],
    typing: [
      [T,T,T,T,T,T,6,6,6,6,T,T,T,T,T,T],
      [T,T,T,T,T,6,3,3,3,3,6,T,T,T,T,T],
      [T,T,T,T,6,3,3,4,4,3,3,6,T,T,T,T],
      [T,T,T,T,7,7,7,7,7,7,7,7,T,T,T,T],
      [T,T,T,7,5,5,9,5,5,9,5,5,7,T,T,T],
      [T,T,T,7,5,5,2,5,5,2,5,5,7,T,T,T],
      [T,T,T,7,5,5,5,5,5,5,5,5,7,T,T,T],
      [T,T,T,T,7,5,5,5,5,5,5,7,T,T,T,T],
      [T,T,T,T,T,7,7,7,7,7,7,T,T,T,T,T],
      [T,T,T,T,2,2,2,2,2,2,2,2,T,T,T,T],
      [T,T,T,2,2,8,2,2,2,2,8,2,2,T,T,T],
      [T,T,2,2,2,8,2,3,3,2,8,2,2,2,T,T],
      [T,T,5,T,2,2,2,2,2,2,2,2,T,5,T,T],
      [T,5,T,T,2,2,2,2,2,2,2,2,T,T,5,T],
      [T,T,T,T,T,1,1,T,T,1,1,T,T,T,T,T],
      [T,T,T,T,T,7,7,T,T,7,7,T,T,T,T,T],
    ],
  },
};

// Office furniture sprites
export const deskSprite: SpriteData = {
  width: 24,
  height: 12,
  palette: [
    "transparent", // 0
    "#1c1412",     // 1 - very dark wood
    "#2d1f14",     // 2 - dark wood
    "#44301e",     // 3 - medium wood
    "#5c4028",     // 4 - wood
    "#3a3a3a",     // 5 - monitor dark
    "#4a4a4a",     // 6 - monitor mid
    "#1a1a2e",     // 7 - screen dark
    "#16213e",     // 8 - screen
    "#3b82f6",     // 9 - screen glow
    "#60a5fa",     // 10 - screen highlight
  ],
  frames: {
    default: [
      [T,T,T,T,T,T,5,5,5,5,5,5,5,5,5,5,5,5,T,T,T,T,T,T],
      [T,T,T,T,T,T,5,7,8,8,9,8,8,9,8,8,7,5,T,T,T,T,T,T],
      [T,T,T,T,T,T,5,7,8,9,10,8,9,10,8,8,7,5,T,T,T,T,T,T],
      [T,T,T,T,T,T,5,7,8,8,8,8,8,8,8,8,7,5,T,T,T,T,T,T],
      [T,T,T,T,T,T,5,5,5,5,5,5,5,5,5,5,5,5,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,5,6,6,5,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,T,T],
      [T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T],
      [T,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,T],
      [T,2,2,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,2,2,T],
      [T,2,2,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,2,2,T],
      [T,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,1,1,T],
    ],
  },
};

// Coffee machine
export const coffeeSprite: SpriteData = {
  width: 8,
  height: 10,
  palette: [
    "transparent", // 0
    "#1a1a1a",     // 1 - dark metal
    "#2a2a2a",     // 2 - metal
    "#3a3a3a",     // 3 - light metal
    "#ef4444",     // 4 - red light
    "#7c2d12",     // 5 - coffee brown
    "#92400e",     // 6 - light brown
    "#d4d4d4",     // 7 - chrome
  ],
  frames: {
    default: [
      [T,1,1,1,1,1,1,T],
      [T,1,2,2,2,2,1,T],
      [T,1,2,4,4,2,1,T],
      [T,1,2,2,2,2,1,T],
      [T,1,3,3,3,3,1,T],
      [T,1,T,5,5,T,1,T],
      [T,1,T,6,6,T,1,T],
      [1,1,1,1,1,1,1,1],
      [1,7,7,7,7,7,7,1],
      [1,1,1,1,1,1,1,1],
    ],
  },
};

// Plant
export const plantSprite: SpriteData = {
  width: 8,
  height: 10,
  palette: [
    "transparent", // 0
    "#14532d",     // 1 - dark green
    "#166534",     // 2 - green
    "#22c55e",     // 3 - bright green
    "#4ade80",     // 4 - light green
    "#78350f",     // 5 - pot dark
    "#92400e",     // 6 - pot
    "#a16207",     // 7 - pot light
  ],
  frames: {
    default: [
      [T,T,T,3,4,T,T,T],
      [T,T,3,2,3,4,T,T],
      [T,3,2,1,2,3,4,T],
      [T,T,3,2,1,2,T,T],
      [T,3,4,2,2,3,4,T],
      [T,T,3,1,2,3,T,T],
      [T,T,T,2,2,T,T,T],
      [T,T,5,6,6,5,T,T],
      [T,T,5,6,6,5,T,T],
      [T,T,5,5,5,5,T,T],
    ],
  },
};

export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  frame: string,
  x: number,
  y: number,
  scale: number = 3
) {
  const data = sprite.frames[frame];
  if (!data) return;

  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const colorIdx = data[row][col];
      if (colorIdx === 0) continue; // transparent
      const color = sprite.palette[colorIdx];
      if (!color || color === "transparent") continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        x + col * scale,
        y + row * scale,
        scale,
        scale
      );
    }
  }
}
