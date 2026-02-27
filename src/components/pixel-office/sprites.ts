// Character sprite system — chibi RPG style
// Reference: top-heavy mushroom silhouette, 1px black outline,
// hair covers forehead, short legs, shoes extend forward
// ~18 wide x 24 tall

export type SpriteData = string[][];

// Template keys
const _ = "";   // transparent
const X = "X";  // outline (black)
const H = "H";  // hair base
const Hd = "Hd"; // hair dark
const Hl = "Hl"; // hair highlight
const K = "K";  // skin base
const Kd = "Kd"; // skin shadow
const S = "S";  // shirt base
const Sd = "Sd"; // shirt shadow
const Sl = "Sl"; // shirt accent
const P = "P";  // pants base
const Pd = "Pd"; // pants shadow
const O = "O";  // shoes
const E = "E";  // eye white
const Ep = "Ep"; // eye pupil

export interface CharPalette {
  skin: string;
  skinShadow: string;
  shirt: string;
  shirtShadow: string;
  shirtAccent: string;
  pants: string;
  pantsShadow: string;
  hair: string;
  hairDark: string;
  hairLight: string;
  shoes: string;
  outline: string;
  eyeWhite: string;
  eyePupil: string;
}

export const PALETTES: Record<string, CharPalette> = {
  nyx: {
    skin: "#d8c0f0",
    skinShadow: "#b89dd8",
    shirt: "#5b21b6",
    shirtShadow: "#3b0f80",
    shirtAccent: "#7c3aed",
    pants: "#1e1040",
    pantsShadow: "#140a2a",
    hair: "#4c1d95",
    hairDark: "#2e1065",
    hairLight: "#7c3aed",
    shoes: "#0f0a1a",
    outline: "#111111",
    eyeWhite: "#ffffff",
    eyePupil: "#111111",
  },
  hemera: {
    skin: "#fce4b8",
    skinShadow: "#e0c090",
    shirt: "#d97706",
    shirtShadow: "#b45f04",
    shirtAccent: "#fbbf24",
    pants: "#5c3310",
    pantsShadow: "#40200a",
    hair: "#f59e0b",
    hairDark: "#d97706",
    hairLight: "#fcd34d",
    shoes: "#3a1a08",
    outline: "#111111",
    eyeWhite: "#ffffff",
    eyePupil: "#111111",
  },
};

function resolve(template: string[][], palette: CharPalette): SpriteData {
  return template.map((row) =>
    row.map((cell) => {
      if (cell === _) return "";
      if (cell === X) return palette.outline;
      if (cell === H) return palette.hair;
      if (cell === Hd) return palette.hairDark;
      if (cell === Hl) return palette.hairLight;
      if (cell === K) return palette.skin;
      if (cell === Kd) return palette.skinShadow;
      if (cell === S) return palette.shirt;
      if (cell === Sd) return palette.shirtShadow;
      if (cell === Sl) return palette.shirtAccent;
      if (cell === P) return palette.pants;
      if (cell === Pd) return palette.pantsShadow;
      if (cell === O) return palette.shoes;
      if (cell === E) return palette.eyeWhite;
      if (cell === Ep) return palette.eyePupil;
      return cell;
    })
  );
}

function flipH(template: string[][]): string[][] {
  return template.map((row) => [...row].reverse());
}

// ═══════════════════════════════════════════════════════════
// TEMPLATES — 18 wide x 24 tall
// Mushroom silhouette: big round head (hair covers forehead),
// rectangular torso, short legs, shoes wider than legs
// ═══════════════════════════════════════════════════════════

