// Character sprite system — chibi RPG style
// 16 wide x 24 tall, traced from reference art
// Pattern: dome hair (4-5 rows) → face (4 rows) → neck (1) → torso (6-7) → legs (4-5) → shoes (3)

export type SpriteData = string[][];

const _ = "";
const X = "X";     // outline (default dark — shoes only)
const Xh = "Xh";   // outline hair (1 shade darker than hair mid)
const Xk = "Xk";   // outline skin (1 shade darker than skin mid)
const Xs = "Xs";    // outline shirt (1 shade darker than shirt mid)
const Xp = "Xp";   // outline pants (1 shade darker than pants mid)
const Xl = "Xl";    // outline light (lighter outline for top/light-hit edges)
const H = "H";     // hair base
const Hd = "Hd";   // hair dark
const Hl = "Hl";   // hair light
const K = "K";     // skin
const Kd = "Kd";   // skin shadow
const S = "S";     // shirt
const Sd = "Sd";   // shirt shadow
const Sl = "Sl";   // shirt light/accent
const P = "P";     // pants
const Pd = "Pd";   // pants shadow
const O = "O";     // shoes
const E = "E";     // eye white
const Ep = "Ep";   // eye pupil
const N = "N";     // nose (subtle skin-shadow blend)
const M = "M";     // mouth (warm shadow)
const Eb = "Eb";   // eyebrow (reuses hairDark)

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
  outlineHair: string;
  outlineSkin: string;
  outlineShirt: string;
  outlinePants: string;
  outlineLight: string;
  eyeWhite: string;
  eyePupil: string;
  nose: string;
  mouth: string;
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
    shoes: "#1a1025",
    outline: "#111111",
    outlineHair: "#3b0f80",
    outlineSkin: "#a888c0",
    outlineShirt: "#2e1065",
    outlinePants: "#140a2a",
    outlineLight: "#3a2050",
    eyeWhite: "#ffffff",
    eyePupil: "#111111",
    nose: "#c4aae0",
    mouth: "#b89dd8",
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
    outlineHair: "#b87a06",
    outlineSkin: "#d0a870",
    outlineShirt: "#a03808",
    outlinePants: "#2a1808",
    outlineLight: "#4a3010",
    eyeWhite: "#ffffff",
    eyePupil: "#111111",
    nose: "#ecd4a0",
    mouth: "#e0c090",
  },
};

function resolve(template: string[][], palette: CharPalette): SpriteData {
  return template.map((row) =>
    row.map((cell) => {
      if (cell === _) return "";
      if (cell === X) return palette.outline;
      if (cell === Xh) return palette.outlineHair;
      if (cell === Xk) return palette.outlineSkin;
      if (cell === Xs) return palette.outlineShirt;
      if (cell === Xp) return palette.outlinePants;
      if (cell === Xl) return palette.outlineLight;
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
      if (cell === N) return palette.nose;
      if (cell === M) return palette.mouth;
      if (cell === Eb) return palette.hairDark; // eyebrow reuses hairDark
      return cell;
    })
  );
}

function flipH(template: string[][]): string[][] {
  return template.map((row) => [...row].reverse());
}

// ═══════════════════════════════════════════════════════════
// FRONT-FACING IDLE (16 x 24)
// Selective outlines: Xh for hair edges, Xk for skin, Xs for shirt, Xp for pants
// Xl for top crown (light-hit edge)
// Facial features: Eb eyebrows, N nose, M mouth
// ═══════════════════════════════════════════════════════════

const IDLE_DOWN: string[][] = [
  //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],           // 0  hair top — light outline
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],            // 1  hair
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],           // 2  hair widens
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],             // 3  hair full width
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],   // 4  hair bottom/brow line
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],            // 5  face top — eyebrows
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],            // 6  eyes
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],            // 7  nose
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],         // 8  mouth/chin
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],               // 9  neck
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],                // 10 shirt collar
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],             // 11 shirt
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],               // 12 shirt widens
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],          // 13 arms + shirt
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],        // 14 arms + shirt shadow
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],        // 15 shirt bottom
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],         // 16 waist
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],               // 17 pants top
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],            // 18 legs split
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],            // 19 legs
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],          // 20 legs dark
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],                  // 21 shoes top
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],                  // 22 shoes
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],                  // 23 shoe soles
];

