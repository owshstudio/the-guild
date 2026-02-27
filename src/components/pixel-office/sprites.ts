// Pixel art sprite data — 32x32 detailed sprites
// Each sprite uses color index arrays mapped to hex palettes

export type SpriteData = {
  width: number;
  height: number;
  palette: string[];
  frames: Record<string, number[][]>;
};

const T = 0; // transparent

// NYX — dark purple hoodie, flowing hair, glowing purple eyes
export const nyxSprite: SpriteData = {
  width: 32,
  height: 32,
  palette: [
    "transparent", // 0
    "#0f0a1a",     // 1 - outline/very dark
    "#1a1030",     // 2 - dark purple shadow
    "#2d1b69",     // 3 - purple body
    "#7c3aed",     // 4 - bright purple accent
    "#a78bfa",     // 5 - light purple glow
    "#e0d0ff",     // 6 - pale skin
    "#c4b5fd",     // 7 - hair highlight
    "#4c1d95",     // 8 - mid purple
    "#ffffff",     // 9 - eye white
    "#6d28d9",     // 10 - eye iris purple
    "#ddd6fe",     // 11 - skin highlight
    "#8b5cf6",     // 12 - purple mid-light
    "#3b0764",     // 13 - deep purple
    "#581c87",     // 14 - hood shadow
    "#1e1b4b",     // 15 - darkest clothing
  ],
  frames: {
    idle: [
      [T,T,T,T,T,T,T,T,T,T,T,7,7,7,7,7,7,7,7,7,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,7,7,5,5,7,7,7,7,5,5,7,7,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,7,5,5,5,7,7,7,7,7,7,5,5,5,7,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,5,5,7,7,7,7,7,7,7,7,7,7,5,5,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,5,7,7,1,1,1,1,1,1,1,1,7,7,5,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,5,7,1,1,1,1,1,1,1,1,1,1,1,1,7,5,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,5,1,1,6,6,6,6,6,6,6,6,6,6,1,1,5,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,9,9,6,6,6,6,9,9,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,9,10,4,9,6,6,9,10,4,9,6,6,1,7,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,11,11,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,1,6,6,6,6,6,6,6,6,6,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,1,6,6,12,12,12,12,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,1,1,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,8,8,8,8,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,4,4,4,4,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,6,3,3,3,3,3,3,3,3,3,3,6,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,6,11,3,3,3,3,3,3,3,3,11,6,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,15,15,3,3,15,15,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,15,15,15,1,1,15,15,15,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,T,T,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
    ],
    typing: [
      [T,T,T,T,T,T,T,T,T,T,T,7,7,7,7,7,7,7,7,7,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,7,7,5,5,7,7,7,7,5,5,7,7,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,7,5,5,5,7,7,7,7,7,7,5,5,5,7,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,5,5,7,7,7,7,7,7,7,7,7,7,5,5,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,5,7,7,1,1,1,1,1,1,1,1,7,7,5,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,5,7,1,1,1,1,1,1,1,1,1,1,1,1,7,5,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,5,1,1,6,6,6,6,6,6,6,6,6,6,1,1,5,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,9,9,6,6,6,6,9,9,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,9,10,4,9,6,6,9,10,4,9,6,6,1,7,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,1,6,6,6,6,6,6,6,6,6,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,1,6,6,12,12,12,12,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,1,1,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,8,8,8,8,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,4,4,4,4,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,3,3,3,14,3,3,3,1,T,T,T,T,T,T,T,T],
      [T,T,T,T,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,T,T,T,T,T,T,T,T],
      [T,T,T,6,11,T,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,T,11,6,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,15,15,3,3,15,15,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,15,15,15,1,1,15,15,15,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,T,T,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
    ],
  },
};

// HEMERA — golden/warm, clean bright look
export const hemeraSprite: SpriteData = {
  width: 32,
  height: 32,
  palette: [
    "transparent", // 0
    "#451a03",     // 1 - outline dark
    "#78350f",     // 2 - dark brown
    "#d97706",     // 3 - amber clothing
    "#fbbf24",     // 4 - gold accent
    "#fde68a",     // 5 - light gold
    "#fef3c7",     // 6 - pale warm skin
    "#f59e0b",     // 7 - amber hair
    "#b45309",     // 8 - dark amber
    "#ffffff",     // 9 - eye white
    "#ea580c",     // 10 - eye iris orange
    "#fff7ed",     // 11 - skin highlight
    "#fcd34d",     // 12 - gold mid
    "#92400e",     // 13 - deep brown
    "#a16207",     // 14 - clothing shadow
    "#7c2d12",     // 15 - darkest clothing
  ],
  frames: {
    idle: [
      [T,T,T,T,T,T,T,T,T,T,T,7,7,7,7,7,7,7,7,7,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,7,7,4,4,7,7,7,7,4,4,7,7,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,7,4,12,4,7,7,7,7,7,7,4,12,4,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,4,12,7,7,7,7,7,7,7,7,7,7,12,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,4,7,7,1,1,1,1,1,1,1,1,7,7,4,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,4,7,1,1,1,1,1,1,1,1,1,1,1,1,7,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,4,1,1,6,6,6,6,6,6,6,6,6,6,1,1,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,9,9,6,6,6,6,9,9,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,9,10,3,9,6,6,9,10,3,9,6,6,1,7,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,11,11,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,1,6,6,6,6,6,6,6,6,6,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,1,6,6,4,4,4,4,6,6,1,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,1,1,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,8,8,8,8,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,4,4,4,4,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,6,3,3,3,3,3,3,3,3,3,3,6,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,6,11,3,3,3,3,3,3,3,3,11,6,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,15,15,3,3,15,15,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,15,15,15,1,1,15,15,15,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,T,T,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
    ],
    typing: [
      [T,T,T,T,T,T,T,T,T,T,T,7,7,7,7,7,7,7,7,7,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,7,7,4,4,7,7,7,7,4,4,7,7,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,7,4,12,4,7,7,7,7,7,7,4,12,4,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,4,12,7,7,7,7,7,7,7,7,7,7,12,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,7,4,7,7,1,1,1,1,1,1,1,1,7,7,4,7,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,4,7,1,1,1,1,1,1,1,1,1,1,1,1,7,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,4,1,1,6,6,6,6,6,6,6,6,6,6,1,1,4,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,9,9,6,6,6,6,9,9,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,9,10,3,9,6,6,9,10,3,9,6,6,1,7,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,7,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,7,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,1,6,6,6,6,6,6,6,6,6,6,6,1,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,1,6,6,4,4,4,4,6,6,1,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,1,1,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,8,8,8,8,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,1,3,3,14,3,3,4,4,4,4,3,3,14,3,3,1,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,1,3,3,14,3,3,3,3,3,3,3,3,3,14,3,3,3,1,T,T,T,T,T,T,T,T],
      [T,T,T,T,6,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,T,T,T,T,T,T,T,T],
      [T,T,T,6,11,T,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,T,11,6,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,3,3,3,3,3,3,3,3,1,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,1,3,3,15,15,3,3,15,15,3,3,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,15,15,15,1,1,15,15,15,1,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,2,2,2,1,1,2,2,2,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,1,1,1,1,T,T,1,1,1,1,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
      [T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T,T],
    ],
  },
};

export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  frame: string,
  x: number,
  y: number,
  scale: number = 2
) {
  const data = sprite.frames[frame];
  if (!data) return;

  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const colorIdx = data[row][col];
      if (colorIdx === 0) continue;
      const color = sprite.palette[colorIdx];
      if (!color || color === "transparent") continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
