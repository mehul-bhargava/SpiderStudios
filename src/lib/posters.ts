"use client";
import type { VideoProject } from "@/content/projects";
import { drawPlaceholderFrame } from "@/engine/placeholders";
import { projectMarkers } from "./media";

const cache = new Map<string, string>();

/** Poster image for a project: the real poster if provided, else a generated frame. */
export function posterUrl(p: VideoProject): string {
  if (p.media.poster) return p.media.poster;
  const hit = cache.get(p.slug);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 180;
  const ctx = c.getContext("2d")!;
  // vertical projects get a letterboxed 9:16 frame in the middle
  if (p.aspect === "9:16") {
    ctx.fillStyle = "#0b0812";
    ctx.fillRect(0, 0, 320, 180);
    const v = document.createElement("canvas");
    v.width = 101;
    v.height = 180;
    drawPlaceholderFrame(v.getContext("2d")!, 101, 180, 1.4, { title: p.title, palette: p.palette, cuts: projectMarkers(p).cuts, bpm: p.bpm, vertical: true, sample: p.sample });
    ctx.drawImage(v, 110, 0);
  } else drawPlaceholderFrame(ctx, 320, 180, 1.4, { title: p.title, palette: p.palette, cuts: projectMarkers(p).cuts, bpm: p.bpm, sample: p.sample });
  const url = c.toDataURL("image/png");
  cache.set(p.slug, url);
  return url;
}