// ── IDLE BREATH VARIANTS (4-phase) ──────────────────────
// Phase 0: Normal (IDLE_DOWN)
// Phase 1: Torso shadow expands (shirt shadow widens 1px)
const IDLE_BREATH_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,Sd,S,S,Sd,S,S,Xs,_,_,_],              // shadow expands
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,Xk,K,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,K,Xk,_,_],      // more shadow
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Phase 2: Shoulders drop (head shifts down 1px effect via torso compression)
const IDLE_BREATH_2: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],               // collar wider — shoulders down
  [_,_,_,Xs,S,S,S,Sl,Sl,S,S,S,Xs,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,Xk,K,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Phase 3: Return transitional (same as phase 1 on way back)
const IDLE_BREATH_3 = IDLE_BREATH_1;

// ── 6-FRAME WALK DOWN ─────────────────────────────────────
// Frame 0: Contact L (left foot forward)
const WALK_DOWN_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,Xp,P,Xp,_,_,Xp,P,Xp,_,_,_,_],
  [_,_,_,Xp,P,Xp,_,_,_,_,Xp,P,Xp,_,_,_],
  [_,_,_,Xp,Pd,Xp,_,_,_,_,Xp,Pd,Xp,_,_,_],
  [_,_,X,O,O,X,_,_,_,_,X,O,O,X,_,_],
  [_,_,X,O,O,X,_,_,_,_,_,X,O,X,_,_],
  [_,_,X,X,X,_,_,_,_,_,_,X,X,_,_,_],
];

// Frame 1: Passing L (legs together, body bob down — blank top row)
const WALK_DOWN_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],                  // blank — bob down
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Frame 2: Push-off L (right foot back, body rising — left arm forward)
const WALK_DOWN_3: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,Xk,K,Xs,S,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],         // left arm forward
  [_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,Xs,S,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,_,Xp,Xp,Xp,P,Xp,_,_,_,_,_],           // right leg back
  [_,_,_,_,_,_,Xp,_,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,X,_,X,X,X,_,_,_,_,_],
];

// Frame 3: Contact R (right foot forward — mirror of frame 0)
const WALK_DOWN_4: string[][] = WALK_DOWN_1.map(row => [...row].reverse());

// Frame 4: Passing R (legs together, body bob down — mirror of frame 1)
const WALK_DOWN_5 = WALK_DOWN_2; // same as passing L — symmetric

// Frame 5: Push-off R (left foot back — mirror of frame 2)
const WALK_DOWN_6: string[][] = WALK_DOWN_3.map(row => [...row].reverse());

// ── 6-FRAME WALK RIGHT ─────────────────────────────────────
// Frame 0: Contact (front foot extended)
const WALK_RIGHT_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,H,Xh,_,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,Eb,K,K,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,E,Ep,K,Hd,H,Xh,_,_,_,_],
  [_,_,Xk,H,K,K,K,N,K,Hd,H,Xk,_,_,_,_],
  [_,_,_,Xk,Kd,K,K,K,Kd,H,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,Sl,S,S,Xs,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,S,Xs,K,Xk,_,_,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,Xp,_,_,_,_,_,_,_],
  [_,_,_,_,Xp,P,Xp,_,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,Xp,P,Xp,_,_,_,Xp,P,Xp,_,_,_,_],
  [_,_,_,Xp,Pd,Xp,_,_,_,Xp,Pd,Xp,_,_,_,_],
  [_,_,X,O,O,X,_,_,X,O,O,X,_,_,_,_],
  [_,_,X,O,O,X,_,_,_,X,O,X,_,_,_,_],
  [_,_,X,X,X,_,_,_,_,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Frame 1: Passing (legs together, bob down)
const WALK_RIGHT_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],                  // blank — bob down
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,H,Xh,_,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,Eb,K,K,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,E,Ep,K,Hd,H,Xh,_,_,_,_],
  [_,_,Xk,H,K,K,K,N,K,Hd,H,Xk,_,_,_,_],
  [_,_,_,Xk,Kd,K,K,K,Kd,H,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,Sl,S,S,Xs,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,S,Xs,Xk,_,_,_,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,Xp,_,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,P,Xp,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,P,Xp,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Pd,Xp,_,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,X,X,_,X,X,X,_,_,_,_,_],
];

