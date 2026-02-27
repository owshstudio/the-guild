// Character sprite system — chibi RPG style
// 16 wide x 24 tall, unique templates per character
// Reference: diverse pixel characters with volume, rich shading, color-matched outlines

import { CustomPalette } from "@/lib/types";

export type SpriteData = string[][];

export type HairStyle = "long" | "short" | "puffy" | "spiky";

// Palette tokens
const _ = "";
const X = "X";   // outline (color-matched per character)
const H = "H";   // hair mid
const Hd = "Hd"; // hair dark
const Hl = "Hl"; // hair highlight
const K = "K";   // skin mid
const Kd = "Kd"; // skin shadow
const S = "S";   // shirt mid
const Sd = "Sd"; // shirt shadow
const Sl = "Sl"; // shirt highlight/accent
const P = "P";   // pants mid
const Pd = "Pd"; // pants shadow
const O = "O";   // shoes
const E = "E";   // eye white
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

// Color utility functions for dynamic palette generation
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

export function darken(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - pct / 100;
  return rgbToHex(r * f, g * f, b * f);
}

export function lighten(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = pct / 100;
  return rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f);
}

export function generatePalette(baseColor: string): CharPalette {
  return {
    skin: "#f0d0b0",
    skinShadow: "#d4b494",
    shirt: baseColor,
    shirtShadow: darken(baseColor, 20),
    shirtAccent: lighten(baseColor, 20),
    pants: darken(baseColor, 60),
    pantsShadow: darken(baseColor, 75),
    hair: darken(baseColor, 30),
    hairDark: darken(baseColor, 50),
    hairLight: lighten(baseColor, 15),
    shoes: darken(baseColor, 80),
    outline: darken(baseColor, 80),
    eyeWhite: "#ffffff",
    eyePupil: darken(baseColor, 80),
  };
}

export const PALETTES: Record<string, CharPalette> = {
  nyx: {
    skin: "#e0d0f0",
    skinShadow: "#c0a8d8",
    shirt: "#4c1d95",
    shirtShadow: "#2e1065",
    shirtAccent: "#7c3aed",
    pants: "#1e1040",
    pantsShadow: "#140a2a",
    hair: "#5b21b6",
    hairDark: "#3b0f80",
    hairLight: "#8b5cf6",
    shoes: "#1a0f2e",
    outline: "#1a0f2e",
    eyeWhite: "#ffffff",
    eyePupil: "#1a0f2e",
  },
  hemera: {
    skin: "#fce4b8",
    skinShadow: "#e8c890",
    shirt: "#ea580c",
    shirtShadow: "#c2410c",
    shirtAccent: "#fb923c",
    pants: "#5c3310",
    pantsShadow: "#3a1f08",
    hair: "#f59e0b",
    hairDark: "#d97706",
    hairLight: "#fcd34d",
    shoes: "#2a1a0a",
    outline: "#2a1a0a",
    eyeWhite: "#ffffff",
    eyePupil: "#2a1a0a",
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
// NYX — Goddess of Night
// Long flowing dark hair past shoulders, dark purple aesthetic
// ═══════════════════════════════════════════════════════════

const NYX_IDLE: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0  dome tip (6 wide)
  [_,_,_,_,X,Hl,H,Hl,Hl,H,Hl,X,_,_,_,_],     // 1  dome widens (8 wide)
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2  hair volume (10 wide)
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 3  hair full (12 wide)
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_], // 4  brow shadow
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 5  face + hair sides
  [_,_,X,Hd,K,E,Ep,K,K,Ep,E,K,Hd,X,_,_],     // 6  eyes
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 7  face
  [_,_,X,H,Kd,K,K,K,K,K,K,Kd,H,X,_,_],       // 8  jaw + hair
  [_,_,X,H,H,Kd,K,K,K,K,Kd,H,H,X,_,_],       // 9  neck + hair drape
  [_,_,X,Hd,H,Sl,S,S,S,S,Sl,H,Hd,X,_,_],     // 10 V-neck collar + long hair
  [_,_,X,Hd,X,S,S,Sl,Sl,S,S,X,Hd,X,_,_],     // 11 shirt + hair sides
  [_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_],          // 12 shirt (hair ends)
  [_,_,X,K,S,S,S,Sd,Sd,S,S,S,K,X,_,_],        // 13 hands at sides
  [_,_,X,Kd,S,Sd,Sd,Sd,Sd,Sd,Sd,S,Kd,X,_,_], // 14 arms lower
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],   // 15 shirt bottom
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],          // 16 waist
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],          // 17 pants
  [_,_,_,X,P,P,Pd,X,X,Pd,P,P,X,_,_,_],        // 18 legs split
  [_,_,_,X,P,Pd,Pd,X,X,Pd,Pd,P,X,_,_,_],     // 19 legs transition
  [_,_,_,X,Pd,Pd,Pd,X,X,Pd,Pd,Pd,X,_,_,_],   // 20 legs dark
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],          // 21 shoes
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],          // 22 shoes
  [_,_,X,X,X,X,X,_,_,X,X,X,X,X,_,_],          // 23 soles
];

