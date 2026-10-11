"use client";
// Modular skin compositor: layers → standard 64×64 skin. Exports work in real Minecraft.
import { mulberry32 } from "./rng";

export type SkinConfig = {
  skin: string;
  eyes: "classic" | "wide" | "sleepy" | "happy";
  eyeColor: string;
  face: "none" | "glasses" | "shades" | "stubble" | "beard" | "mask";
  hair: "none" | "buzz" | "short" | "fade" | "messy" | "long" | "curly" | "spiky";
  hairColor: string;
  shirt: "tee" | "stripe" | "collar" | "tank" | "logo" | "kurta";
  shirtColor: string;
  jacket: "none" | "hoodie" | "bomber" | "varsity" | "spider" | "tactical";
  jacketColor: string;
  trousers: "jeans" | "cargo" | "shorts" | "joggers";
  trousersColor: string;
  shoes: "sneakers" | "boots" | "hightops" | "slides";
  shoesColor: string;
  headwear: "none" | "cap" | "backcap" | "beanie" | "headphones" | "headset" | "bucket" | "crown" | "pumpkin";
  headwearColor: string;
  accessory: "none" | "cape" | "backpack" | "scarf" | "chain" | "spider_pet" | "elytra";
  accessoryColor: string;
  held: "none" | "camera" | "clapper" | "pen" | "pickaxe" | "cricket_bat" | "controller" | "spider_plush" | "axolotl_plush" | "mug" | "film_reel";
  slim: boolean;
  imported: string | null;
};

type Opt<T extends string> = { id: T; name: string; unlock?: string };

export const catalog = {
  hair: [
    { id: "none", name: "Bald" },
    { id: "buzz", name: "Buzz cut" },
    { id: "short", name: "Short" },
    { id: "fade", name: "Fade" },
    { id: "messy", name: "Messy" },
    { id: "long", name: "Long" },
    { id: "curly", name: "Curly" },
    { id: "spiky", name: "Spiky" },
  ] as Opt<SkinConfig["hair"]>[],
  eyes: [
    { id: "classic", name: "Classic" },
    { id: "wide", name: "Wide" },
    { id: "sleepy", name: "Sleepy" },
    { id: "happy", name: "Happy" },
  ] as Opt<SkinConfig["eyes"]>[],
  face: [
    { id: "none", name: "Clean" },
    { id: "glasses", name: "Glasses" },
    { id: "shades", name: "Shades" },
    { id: "stubble", name: "Stubble" },
    { id: "beard", name: "Beard" },
    { id: "mask", name: "Face mask" },
  ] as Opt<SkinConfig["face"]>[],
  shirt: [
    { id: "tee", name: "Tee" },
    { id: "stripe", name: "Striped tee" },
    { id: "collar", name: "Collar shirt" },
    { id: "tank", name: "Tank top" },
    { id: "logo", name: "Spider logo tee" },
    { id: "kurta", name: "Kurta" },
  ] as Opt<SkinConfig["shirt"]>[],
  jacket: [
    { id: "none", name: "No jacket" },
    { id: "hoodie", name: "Hoodie" },
    { id: "bomber", name: "Bomber" },
    { id: "varsity", name: "Varsity" },
    { id: "spider", name: "Spider hoodie" },
    { id: "tactical", name: "Tactical jacket" },
  ] as Opt<SkinConfig["jacket"]>[],
  trousers: [
    { id: "jeans", name: "Jeans" },
    { id: "cargo", name: "Cargos" },
    { id: "shorts", name: "Shorts" },
    { id: "joggers", name: "Joggers" },
  ] as Opt<SkinConfig["trousers"]>[],
  shoes: [
    { id: "sneakers", name: "Sneakers" },
    { id: "boots", name: "Boots" },
    { id: "hightops", name: "High-tops" },
    { id: "slides", name: "Slides" },
  ] as Opt<SkinConfig["shoes"]>[],
  headwear: [
    { id: "none", name: "Nothing" },
    { id: "cap", name: "Cap" },
    { id: "backcap", name: "Backwards cap" },
    { id: "beanie", name: "Beanie" },
    { id: "headphones", name: "Headphones" },
    { id: "headset", name: "Gaming headset" },
    { id: "bucket", name: "Bucket hat" },
    { id: "pumpkin", name: "Carved pumpkin" },
    { id: "crown", name: "Crown", unlock: "credits" },
  ] as Opt<SkinConfig["headwear"]>[],
  accessory: [
    { id: "none", name: "Nothing" },
    { id: "cape", name: "Cape" },
    { id: "backpack", name: "Backpack" },
    { id: "scarf", name: "Scarf" },
    { id: "chain", name: "Chain" },
    { id: "spider_pet", name: "Spider pet" },
    { id: "elytra", name: "Elytra", unlock: "climb" },
  ] as Opt<SkinConfig["accessory"]>[],
  held: [
    { id: "none", name: "Empty hand" },
    { id: "camera", name: "Camera" },
    { id: "clapper", name: "Clapperboard" },
    { id: "pen", name: "Tablet pen" },
    { id: "pickaxe", name: "Pickaxe" },
    { id: "cricket_bat", name: "Cricket bat" },
    { id: "controller", name: "Controller" },
    { id: "spider_plush", name: "Spider plushie" },
    { id: "axolotl_plush", name: "Axolotl plushie" },
    { id: "mug", name: "Chai mug" },
    { id: "film_reel", name: "Film reel" },
  ] as Opt<SkinConfig["held"]>[],
};