// Frame 2: Push-off (back leg pushing, front arm forward)
const WALK_RIGHT_3: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,H,Xh,_,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,Eb,K,K,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,E,Ep,K,Hd,H,Xh,_,_,_,_],
  [_,_,Xk,H,K,K,K,N,K,Hd,H,Xk,_,_,_,_],
  [_,_,_,Xk,Kd,K,K,K,Kd,H,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,Sl,S,S,Xs,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_,_],
  [_,Xk,K,Xs,S,S,Sd,Sd,S,Xs,K,Xk,_,_,_,_],         // front arm forward
  [_,_,Xk,Xs,Sd,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_,_,_],
  [_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,Xp,_,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,P,Xp,_,_,_,_,_,_],
  [_,_,_,_,_,_,Xp,_,Xp,P,Xp,_,_,_,_,_],             // back leg shorter
  [_,_,_,_,_,_,Xp,_,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,X,_,X,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Frame 3: Contact R (mirror)
const WALK_RIGHT_4: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,H,Xh,_,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,Eb,K,K,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,E,Ep,K,Hd,H,Xh,_,_,_,_],
  [_,_,Xk,H,K,K,K,N,K,Hd,H,Xk,_,_,_,_],
  [_,_,_,Xk,Kd,K,K,K,Kd,H,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,Sl,S,S,Xs,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,S,Xs,K,Xk,_,_,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,Xp,_,_,_,_,_,_,_],
  [_,_,_,Xp,P,Xp,_,_,Xp,P,Xp,_,_,_,_,_],           // other leg forward
  [_,_,Xp,P,Xp,_,_,_,_,Xp,P,Xp,_,_,_,_],
  [_,_,Xp,Pd,Xp,_,_,_,_,Xp,Pd,Xp,_,_,_,_],
  [_,_,X,O,O,X,_,_,_,X,O,O,X,_,_,_],
  [_,_,X,O,X,_,_,_,_,X,O,O,X,_,_,_],
  [_,_,X,X,_,_,_,_,_,X,X,X,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// Frame 4: Passing R (bob down — same as frame 1)
const WALK_RIGHT_5 = WALK_RIGHT_2;

// Frame 5: Push-off R (mirror arm)
const WALK_RIGHT_6: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,H,Xh,_,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,H,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,Eb,K,K,H,H,Xh,_,_,_,_],
  [_,_,Xh,H,K,K,E,Ep,K,Hd,H,Xh,_,_,_,_],
  [_,_,Xk,H,K,K,K,N,K,Hd,H,Xk,_,_,_,_],
  [_,_,_,Xk,Kd,K,K,K,Kd,H,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,Sl,S,S,Xs,_,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,S,Xs,K,Xk,_,_,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Xs,K,Xk,_,_,_,_],       // back arm forward
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,Xp,_,_,_,_,_,_,_],
  [_,_,_,_,Xp,P,Xp,_,_,_,_,_,_,_,_,_],               // front leg back
  [_,_,_,Xp,P,Xp,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,Xp,Pd,Xp,_,_,_,_,_,_,_,_,_,_],
  [_,_,X,O,O,X,_,_,_,_,_,_,_,_,_,_],
  [_,_,X,O,O,X,_,_,_,_,_,_,_,_,_,_],
  [_,_,X,X,X,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

// ── 6-FRAME WALK UP (back-facing) ─────────────────────────
// Frame 0: Contact L
const WALK_UP_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,H,H,H,H,H,Xh,_,_,_,_],              // back of hair — no highlights visible
  [_,_,_,Xh,H,H,Hd,H,H,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,Hd,H,H,H,H,H,H,Hd,H,Xh,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,H,Hd,Hd,Hd,Hd,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xk,K,K,K,K,K,K,K,K,Xk,_,_,_],               // back of neck
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,Sd,S,S,Sd,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,Xp,P,Xp,_,_,Xp,P,Xp,_,_,_,_],
  [_,_,_,Xp,P,Xp,_,_,_,_,Xp,P,Xp,_,_,_],
  [_,_,_,Xp,Pd,Xp,_,_,_,_,Xp,Pd,Xp,_,_,_],
  [_,_,X,O,O,X,_,_,_,_,X,O,O,X,_,_],
  [_,_,X,O,O,X,_,_,_,_,_,X,O,X,_,_],
  [_,_,X,X,X,_,_,_,_,_,_,X,X,_,_,_],
];

// Frame 1: Passing L (bob down)
const WALK_UP_2: string[][] = [
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],                  // blank — bob down
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,Hd,H,H,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,Hd,H,H,H,H,H,H,Hd,H,Xh,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,H,Hd,Hd,Hd,Hd,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xk,K,K,K,K,K,K,K,K,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,Sd,S,S,Sd,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Frame 2: Push-off L
const WALK_UP_3: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,H,H,H,H,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,Hd,H,H,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,Hd,H,H,H,H,H,H,Hd,H,Xh,_,_],
  [_,_,Xh,H,H,H,H,H,H,H,H,H,H,Xh,_,_],
  [_,_,Xh,H,H,Hd,Hd,Hd,Hd,Hd,H,H,Xh,_,_,_],
  [_,_,_,Xk,K,K,K,K,K,K,K,K,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,Sd,S,S,Sd,S,S,Xs,_,_,_],
  [_,Xk,K,Xs,S,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],       // left arm forward
  [_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,Xs,S,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,_,Xp,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,_,Xp,_,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,_,X,X,_,X,X,X,_,_,_,_,_],
];