// ═══════════════════════════════════════════════════════════
// HEMERA — Goddess of Day
// Short puffy/voluminous warm hair, bright orange aesthetic
// ═══════════════════════════════════════════════════════════

const HEMERA_IDLE: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0  dome tip (same as NYX)
  [_,_,_,X,Hl,Hl,Hl,H,H,Hl,Hl,Hl,X,_,_,_],  // 1  immediate poof (10 wide)
  [_,_,X,H,Hl,H,Hl,H,H,Hl,H,Hl,H,X,_,_],    // 2  fluffy volume
  [_,_,X,H,H,Hl,H,H,H,H,Hl,H,H,X,_,_],      // 3  hair body
  [_,_,X,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,X,_,_], // 4  bangs
  [_,_,X,H,Hd,K,K,K,K,K,K,Hd,H,X,_,_],       // 5  forehead + thick hair
  [_,_,X,H,K,E,Ep,K,K,Ep,E,K,H,X,_,_],        // 6  eyes
  [_,_,X,H,K,K,K,K,K,K,K,K,H,X,_,_],          // 7  face
  [_,_,_,X,K,K,K,Kd,Kd,K,K,K,X,_,_,_],        // 8  lower face
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],        // 9  jaw
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],        // 10 neck
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_],           // 11 collar
  [_,_,_,X,S,S,Sl,Sl,Sl,Sl,S,S,X,_,_,_],      // 12 shirt accent stripe
  [_,_,X,S,S,S,S,Sd,Sd,S,S,S,S,X,_,_],        // 13 shirt wide
  [_,_,X,K,S,Sd,Sd,Sd,Sd,Sd,Sd,S,K,X,_,_],    // 14 hands + shadow
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],    // 15 shirt bottom
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],           // 16 waist
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],           // 17 pants
  [_,_,_,X,P,P,Pd,X,X,Pd,P,P,X,_,_,_],        // 18 legs split
  [_,_,_,X,P,Pd,Pd,X,X,Pd,Pd,P,X,_,_,_],      // 19 legs transition
  [_,_,_,X,Pd,Pd,Pd,X,X,Pd,Pd,Pd,X,_,_,_],    // 20 legs dark
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],           // 21 shoes
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],           // 22 shoes
  [_,_,X,X,X,X,X,_,_,X,X,X,X,X,_,_],           // 23 soles
];

// ═══════════════════════════════════════════════════════════
// TYPING ARMS — shared arm patches for typing animation
// Replaces rows 13-15 of idle templates
// ═══════════════════════════════════════════════════════════

const TYPING_ARMS_1: string[][] = [
  [_,X,K,X,S,S,Sd,Sd,Sd,Sd,S,S,X,K,X,_],      // 13 arms extended
  [X,K,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,Kd,K,X],  // 14 arms out
  [_,X,X,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,X,X,_],  // 15 hands forward
];

const TYPING_ARMS_2: string[][] = [
  [_,X,K,X,S,S,S,Sd,Sd,S,S,S,X,K,X,_],         // 13 one arm shifted
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,K,X,_],   // 14 asymmetric
  [_,_,X,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,X,_,_],  // 15 hands
];

function withTypingArms(idle: string[][], arms: string[][]): string[][] {
  return [...idle.slice(0, 13), ...arms, ...idle.slice(16)];
}

// ═══════════════════════════════════════════════════════════
// IDLE BREATHING VARIANTS — subtle torso shift for living feel
// ═══════════════════════════════════════════════════════════

