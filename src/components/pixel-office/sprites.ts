// Agent character drawing — procedural pixel art characters
// Much cleaner than grid arrays, actual recognizable figures

export type SpriteData = {
  width: number;
  height: number;
  id: string;
};

export const nyxSprite: SpriteData = { width: 28, height: 40, id: "nyx" };
export const hemeraSprite: SpriteData = { width: 28, height: 40, id: "hemera" };

// Draw NYX — dark purple hoodie, flowing dark hair, pale skin, glowing purple eyes
export function drawNyx(ctx: CanvasRenderingContext2D, x: number, y: number, frame: "idle" | "typing", scale: number) {
  const s = scale; // shorthand
  ctx.save();

  // === HAIR (dark purple, flows down past shoulders) ===
  ctx.fillStyle = "#2d1b69";
  // Hair top/back
  roundRect(ctx, x + 8*s, y + 0*s, 12*s, 4*s, 2*s);
  ctx.fill();
  ctx.fillRect(x + 7*s, y + 2*s, 14*s, 6*s);
  // Hair sides flowing down
  ctx.fillStyle = "#1a1030";
  ctx.fillRect(x + 6*s, y + 4*s, 3*s, 12*s);
  ctx.fillRect(x + 19*s, y + 4*s, 3*s, 12*s);
  // Hair highlights
  ctx.fillStyle = "#4c1d95";
  ctx.fillRect(x + 8*s, y + 1*s, 2*s, 3*s);
  ctx.fillRect(x + 17*s, y + 2*s, 2*s, 2*s);

  // === HEAD ===
  ctx.fillStyle = "#e0d0ff"; // pale skin
  roundRect(ctx, x + 9*s, y + 4*s, 10*s, 10*s, 2*s);
  ctx.fill();

  // === EYES (glowing purple) ===
  // Eye whites
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 11*s, y + 7*s, 3*s, 2*s);
  ctx.fillRect(x + 16*s, y + 7*s, 3*s, 2*s);
  // Irises (purple glow)
  ctx.fillStyle = "#7c3aed";
  ctx.fillRect(x + 12*s, y + 7*s, 2*s, 2*s);
  ctx.fillRect(x + 17*s, y + 7*s, 2*s, 2*s);
  // Pupil
  ctx.fillStyle = "#1a1030";
  ctx.fillRect(x + 12*s, y + 8*s, 1*s, 1*s);
  ctx.fillRect(x + 17*s, y + 8*s, 1*s, 1*s);
  // Eye glow
  ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
  ctx.fillRect(x + 10*s, y + 6*s, 8*s, 4*s);

  // === MOUTH (subtle) ===
  ctx.fillStyle = "#c4a0e0";
  ctx.fillRect(x + 13*s, y + 11*s, 3*s, 1*s);

  // === HOODIE / BODY ===
  ctx.fillStyle = "#2d1b69"; // purple hoodie
  // Hood outline around head
  ctx.fillRect(x + 7*s, y + 3*s, 2*s, 5*s);
  ctx.fillRect(x + 19*s, y + 3*s, 2*s, 5*s);
  ctx.fillRect(x + 7*s, y + 2*s, 14*s, 2*s);
  // Torso
  roundRect(ctx, x + 7*s, y + 14*s, 14*s, 12*s, 2*s);
  ctx.fill();
  // Hoodie pocket/detail
  ctx.fillStyle = "#4c1d95";
  ctx.fillRect(x + 10*s, y + 20*s, 8*s, 3*s);
  // Hood string
  ctx.fillStyle = "#a78bfa";
  ctx.fillRect(x + 12*s, y + 14*s, 1*s, 4*s);
  ctx.fillRect(x + 15*s, y + 14*s, 1*s, 3*s);

  // === ARMS ===
  ctx.fillStyle = "#2d1b69";
  if (frame === "typing") {
    // Arms forward (on keyboard)
    ctx.fillRect(x + 5*s, y + 16*s, 3*s, 8*s);
    ctx.fillRect(x + 20*s, y + 16*s, 3*s, 8*s);
    // Forearms reaching to keyboard
    ctx.fillRect(x + 4*s, y + 23*s, 4*s, 3*s);
    ctx.fillRect(x + 20*s, y + 23*s, 4*s, 3*s);
    // Hands (skin)
    ctx.fillStyle = "#e0d0ff";
    ctx.fillRect(x + 4*s, y + 25*s, 3*s, 2*s);
    ctx.fillRect(x + 21*s, y + 25*s, 3*s, 2*s);
  } else {
    // Arms at sides / relaxed
    ctx.fillRect(x + 5*s, y + 16*s, 3*s, 9*s);
    ctx.fillRect(x + 20*s, y + 16*s, 3*s, 9*s);
    // Hands
    ctx.fillStyle = "#e0d0ff";
    ctx.fillRect(x + 5*s, y + 24*s, 3*s, 2*s);
    ctx.fillRect(x + 20*s, y + 24*s, 3*s, 2*s);
  }

  // === LEGS (dark pants) ===
  ctx.fillStyle = "#0f0a1a";
  ctx.fillRect(x + 9*s, y + 26*s, 4*s, 10*s);
  ctx.fillRect(x + 15*s, y + 26*s, 4*s, 10*s);

  // === SHOES ===
  ctx.fillStyle = "#1a1030";
  ctx.fillRect(x + 8*s, y + 35*s, 5*s, 3*s);
  ctx.fillRect(x + 15*s, y + 35*s, 5*s, 3*s);

  ctx.restore();
}