export const heldSprite: Record<SkinConfig["held"], string | null> = {
  none: null,
  camera: "camera",
  clapper: "clapper",
  pen: "tool_pen",
  pickaxe: "pickaxe",
  cricket_bat: "cricket_bat",
  controller: "controller",
  spider_plush: "spider",
  axolotl_plush: "axolotl",
  mug: "mug",
  film_reel: "tool_reel",
};

// 16 dye-inspired swatches + skin tones
export const dyes = [
  "#f9fffe", "#9d9d97", "#474f52", "#1d1d21", "#835432", "#b02e26", "#f9801d", "#fed83d",
  "#80c71f", "#5e7c16", "#169c9c", "#3ab3da", "#3c44aa", "#8932b8", "#c74ebd", "#f38baa",
];
export const skinTones = ["#f6d7c3", "#eac0a0", "#d9a27e", "#c68863", "#a96d4b", "#8a5638", "#6b4129", "#4a2c1c"];

export const defaultSkin: SkinConfig = {
  skin: "#c68863",
  eyes: "classic",
  eyeColor: "#3a2414",
  face: "none",
  hair: "short",
  hairColor: "#1d1d21",
  shirt: "tee",
  shirtColor: "#f9fffe",
  jacket: "spider",
  jacketColor: "#1d1d21",
  trousers: "jeans",
  trousersColor: "#3c44aa",
  shoes: "sneakers",
  shoesColor: "#f9fffe",
  headwear: "none",
  headwearColor: "#b02e26",
  accessory: "none",
  accessoryColor: "#b02e26",
  held: "none",
  slim: false,
  imported: null,
};