// NYX breathing: shift torso rows 12-15 down 1px (shoulders drop slightly)
const NYX_IDLE_2: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,_,X,Hl,H,Hl,Hl,H,Hl,X,_,_,_,_],     // 1
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 3
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_], // 4
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 5
  [_,_,X,Hd,K,E,Ep,K,K,Ep,E,K,Hd,X,_,_],     // 6
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 7
  [_,_,X,H,Kd,K,K,K,K,K,K,Kd,H,X,_,_],       // 8
  [_,_,X,H,H,Kd,K,K,K,K,Kd,H,H,X,_,_],       // 9
  [_,_,X,Hd,H,Sl,S,S,S,S,Sl,H,Hd,X,_,_],     // 10
  [_,_,X,Hd,X,S,S,Sl,Sl,S,S,X,Hd,X,_,_],     // 11
  [_,_,_,X,S,S,S,S,S,S,S,S,X,_,_,_],          // 12 shoulders drop: same
  [_,_,_,X,K,S,S,Sd,Sd,S,S,K,X,_,_,_],        // 13 shifted down from row 13
  [_,_,X,K,S,S,S,Sd,Sd,S,S,S,K,X,_,_],        // 14 shifted: hands wider
  [_,_,X,Kd,S,Sd,Sd,Sd,Sd,Sd,Sd,S,Kd,X,_,_], // 15 shifted from row 14
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],          // 16
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],          // 17
  [_,_,_,X,P,P,Pd,X,X,Pd,P,P,X,_,_,_],        // 18
  [_,_,_,X,P,Pd,Pd,X,X,Pd,Pd,P,X,_,_,_],     // 19
  [_,_,_,X,Pd,Pd,Pd,X,X,Pd,Pd,Pd,X,_,_,_],   // 20
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],          // 21
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],          // 22
  [_,_,X,X,X,X,X,_,_,X,X,X,X,X,_,_],          // 23
];

// HEMERA breathing: subtle shoulder/torso shift
const HEMERA_IDLE_2: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,X,Hl,Hl,Hl,H,H,Hl,Hl,Hl,X,_,_,_],  // 1
  [_,_,X,H,Hl,H,Hl,H,H,Hl,H,Hl,H,X,_,_],    // 2
  [_,_,X,H,H,Hl,H,H,H,H,Hl,H,H,X,_,_],      // 3
  [_,_,X,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,X,_,_], // 4
  [_,_,X,H,Hd,K,K,K,K,K,K,Hd,H,X,_,_],       // 5
  [_,_,X,H,K,E,Ep,K,K,Ep,E,K,H,X,_,_],        // 6
  [_,_,X,H,K,K,K,K,K,K,K,K,H,X,_,_],          // 7
  [_,_,_,X,K,K,K,Kd,Kd,K,K,K,X,_,_,_],        // 8
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],        // 9
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],        // 10
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_],           // 11
  [_,_,_,X,S,S,Sl,Sl,Sl,Sl,S,S,X,_,_,_],      // 12
  [_,_,_,X,S,S,S,Sd,Sd,S,S,S,X,_,_,_],        // 13 shifted: slightly narrower
  [_,_,X,S,S,S,S,Sd,Sd,S,S,S,S,X,_,_],        // 14 shifted: wider shoulders
  [_,_,X,K,S,Sd,Sd,Sd,Sd,Sd,Sd,S,K,X,_,_],    // 15 shifted from row 14
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],           // 16
  [_,_,_,X,P,P,P,P,P,P,P,P,X,_,_,_],           // 17
  [_,_,_,X,P,P,Pd,X,X,Pd,P,P,X,_,_,_],        // 18
  [_,_,_,X,P,Pd,Pd,X,X,Pd,Pd,P,X,_,_,_],      // 19
  [_,_,_,X,Pd,Pd,Pd,X,X,Pd,Pd,Pd,X,_,_,_],    // 20
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],           // 21
  [_,_,X,O,O,O,O,X,X,O,O,O,O,X,_,_],           // 22
  [_,_,X,X,X,X,X,_,_,X,X,X,X,X,_,_],           // 23
];

// ═══════════════════════════════════════════════════════════
// SITTING SPRITES — from behind, at desk, typing animation
// Chair colors (inline hex, not palette-driven)
// ═══════════════════════════════════════════════════════════

const C1 = "#3a3a3a"; // chair seat dark
const C2 = "#4a4a4a"; // chair seat mid
const C3 = "#2a2a2a"; // chair base dark
const C4 = "#333333"; // chair base mid

