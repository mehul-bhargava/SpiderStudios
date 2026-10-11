"use client";
// Procedural 16×16 block textures — all original, painted at runtime into one atlas.
import { hashString, mulberry32 } from "./rng";

type RGB = [number, number, number];
const cache = new Map<string, RGB>();
export function rgb(h: string): RGB {
  let v = cache.get(h);
  if (!v) {
    const s = h.replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    cache.set(h, v);
  }
  return v;
}

export class P {
  d = new Uint8ClampedArray(16 * 16 * 4);
  r: () => number;
  constructor(seed: number) {
    this.r = mulberry32(seed);
  }
  set(x: number, y: number, c: string, a = 255) {
    if (x < 0 || y < 0 || x > 15 || y > 15) return;
    const [r, g, b] = rgb(c);
    const i = (y * 16 + x) * 4;
    this.d[i] = r;
    this.d[i + 1] = g;
    this.d[i + 2] = b;
    this.d[i + 3] = a;
  }
  clear(x: number, y: number) {
    const i = (y * 16 + x) * 4;
    this.d[i + 3] = 0;
  }
  tint(x: number, y: number, k: number) {
    const i = (y * 16 + x) * 4;
    this.d[i] *= k;
    this.d[i + 1] *= k;
    this.d[i + 2] *= k;
  }
  pick(pal: string[]) {
    return pal[Math.floor(this.r() * pal.length)];
  }
  fill(c: string) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) this.set(x, y, c);
  }
  noise(pal: string[]) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) this.set(x, y, this.pick(pal));
  }
  speck(pal: string[], density: number) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (this.r() < density) this.set(x, y, this.pick(pal));
  }
  rect(x: number, y: number, w: number, h: number, c: string | string[]) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) this.set(i, j, Array.isArray(c) ? this.pick(c) : c);
  }
  frame(c: string, inset = 0) {
    for (let i = inset; i < 16 - inset; i++) {
      this.set(i, inset, c);
      this.set(i, 15 - inset, c);
      this.set(inset, i, c);
      this.set(15 - inset, i, c);
    }
  }
  bricks(pal: string[], mortar: string, h = 4, w = 8) {
    this.noise(pal);
    for (let row = 0; row < 16 / h; row++) {
      const y = row * h + h - 1;
      for (let x = 0; x < 16; x++) this.set(x, y, mortar);
      const off = row % 2 ? w / 2 : 0;
      for (let x = off; x < 16; x += w) for (let j = row * h; j < row * h + h - 1; j++) this.set(x, j, mortar);
    }
  }
  planks(pal: string[], dark: string) {
    this.noise(pal);
    for (const y of [3, 7, 11, 15]) for (let x = 0; x < 16; x++) this.set(x, y, dark);
    [
      [5, 0],
      [12, 4],
      [3, 8],
      [10, 12],
    ].forEach(([x, y]) => {
      for (let j = y; j < y + 3; j++) this.set(x, j, dark);
    });
  }
  logSide(pal: string[], dark: string) {
    for (let x = 0; x < 16; x++) {
      const c = x % 4 === 0 ? dark : this.pick(pal);
      for (let y = 0; y < 16; y++) this.set(x, y, this.r() < 0.15 ? dark : c);
    }
  }
  rings(bark: string, pal: string[]) {
    this.fill(bark);
    for (let y = 1; y < 15; y++)
      for (let x = 1; x < 15; x++) {
        const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
        this.set(x, y, pal[Math.floor(d) % pal.length]);
      }
  }
  topBand(c: string[], rows: number, jag = true) {
    for (let x = 0; x < 16; x++) {
      const h = rows + (jag && this.r() < 0.5 ? 1 : 0);
      for (let y = 0; y < h; y++) this.set(x, y, this.pick(c));
    }
  }
  holes(density: number) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (this.r() < density) this.clear(x, y);
  }
  transparent() {
    for (let i = 3; i < this.d.length; i += 4) this.d[i] = 0;
  }
}

type Painter = (p: P) => void;