export const presets: { id: string; name: string; config: SkinConfig }[] = [
  {
    id: "mehul",
    name: "Mehul (Creator)",
    config: {
      ...defaultSkin,
      hair: "messy",
      hairColor: "#1a120c",
      jacket: "spider",
      jacketColor: "#1d1d21",
      shirt: "tee",
      shirtColor: "#b02e26",
      headwear: "headphones",
      headwearColor: "#e0313f",
      held: "camera",
      trousers: "cargo",
      trousersColor: "#474f52",
      shoes: "hightops",
      shoesColor: "#f9fffe",
    },
  },
  {
    id: "explorer",
    name: "Explorer",
    config: {
      ...defaultSkin,
      skin: "#eac0a0",
      hair: "short",
      hairColor: "#835432",
      jacket: "none",
      shirt: "tee",
      shirtColor: "#169c9c",
      trousers: "jeans",
      trousersColor: "#3c44aa",
      shoes: "boots",
      shoesColor: "#835432",
      held: "pickaxe",
    },
  },
  {
    id: "agent",
    name: "Agent",
    config: {
      ...defaultSkin,
      skin: "#a96d4b",
      hair: "fade",
      hairColor: "#1d1d21",
      face: "shades",
      jacket: "tactical",
      jacketColor: "#2b2b33",
      shirt: "tee",
      shirtColor: "#1d1d21",
      trousers: "cargo",
      trousersColor: "#2b2b33",
      shoes: "boots",
      shoesColor: "#1d1d21",
      headwear: "headset",
      headwearColor: "#e0313f",
      held: "controller",
    },
  },
  {
    id: "spider",
    name: "Spider",
    config: {
      ...defaultSkin,
      skin: "#d9a27e",
      hair: "spiky",
      hairColor: "#1d1d21",
      eyes: "wide",
      jacket: "spider",
      jacketColor: "#1d1d21",
      shirt: "logo",
      shirtColor: "#b02e26",
      trousers: "joggers",
      trousersColor: "#1d1d21",
      shoes: "sneakers",
      shoesColor: "#b02e26",
      accessory: "spider_pet",
      held: "spider_plush",
    },
  },
];

export const mehulSkin = presets[0].config;

// ── compositor ──────────────────────────────────────────────────────────────

type Rect = { x: number; y: number; w: number; h: number };
type FaceName = "top" | "bottom" | "right" | "front" | "left" | "back";
type PartUV = { u: number; v: number; w: number; h: number; d: number };

export const PARTS = {
  head: { u: 0, v: 0, w: 8, h: 8, d: 8 },
  hat: { u: 32, v: 0, w: 8, h: 8, d: 8 },
  body: { u: 16, v: 16, w: 8, h: 12, d: 4 },
  jacket: { u: 16, v: 32, w: 8, h: 12, d: 4 },
  rarm: { u: 40, v: 16, w: 4, h: 12, d: 4 },
  rsleeve: { u: 40, v: 32, w: 4, h: 12, d: 4 },
  larm: { u: 32, v: 48, w: 4, h: 12, d: 4 },
  lsleeve: { u: 48, v: 48, w: 4, h: 12, d: 4 },
  rleg: { u: 0, v: 16, w: 4, h: 12, d: 4 },
  rpant: { u: 0, v: 32, w: 4, h: 12, d: 4 },
  lleg: { u: 16, v: 48, w: 4, h: 12, d: 4 },
  lpant: { u: 0, v: 48, w: 4, h: 12, d: 4 },
} satisfies Record<string, PartUV>;

export function faceRects(p: PartUV): Record<FaceName, Rect> {
  const { u, v, w, h, d } = p;
  return {
    top: { x: u + d, y: v, w, h: d },
    bottom: { x: u + d + w, y: v, w, h: d },
    right: { x: u, y: v + d, w: d, h },
    front: { x: u + d, y: v + d, w, h },
    left: { x: u + d + w, y: v + d, w: d, h },
    back: { x: u + d + w + d, y: v + d, w, h },
  };
}

function shadeHex(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * k)));
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * k)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * k)));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