// NYX sitting from behind — frame 1 (arms centered on desk)
const NYX_SITTING_1: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0  dome tip
  [_,_,_,_,X,Hl,H,Hl,Hl,H,Hl,X,_,_,_,_],     // 1  hair top
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2  hair volume
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 3  back of head full
  [_,_,X,H,H,H,Hd,Hd,Hd,Hd,H,H,H,X,_,_],   // 4  back of head lower
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_], // 5  back of head / nape
  [_,_,X,Hd,H,H,H,H,H,H,H,H,Hd,X,_,_],      // 6  hair draping down
  [_,_,X,Hd,H,H,Hd,Hd,Hd,Hd,H,H,Hd,X,_,_], // 7  hair mid-back
  [_,_,X,H,Hd,H,H,H,H,H,H,Hd,H,X,_,_],      // 8  hair lower
  [_,_,X,H,H,Hd,Kd,K,K,Kd,Hd,H,H,X,_,_],    // 9  nape visible through hair
  [_,_,X,Hd,H,Kd,S,S,S,S,Kd,H,Hd,X,_,_],    // 10 collar + long hair sides
  [_,_,X,Hd,X,S,S,Sd,Sd,S,S,X,Hd,X,_,_],     // 11 shirt + hair drapes
  [_,_,_,X,S,S,S,Sd,Sd,S,S,S,X,_,_,_],        // 12 back of shirt
  [_,_,X,K,S,S,Sd,Sd,Sd,Sd,S,S,K,X,_,_],      // 13 arms reaching forward
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,Kd,X,_], // 14 arms extended to desk
  [X,K,K,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X], // 15 hands on desk
  [_,_,_,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,_,_,_], // 16 lower shirt
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],   // 17 shirt meets chair
  [_,_,X,C2,C2,C1,C1,C1,C1,C1,C1,C2,C2,X,_,_], // 18 chair seat
  [_,_,X,C1,C2,C2,C1,C1,C1,C1,C2,C2,C1,X,_,_], // 19 chair seat lower
  [_,_,_,X,C1,C1,C1,C1,C1,C1,C1,C1,X,_,_,_],   // 20 chair base top
  [_,_,_,X,C3,C4,C3,C3,C3,C3,C4,C3,X,_,_,_],   // 21 chair legs
  [_,_,_,X,C3,C3,_,_,_,_,C3,C3,X,_,_,_],       // 22 chair legs lower
  [_,_,_,X,X,X,_,_,_,_,X,X,X,_,_,_],           // 23 chair feet
];

// NYX sitting from behind — frame 2 (right arm shifted slightly for typing)
const NYX_SITTING_2: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,_,X,Hl,H,Hl,Hl,H,Hl,X,_,_,_,_],     // 1
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 3
  [_,_,X,H,H,H,Hd,Hd,Hd,Hd,H,H,H,X,_,_],   // 4
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_], // 5
  [_,_,X,Hd,H,H,H,H,H,H,H,H,Hd,X,_,_],      // 6
  [_,_,X,Hd,H,H,Hd,Hd,Hd,Hd,H,H,Hd,X,_,_], // 7
  [_,_,X,H,Hd,H,H,H,H,H,H,Hd,H,X,_,_],      // 8
  [_,_,X,H,H,Hd,Kd,K,K,Kd,Hd,H,H,X,_,_],    // 9
  [_,_,X,Hd,H,Kd,S,S,S,S,Kd,H,Hd,X,_,_],    // 10
  [_,_,X,Hd,X,S,S,Sd,Sd,S,S,X,Hd,X,_,_],     // 11
  [_,_,_,X,S,S,S,Sd,Sd,S,S,S,X,_,_,_],        // 12
  [_,_,X,K,S,S,Sd,Sd,Sd,Sd,S,S,K,X,_,_],      // 13
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,K,X,_],  // 14 right arm shifted
  [X,K,K,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,Kd,K,X],// 15 asymmetric hands
  [_,_,_,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,_,_,_], // 16
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],   // 17
  [_,_,X,C2,C2,C1,C1,C1,C1,C1,C1,C2,C2,X,_,_], // 18
  [_,_,X,C1,C2,C2,C1,C1,C1,C1,C2,C2,C1,X,_,_], // 19
  [_,_,_,X,C1,C1,C1,C1,C1,C1,C1,C1,X,_,_,_],   // 20
  [_,_,_,X,C3,C4,C3,C3,C3,C3,C4,C3,X,_,_,_],   // 21
  [_,_,_,X,C3,C3,_,_,_,_,C3,C3,X,_,_,_],       // 22
  [_,_,_,X,X,X,_,_,_,_,X,X,X,_,_,_],           // 23
];

