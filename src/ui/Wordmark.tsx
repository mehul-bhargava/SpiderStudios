"use client";
import { useEffect, useRef } from "react";
import { tileCanvas } from "@/engine/textures";

// Original 5×7 block alphabet for the SpiderStudios wordmark.
const GLYPHS: Record<string, string[]> = {
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  I: ["XXX", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"],
  D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
  E: ["XXXXX", "X....", "X....", "XXXX.", "X....", "X....", "XXXXX"],
  R: ["XXXX.", "X...X", "X...X", "XXXX.", "X.X..", "X..X.", "X...X"],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  U: ["X...X", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
};

type Part = { text: string; tile: string; edge: string; depth: string };

export function drawWordmark(canvas: HTMLCanvasElement, parts: Part[], scale = 6) {
  const gap = 1;
  const word = 3;
  const cells: { x: number; y: number; part: Part }[] = [];
  let cx = 0;
  parts.forEach((part, pi) => {
    for (const ch of part.text) {
      const g = GLYPHS[ch];
      if (!g) {
        cx += 3;
        continue;
      }
      g.forEach((row, y) => [...row].forEach((c, x) => c === "X" && cells.push({ x: cx + x, y, part })));
      cx += g[0].length + gap;
    }
    if (pi < parts.length - 1) cx += word - gap;
  });
  const depth = 3;
  const W = (cx - gap) * scale + depth * (scale / 2) + scale;
  const H = 7 * scale + depth * (scale / 2) + scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
  const ox = scale / 2;
  const oy = scale / 2;
  // extrusion
  for (let d = depth; d >= 1; d--)
    for (const c of cells) {
      ctx.fillStyle = d === depth ? "#000" : c.part.depth;
      ctx.fillRect(ox + c.x * scale + d * (scale / 2), oy + c.y * scale + d * (scale / 2), scale, scale);
    }
  // faces with block texture
  const tiles = new Map<string, HTMLCanvasElement>();
  for (const c of cells) {
    let t = tiles.get(c.part.tile);
    if (!t) {
      t = tileCanvas(c.part.tile);
      tiles.set(c.part.tile, t);
    }
    const sx = (c.x * 4) % 16;
    const sy = (c.y * 4) % 16;
    ctx.drawImage(t, sx, sy, 4, 4, ox + c.x * scale, oy + c.y * scale, scale, scale);
  }
  // outline + highlight
  const has = new Set(cells.map((c) => `${c.x},${c.y}`));
  for (const c of cells) {
    const X = ox + c.x * scale;
    const Y = oy + c.y * scale;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    if (!has.has(`${c.x},${c.y - 1}`)) ctx.fillRect(X, Y, scale, Math.max(1, scale / 6));
    if (!has.has(`${c.x - 1},${c.y}`)) ctx.fillRect(X, Y, Math.max(1, scale / 6), scale);
    ctx.fillStyle = c.part.edge;
    if (!has.has(`${c.x},${c.y + 1}`)) ctx.fillRect(X, Y + scale - Math.max(1, scale / 6), scale, Math.max(1, scale / 6));
  }
  return { W, H };
}

export function Wordmark({ className = "wordmark" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    drawWordmark(ref.current, [
      { text: "SPIDER", tile: "blackstone", edge: "#e0313f", depth: "#3a0a10" },
      { text: "STUDIOS", tile: "stone", edge: "#555", depth: "#2a2a2a" },
    ]);
  }, []);
  return <canvas ref={ref} className={className} role="img" aria-label="SpiderStudios" />;
}