class SP {
  ctx: CanvasRenderingContext2D;
  r = mulberry32(42);
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  px(x: number, y: number, c: string, vary = 0.05) {
    this.ctx.fillStyle = vary ? shadeHex(c, 1 - vary + this.r() * vary * 2) : c;
    this.ctx.fillRect(x, y, 1, 1);
  }
  clear(x: number, y: number) {
    this.ctx.clearRect(x, y, 1, 1);
  }
  rect(r: Rect, c: string, vary = 0.05) {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) this.px(x, y, c, vary);
  }
  all(p: PartUV, c: string, vary = 0.05) {
    const f = faceRects(p);
    (Object.keys(f) as FaceName[]).forEach((k) => this.rect(f[k], c, vary));
  }
  /** rows y0..y1 (box-local, 0 = top) on the four side faces, plus top/bottom caps. */
  band(p: PartUV, y0: number, y1: number, c: string | ((face: FaceName, x: number, y: number) => string | null), vary = 0.05, faces: FaceName[] = ["right", "front", "left", "back"]) {
    const f = faceRects(p);
    for (const k of faces) {
      const r = f[k];
      for (let y = y0; y <= y1; y++)
        for (let x = 0; x < r.w; x++) {
          const col = typeof c === "string" ? c : c(k, x, y);
          if (col) this.px(r.x + x, r.y + y, col, vary);
        }
    }
    if (y0 === 0 && faces.length === 4) this.rect(f.top, typeof c === "string" ? c : c("top", 0, 0) ?? "#000", vary);
    if (y1 === p.h - 1 && faces.length === 4) this.rect(f.bottom, typeof c === "string" ? c : c("bottom", 0, 0) ?? "#000", vary);
  }
  on(p: PartUV, face: FaceName, fn: (x: number, y: number) => string | null, vary = 0.04) {
    const r = faceRects(p)[face];
    for (let y = 0; y < r.h; y++)
      for (let x = 0; x < r.w; x++) {
        const c = fn(x, y);
        if (c === "clear") this.clear(r.x + x, r.y + y);
        else if (c) this.px(r.x + x, r.y + y, c, vary);
      }
  }
}