// HEMERA sitting from behind — frame 1 (arms centered on desk)
const HEMERA_SITTING_1: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0  dome tip
  [_,_,_,X,Hl,Hl,Hl,H,H,Hl,Hl,Hl,X,_,_,_],  // 1  puffy top
  [_,_,X,H,Hl,H,Hl,H,H,Hl,H,Hl,H,X,_,_],    // 2  fluffy volume
  [_,_,X,H,H,Hl,H,H,H,H,Hl,H,H,X,_,_],      // 3  hair body
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 4  back of head
  [_,_,X,H,Hd,H,Hd,Hd,Hd,Hd,H,Hd,H,X,_,_], // 5  back of head lower
  [_,_,X,Hd,H,Hd,Hd,Hd,Hd,Hd,Hd,H,Hd,X,_,_],// 6  nape area
  [_,_,_,X,Hd,H,H,H,H,H,H,Hd,X,_,_,_],       // 7  hair ends
  [_,_,_,X,X,Hd,Hd,Hd,Hd,Hd,Hd,X,X,_,_,_],  // 8  hair base
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],        // 9  nape / neck
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_],           // 10 collar
  [_,_,_,X,S,S,Sl,Sl,Sl,Sl,S,S,X,_,_,_],      // 11 shirt accent
  [_,_,X,S,S,S,S,Sd,Sd,S,S,S,S,X,_,_],        // 12 back of shirt
  [_,_,X,K,S,S,Sd,Sd,Sd,Sd,S,S,K,X,_,_],      // 13 arms reaching
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,Kd,X,_], // 14 arms extended
  [X,K,K,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,K,K,X], // 15 hands on desk
  [_,_,_,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,_,_,_], // 16 lower shirt
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],   // 17 shirt meets chair
  [_,_,X,C2,C2,C1,C1,C1,C1,C1,C1,C2,C2,X,_,_], // 18 chair seat
  [_,_,X,C1,C2,C2,C1,C1,C1,C1,C2,C2,C1,X,_,_], // 19 chair seat lower
  [_,_,_,X,C1,C1,C1,C1,C1,C1,C1,C1,X,_,_,_],   // 20 chair base top
  [_,_,_,X,C3,C4,C3,C3,C3,C3,C4,C3,X,_,_,_],   // 21 chair legs
  [_,_,_,X,C3,C3,_,_,_,_,C3,C3,X,_,_,_],       // 22 chair legs lower
  [_,_,_,X,X,X,_,_,_,_,X,X,X,_,_,_],           // 23 chair feet
];

// HEMERA sitting from behind — frame 2 (right arm shifted for typing)
const HEMERA_SITTING_2: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,X,Hl,Hl,Hl,H,H,Hl,Hl,Hl,X,_,_,_],  // 1
  [_,_,X,H,Hl,H,Hl,H,H,Hl,H,Hl,H,X,_,_],    // 2
  [_,_,X,H,H,Hl,H,H,H,H,Hl,H,H,X,_,_],      // 3
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 4
  [_,_,X,H,Hd,H,Hd,Hd,Hd,Hd,H,Hd,H,X,_,_], // 5
  [_,_,X,Hd,H,Hd,Hd,Hd,Hd,Hd,Hd,H,Hd,X,_,_],// 6
  [_,_,_,X,Hd,H,H,H,H,H,H,Hd,X,_,_,_],       // 7
  [_,_,_,X,X,Hd,Hd,Hd,Hd,Hd,Hd,X,X,_,_,_],  // 8
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],        // 9
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_],           // 10
  [_,_,_,X,S,S,Sl,Sl,Sl,Sl,S,S,X,_,_,_],      // 11
  [_,_,X,S,S,S,S,Sd,Sd,S,S,S,S,X,_,_],        // 12
  [_,_,X,K,S,S,Sd,Sd,Sd,Sd,S,S,K,X,_,_],      // 13
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,K,X,_],  // 14 right arm shifted
  [X,K,K,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,Kd,K,X],// 15 asymmetric hands
  [_,_,_,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,_,_,_], // 16
  [_,_,_,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,_,_,_],   // 17
  [_,_,X,C2,C2,C1,C1,C1,C1,C1,C1,C2,C2,X,_,_], // 18
  [_,_,X,C1,C2,C2,C1,C1,C1,C1,C2,C2,C1,X,_,_], // 19
  [_,_,_,X,C1,C1,C1,C1,C1,C1,C1,C1,X,_,_,_],   // 20
  [_,_,_,X,C3,C4,C3,C3,C3,C3,C4,C3,X,_,_,_],   // 21
  [_,_,_,X,C3,C3,_,_,_,_,C3,C3,X,_,_,_],       // 22
  [_,_,_,X,X,X,_,_,_,_,X,X,X,_,_,_],           // 23
];

// ═══════════════════════════════════════════════════════════
// WALK TEMPLATES — shared generic shape (updated when walk logic ships)
// ═══════════════════════════════════════════════════════════

