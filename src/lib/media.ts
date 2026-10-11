import type { Thumbnail } from "@/content/thumbnails";
import type { DesignPiece } from "@/content/designs";
import type { VideoProject } from "@/content/projects";
import { sampleMarkers } from "@/engine/placeholders";

export function thumbUrl(t: Thumbnail, alt?: number): string {
  if (alt === undefined) return t.image ?? `/ph/thumb/${t.slug}`;
  const a = t.alternates?.[alt];
  return a?.image ?? `/ph/thumb/${t.slug}?alt=${alt}`;
}

export function designUrl(d: DesignPiece): string {
  return d.image ?? `/ph/design/${d.slug}`;
}

export function projectMarkers(p: VideoProject): { cuts: number[]; beats: number[] } {
  const synthetic = sampleMarkers(p.slug, p.durationSec, p.bpm);
  return { cuts: p.markers?.cuts ?? synthetic.cuts, beats: p.markers?.beats ?? synthetic.beats };
}

export function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