export function composeSkin(cfg: SkinConfig, target?: HTMLCanvasElement): HTMLCanvasElement {
  const c = target ?? document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 64, 64);
  const p = new SP(ctx);
  const P = PARTS;

  // 1. skin
  for (const part of [P.head, P.body, P.rarm, P.larm, P.rleg, P.lleg]) p.all(part, cfg.skin, 0.03);

  // 2. face
  const dark = shadeHex(cfg.skin, 0.62);
  const mid = shadeHex(cfg.skin, 0.85);
  p.on(P.head, "front", (x, y) => {
    if (cfg.eyes === "sleepy") {
      if (y === 4 && (x === 1 || x === 2 || x === 5 || x === 6)) return shadeHex(cfg.skin, 0.4);
    } else if (cfg.eyes === "wide") {
      if ((y === 3 || y === 4) && (x === 1 || x === 6)) return "#f4f4f4";
      if ((y === 3 || y === 4) && (x === 2 || x === 5)) return cfg.eyeColor;
    } else {
      if (y === 4 && (x === 1 || x === 6)) return "#f4f4f4";
      if (y === 4 && (x === 2 || x === 5)) return cfg.eyeColor;
    }
    if (y === 5 && (x === 3 || x === 4)) return mid;
    if (cfg.eyes === "happy") {
      if (y === 6 && (x === 2 || x === 5)) return dark;
      if (y === 7 && x >= 3 && x <= 4) return dark;
    } else if (y === 6 && x >= 3 && x <= 4) return dark;
    return null;
  });
  if (cfg.hair !== "none") p.on(P.head, "front", (x, y) => (y === 3 && (x === 1 || x === 2 || x === 5 || x === 6) ? shadeHex(cfg.hairColor, 1.1) : null));

  if (cfg.face === "stubble" || cfg.face === "beard") {
    const bc = cfg.face === "beard" ? cfg.hairColor : shadeHex(cfg.skin, 0.72);
    p.on(P.head, "front", (x, y) => {
      if (y === 7) return bc;
      if (y === 6 && (x <= 1 || x >= 6 || cfg.face === "beard")) return x >= 3 && x <= 4 && cfg.face === "beard" ? shadeHex(cfg.skin, 0.5) : bc;
      if (y === 5 && cfg.face === "beard" && (x === 0 || x === 7)) return bc;
      return null;
    });
    for (const side of ["right", "left"] as const) p.on(P.head, side, (x, y) => (y >= 5 && (side === "right" ? x >= 5 : x <= 2) ? bc : null));
  }
  if (cfg.face === "mask") p.on(P.head, "front", (x, y) => (y >= 5 ? "#2b2b33" : null));

  // 3. trousers
  const tc = cfg.trousersColor;
  for (const leg of [P.rleg, P.lleg]) {
    const rows = cfg.trousers === "shorts" ? 5 : 11;
    p.band(leg, 0, rows, (f, x, y) => {
      if (cfg.trousers === "jeans" && f === "front" && x === 0 && y > 1) return shadeHex(tc, 0.8);
      if (cfg.trousers === "joggers" && y >= 9) return shadeHex(tc, 0.75);
      if (cfg.trousers === "cargo" && (f === "right" || f === "left") && y >= 4 && y <= 7 && x >= 1 && x <= 2) return shadeHex(tc, 0.75);
      return tc;
    }, 0.06);
    p.rect(faceRects(leg).top, tc, 0.05);
  }

  // 4. shoes
  const sc = cfg.shoesColor;
  for (const leg of [P.rleg, P.lleg]) {
    const r = faceRects(leg);
    if (cfg.shoes === "boots") p.band(leg, 8, 11, (_f, _x, y) => (y === 11 ? "#2a1a0a" : sc));
    else if (cfg.shoes === "hightops") p.band(leg, 8, 11, (f, x, y) => (y === 11 ? "#eeeeee" : f === "front" && y === 9 && (x === 1 || x === 2) ? "#ffffff" : sc));
    else if (cfg.shoes === "slides") p.band(leg, 11, 11, sc);
    else p.band(leg, 10, 11, (_f, _x, y) => (y === 11 ? "#eeeeee" : sc));
    p.rect(r.bottom, cfg.shoes === "slides" ? sc : "#2a2a2a", 0.05);
  }

  // 5. shirt
  const shc = cfg.shirtColor;
  const sleeves = cfg.shirt === "tank" ? 0 : cfg.shirt === "kurta" ? 10 : 4;
  p.band(P.body, 0, 11, (f, x, y) => {
    if (cfg.shirt === "stripe" && y % 3 === 2) return shadeHex(shc, 0.6);
    if (cfg.shirt === "collar" && f === "front" && y <= 1 && (x <= 2 || x >= 5)) return "#f4f4f4";
    if (cfg.shirt === "tank" && (f === "front" || f === "back") && y === 0 && x >= 2 && x <= 5) return cfg.skin;
    if (cfg.shirt === "logo" && f === "front") {
      if (y >= 3 && y <= 6 && x >= 2 && x <= 5) {
        if ((y === 4 && (x === 3 || x === 4)) || (y === 5 && (x === 3 || x === 4))) return "#e0313f";
        if (y === 3 || y === 6) return x % 2 ? "#111" : null;
        return "#111";
      }
    }
    if (cfg.shirt === "kurta" && f === "front" && x >= 3 && x <= 4 && y <= 4) return "#f2c14e";
    if (y === 11 && cfg.shirt !== "kurta") return "#3a2414";
    return shc;
  }, 0.05);
  if (sleeves) for (const arm of [P.rarm, P.larm]) p.band(arm, 0, sleeves - 1, (f, x, y) => (cfg.shirt === "stripe" && y % 3 === 2 ? shadeHex(shc, 0.6) : shc));
  if (cfg.shirt === "kurta") for (const pant of [P.rpant, P.lpant]) p.band(pant, 0, 4, (_f, _x, y) => (y === 4 ? "#f2c14e" : shc), 0.04, ["right", "front", "left", "back"]);

  // 6. jacket (overlay layers)
  const jc = cfg.jacket === "spider" ? cfg.jacketColor || "#1d1d21" : cfg.jacketColor;
  if (cfg.jacket !== "none") {
    const open = cfg.jacket === "bomber";
    p.band(P.jacket, 0, 11, (f, x, y) => {
      if (open && f === "front" && (x === 3 || x === 4) && y < 10) return null;
      if ((cfg.jacket === "hoodie" || cfg.jacket === "spider") && f === "front") {
        if (y >= 1 && y <= 3 && (x === 3 || x === 4) && cfg.jacket === "hoodie") return "#eeeeee";
        if (y >= 7 && y <= 9 && x >= 2 && x <= 5) return shadeHex(jc, 0.75);
      }
      if (cfg.jacket === "spider" && f === "front") {
        if (y === 3 && (x === 2 || x === 5)) return "#ff4655";
        if (y === 3 && (x === 3 || x === 4)) return "#a0141f";
        if (y === 2 && (x === 1 || x === 6)) return "#3a3a42";
        if (y === 4 && (x === 0 || x === 7)) return "#3a3a42";
      }
      if (cfg.jacket === "varsity" && f === "front" && y >= 2 && y <= 5 && x >= 1 && x <= 2) return y === 2 || y === 5 || x === 1 ? "#f9fffe" : jc;
      if (cfg.jacket === "tactical") {
        if (f === "front" && (x === y - 1 || x === y - 2) && y < 9) return "#3a3a42";
        if (f === "front" && y === 8 && x !== 3 && x !== 4) return shadeHex(jc, 0.7);
      }
      if (y >= 10 && (cfg.jacket === "bomber" || cfg.jacket === "varsity")) return shadeHex(jc, 0.7);
      if (y === 0 && open) return shadeHex(jc, 0.7);
      return jc;
    }, 0.06);
    const sleeveColor = cfg.jacket === "varsity" ? "#eeeeee" : jc;
    for (const s of [P.rsleeve, P.lsleeve])
      p.band(s, 0, 11, (_f, _x, y) => {
        if (cfg.jacket === "tactical" && (y === 2 || y === 3)) return y === 2 ? "#e0313f" : "#ff4655";
        if (cfg.jacket === "varsity" && y >= 10) return jc;
        if (y === 11 && cfg.jacket !== "spider") return shadeHex(sleeveColor, 0.75);
        return sleeveColor;
      }, 0.06);
    if (cfg.jacket === "hoodie" || cfg.jacket === "spider") {
      p.on(P.hat, "back", (_x, y) => (y >= 5 ? jc : null), 0.06);
      p.on(P.hat, "right", (x, y) => (y >= 6 && x <= 2 ? jc : null), 0.06);
      p.on(P.hat, "left", (x, y) => (y >= 6 && x >= 5 ? jc : null), 0.06);
    }
  }

  // 7. hair
  const hc = cfg.hairColor;
  const hair = cfg.hair;
  if (hair !== "none") {
    const dither = (x: number, y: number) => (x + y) % 2 === 0;
    p.rect(faceRects(P.head).top, hair === "buzz" ? shadeHex(hc, 1.15) : hc, 0.08);
    if (hair === "buzz") {
      p.on(P.head, "top", (x, y) => (dither(x, y) ? cfg.skin : null));
      p.on(P.head, "front", (x, y) => (y === 0 && dither(x, y) ? hc : null));
    } else {
      const spec = {
        short: { front: 1, side: 2, back: 3 },
        fade: { front: 1, side: 1, back: 2 },
        messy: { front: 2, side: 3, back: 5 },
        long: { front: 1, side: 8, back: 8 },
        curly: { front: 2, side: 3, back: 4 },
        spiky: { front: 1, side: 2, back: 3 },
      }[hair];
      p.on(P.head, "front", (x, y) => {
        if (y < spec.front) return hair === "messy" && y === 1 && (x === 2 || x === 5) ? null : hc;
        if (hair === "long" && (x === 0 || x === 7)) return hc;
        if (hair === "spiky" && y === 1 && x % 2 === 0) return hc;
        return null;
      }, 0.08);
      p.on(P.head, "right", (x, y) => (y < spec.side || (hair === "fade" && y === 1 && dither(x, y)) ? hc : null), 0.08);
      p.on(P.head, "left", (x, y) => (y < spec.side || (hair === "fade" && y === 1 && dither(x, y)) ? hc : null), 0.08);
      p.on(P.head, "back", (x, y) => (y < spec.back || (hair === "fade" && y === spec.back && dither(x, y)) ? hc : null), 0.08);
      if (hair === "messy" || hair === "curly" || hair === "spiky") {
        p.on(P.hat, "top", (x, y) => ((hair === "spiky" ? (x + y) % 3 === 0 : (x * 3 + y * 5) % 4 !== 0) ? shadeHex(hc, 1.12) : null), 0.08);
        p.on(P.hat, "front", (x, y) => (y === 0 && (hair === "spiky" ? x % 2 === 1 : x % 3 !== 1) ? hc : null), 0.08);
        for (const side of ["right", "left", "back"] as const) p.on(P.hat, side, (x, y) => (y === 0 && (x + (hair === "curly" ? 1 : 0)) % 2 === 0 ? hc : null), 0.08);
      }
      if (hair === "long") p.on(P.hat, "back", (_x, y) => (y <= 7 ? hc : null), 0.08);
    }
  }

  // 8. eyewear on the hat layer
  if (cfg.face === "glasses")
    p.on(P.hat, "front", (x, y) => {
      if ((y === 3 || y === 5) && (x === 1 || x === 2 || x === 5 || x === 6)) return "#1a1a1e";
      if (y === 4 && (x === 0 || x === 3 || x === 4 || x === 7)) return "#1a1a1e";
      return null;
    }, 0);
  if (cfg.face === "shades")
    p.on(P.hat, "front", (x, y) => {
      if (y === 4 && x >= 0 && x <= 7) return x === 1 || x === 5 ? "#3a3a52" : "#0d0d10";
      if (y === 3 && (x === 1 || x === 2 || x === 5 || x === 6)) return "#0d0d10";
      return null;
    }, 0);

  return c;
}