const WALK_DOWN_L: string[][] = [
  [_,_,_,_,X,X,X,X,X,X,X,_,_,_,_,_],
  [_,_,_,X,H,Hl,H,H,H,H,Hl,H,X,_,_,_],
  [_,_,X,H,H,H,H,Hl,Hl,H,H,H,H,X,_,_],
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],
  [_,_,X,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,X,_,_],
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],
  [_,_,X,Hd,K,E,Ep,K,K,Ep,E,K,Hd,X,_,_],
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],
  [_,_,_,_,_,X,K,K,K,K,X,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,S,S,X,_,_,_,_],
  [_,_,_,X,S,S,S,Sl,Sl,S,S,S,X,_,_,_],
  [_,_,X,S,S,S,S,S,S,S,S,S,S,X,_,_],
  [_,X,K,X,S,S,Sd,Sd,Sd,Sd,S,S,X,K,X,_],
  [_,X,Kd,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,Kd,X,_],
  [_,_,X,X,S,Sd,Sd,Sd,Sd,Sd,Sd,S,X,X,_,_],
  [_,_,_,X,Sd,Sd,Sd,Sd,Sd,Sd,Sd,Sd,X,_,_,_],
  [_,_,_,_,X,P,P,P,P,P,P,X,_,_,_,_],
  [_,_,_,X,P,P,X,_,_,X,P,P,X,_,_,_],
  [_,_,X,P,Pd,X,_,_,_,_,X,Pd,P,X,_,_],
  [_,_,X,Pd,Pd,X,_,_,_,_,X,Pd,Pd,X,_,_],
  [_,X,O,O,O,X,_,_,_,_,X,O,O,O,X,_],
  [_,X,O,O,O,X,_,_,_,_,_,X,O,O,X,_],
  [_,X,X,X,X,_,_,_,_,_,_,X,X,X,_,_],
];

const WALK_DOWN_R: string[][] = WALK_DOWN_L.map(row => [...row].reverse());

const WALK_RIGHT_STAND: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,X,_,_,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,X,H,Hd,Hd,Hd,Hd,H,H,H,X,_,_,_,_],
  [_,_,X,H,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,X,H,K,K,E,Ep,K,Hd,H,X,_,_,_,_],
  [_,_,X,H,K,K,K,K,K,Hd,H,X,_,_,_,_],
  [_,_,_,X,Kd,K,K,K,Kd,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,X,_,_,_,_,_,_],
  [_,_,_,X,S,S,S,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_],
  [_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_],
  [_,_,_,X,X,Sd,Sd,Sd,Sd,X,X,_,_,_,_,_],
  [_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,_,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,X,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,X,P,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,Pd,X,Pd,X,_,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,O,O,X,O,O,X,_,_,_,_,_],
  [_,_,_,_,X,X,X,_,X,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];

const WALK_RIGHT_STEP: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,_,_,_,_,_,_],
  [_,_,_,_,X,H,Hl,H,H,H,X,_,_,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,_,X,H,H,H,H,H,H,H,X,_,_,_,_],
  [_,_,X,H,Hd,Hd,Hd,Hd,H,H,H,X,_,_,_,_],
  [_,_,X,H,K,K,K,K,K,H,H,X,_,_,_,_],
  [_,_,X,H,K,K,E,Ep,K,Hd,H,X,_,_,_,_],
  [_,_,X,H,K,K,K,K,K,Hd,H,X,_,_,_,_],
  [_,_,_,X,Kd,K,K,K,Kd,H,X,_,_,_,_,_],
  [_,_,_,_,_,X,K,K,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,S,S,S,S,X,_,_,_,_,_,_],
  [_,_,_,X,S,S,S,Sl,S,S,X,_,_,_,_,_],
  [_,_,_,X,S,S,S,S,S,S,X,_,_,_,_,_],
  [_,_,X,K,X,S,Sd,Sd,S,X,K,X,_,_,_,_],
  [_,_,_,X,X,Sd,Sd,Sd,Sd,X,X,_,_,_,_,_],
  [_,_,_,_,X,Sd,Sd,Sd,Sd,X,_,_,_,_,_,_],
  [_,_,_,_,_,X,P,P,X,_,_,_,_,_,_,_],
  [_,_,_,_,X,P,X,_,X,P,X,_,_,_,_,_],
  [_,_,_,X,P,X,_,_,_,X,P,X,_,_,_,_],
  [_,_,_,X,Pd,X,_,_,_,X,Pd,X,_,_,_,_],
  [_,_,X,O,O,X,_,_,X,O,O,X,_,_,_,_],
  [_,_,X,O,O,X,_,_,_,X,O,X,_,_,_,_],
  [_,_,X,X,X,_,_,_,_,X,X,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
];


// ═══════════════════════════════════════════════════════════
// HAIR TEMPLATES — 4 hair style variations
// Each replaces rows 0-9 of the idle template
// ═══════════════════════════════════════════════════════════

