// Generated stand-ins for thumbnails, designs and video previews — they demo every
// feature until Mehul's real files are dropped in. All visibly marked SAMPLE.
import type { ThumbArt } from "@/content/thumbnails";
import type { DesignPiece } from "@/content/designs";
import { hashString, mulberry32 } from "./rng";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Blocky character head expressing an emotion, drawn as SVG rects (pixel art). */
function head(cx: number, cy: number, size: number, emotion: ThumbArt["subject"], skin: string, hair: string): string {
  const p = size / 8;
  const r: string[] = [];
  const px = (x: number, y: number, c: string, w = 1, h = 1) =>
    r.push(`<rect x="${cx - size / 2 + x * p}" y="${cy - size / 2 + y * p}" width="${w * p + 0.5}" height="${h * p + 0.5}" fill="${c}"/>`);
  px(0, 0, skin, 8, 8);
  px(0, 0, hair, 8, 2);
  px(0, 2, hair, 1, 1);
  px(7, 2, hair, 1, 1);
  const dark = "#2a1a12";
  if (emotion === "shock") {
    px(1, 3, "#fff", 2, 2);
    px(5, 3, "#fff", 2, 2);
    px(2, 4, dark);
    px(5, 4, dark);
    px(3, 5, dark, 2, 3);
  } else if (emotion === "hype") {
    px(1, 3, "#fff", 2, 1);
    px(5, 3, "#fff", 2, 1);
    px(2, 3, dark);
    px(5, 3, dark);
    px(2, 5, dark, 4, 1);
    px(2, 6, "#e0313f", 4, 1);
  } else if (emotion === "smug") {
    px(1, 3, dark, 2, 1);
    px(5, 3, dark, 2, 1);
    px(3, 6, dark, 3, 1);
    px(5, 5, dark);
  } else {
    px(1, 3, "#fff", 2, 1);
    px(5, 3, "#fff", 2, 1);
    px(2, 3, dark);
    px(6, 3, dark);
    px(3, 6, dark, 2, 1);
  }
  return `<g filter="url(#sh)">${r.join("")}</g>`;
}

export function thumbSvg(art: ThumbArt, opts: { sample?: boolean; seed?: string } = {}): string {
  const W = 1280;
  const H = 720;
  const rnd = mulberry32(hashString(opts.seed ?? art.headline));
  const faceX = art.side === "left" ? 360 : 920;
  const textX = art.side === "left" ? 1180 : 100;
  const anchor = art.side === "left" ? "end" : "start";
  const skin = ["#c68863", "#eac0a0", "#a96d4b", "#d9a27e"][Math.floor(rnd() * 4)];
  const words = art.headline.split(" ");
  const lines: string[] = [];
  if (art.clutter) {
    for (let i = 0; i < words.length; i += 2) lines.push(words.slice(i, i + 2).join(" "));
  } else lines.push(art.headline);
  const fs = art.clutter ? 70 : art.headline.length > 8 ? 120 : 170;
  const headSize = art.clutter ? 300 : 470;
  const extras: string[] = [];
  if (art.extras?.includes("glow")) extras.push(`<circle cx="${faceX}" cy="380" r="330" fill="${art.accent}" opacity="0.18"/>`);
  if (art.extras?.includes("circle")) {
    const cx = art.side === "left" ? 820 : 420;
    extras.push(`<circle cx="${cx}" cy="560" r="80" fill="none" stroke="${art.accent === "#ffffff" ? "#e0313f" : art.accent}" stroke-width="16"/>`);
  }
  if (art.extras?.includes("arrow")) {
    const x = art.side === "left" ? 640 : 560;
    const dir = art.side === "left" ? -1 : 1;
    extras.push(
      `<path d="M ${x} 600 L ${x - dir * 130} 470 L ${x - dir * 95} 500 L ${x - dir * 170} 430 L ${x - dir * 120} 420 L ${x - dir * 200} 350" stroke="${art.accent}" stroke-width="26" fill="none" stroke-linejoin="miter" filter="url(#sh)"/>`,
    );
  }
  if (art.extras?.includes("badge")) {
    const bx = art.side === "left" ? 1000 : 100;
    extras.push(`<rect x="${bx}" y="560" width="180" height="70" fill="${art.accent}" filter="url(#sh)"/><text x="${bx + 90}" y="610" font-size="42" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" fill="#111">NEW</text>`);
  }
  // background "scene": blocky skyline
  const sky: string[] = [];
  for (let i = 0; i < 18; i++) {
    const w = 60 + rnd() * 90;
    const x = i * 75 - 20;
    const h = 120 + rnd() * 260;
    sky.push(`<rect x="${x}" y="${H - h}" width="${w}" height="${h}" fill="#000" opacity="${0.12 + rnd() * 0.12}"/>`);
  }
  const textY = art.sub ? 330 : 400;
  const text = lines
    .map(
      (l, i) =>
        `<text x="${textX}" y="${textY + i * (fs * 0.95)}" font-size="${fs}" text-anchor="${anchor}" font-family="Impact, 'Arial Black', 'Helvetica Neue', sans-serif" font-weight="900" fill="${art.ink}" stroke="${art.stroke}" stroke-width="${art.lowContrast ? 2 : 14}" paint-order="stroke" letter-spacing="2">${esc(l)}</text>`,
    )
    .join("");
  const sub = art.sub
    ? `<rect x="${anchor === "end" ? textX - 420 : textX}" y="${textY + 40 + (lines.length - 1) * fs * 0.95}" width="420" height="90" fill="${art.accent}" opacity="${art.lowContrast ? 0.4 : 1}"/><text x="${anchor === "end" ? textX - 210 : textX + 210}" y="${textY + 105 + (lines.length - 1) * fs * 0.95}" font-size="60" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" fill="#111">${esc(art.sub)}</text>`
    : "";
  const badge = opts.sample
    ? `<g><rect x="16" y="16" width="150" height="44" fill="#000" opacity="0.65"/><text x="91" y="48" font-size="28" text-anchor="middle" font-family="monospace" fill="#ffff55">SAMPLE</text></g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${art.bg[0]}"/><stop offset="1" stop-color="${art.bg[1]}"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity="0.55"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>${sky.join("")}${extras.join("")}
${head(faceX, 390, headSize, art.subject, skin, "#1a120c")}
${text}${sub}${badge}</svg>`;
}

