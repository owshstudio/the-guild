// Character sprite system — template-based with palette swapping
// Style reference: chibi RPG sprites with black outlines, 2-3 tone shading
// ~18x30 sprites with 1:1.2 head:body ratio

export type SpriteData = string[][];

// Template keys
const _ = "";   // transparent
const X = "X";  // outline (black)
const H = "H";  // hair base
const Hd = "Hd"; // hair dark/shadow
const Hl = "Hl"; // hair light/highlight
const K = "K";  // skin base
const Kd = "Kd"; // skin shadow
const S = "S";  // shirt base
const Sd = "Sd"; // shirt shadow
const Sl = "Sl"; // shirt highlight/accent
const P = "P";  // pants base
const Pd = "Pd"; // pants shadow
const O = "O";  // shoes base
const E = "E";  // eye white
const Ep = "Ep"; // eye pupil (black)

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

// ── PALETTES ──────────────────────────────────────────────

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
    outline: "#1a1025",
    eyeWhite: "#ffffff",
    eyePupil: "#1a1025",
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
    outline: "#2a1a0a",
    eyeWhite: "#ffffff",
    eyePupil: "#2a1a0a",
  },
};

// ── RESOLVE TEMPLATE → PIXEL COLORS ─────────────────────

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

// ── CHARACTER TEMPLATES (18 wide x 30 tall) ─────────────
// Chibi proportions: big head (~13px), small body (~17px)
// Full black outline around every form
// 2-3 tone shading on hair, clothes, skin

// NYX: messy medium-length dark purple hair, falls to sides
// HEMERA: long flowing golden hair past shoulders