const HAIR_LONG: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0  dome tip
  [_,_,_,_,X,Hl,H,Hl,Hl,H,Hl,X,_,_,_,_],     // 1  dome widens
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2  hair volume
  [_,_,X,H,H,H,H,H,H,H,H,H,H,X,_,_],        // 3  hair full
  [_,_,X,H,H,Hd,Hd,Hd,Hd,Hd,Hd,H,H,X,_,_], // 4  brow shadow
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 5  face + hair sides
  [_,_,X,Hd,K,E,Ep,K,K,Ep,E,K,Hd,X,_,_],     // 6  eyes
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],       // 7  face
  [_,_,X,H,Kd,K,K,K,K,K,K,Kd,H,X,_,_],       // 8  jaw + hair
  [_,_,X,H,H,Kd,K,K,K,K,Kd,H,H,X,_,_],       // 9  neck + hair drape
];

const HAIR_SHORT: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,_,X,H,H,Hl,Hl,H,H,X,_,_,_,_],       // 1  tighter
  [_,_,_,X,H,Hl,H,Hl,Hl,H,Hl,H,X,_,_,_],    // 2
  [_,_,_,X,H,H,H,H,H,H,H,H,X,_,_,_],        // 3  narrower
  [_,_,_,X,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,X,_,_,_], // 4  bangs
  [_,_,_,X,K,K,K,K,K,K,K,K,X,_,_,_],          // 5  no side hair
  [_,_,_,X,K,E,Ep,K,K,Ep,E,K,X,_,_,_],        // 6  eyes
  [_,_,_,X,K,K,K,K,K,K,K,K,X,_,_,_],          // 7  face
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],       // 8  jaw
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],       // 9  neck
];

const HAIR_PUFFY: string[][] = [
  [_,_,_,_,_,X,X,X,X,X,X,_,_,_,_,_],          // 0
  [_,_,_,X,Hl,Hl,Hl,H,H,Hl,Hl,Hl,X,_,_,_],  // 1  immediate poof
  [_,_,X,H,Hl,H,Hl,H,H,Hl,H,Hl,H,X,_,_],    // 2  fluffy volume
  [_,_,X,H,H,Hl,H,H,H,H,Hl,H,H,X,_,_],      // 3  hair body
  [_,_,X,H,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,H,X,_,_], // 4  bangs
  [_,_,X,H,Hd,K,K,K,K,K,K,Hd,H,X,_,_],       // 5  forehead + thick hair
  [_,_,X,H,K,E,Ep,K,K,Ep,E,K,H,X,_,_],        // 6  eyes
  [_,_,X,H,K,K,K,K,K,K,K,K,H,X,_,_],          // 7  face
  [_,_,_,X,K,K,K,Kd,Kd,K,K,K,X,_,_,_],        // 8  lower face
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],        // 9  jaw
];

const HAIR_SPIKY: string[][] = [
  [_,_,_,_,X,X,H,Hl,Hl,H,X,X,_,_,_,_],        // 0  spikes up
  [_,_,_,X,H,Hl,Hl,H,H,Hl,Hl,H,X,_,_,_],     // 1  tall spikes
  [_,_,X,Hl,H,Hl,H,Hl,Hl,H,Hl,H,Hl,X,_,_],  // 2  wide spiky
  [_,_,X,H,Hl,H,H,H,H,H,H,Hl,H,X,_,_],       // 3  hair body
  [_,_,X,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,Hd,X,_,_], // 4  brow line
  [_,_,X,Hd,K,K,K,K,K,K,K,K,Hd,X,_,_],        // 5  face
  [_,_,X,Hd,K,E,Ep,K,K,Ep,E,K,Hd,X,_,_],      // 6  eyes
  [_,_,_,X,K,K,K,K,K,K,K,K,X,_,_,_],           // 7  face
  [_,_,_,X,Kd,K,K,K,K,K,K,Kd,X,_,_,_],        // 8  jaw
  [_,_,_,_,X,Kd,K,K,K,K,Kd,X,_,_,_,_],        // 9  neck
];

export const HAIR_TEMPLATES: Record<HairStyle, string[][]> = {
  long: HAIR_LONG,
  short: HAIR_SHORT,
  puffy: HAIR_PUFFY,
  spiky: HAIR_SPIKY,
};

function applyHairStyle(idle: string[][], hairStyle: HairStyle): string[][] {
  const hairRows = HAIR_TEMPLATES[hairStyle];
  return [...hairRows, ...idle.slice(10)];
}

// ── SPRITE SET ──────────────────────────────────────────