const STONE = ["#7f7f7f", "#878787", "#747474", "#6d6d6d", "#828282"];
const DIRT = ["#86603e", "#79553a", "#966c4a", "#6b4a30", "#8c6343"];
const GRASS = ["#6aa84f", "#5f9b45", "#77b85a", "#58903f", "#71ad55"];
const OAK = ["#b08a55", "#a37e4b", "#bb9561", "#9c7745"];
const DARK_OAK = ["#4a3220", "#53392a", "#41291a", "#5a3e2c"];
const SAND = ["#e3d4a0", "#dccb94", "#e9dbab", "#d6c48c"];
const PINK = ["#d88474", "#cf7a6a", "#e0907f", "#c77163"];
const DEEP = ["#3a3a40", "#34343a", "#404047", "#2e2e33"];
const SCULK = ["#0b2b33", "#0d333c", "#082228", "#0f3a44"];
const ENDS = ["#dcdc9e", "#e4e3a8", "#d2d293", "#e8e8b4"];
const PURPUR = ["#a77ba7", "#b088b0", "#9d6f9d", "#b791b7"];
const OBS = ["#140d1f", "#1b1129", "#0f0a17", "#22163a"];
const NRACK = ["#6f2b2b", "#7c3030", "#622424", "#843838", "#5a2020"];
const BLACK = ["#27242a", "#2d2a31", "#211f24", "#332f37"];

const wool = (base: string, light: string, dark: string): Painter => (p) => {
  p.noise([base, base, light, dark]);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if ((x + y) % 4 === 0 && p.r() < 0.4) p.set(x, y, dark);
};
const concrete = (base: string, var1: string): Painter => (p) => {
  p.fill(base);
  p.speck([var1], 0.12);
};
const terracotta = (pal: string[]): Painter => (p) => {
  p.noise(pal);
  p.speck([pal[pal.length - 1]], 0.1);
};