// Front-facing idle/standing
const IDLE_DOWN: string[][] = [
  // Row 0-1: top of hair
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,Hl,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,Hl,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,Hd,Hd,Hd,Hd,H,H,X,_,_,_,_],
  // Row 5: forehead + hair sides
  [_,_,_,X,H,H,X,K,K,K,K,X,H,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  // Row 7: eyes
  [_,_,_,X,H,X,K,E,Ep,K,E,Ep,X,H,X,_,_,_],
  // Row 8: nose area
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  // Row 9: mouth
  [_,_,_,_,X,X,K,K,Kd,Kd,K,K,X,X,_,_,_,_],
  // Row 10: chin
  [_,_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_,_],
  // Row 11: neck
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  // Row 12: shoulders
  [_,_,_,_,_,X,X,S,S,S,S,X,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,Sl,Sl,S,S,S,X,_,_,_,_],
  // Row 14: torso
  [_,_,_,X,K,X,S,S,S,S,S,S,X,K,X,_,_,_],
  [_,_,_,X,K,X,S,S,Sd,Sd,S,S,X,K,X,_,_,_],
  // Row 16: lower torso / hands
  [_,_,_,X,K,X,S,Sd,Sd,Sd,Sd,S,X,K,X,_,_,_],
  [_,_,_,_,X,X,S,Sd,Sd,Sd,Sd,S,X,X,_,_,_,_],
  // Row 18: belt area
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  // Row 19-22: legs
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_],
  // Row 24-25: shoes
  [_,_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  // Row 27-29: padding
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Walk step left (front-facing)
const WALK_DOWN_L: string[][] = [
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,Hl,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,Hl,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,Hd,Hd,Hd,Hd,H,H,X,_,_,_,_],
  [_,_,_,X,H,H,X,K,K,K,K,X,H,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,E,Ep,K,E,Ep,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,_,X,X,K,K,Kd,Kd,K,K,X,X,_,_,_,_],
  [_,_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,X,S,S,S,S,X,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,Sl,Sl,S,S,S,X,_,_,_,_],
  [_,_,_,X,K,X,S,S,S,S,S,S,X,K,X,_,_,_],
  [_,_,_,X,K,X,S,S,Sd,Sd,S,S,X,K,X,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,Sd,Sd,S,X,K,X,_,_,_],
  [_,_,_,_,X,X,S,Sd,Sd,Sd,Sd,S,X,X,_,_,_,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,X,P,P,X,_,_,X,P,P,X,_,_,_,_],
  [_,_,_,_,X,P,Pd,X,_,_,X,Pd,P,X,_,_,_,_],
  [_,_,_,X,P,Pd,X,_,_,_,_,X,Pd,P,X,_,_,_],
  [_,_,_,X,O,O,X,_,_,_,_,X,O,O,X,_,_,_],
  [_,_,X,O,O,O,X,_,_,_,_,_,X,O,X,_,_,_],
  [_,_,X,X,X,X,_,_,_,_,_,_,X,X,X,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Walk step right = mirror of left
const WALK_DOWN_R: string[][] = WALK_DOWN_L.map(row => [...row].reverse());

// Typing frame 1 — arms forward on desk
const TYPE_1: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,Hl,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,Hl,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,Hd,Hd,Hd,Hd,H,H,X,_,_,_,_],
  [_,_,_,X,H,H,X,K,K,K,K,X,H,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,E,Ep,K,E,Ep,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,_,X,X,K,K,Kd,Kd,K,K,X,X,_,_,_,_],
  [_,_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,X,S,S,S,S,X,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,Sl,Sl,S,S,S,X,_,_,_,_],
  [_,_,_,X,S,S,S,S,S,S,S,S,S,S,X,_,_,_],
  [_,_,X,K,X,S,S,Sd,Sd,Sd,Sd,S,S,X,K,X,_,_],
  [_,X,K,K,X,S,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X,_],
  [_,X,K,X,_,X,X,X,X,X,X,X,X,_,X,K,X,_],
  [_,_,X,_,_,X,P,P,P,P,P,P,X,_,_,X,_,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Typing frame 2 — slight arm shift
const TYPE_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,Hl,Hl,H,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,X,Hl,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,X,H,H,Hd,Hd,Hd,Hd,H,H,X,_,_,_,_],
  [_,_,_,X,H,H,X,K,K,K,K,X,H,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,E,Ep,K,E,Ep,X,H,X,_,_,_],
  [_,_,_,X,H,X,K,K,K,K,K,K,X,H,X,_,_,_],
  [_,_,_,_,X,X,K,K,Kd,Kd,K,K,X,X,_,_,_,_],
  [_,_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,X,S,S,S,S,X,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,Sl,Sl,S,S,S,X,_,_,_,_],
  [_,_,_,X,S,S,S,S,S,S,S,S,S,S,X,_,_,_],
  [_,_,_,X,K,X,S,Sd,Sd,Sd,Sd,S,X,K,X,_,_,_],
  [_,X,K,K,X,S,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X,_],
  [_,X,K,X,_,X,X,X,X,X,X,X,X,_,X,K,X,_],
  [_,_,X,_,_,X,P,P,P,P,P,P,X,_,_,X,_,_],
  [_,_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,P,Pd,X,X,Pd,P,X,_,_,_,_,_],
  [_,_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Right-facing standing
const WALK_RIGHT_STAND: string[][] = [
  [_,_,_,_,_,_,_,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,H,Hl,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,Hd,Hd,Hd,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,E,Ep,X,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,K,K,X,H,X,_,_,_,_],
  [_,_,_,_,_,_,X,K,Kd,K,K,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,X,S,S,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,S,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_],
  [_,_,_,_,_,X,X,S,Sd,Sd,S,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,X,P,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,X,X,Pd,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,X,X,Pd,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,O,X,X,O,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,_,X,X,X,_,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Right-facing walk step
const WALK_RIGHT_STEP: string[][] = [
  [_,_,_,_,_,_,_,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,H,Hl,H,H,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,Hd,Hd,Hd,H,H,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,E,Ep,X,H,X,_,_,_,_],
  [_,_,_,_,_,X,K,K,K,K,K,X,H,X,_,_,_,_],
  [_,_,_,_,_,_,X,K,Kd,K,K,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,X,S,S,X,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,S,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_],
  [_,_,_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_],
  [_,_,_,_,_,X,X,S,Sd,Sd,S,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,_,X,P,P,P,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,X,P,P,X,_,_,_,_,_],
  [_,_,_,_,X,P,Pd,X,_,X,Pd,P,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,_,_,X,O,O,X,_,_,_,_],
  [_,_,_,X,O,O,X,_,_,_,_,X,O,X,_,_,_,_],
  [_,_,_,X,X,X,_,_,_,_,_,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
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

  const walkDownStand = r(IDLE_DOWN);
  const sprites: CharacterSprites = {
    idle: r(IDLE_DOWN),
    walkDown: [r(WALK_DOWN_L), walkDownStand, r(WALK_DOWN_R), walkDownStand],
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