// Frame 3: Contact R (mirror of frame 0)
const WALK_UP_4: string[][] = WALK_UP_1.map(row => [...row].reverse());

// Frame 4: Passing R (same as frame 1)
const WALK_UP_5 = WALK_UP_2;

// Frame 5: Push-off R (mirror of frame 2)
const WALK_UP_6: string[][] = WALK_UP_3.map(row => [...row].reverse());

// ── TYPING FRAMES ─────────────────────────────────────────
// Subtle typing — arms bent at sides, hands alternate slightly
// Frame 1: left hand slightly lower
const TYPE_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],          // arms at sides
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,Xk,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,K,Xk,_,_],     // right hand forward
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Frame 2: right hand slightly lower
const TYPE_2: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],          // arms at sides
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,Xk,K,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,Xk,_,_,_],     // left hand forward
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];


// ── NYX-SPECIFIC IDLE (slimmer torso, longer legs) ──────
// Narrower torso (12px vs 14px), thinner arms
const NYX_IDLE: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],               // narrow collar
  [_,_,_,_,_,Xs,S,Sl,Sl,S,Xs,_,_,_,_,_],             // slim shirt (10px)
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],               // 12px torso
  [_,_,_,Xk,Xs,S,S,Sd,Sd,S,S,Xs,Xk,_,_,_],          // thin arms
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,_,_,_],
  [_,_,_,_,_,Xs,Sd,Sd,Sd,Sd,Xs,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],            // longer legs
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],         // +1 row legs
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// ── HEMERA-SPECIFIC IDLE (broader, rounder) ─────────────
// Full 14px torso, broader shoulders, shorter legs, chunkier shoes
const HEMERA_IDLE: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,S,S,S,S,Xs,_,_,_,_],               // wide collar
  [_,_,_,Xs,S,S,S,Sl,Sl,S,S,S,Xs,_,_,_],             // broad shirt (14px)
  [_,_,Xs,S,S,S,S,S,S,S,S,S,S,Xs,_,_],               // 14px torso
  [_,Xk,K,Xs,S,S,S,Sd,Sd,S,S,S,Xs,K,Xk,_],          // broad arms
  [_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_],
  [_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_],
  [_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_],
  [_,_,_,_,Xp,P,P,P,P,P,P,Xp,_,_,_,_],              // wider pants
  [_,_,_,_,Xp,P,P,Xp,Xp,P,P,Xp,_,_,_,_],
  [_,_,_,_,Xp,P,Xp,_,_,Xp,P,Xp,_,_,_,_],
  [_,_,_,_,Xp,Pd,Xp,_,_,Xp,Pd,Xp,_,_,_,_],
  [_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_],                  // chunky shoes
  [_,_,_,X,O,O,O,X,X,O,O,O,X,_,_,_],
  [_,_,_,X,X,X,X,_,_,X,X,X,X,_,_,_],
];

// ── COFFEE DRINKING (2 frames, arm raised with cup) ─────
// Frame 1: Arm raising cup
const COFFEE_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],       // left arm normal
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,Kd,_,_],      // right hand up
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,Xk,K,Xk,_],     // holding cup
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,X,Sd,X,_],             // cup
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,X,X,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Frame 2: Cup at face level (drinking)
const COFFEE_2: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,X,Sd,X],           // cup at face
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,X,X,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,K,Xk,_,_],             // arm up to face
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,Xk,K,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,Xk,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,_,_,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,_,_,_],
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// ── CONVERSATION (2 frames, slight lean + gesture) ──────
// Frame 1: Slight lean, arm out
const CONVO_1: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],
  [_,Xk,K,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,K,Xk,_,_],     // left arm gesturing out
  [Xk,K,Xk,_,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,_,_,_],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];