export function svgUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function designSvg(d: DesignPiece): string {
  const { art } = d;
  const isSquare = d.kind === "carousel" || d.kind === "logo";
  const W = isSquare ? 1080 : d.kind === "banner" ? 1600 : 1080;
  const H = isSquare ? 1080 : d.kind === "banner" ? 900 : 1350;
  const sample = d.sample ? `<rect x="24" y="24" width="190" height="56" fill="#000" opacity="0.6"/><text x="119" y="64" font-size="34" text-anchor="middle" font-family="monospace" fill="#ffff55">SAMPLE</text>` : "";
  let body = "";
  if (d.kind === "carousel") {
    body = `<rect x="90" y="90" width="${W - 180}" height="${H - 180}" fill="none" stroke="${art.ink}" stroke-width="4"/>
<text x="140" y="300" font-size="140" font-family="Georgia, serif" font-weight="700" fill="${art.ink}">${esc(art.title)}</text>
<rect x="140" y="350" width="220" height="10" fill="#e0313f"/>
${[0, 1, 2].map((i) => `<rect x="140" y="${460 + i * 110}" width="${600 - i * 120}" height="34" fill="${art.ink}" opacity="0.18"/>`).join("")}
<text x="${W - 140}" y="${H - 140}" font-size="44" text-anchor="end" font-family="Helvetica, Arial" fill="${art.ink}">${esc(art.sub)}</text>`;
  } else if (d.kind === "poster") {
    body = `<circle cx="${W / 2}" cy="560" r="330" fill="${art.ink}" opacity="0.12"/>
<text x="${W / 2}" y="680" font-size="300" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" fill="${art.ink}" letter-spacing="8">${esc(art.title)}</text>
<rect x="0" y="${H - 260}" width="${W}" height="160" fill="#000" opacity="0.35"/>
<text x="${W / 2}" y="${H - 155}" font-size="70" text-anchor="middle" font-family="monospace" fill="#ffffff">${esc(art.sub)}</text>`;
  } else if (d.kind === "logo") {
    body = `<g transform="translate(${W / 2},${H / 2 - 40})">
<rect x="-220" y="-220" width="440" height="440" fill="none" stroke="${art.ink}" stroke-width="22"/>
<text x="0" y="70" font-size="200" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" fill="${art.ink}">${esc(art.title)}</text></g>
<text x="${W / 2}" y="${H - 160}" font-size="54" text-anchor="middle" font-family="Helvetica, Arial" fill="#ffffff" letter-spacing="12">${esc(art.sub.toUpperCase())}</text>`;
  } else {
    body = `<rect x="0" y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="#000" opacity="0.25"/>
<text x="120" y="${H * 0.5}" font-size="200" font-family="Impact, 'Arial Black', sans-serif" fill="${art.ink}">${esc(art.title)}</text>
<text x="120" y="${H * 0.8}" font-size="70" font-family="monospace" fill="#ffffff">${esc(art.sub)}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${art.bg[0]}"/><stop offset="1" stop-color="${art.bg[1]}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>${body}${sample}</svg>`;
}

/**
 * Animated stand-in for a video: draws a frame of a fake edit at time t into ctx.
 * Cuts flash on markers so Edit X-Ray has something to show.
 */
export function drawPlaceholderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  opts: { title: string; palette: [string, string]; cuts: number[]; bpm?: number; vertical?: boolean; raw?: boolean; sample?: boolean },
) {
  const shot = opts.cuts.filter((c) => c <= t).length;
  const rnd = mulberry32(shot * 977 + hashString(opts.title));
  const [a, b] = opts.palette;
  if (opts.raw) {
    // raw footage: flat, grey, long takes
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#555";
    for (let i = 0; i < 6; i++) ctx.fillRect(((t * 20 + i * 140) % (w + 100)) - 100, h * 0.55, 80, h * 0.3);
    ctx.fillStyle = "#bbb";
    ctx.font = `${Math.round(h * 0.06)}px monospace`;
    ctx.fillText("RAW FOOTAGE", w * 0.05, h * 0.12);
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, a);
    g.addColorStop(1, rnd() > 0.5 ? b : a);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // moving blocky shapes per shot
    const n = 6 + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) {
      const sx = rnd() * w;
      const sy = rnd() * h;
      const s = (0.05 + rnd() * 0.18) * Math.min(w, h);
      const vx = (rnd() - 0.5) * 300;
      const vy = (rnd() - 0.5) * 200;
      const lt = t - (opts.cuts[shot - 1] ?? 0);
      ctx.fillStyle = i % 3 === 0 ? b : `rgba(255,255,255,${0.08 + rnd() * 0.15})`;
      ctx.fillRect(sx + vx * lt, sy + vy * lt, s, s);
    }
    // beat pulse
    if (opts.bpm) {
      const beat = (t * opts.bpm) / 60;
      const pulse = Math.max(0, 1 - (beat % 1) * 4);
      ctx.fillStyle = `rgba(255,255,255,${pulse * 0.12})`;
      ctx.fillRect(0, 0, w, h);
    }
    // cut flash
    const sinceCut = t - (opts.cuts[shot - 1] ?? -1);
    if (sinceCut >= 0 && sinceCut < 0.06) {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(0, 0, w, h);
    }
  }
  // title
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.fillStyle = "#ffffff";
  const fs = Math.max(10, Math.round(Math.min(w, h) * (opts.vertical ? 0.07 : 0.065)));
  ctx.font = `bold ${fs}px monospace`;
  ctx.textBaseline = "middle";
  const title = opts.title.length > 28 && opts.vertical ? opts.title.slice(0, 26) + "…" : opts.title;
  ctx.fillText(title, w * 0.04, h * 0.86);
  ctx.fillStyle = "#ffff55";
  ctx.font = `${Math.round(fs * 0.7)}px monospace`;
  ctx.fillText(opts.sample ? "SAMPLE — real edit goes here" : "", w * 0.04, h * 0.94);
  ctx.textBaseline = "alphabetic";
}

/** Synthetic cut / beat markers for sample projects. */
export function sampleMarkers(slug: string, duration: number, bpm?: number) {
  const rnd = mulberry32(hashString(slug));
  const cuts: number[] = [];
  let t = 0.4 + rnd() * 0.8;
  const avg = bpm ? 60 / bpm : 1.1;
  while (t < duration - 0.3) {
    cuts.push(+t.toFixed(2));
    t += avg * (1 + Math.floor(rnd() * 3)) * (0.7 + rnd() * 0.6);
  }
  const beats: number[] = [];
  if (bpm) for (let b = 60 / bpm; b < duration; b += 60 / bpm) beats.push(+b.toFixed(3));
  return { cuts, beats };
}