export interface CharacterSprites {
  idle: SpriteData;
  idleBreath: [SpriteData, SpriteData];
  walkDown: [SpriteData, SpriteData, SpriteData, SpriteData];
  walkRight: [SpriteData, SpriteData, SpriteData, SpriteData];
  walkLeft: [SpriteData, SpriteData, SpriteData, SpriteData];
  typing: [SpriteData, SpriteData];
  sitting: [SpriteData, SpriteData];
}

const CHARACTER_TEMPLATES: Record<string, string[][]> = {
  nyx: NYX_IDLE,
  hemera: HEMERA_IDLE,
};

const IDLE_BREATH_TEMPLATES: Record<string, string[][]> = {
  nyx: NYX_IDLE_2,
  hemera: HEMERA_IDLE_2,
};

const SITTING_TEMPLATES: Record<string, [string[][], string[][]]> = {
  nyx: [NYX_SITTING_1, NYX_SITTING_2],
  hemera: [HEMERA_SITTING_1, HEMERA_SITTING_2],
};

const spriteCache = new Map<string, CharacterSprites>();

export function invalidateSpriteCache(paletteId: string): void {
  spriteCache.delete(paletteId);
}

export function getPalette(
  agentId: string,
  customPalettes?: CustomPalette[]
): CharPalette {
  if (customPalettes) {
    const custom = customPalettes.find((p) => p.agentId === agentId);
    if (custom) {
      return {
        skin: custom.skin,
        skinShadow: custom.skinShadow,
        shirt: custom.shirt,
        shirtShadow: custom.shirtShadow,
        shirtAccent: custom.shirtAccent,
        pants: custom.pants,
        pantsShadow: custom.pantsShadow,
        hair: custom.hair,
        hairDark: custom.hairDark,
        hairLight: custom.hairLight,
        shoes: custom.shoes,
        outline: custom.outline,
        eyeWhite: "#ffffff",
        eyePupil: custom.outline,
      };
    }
  }
  const pal = PALETTES[agentId];
  if (!pal) {
    return agentId.startsWith("#")
      ? generatePalette(agentId)
      : generatePalette("#6b7280");
  }
  return pal;
}

export function getCharacterSprites(
  paletteId: string,
  customPalette?: CustomPalette,
  hairStyle?: HairStyle
): CharacterSprites {
  const cacheKey = customPalette
    ? `${paletteId}-custom-${JSON.stringify(customPalette)}`
    : paletteId;

  const cached = spriteCache.get(cacheKey);
  if (cached) return cached;

  let pal: CharPalette;
  if (customPalette) {
    pal = {
      skin: customPalette.skin,
      skinShadow: customPalette.skinShadow,
      shirt: customPalette.shirt,
      shirtShadow: customPalette.shirtShadow,
      shirtAccent: customPalette.shirtAccent,
      pants: customPalette.pants,
      pantsShadow: customPalette.pantsShadow,
      hair: customPalette.hair,
      hairDark: customPalette.hairDark,
      hairLight: customPalette.hairLight,
      shoes: customPalette.shoes,
      outline: customPalette.outline,
      eyeWhite: "#ffffff",
      eyePupil: customPalette.outline,
    };
  } else {
    pal = PALETTES[paletteId];
    if (!pal) {
      // Generate palette from hex color or use neutral fallback
      pal = paletteId.startsWith("#")
        ? generatePalette(paletteId)
        : generatePalette("#6b7280");
    }
  }

  let template = CHARACTER_TEMPLATES[paletteId] || NYX_IDLE;
  let breathTemplate = IDLE_BREATH_TEMPLATES[paletteId] || NYX_IDLE_2;

  if (hairStyle) {
    template = applyHairStyle(template, hairStyle);
    breathTemplate = applyHairStyle(breathTemplate, hairStyle);
  }

  const [sit1, sit2] = SITTING_TEMPLATES[paletteId] || SITTING_TEMPLATES.nyx;
  const r = (t: string[][]) => resolve(t, pal);

  const sprites: CharacterSprites = {
    idle: r(template),
    idleBreath: [r(template), r(breathTemplate)],
    walkDown: [r(WALK_DOWN_L), r(template), r(WALK_DOWN_R), r(template)],
    walkRight: [r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND), r(WALK_RIGHT_STEP), r(WALK_RIGHT_STAND)],
    walkLeft: [
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
      resolve(flipH(WALK_RIGHT_STEP), pal),
      resolve(flipH(WALK_RIGHT_STAND), pal),
    ],
    typing: [
      r(withTypingArms(template, TYPING_ARMS_1)),
      r(withTypingArms(template, TYPING_ARMS_2)),
    ],
    sitting: [r(sit1), r(sit2)],
  };

  // Only cache built-in palettes (not live preview custom ones)
  if (!customPalette) {
    spriteCache.set(cacheKey, sprites);
  }

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