// Frame 2: Other arm gesturing
const CONVO_2: string[][] = [
  [_,_,_,_,_,Xl,Xl,Xl,Xl,Xl,Xl,_,_,_,_,_],
  [_,_,_,_,Xh,H,Hl,H,H,Hl,H,Xh,_,_,_,_],
  [_,_,_,Xh,H,H,H,Hl,Hl,H,H,H,Xh,_,_,_],
  [_,_,_,Xh,H,H,H,H,H,H,H,H,Xh,_,_,_],
  [_,_,Xh,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,Xh,_,_],
  [_,_,Xh,H,K,Eb,K,K,K,K,Eb,K,H,Xh,_,_],
  [_,_,Xh,H,K,E,Ep,K,K,Ep,E,K,H,Xh,_,_],
  [_,_,Xk,Hd,K,K,K,N,N,K,K,K,Hd,Xk,_,_],
  [_,_,_,Xk,Hd,Kd,K,M,M,K,Kd,Hd,Xk,_,_,_],
  [_,_,_,_,_,_,Xk,K,K,Xk,_,_,_,_,_,_],
  [_,_,_,_,_,Xs,S,S,S,S,Xs,_,_,_,_,_],
  [_,_,_,_,Xs,S,S,Sl,Sl,S,S,Xs,_,_,_,_],
  [_,_,_,Xs,S,S,S,S,S,S,S,S,Xs,_,_,_],
  [_,_,Xk,K,Xs,S,S,Sd,Sd,S,S,Xs,K,Xk,_,_],
  [_,_,Xk,K,Xs,S,Sd,Sd,Sd,Sd,S,Xs,Xk,K,Xk,_],     // right arm gesturing out
  [_,_,_,Xk,Xs,S,Sd,Sd,Sd,Sd,S,Xs,_,Xk,K,Xk],
  [_,_,_,_,Xs,Sd,Sd,Sd,Sd,Sd,Sd,Xs,_,_,_,_],
  [_,_,_,_,_,Xp,P,P,P,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,P,Xp,Xp,P,Xp,_,_,_,_,_],
  [_,_,_,_,_,Xp,Pd,Xp,Xp,Pd,Xp,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,O,O,X,X,O,O,X,_,_,_,_],
  [_,_,_,_,X,X,X,_,_,X,X,X,_,_,_,_],
];


// ── SPRITE SET ──────────────────────────────────────────
// Per-character idle variants, 6-frame walks, walk-up direction,
// 4-phase breathing, coffee + conversation animations

export interface CharacterSprites {
  idle: SpriteData;
  idleBreath: SpriteData[];       // 4 phases
  walkDown: SpriteData[];         // 6 frames
  walkRight: SpriteData[];        // 6 frames
  walkLeft: SpriteData[];         // 6 frames
  walkUp: SpriteData[];           // 6 frames
  typing: [SpriteData, SpriteData];
  coffee: [SpriteData, SpriteData];
  conversation: [SpriteData, SpriteData];
}

const spriteCache = new Map<string, CharacterSprites>();

export function getCharacterSprites(paletteId: string): CharacterSprites {
  const cached = spriteCache.get(paletteId);
  if (cached) return cached;

  const pal = PALETTES[paletteId];
  if (!pal) throw new Error(`Unknown palette: ${paletteId}`);

  const r = (t: string[][]) => resolve(t, pal);

  // Per-character idle templates
  const idleTemplate = paletteId === "nyx" ? NYX_IDLE : HEMERA_IDLE;

  const sprites: CharacterSprites = {
    idle: r(idleTemplate),
    idleBreath: [r(idleTemplate), r(IDLE_BREATH_1), r(IDLE_BREATH_2), r(IDLE_BREATH_3)],
    walkDown: [r(WALK_DOWN_1), r(WALK_DOWN_2), r(WALK_DOWN_3), r(WALK_DOWN_4), r(WALK_DOWN_5), r(WALK_DOWN_6)],
    walkRight: [r(WALK_RIGHT_1), r(WALK_RIGHT_2), r(WALK_RIGHT_3), r(WALK_RIGHT_4), r(WALK_RIGHT_5), r(WALK_RIGHT_6)],
    walkLeft: [
      resolve(flipH(WALK_RIGHT_1), pal),
      resolve(flipH(WALK_RIGHT_2), pal),
      resolve(flipH(WALK_RIGHT_3), pal),
      resolve(flipH(WALK_RIGHT_4), pal),
      resolve(flipH(WALK_RIGHT_5), pal),
      resolve(flipH(WALK_RIGHT_6), pal),
    ],
    walkUp: [r(WALK_UP_1), r(WALK_UP_2), r(WALK_UP_3), r(WALK_UP_4), r(WALK_UP_5), r(WALK_UP_6)],
    typing: [r(TYPE_1), r(TYPE_2)],
    coffee: [r(COFFEE_1), r(COFFEE_2)],
    conversation: [r(CONVO_1), r(CONVO_2)],
  };

  spriteCache.set(paletteId, sprites);
  return sprites;
}

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