// Draw HEMERA — golden/warm, clean bright look, lighter hair
export function drawHemera(ctx: CanvasRenderingContext2D, x: number, y: number, frame: "idle" | "typing", scale: number) {
  const s = scale;
  ctx.save();

  // === HAIR (golden, shorter/tidier than NYX) ===
  ctx.fillStyle = "#f59e0b";
  roundRect(ctx, x + 8*s, y + 0*s, 12*s, 4*s, 2*s);
  ctx.fill();
  ctx.fillRect(x + 7*s, y + 2*s, 14*s, 5*s);
  // Hair sides (shorter)
  ctx.fillStyle = "#d97706";
  ctx.fillRect(x + 6*s, y + 4*s, 3*s, 8*s);
  ctx.fillRect(x + 19*s, y + 4*s, 3*s, 8*s);
  // Highlights
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x + 10*s, y + 1*s, 3*s, 2*s);
  ctx.fillRect(x + 16*s, y + 2*s, 2*s, 2*s);

  // === HEAD ===
  ctx.fillStyle = "#fef3c7"; // warm pale skin
  roundRect(ctx, x + 9*s, y + 4*s, 10*s, 10*s, 2*s);
  ctx.fill();

  // === EYES (warm amber) ===
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 11*s, y + 7*s, 3*s, 2*s);
  ctx.fillRect(x + 16*s, y + 7*s, 3*s, 2*s);
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(x + 12*s, y + 7*s, 2*s, 2*s);
  ctx.fillRect(x + 17*s, y + 7*s, 2*s, 2*s);
  ctx.fillStyle = "#451a03";
  ctx.fillRect(x + 12*s, y + 8*s, 1*s, 1*s);
  ctx.fillRect(x + 17*s, y + 8*s, 1*s, 1*s);

  // === MOUTH ===
  ctx.fillStyle = "#e8c4a0";
  ctx.fillRect(x + 13*s, y + 11*s, 3*s, 1*s);

  // === BODY (clean light top) ===
  ctx.fillStyle = "#d97706"; // amber top
  roundRect(ctx, x + 7*s, y + 14*s, 14*s, 12*s, 2*s);
  ctx.fill();
  // Collar detail
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x + 11*s, y + 14*s, 6*s, 2*s);
  // Button/detail
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x + 13*s, y + 18*s, 2*s, 1*s);
  ctx.fillRect(x + 13*s, y + 21*s, 2*s, 1*s);

  // === ARMS ===
  ctx.fillStyle = "#d97706";
  if (frame === "typing") {
    ctx.fillRect(x + 5*s, y + 16*s, 3*s, 8*s);
    ctx.fillRect(x + 20*s, y + 16*s, 3*s, 8*s);
    ctx.fillRect(x + 4*s, y + 23*s, 4*s, 3*s);
    ctx.fillRect(x + 20*s, y + 23*s, 4*s, 3*s);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(x + 4*s, y + 25*s, 3*s, 2*s);
    ctx.fillRect(x + 21*s, y + 25*s, 3*s, 2*s);
  } else {
    ctx.fillRect(x + 5*s, y + 16*s, 3*s, 9*s);
    ctx.fillRect(x + 20*s, y + 16*s, 3*s, 9*s);
    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(x + 5*s, y + 24*s, 3*s, 2*s);
    ctx.fillRect(x + 20*s, y + 24*s, 3*s, 2*s);
  }

  // === LEGS ===
  ctx.fillStyle = "#78350f";
  ctx.fillRect(x + 9*s, y + 26*s, 4*s, 10*s);
  ctx.fillRect(x + 15*s, y + 26*s, 4*s, 10*s);

  // === SHOES ===
  ctx.fillStyle = "#451a03";
  ctx.fillRect(x + 8*s, y + 35*s, 5*s, 3*s);
  ctx.fillRect(x + 15*s, y + 35*s, 5*s, 3*s);

  ctx.restore();
}

// Render the right character based on sprite ID
export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  frame: string,
  x: number,
  y: number,
  scale: number = 3
) {
  const drawFrame = (frame === "typing" ? "typing" : "idle") as "idle" | "typing";
  if (sprite.id === "nyx") {
    drawNyx(ctx, x, y, drawFrame, scale);
  } else if (sprite.id === "hemera") {
    drawHemera(ctx, x, y, drawFrame, scale);
  }
}

// Helper for rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
