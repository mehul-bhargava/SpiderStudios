"use client";
import { useEffect, useRef } from "react";
import { composeSkin, drawImported, type SkinConfig } from "@/engine/skin";

/** Flat 2D front view of a skin (used on the Player Card and in Classic Mode). */
export function SkinPreview({ config, scale = 6 }: { config: SkinConfig; scale?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const out = ref.current;
    if (!out) return;
    const draw = (skin: HTMLCanvasElement) => {
      const ctx = out.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, out.width, out.height);
      const s = scale;
      const blit = (sx: number, sy: number, w: number, h: number, dx: number, dy: number) => ctx.drawImage(skin, sx, sy, w, h, dx * s, dy * s, w * s, h * s);
      // base layer
      blit(8, 8, 8, 8, 4, 0); // head front
      blit(20, 20, 8, 12, 4, 8); // body
      blit(44, 20, 4, 12, 0, 8); // right arm
      blit(36, 52, 4, 12, 12, 8); // left arm
      blit(4, 20, 4, 12, 4, 20); // right leg
      blit(20, 52, 4, 12, 8, 20); // left leg
      // overlay
      blit(40, 8, 8, 8, 4, 0);
      blit(20, 36, 8, 12, 4, 8);
      blit(44, 36, 4, 12, 0, 8);
      blit(52, 52, 4, 12, 12, 8);
      blit(4, 36, 4, 12, 4, 20);
      blit(4, 52, 4, 12, 8, 20);
    };
    if (config.imported) {
      const img = new Image();
      img.onload = () => draw(drawImported(img));
      img.src = config.imported;
    } else draw(composeSkin(config));
  }, [config, scale]);
  return <canvas ref={ref} width={16 * scale} height={32 * scale} className="px" aria-label="Character preview" role="img" />;
}