// Front-facing standing
const IDLE_DOWN: string[][] = [
  // -- Hair top (rows 0-3) --
  [_,_,_,_,_,X,X,X,X,X,X,X,X,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,H,Hl,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,Hl,H,H,Hl,H,H,H,X,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_,_],
  // -- Hair sides + forehead covered (rows 4-5) --
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_],
  [_,_,X,H,H,Hd,H,H,H,H,H,H,Hd,H,H,X,_,_],
  // -- Face: eyes (row 6) — hair still on sides --
  [_,_,X,H,Hd,K,K,E,Ep,K,K,Ep,E,K,Hd,H,X,_],
  // -- Face: cheeks (rows 7-8) --
  [_,_,X,H,Hd,K,K,K,K,K,K,K,K,K,Hd,H,X,_],
  [_,_,_,X,H,Kd,K,K,K,K,K,K,K,Kd,H,X,_,_],
  // -- Chin (row 9) --
  [_,_,_,_,X,Hd,Kd,K,K,K,K,Kd,Hd,X,_,_,_,_],
  // -- Neck (row 10) --
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  // -- Shoulders + shirt (rows 11-12) --
  [_,_,_,_,_,X,S,S,Sl,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_,_],
  // -- Torso + arms (rows 13-14): arms protrude, skin below sleeves --
  [_,_,_,X,K,X,S,S,Sd,Sd,S,S,X,K,X,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,Sd,Sd,S,X,K,X,_,_,_],
  // -- Waist (row 15) --
  [_,_,_,_,X,X,Sd,Sd,Sd,Sd,Sd,Sd,X,X,_,_,_,_],
  // -- Pants (rows 16-18): short, separated by gap --
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  // -- Shoes (rows 19-20): wider than legs, extend forward --
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  // -- Padding --
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Walk step left
const WALK_DOWN_L: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,X,X,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,H,Hl,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,Hl,H,H,Hl,H,H,H,X,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_,_],
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_],
  [_,_,X,H,H,Hd,H,H,H,H,H,H,Hd,H,H,X,_,_],
  [_,_,X,H,Hd,K,K,E,Ep,K,K,Ep,E,K,Hd,H,X,_],
  [_,_,X,H,Hd,K,K,K,K,K,K,K,K,K,Hd,H,X,_],
  [_,_,_,X,H,Kd,K,K,K,K,K,K,K,Kd,H,X,_,_],
  [_,_,_,_,X,Hd,Kd,K,K,K,K,Kd,Hd,X,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,Sl,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_,_],
  [_,_,_,X,K,X,S,S,Sd,Sd,S,S,X,K,X,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,Sd,Sd,S,X,K,X,_,_,_],
  [_,_,_,_,X,X,Sd,Sd,Sd,Sd,Sd,Sd,X,X,_,_,_,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,X,P,P,X,_,_,X,P,P,X,_,_,_,_],
  [_,_,_,X,P,Pd,X,_,_,_,X,Pd,P,X,_,_,_,_],
  [_,_,X,O,O,O,X,_,_,_,_,X,O,O,X,_,_,_],
  [_,_,X,X,X,X,_,_,_,_,_,X,X,X,X,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const WALK_DOWN_R: string[][] = WALK_DOWN_L.map(row => [...row].reverse());

// Typing frame 1 — shifted down 1px, arms reach forward
const TYPE_1: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,X,X,X,X,X,X,X,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,H,Hl,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,Hl,H,H,Hl,H,H,H,X,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_,_],
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_],
  [_,_,X,H,H,Hd,H,H,H,H,H,H,Hd,H,H,X,_,_],
  [_,_,X,H,Hd,K,K,E,Ep,K,K,Ep,E,K,Hd,H,X,_],
  [_,_,X,H,Hd,K,K,K,K,K,K,K,K,K,Hd,H,X,_],
  [_,_,_,X,H,Kd,K,K,K,K,K,K,K,Kd,H,X,_,_],
  [_,_,_,_,X,Hd,Kd,K,K,K,K,Kd,Hd,X,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,Sl,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_,_],
  [_,_,X,K,X,S,S,S,Sd,Sd,S,S,S,X,K,X,_,_],
  [_,X,K,K,X,S,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X,_],
  [_,X,X,X,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,X,X,X,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Typing frame 2 — one arm slightly higher
const TYPE_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,X,X,X,X,X,X,X,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,H,Hl,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,Hl,H,H,Hl,H,H,H,X,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_,_],
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_],
  [_,_,X,H,H,Hd,H,H,H,H,H,H,Hd,H,H,X,_,_],
  [_,_,X,H,Hd,K,K,E,Ep,K,K,Ep,E,K,Hd,H,X,_],
  [_,_,X,H,Hd,K,K,K,K,K,K,K,K,K,Hd,H,X,_],
  [_,_,_,X,H,Kd,K,K,K,K,K,K,K,Kd,H,X,_,_],
  [_,_,_,_,X,Hd,Kd,K,K,K,K,Kd,Hd,X,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,Sl,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_,_],
  [_,X,K,X,X,S,S,S,Sd,Sd,S,S,S,X,K,X,_,_],
  [_,_,X,K,X,S,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X,_],
  [_,_,_,X,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,X,X,X,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Right-facing standing
const WALK_RIGHT_STAND: string[][] = [
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,H,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,Hd,Hd,Hd,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,Hd,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,_,X,Hd,K,K,K,E,Ep,K,Hd,H,X,_,_,_,_],
  [_,_,_,X,Hd,K,K,K,K,K,K,Hd,H,X,_,_,_,_],
  [_,_,_,_,X,Kd,K,K,K,K,Kd,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,Kd,K,K,Kd,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,Sl,S,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_,_],
  [_,_,_,_,X,X,Sd,Sd,Sd,Sd,X,X,_,_,_,_,_],
  [_,_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,X,X,P,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,Pd,X,X,Pd,X,_,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_,_,_],
  [_,_,_,_,X,X,X,_,X,X,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Right-facing walk step
const WALK_RIGHT_STEP: string[][] = [
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,H,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,Hd,Hd,Hd,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,Hd,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,_,X,Hd,K,K,K,E,Ep,K,Hd,H,X,_,_,_,_],
  [_,_,_,X,Hd,K,K,K,K,K,K,Hd,H,X,_,_,_,_],
  [_,_,_,_,X,Kd,K,K,K,K,Kd,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,Kd,K,K,Kd,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,Sl,S,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_,_],
  [_,_,_,_,X,X,Sd,Sd,Sd,Sd,X,X,_,_,_,_,_],
  [_,_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_,_],
  [_,_,_,X,P,Pd,X,_,X,Pd,P,X,_,_,_,_,_],
  [_,_,X,O,O,O,X,_,X,O,O,O,X,_,_,_,_,_],
  [_,_,X,X,X,X,_,_,_,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── SPRITE SET BUILDER ──────────────────────────────────

export interface CharacterSprites {
  idle: SpriteData;
  walkDown: [SpriteData, SpriteData, SpriteData, SpriteData];
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
  const stand = r(IDLE_DOWN);

  const sprites: CharacterSprites = {
    idle: stand,
    walkDown: [r(WALK_DOWN_L), stand, r(WALK_DOWN_R), stand],
    walkRight: [r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND), r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND)],
    walkLeft: [
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
    ],
    typing: [r(TYPE_1), r(TYPE_2)],
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