export const painters: Record<string, Painter> = {
  stone: (p) => {
    p.noise(STONE);
    p.speck(["#5f5f5f"], 0.06);
  },
  cobblestone: (p) => {
    p.noise(["#8a8a8a", "#7b7b7b", "#949494"]);
    for (let i = 0; i < 9; i++) {
      const x = Math.floor(p.r() * 14);
      const y = Math.floor(p.r() * 14);
      p.rect(x, y, 3, 2, "#5a5a5a");
    }
  },
  smooth_stone: (p) => {
    p.noise(["#a3a3a3", "#9e9e9e", "#a8a8a8"]);
    p.frame("#8a8a8a");
  },
  dirt: (p) => p.noise(DIRT),
  grass_top: (p) => {
    p.noise(GRASS);
    p.speck(["#4f8538", "#83c066"], 0.08);
  },
  grass_side: (p) => {
    p.noise(DIRT);
    p.topBand(GRASS, 3);
  },
  sand: (p) => p.noise(SAND),
  suspicious_sand: (p) => {
    p.noise(SAND);
    p.speck(["#a88d55", "#8c7445"], 0.12);
  },
  sandstone_top: (p) => {
    p.noise(["#e0cf96", "#dbc98f", "#e6d6a0"]);
  },
  sandstone_side: (p) => {
    p.noise(["#d9c68c", "#e0cf96", "#cfbb80"]);
    p.rect(0, 0, 16, 3, ["#e6d6a0", "#ebdcab"]);
    p.rect(0, 12, 16, 4, ["#c9b47a", "#cdb97e"]);
    p.rect(0, 3, 16, 1, "#c2ad73");
  },
  red_sandstone: (p) => {
    p.noise(["#c4652a", "#b85d25", "#cc6e31"]);
    p.rect(0, 0, 16, 3, ["#d27a3d"]);
    p.rect(0, 3, 16, 1, "#9e4f1f");
  },
  pink_terracotta: terracotta(PINK),
  pink_carved: (p) => {
    p.noise(PINK);
    p.frame("#b8645a");
    p.rect(5, 3, 6, 10, "#efe6d8");
    p.rect(6, 4, 4, 8, "#3a2a2a");
    p.rect(7, 2, 2, 1, "#efe6d8");
  },
  pink_lattice: (p) => {
    p.noise(PINK);
    for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) p.set(x, y, "#f2e9dc");
    p.frame("#b8645a");
  },
  cream: (p) => {
    p.noise(["#efe6d8", "#e8dfcf", "#f4ecdf"]);
  },
  yellow_terracotta: terracotta(["#c9953f", "#c08b37", "#d19e48"]),
  orange_terracotta: terracotta(["#a65a2e", "#9c532a", "#ae6334"]),
  oak_planks: (p) => p.planks(OAK, "#7d6038"),
  dark_oak_planks: (p) => p.planks(DARK_OAK, "#2e1f13"),
  spruce_planks: (p) => p.planks(["#73532f", "#6b4c2b", "#7b5a34"], "#4c351e"),
  oak_log: (p) => p.logSide(["#6b5232", "#5d4629", "#735936"], "#4a3820"),
  oak_log_top: (p) => p.rings("#5d4629", ["#b08a55", "#9c7745", "#b08a55", "#a37e4b"]),
  jungle_log: (p) => p.logSide(["#5a4a26", "#665530", "#4f411f"], "#3f3418"),
  leaves: (p) => {
    p.noise(["#3f7f2f", "#4a8f37", "#357028", "#56a040"]);
    p.holes(0.18);
  },
  palm_leaves: (p) => {
    p.noise(["#5d9a2f", "#6aa83a", "#4f8a26"]);
    p.holes(0.28);
  },
  glass: (p) => {
    p.transparent();
    p.frame("#dfeff5");
    p.set(3, 3, "#ffffff");
    p.set(4, 4, "#ffffff");
    p.set(5, 5, "#ffffff");
    p.set(10, 3, "#ffffff");
    p.set(11, 4, "#ffffff");
  },
  bookshelf: (p) => {
    p.planks(OAK, "#7d6038");
    const books = ["#8e2b2b", "#2b4f8e", "#2b8e4b", "#8e7a2b", "#5a2b8e", "#2b8e8e", "#6b3a1f"];
    for (const row of [1, 9]) {
      p.rect(0, row, 16, 6, "#3a2814");
      let x = 1;
      while (x < 15) {
        const w = 1 + Math.floor(p.r() * 2);
        const h = 4 + Math.floor(p.r() * 2);
        p.rect(x, row + 6 - h, w, h, p.pick(books));
        x += w + (p.r() < 0.3 ? 1 : 0);
      }
    }
  },
  crafting_top: (p) => {
    p.planks(OAK, "#7d6038");
    p.frame("#6b4f2c");
    p.rect(2, 2, 12, 12, ["#a07c48", "#9a7643"]);
    for (const v of [6, 10]) {
      for (let i = 2; i < 14; i++) {
        p.set(v, i, "#6b4f2c");
        p.set(i, v, "#6b4f2c");
      }
    }
  },
  crafting_side: (p) => {
    p.planks(OAK, "#7d6038");
    p.rect(0, 0, 16, 3, "#6b4f2c");
    p.rect(3, 5, 2, 8, "#8a8a8a"); // saw
    p.rect(2, 5, 4, 2, "#5a3d1e");
    p.rect(10, 6, 4, 2, "#8a8a8a"); // hammer
    p.rect(11, 8, 2, 5, "#5a3d1e");
  },
  deepslate: (p) => {
    p.noise(DEEP);
    for (let y = 0; y < 16; y += 3) for (let x = 0; x < 16; x++) if (p.r() < 0.4) p.set(x, y, "#28282d");
  },
  deepslate_bricks: (p) => p.bricks(["#4a4a50", "#45454b", "#505056"], "#2a2a2f"),
  deepslate_tiles: (p) => p.bricks(["#37373d", "#3c3c42", "#323238"], "#1f1f23", 8, 8),
  reinforced_deepslate: (p) => {
    p.noise(["#3c4446", "#363d3f", "#424a4c"]);
    p.frame("#dcd6c2");
    p.frame("#2a3133", 1);
    p.rect(6, 6, 4, 4, "#dcd6c2");
  },
  chiseled_deepslate: (p) => {
    p.noise(DEEP);
    p.frame("#25252a");
    p.rect(4, 4, 8, 8, "#2a2a30");
    p.rect(6, 6, 4, 4, "#4a4a52");
  },
  sculk: (p) => {
    p.noise(SCULK);
    for (let i = 0; i < 10; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), p.pick(["#1fd3e0", "#29dfeb", "#0e8e99"]));
  },
  sculk_sensor_top: (p) => {
    p.noise(SCULK);
    p.frame("#04161a");
    p.rect(5, 5, 6, 6, "#0e8e99");
    p.rect(6, 6, 4, 4, "#29dfeb");
  },
  soul_sand: (p) => {
    p.noise(["#51402f", "#4a3a2b", "#5a4734"]);
    for (let i = 0; i < 3; i++) {
      const x = 2 + Math.floor(p.r() * 10);
      const y = 2 + Math.floor(p.r() * 10);
      p.rect(x, y, 3, 1, "#2e231a");
      p.set(x, y + 2, "#2e231a");
      p.set(x + 2, y + 2, "#2e231a");
    }
  },
  end_stone: (p) => {
    p.noise(ENDS);
    p.speck(["#b8b77a", "#c6c588"], 0.12);
  },
  end_stone_bricks: (p) => p.bricks(ENDS, "#b5b47c"),
  purpur: (p) => {
    p.noise(PURPUR);
    p.frame("#8a5f8a");
    for (let i = 0; i < 16; i++) {
      p.set(i, 7, "#8a5f8a");
      p.set(7, i, "#8a5f8a");
    }
  },
  purpur_pillar: (p) => {
    p.noise(PURPUR);
    for (let y = 0; y < 16; y++) {
      p.set(0, y, "#8a5f8a");
      p.set(15, y, "#8a5f8a");
      p.set(4, y, "#9a6f9a");
      p.set(11, y, "#9a6f9a");
    }
  },
  obsidian: (p) => {
    p.noise(OBS);
    for (let i = 0; i < 6; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), p.pick(["#3b2a5c", "#4a3570"]));
  },
  crying_obsidian: (p) => {
    p.noise(OBS);
    for (let i = 0; i < 12; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), p.pick(["#7a2bd6", "#a14df0", "#5b1fa8"]));
  },
  bedrock: (p) => {
    p.noise(["#565656", "#3a3a3a", "#6e6e6e", "#2a2a2a"]);
  },
  netherrack: (p) => {
    p.noise(NRACK);
    p.speck(["#4a1a1a"], 0.08);
  },
  nether_bricks: (p) => p.bricks(["#3d1c21", "#45212a", "#371a1f"], "#1f0d10", 4, 8),
  blackstone: (p) => {
    p.noise(BLACK);
    p.speck(["#3d3842"], 0.1);
  },
  blackstone_bricks: (p) => p.bricks(["#36323b", "#3d3842", "#302c34"], "#1a181c"),
  gilded_blackstone: (p) => {
    p.noise(BLACK);
    p.speck(["#e0a32b", "#f2c14e"], 0.12);
  },
  red_trim: (p) => {
    p.noise(BLACK);
    p.rect(0, 6, 16, 4, ["#e0313f", "#c92a37", "#ea4553"]);
  },
  basalt: (p) => {
    for (let x = 0; x < 16; x++) {
      const c = p.pick(["#4c4c52", "#55555b", "#45454b", "#5c5c62"]);
      for (let y = 0; y < 16; y++) p.set(x, y, p.r() < 0.1 ? "#3a3a3f" : c);
    }
  },
  basalt_top: (p) => p.rings("#3a3a3f", ["#5c5c62", "#4c4c52", "#55555b"]),
  crimson_nylium: (p) => {
    p.noise(["#9c1c1c", "#8a1717", "#ad2424", "#7a1414"]);
  },
  crimson_side: (p) => {
    p.noise(NRACK);
    p.topBand(["#9c1c1c", "#8a1717", "#ad2424"], 3);
  },
  crimson_stem: (p) => p.logSide(["#7a2a3a", "#6b2433", "#8a3344"], "#4a1621"),
  wart_block: (p) => {
    p.noise(["#8a1010", "#7a0c0c", "#9c1717", "#6b0a0a"]);
  },
  shroomlight: (p) => {
    p.noise(["#ffb35a", "#ff9f3d", "#ffc46e"]);
    p.speck(["#e07a2a"], 0.1);
  },
  glowstone: (p) => {
    p.noise(["#f8d66a", "#e6b84a", "#ffe58a", "#c99a3a"]);
  },
  lava: (p) => {
    p.noise(["#ff7a1a", "#ff5a00", "#ff9a2a", "#ffb84a", "#e64a00"]);
  },
  magma: (p) => {
    p.noise(["#5a1a0a", "#4a1408", "#6b2410"]);
    for (let i = 0; i < 18; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), p.pick(["#ff7a1a", "#ffb84a"]));
  },
  redstone_block: (p) => {
    p.noise(["#b51b10", "#a31409", "#c42419"]);
    p.frame("#7a0c05");
  },
  lamp_on: (p) => {
    p.noise(["#f5c26b", "#ffd88a", "#e8a94a"]);
    p.frame("#6b3f1a");
    for (let i = 3; i < 13; i += 3) {
      p.set(i, 7, "#fff1c4");
      p.set(7, i, "#fff1c4");
    }
  },
  lamp_off: (p) => {
    p.noise(["#5a3a22", "#4a2f1c", "#6b4528"]);
    p.frame("#3a2414");
  },
  note_block: (p) => {
    p.planks(DARK_OAK, "#2e1f13");
    p.frame("#2e1f13");
    p.rect(6, 4, 2, 7, "#111");
    p.rect(4, 9, 3, 3, "#111");
    p.rect(8, 4, 3, 2, "#111");
  },
  jukebox_top: (p) => {
    p.planks(DARK_OAK, "#2e1f13");
    p.frame("#2e1f13");
    p.rect(3, 6, 10, 4, "#0d0d0d");
  },
  enchant_top: (p) => {
    p.noise(["#9e2a2a", "#b03030", "#8a2020"]);
    p.frame("#2a1a3a");
    p.rect(3, 3, 10, 10, ["#2fd0c4", "#25b3a8"]);
  },
  enchant_side: (p) => {
    p.noise(OBS);
    p.rect(0, 0, 16, 4, ["#9e2a2a", "#b03030"]);
  },
  loom_top: (p) => {
    p.planks(OAK, "#7d6038");
    for (let x = 2; x < 14; x += 2) for (let y = 2; y < 14; y++) p.set(x, y, "#e8e0d0");
  },
  loom_side: (p) => {
    p.planks(OAK, "#7d6038");
    p.rect(3, 4, 10, 8, ["#c94a4a", "#e8e0d0", "#3a6ac9"]);
  },
  cartography_top: (p) => {
    p.planks(DARK_OAK, "#2e1f13");
    p.rect(2, 2, 12, 12, ["#d8c89a", "#cdbb88"]);
    p.rect(4, 5, 3, 2, "#5a8a3a");
    p.rect(8, 8, 4, 3, "#3a6ac9");
    p.set(10, 4, "#c92a2a");
  },
  cartography_side: (p) => {
    p.planks(DARK_OAK, "#2e1f13");
    p.rect(2, 3, 12, 6, ["#d8c89a", "#cdbb88"]);
  },
  target_top: (p) => {
    p.noise(["#f2ece0", "#ebe4d6"]);
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d < 2) p.set(x, y, "#d42a2a");
        else if (d > 4 && d < 5.5) p.set(x, y, "#d42a2a");
        else if (d > 7) p.set(x, y, "#c9b26a");
      }
  },
  hay: (p) => {
    p.noise(["#d1aa2a", "#c09a20", "#dcb83a"]);
    p.rect(0, 6, 16, 3, ["#8a2a1a", "#7a2416"]);
  },
  white_concrete: concrete("#e6e8ea", "#dadcde"),
  light_gray_concrete: concrete("#a0a0a0", "#999999"),
  gray_concrete: concrete("#4a4d52", "#45484d"),
  black_concrete: concrete("#141418", "#1b1b20"),
  red_concrete: concrete("#a02428", "#962026"),
  grid: (p) => {
    p.fill("#f2f2f2");
    for (let i = 0; i < 16; i++) {
      p.set(i, 0, "#c8c8c8");
      p.set(0, i, "#c8c8c8");
    }
    p.set(8, 8, "#d8d8d8");
  },
  structure_block: (p) => {
    p.noise(["#3a3540", "#433d4a"]);
    p.frame("#1a161e");
    p.rect(4, 4, 8, 8, "#5e4d6e");
    p.rect(6, 6, 4, 4, "#b8a6c9");
  },
  command_block: (p) => {
    p.noise(["#c88a5a", "#b97c4e"]);
    p.frame("#6b4428");
    p.rect(4, 4, 8, 8, "#2a2a2a");
    p.rect(6, 7, 3, 1, "#ffffff");
  },
  scaffold: (p) => {
    p.transparent();
    p.frame("#d8b45a");
    for (let i = 0; i < 16; i++) p.set(i, i, "#c49e48");
  },
  wool_white: wool("#e9ecec", "#f5f7f7", "#d6d9d9"),
  wool_red: wool("#a12722", "#b02e28", "#8a201c"),
  wool_black: wool("#1d1d21", "#26262b", "#141417"),
  wool_yellow: wool("#f8c527", "#ffd23f", "#e0ad1a"),
  wool_cyan: wool("#158991", "#1a9aa3", "#10777e"),
  wool_purple: wool("#7a2aac", "#8a35bd", "#68219a"),
  wool_lime: wool("#70b919", "#7fca22", "#5fa312"),
  wool_orange: wool("#f07613", "#ff8a26", "#d9660c"),
  wool_pink: wool("#ed8dac", "#f7a3bd", "#d97a98"),
  wool_blue: wool("#35399d", "#3f44b0", "#2c2f88"),
  gold_block: (p) => {
    p.noise(["#f7d23e", "#f2c42a", "#ffe066"]);
    p.frame("#c99a17");
  },
  iron_block: (p) => {
    p.noise(["#dcdcdc", "#d2d2d2", "#e6e6e6"]);
    p.frame("#b5b5b5");
  },
  quartz: (p) => {
    p.noise(["#ece6dd", "#e6e0d6", "#f2ece4"]);
  },
  lapis: (p) => {
    p.noise(["#1f4aa8", "#2554bc", "#1a3f94"]);
  },
  emerald_block: (p) => {
    p.noise(["#2fd06a", "#24bd5c", "#3ae07a"]);
    p.frame("#14904a");
  },
  sea_lantern: (p) => {
    p.noise(["#dff2ec", "#cbe8e0", "#e8f7f2"]);
    p.frame("#9fd0c4");
  },
  froglight: (p) => {
    p.noise(["#f5e6b0", "#ffeec2", "#ead79a"]);
    p.frame("#d8c080");
  },
  portal_frame_top: (p) => {
    p.noise(["#3d6b5a", "#2f5a4a", "#4a7a68"]);
    p.frame("#dcdc9e");
    p.rect(5, 5, 6, 6, "#1a3a2a");
  },
  chorus: (p) => {
    p.noise(["#5e3a6b", "#6b4478", "#523060"]);
    p.speck(["#8a6a9a"], 0.1);
  },
  chorus_flower: (p) => {
    p.noise(["#9a7aa8", "#b08cbd", "#8a6a98"]);
    p.frame("#6b4478");
  },
  shulker: (p) => {
    p.noise(["#8f5a9a", "#9a64a5", "#84508f"]);
    p.rect(0, 7, 16, 2, "#5a3060");
  },
  // cross plants (rendered as X billboards)
  tall_grass: (p) => {
    p.transparent();
    for (let i = 0; i < 9; i++) {
      const x = 1 + Math.floor(p.r() * 14);
      const h = 5 + Math.floor(p.r() * 9);
      for (let y = 15; y > 15 - h; y--) p.set(x + (y < 8 && p.r() < 0.3 ? 1 : 0), y, p.pick(GRASS));
    }
  },
  poppy: (p) => {
    p.transparent();
    for (let y = 8; y < 16; y++) p.set(7, y, "#3f7f2f");
    p.set(6, 11, "#3f7f2f");
    p.rect(6, 4, 3, 3, "#d42a2a");
    p.set(7, 3, "#d42a2a");
    p.set(7, 5, "#1a1a1a");
  },
  marigold: (p) => {
    p.transparent();
    for (let y = 8; y < 16; y++) p.set(7, y, "#3f7f2f");
    p.rect(5, 3, 5, 5, ["#ff9a1a", "#ffb02e", "#f08a10"]);
    p.set(7, 5, "#c06a00");
  },
  crimson_roots: (p) => {
    p.transparent();
    for (let i = 0; i < 6; i++) {
      const x = 2 + Math.floor(p.r() * 12);
      for (let y = 15; y > 6 + Math.floor(p.r() * 4); y--) p.set(x, y, p.pick(["#9c1c1c", "#c42a2a", "#7a1414"]));
    }
  },
  sculk_vein: (p) => {
    p.transparent();
    for (let i = 0; i < 20; i++) p.set(Math.floor(p.r() * 16), Math.floor(p.r() * 16), p.pick(["#0f3a44", "#1fd3e0"]));
  },
  dead_bush: (p) => {
    p.transparent();
    for (let y = 6; y < 16; y++) p.set(7 + Math.round(Math.sin(y) * 1.5), y, "#8a6a3a");
    for (let i = 0; i < 6; i++) p.set(4 + Math.floor(p.r() * 8), 5 + Math.floor(p.r() * 6), "#8a6a3a");
  },
  soul_fire: (p) => {
    p.transparent();
    for (let y = 4; y < 16; y++) {
      const w = Math.floor((y - 3) / 2);
      for (let x = 8 - w; x < 8 + w; x++) if (p.r() < 0.8) p.set(x, y, p.pick(["#29dfeb", "#6af2f8", "#1aa6b0"]));
    }
  },
};