/** Draw an imported 64×64 (or legacy 64×32) skin onto a 64×64 canvas. */
export function drawImported(img: HTMLImageElement, target?: HTMLCanvasElement): HTMLCanvasElement {
  const c = target ?? document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.drawImage(img, 0, 0);
  if (img.height === 32) {
    // legacy: mirror right limbs into left slots
    ctx.drawImage(c, 0, 16, 16, 16, 16, 48, 16, 16);
    ctx.drawImage(c, 40, 16, 16, 16, 32, 48, 16, 16);
  }
  return c;
}

export function randomSkin(): SkinConfig {
  const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
  const ids = <T extends string>(o: Opt<T>[]) => o.filter((x) => !x.unlock).map((x) => x.id);
  return {
    ...defaultSkin,
    skin: pick(skinTones),
    eyes: pick(ids(catalog.eyes)),
    face: pick(ids(catalog.face)),
    hair: pick(ids(catalog.hair)),
    hairColor: pick(["#1d1d21", "#3a2414", "#835432", "#d9b36a", "#b02e26", "#f9fffe", "#8932b8"]),
    shirt: pick(ids(catalog.shirt)),
    shirtColor: pick(dyes),
    jacket: pick(ids(catalog.jacket)),
    jacketColor: pick(dyes),
    trousers: pick(ids(catalog.trousers)),
    trousersColor: pick(dyes),
    shoes: pick(ids(catalog.shoes)),
    shoesColor: pick(dyes),
    headwear: pick(ids(catalog.headwear)),
    headwearColor: pick(dyes),
    accessory: pick(ids(catalog.accessory)),
    accessoryColor: pick(dyes),
    held: pick(ids(catalog.held)),
  };
}

// Share-by-link: compact base64 JSON of the config (minus imported image).
export function encodeSkin(cfg: SkinConfig): string {
  const { imported: _imported, ...rest } = cfg;
  void _imported;
  return btoa(unescape(encodeURIComponent(JSON.stringify(rest)))).replace(/=+$/, "");
}

export function decodeSkin(s: string): SkinConfig | null {
  try {
    const obj = JSON.parse(decodeURIComponent(escape(atob(s))));
    return { ...defaultSkin, ...obj, imported: null };
  } catch {
    return null;
  }
}
