"use client";

import { useRef, useEffect } from "react";
import { CustomPalette } from "@/lib/types";
import { getCharacterSprites, renderSprite } from "@/components/pixel-office/sprites";

interface SpritePreviewProps {
  palette: CustomPalette;
}

const PREVIEW_SIZE = 128;
const PIXEL_SCALE = 8; // 16 * 8 = 128

export default function SpritePreview({ palette }: SpritePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    let animId: number;
    let lastTime = performance.now();

    const draw = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      timerRef.current += dt;
      if (timerRef.current >= 0.5) {
        frameRef.current = frameRef.current === 0 ? 1 : 0;
        timerRef.current = 0;
      }

      ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

      try {
        const sprites = getCharacterSprites(
          palette.agentId,
          palette,
          palette.hairStyle
        );
        const sprite = sprites.idleBreath[frameRef.current];
        renderSprite(ctx, sprite, 0, 0, PIXEL_SCALE);
      } catch {
        // Fallback if palette doesn't map to valid sprites
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
        ctx.fillStyle = "#737373";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Preview", PREVIEW_SIZE / 2, PREVIEW_SIZE / 2);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [palette]);

  return (
    <div className="flex justify-center mb-4">
      <canvas
        ref={canvasRef}
        width={PREVIEW_SIZE}
        height={PREVIEW_SIZE + 64}
        className="border border-[#1f1f1f] rounded-lg bg-[#0a0a0a]"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