export const ATLAS_COLS = 16;
export const tileNames = Object.keys(painters);
export const tileIndex: Record<string, number> = Object.fromEntries(tileNames.map((n, i) => [n, i]));

let atlasCanvas: HTMLCanvasElement | null = null;

export function getAtlasCanvas(): HTMLCanvasElement {
  if (atlasCanvas) return atlasCanvas;
  const rows = Math.ceil(tileNames.length / ATLAS_COLS);
  const c = document.createElement("canvas");
  c.width = ATLAS_COLS * 16;
  c.height = rows * 16;
  const ctx = c.getContext("2d")!;
  tileNames.forEach((name, i) => {
    const p = new P(hashString(name));
    painters[name](p);
    const img = new ImageData(p.d, 16, 16);
    ctx.putImageData(img, (i % ATLAS_COLS) * 16, Math.floor(i / ATLAS_COLS) * 16);
  });
  atlasCanvas = c;
  return c;
}

export function atlasRows() {
  return Math.ceil(tileNames.length / ATLAS_COLS);
}

/** Draws a single tile to a fresh canvas (used for UI). */
export function tileCanvas(name: string): HTMLCanvasElement {
  const atlas = getAtlasCanvas();
  const i = tileIndex[name] ?? 0;
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 16;
  c.getContext("2d")!.drawImage(atlas, (i % ATLAS_COLS) * 16, Math.floor(i / ATLAS_COLS) * 16, 16, 16, 0, 0, 16, 16);
  return c;
}
