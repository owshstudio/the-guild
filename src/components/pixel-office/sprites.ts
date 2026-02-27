// Character sprite system — template-based with palette swapping
// Inspired by Pixel Agents: 16x24 sprites with placeholder keys

export type SpriteData = string[][];

// Template keys
const _ = "";  // transparent
const H = "H"; // hair
const K = "K"; // skin
const S = "S"; // shirt
const P = "P"; // pants
const O = "O"; // shoes
const E = "#FFFFFF"; // eye whites

// Palette definition
export interface CharPalette {
  skin: string;
  shirt: string;
  pants: string;
  hair: string;
  shoes: string;
  accent?: string; // optional shirt detail
}

// ── PALETTES ──────────────────────────────────────────────

export const PALETTES: Record<string, CharPalette> = {
  nyx: {
    skin: "#e0d0ff",
    shirt: "#4c1d95",
    pants: "#1a1030",
    hair: "#2d1b69",
    shoes: "#0f0a1a",
    accent: "#7c3aed",
  },
  hemera: {
    skin: "#fef3c7",
    shirt: "#d97706",
    pants: "#78350f",
    hair: "#f59e0b",
    shoes: "#451a03",
    accent: "#fbbf24",
  },
};

// ── RESOLVE TEMPLATE → SPRITE DATA ──────────────────────

function resolve(template: string[][], palette: CharPalette): SpriteData {
  return template.map((row) =>
    row.map((cell) => {
      if (cell === _) return "";
      if (cell === E) return E;
      if (cell === H) return palette.hair;
      if (cell === K) return palette.skin;
      if (cell === S) return palette.shirt;
      if (cell === P) return palette.pants;
      if (cell === O) return palette.shoes;
      return cell;
    })
  );
}

function flipH(template: string[][]): string[][] {
  return template.map((row) => [...row].reverse());
}

// ── CHARACTER TEMPLATES (16x24) ─────────────────────────
// Front-facing (down) — walk cycle: 3 unique frames (1, 2=stand, 3=mirror)

const WALK_DOWN_STAND: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const WALK_DOWN_STEP_L: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,P,P,_,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,P,P,_,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,O,O,_,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,O,O,_,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const WALK_DOWN_STEP_R: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,O,O,_,_,_,_,_,_,P,P,_,_,_],
  [_,_,_,O,O,_,_,_,_,_,_,P,P,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,O,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,O,O,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Typing (sitting, front-facing) — 2 frames
const TYPE_DOWN_1: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,K,K,S,S,S,S,S,S,K,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const TYPE_DOWN_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,K,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,_,K,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Idle sitting (front-facing, hands at side)
const IDLE_DOWN: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,_,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,H,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,E,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,S,S,S,S,S,S,S,S,_,_,_,_],
  [_,_,_,_,K,S,S,S,S,S,S,K,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,P,P,P,P,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Right-facing walk
const WALK_RIGHT_STAND: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,K,S,S,S,S,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,P,P,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,_,P,P,_,_,_,_,_],
  [_,_,_,_,_,_,O,O,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,O,O,_,O,O,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const WALK_RIGHT_STEP: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,H,H,H,H,H,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,E,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,K,_,_,_,_,_],
  [_,_,_,_,_,_,K,K,K,K,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,S,S,S,S,S,S,_,_,_,_,_],
  [_,_,_,_,_,K,S,S,S,S,K,_,_,_,_,_],
  [_,_,_,_,_,_,S,S,S,S,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,P,P,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,_,P,P,_,_,_,P,P,_,_,_,_],
  [_,_,_,_,_,O,O,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,_,O,O,_,_,_,_,O,O,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── SPRITE SET BUILDER ──────────────────────────────────

export interface CharacterSprites {
  idle: SpriteData;
  walkDown: [SpriteData, SpriteData, SpriteData, SpriteData]; // step_l, stand, step_r, stand
  walkRight: [SpriteData, SpriteData, SpriteData, SpriteData];
  walkLeft: [SpriteData, SpriteData, SpriteData, SpriteData];
  typing: [SpriteData, SpriteData];
}

const spriteCache = new Map<string, CharacterSprites>();

export function getCharacterSprites(paletteId: string): CharacterSprites {
  const cached = spriteCache.get(paletteId);
  if (cached) return cached;

  const pal = PALETTES[paletteId];
  if (!pal) throw new Error(`Unknown palette: ${paletteId}`);

  const r = (t: string[][]) => resolve(t, pal);

  const sprites: CharacterSprites = {
    idle: r(IDLE_DOWN),
    walkDown: [r(WALK_DOWN_STEP_L), r(WALK_DOWN_STAND), r(WALK_DOWN_STEP_R), r(WALK_DOWN_STAND)],
    walkRight: [r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND), r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND)],
    walkLeft: [
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
    ],
    typing: [r(TYPE_DOWN_1), r(TYPE_DOWN_2)],
  };

  spriteCache.set(paletteId, sprites);
  return sprites;
}

// ── RENDERER ──────────────────────────────────────────────

export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  x: number,
  y: number,
  scale: number = 3
) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
