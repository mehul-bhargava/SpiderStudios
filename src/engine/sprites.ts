"use client";
// Original pixel-art item sprites, authored as text grids. Each sprite becomes a
// crisp UI icon AND (via extrudeSprite) a 3D held item — exactly how block games
// render items in hand.
import { blocks, B } from "./blocks";
import { tileCanvas } from "./textures";

export type Sprite = { w: number; h: number; px: (string | null)[] };

function S(rows: string[], pal: Record<string, string>): Sprite {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const px: (string | null)[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x] ?? ".";
      px.push(ch === "." || ch === " " ? null : pal[ch] ?? null);
    }
  return { w, h, px };
}

function grid(w: number, h: number, f: (x: number, y: number) => string | null): Sprite {
  const px: (string | null)[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px.push(f(x, y));
  return { w, h, px };
}

function orb(fill: string, light: string, dark: string, rim: string, extra?: (x: number, y: number, d: number) => string | null): Sprite {
  return grid(16, 16, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 6.2) return null;
    if (extra) {
      const e = extra(x, y, d);
      if (e) return e;
    }
    if (d > 5.3) return rim;
    if (x + y < 11 && d < 4.5 && d > 2.5) return light;
    if (x + y > 19) return dark;
    return fill;
  });
}

function disc(label: string): Sprite {
  return grid(16, 16, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 6.8) return null;
    if (d < 1) return null;
    if (d < 2.6) return label;
    if (d > 6) return "#111114";
    return (x + y) % 5 === 0 ? "#2c2c33" : "#1d1d22";
  });
}

function scatter(pal: string[], seed: number, shape: "diamond" | "pile" = "pile"): Sprite {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return grid(16, 16, (x, y) => {
    const inside = shape === "diamond" ? Math.abs(x - 7.5) + Math.abs(y - 8.5) < 6.5 : y > 6 && Math.abs(x - 7.5) < (y - 4) * 0.9;
    if (!inside) return null;
    return r() < 0.55 ? pal[Math.floor(r() * pal.length)] : null;
  });
}

function bottle(liquid: string, light: string): Sprite {
  return S(
    [
      "................",
      "......kkkk......",
      "......kbbk......",
      ".......gg.......",
      ".......gg.......",
      "......g..g......",
      ".....g....g.....",
      "....gLLLLLLg....",
      "...gLwLLLLLLg...",
      "...gLwLLLLLLg...",
      "...gLLLLLLLLg...",
      "...gLLLLLLLLg...",
      "....gLLLLLLg....",
      ".....gggggg.....",
    ],
    { k: "#5a3d1e", b: "#8a6a3a", g: "#c9e6ee", L: liquid, w: light },
  );
}

function filmStrip(color: string): Sprite {
  return grid(16, 16, (x, y) => {
    if (y < 2 || y > 13) return null;
    if (x === 1 || x === 14) return (y % 3 === 0 ? "#eeeeee" : "#1a1a1e");
    if (x === 0 || x === 15) return "#1a1a1e";
    if (y === 2 || y === 13 || y === 7 || y === 8) return "#1a1a1e";
    return (x + y) % 7 === 0 ? "#ffffff" : color;
  });
}

const K = "#1a1a1e";

export const sprites: Record<string, Sprite> = {
  camera: S(
    [
      "................",
      "................",
      "................",
      "....kkkk........",
      "...kmmmmk..kkk..",
      ".kkkkkkkkkkkrrk.",
      "kddddddddddddddk",
      "kdddkkkkkkdddddk",
      "kddkbbbbbbkddddk",
      "kddkbllbbbkddddk",
      "kddkblbbbbkddddk",
      "kddkbbbbbbkddddk",
      "kdddkkkkkkdddddk",
      "kddddddddddddddk",
      ".kkkkkkkkkkkkkk.",
    ],
    { k: K, m: "#5a5a64", d: "#3a3a42", b: "#24426e", l: "#9fd0ff", r: "#e0313f" },
  ),
  headphones: S(
    [
      "................",
      ".....kkkkkk.....",
      "...kksssssskk...",
      "..ks........sk..",
      ".ks..........sk.",
      ".ks..........sk.",
      ".ks..........sk.",
      ".ks..........sk.",
      "kkkk........kkkk",
      "krrk........krrk",
      "krrk........krrk",
      "krrk........krrk",
      "krrk........krrk",
      ".kk..........kk.",
    ],
    { k: K, s: "#4a4a54", r: "#e0313f" },
  ),
  memory_card: S(
    [
      "................",
      "................",
      "....kkkkkk......",
      "....kykykyk.....",
      "....kykykykk....",
      "....kwwwwwwwk...",
      "....kwrrrrrwk...",
      "....kwrWWWrwk...",
      "....kwrrrrrwk...",
      "....kwwwwwwwk...",
      "....kwwwwwwwk...",
      "....kwwwwwwwk...",
      "....kkkkkkkkk...",
    ],
    { k: "#0d0d10", y: "#f2c14e", w: "#2b2b33", r: "#e0313f", W: "#ffffff" },
  ),
  film_frame: S(
    [
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kwkwkwkwkwkwkk.",
      ".kkkkkkkkkkkkkk.",
      ".kaaaaaaaaaaaak.",
      ".kaaaaaaasaaaak.",
      ".kaaaaaassaaaak.",
      ".kaaaaasssaaaak.",
      ".kaaaagggggaaak.",
      ".kagggggggggaak.",
      ".kkkkkkkkkkkkkk.",
      ".kwkwkwkwkwkwkk.",
      ".kkkkkkkkkkkkkk.",
    ],
    { k: K, w: "#e8e8e8", a: "#ffaa00", s: "#fff1a8", g: "#c9631a" },
  ),
  controller: S(
    [
      "................",
      "................",
      "................",
      "...kkkkkkkkkk...",
      "..kddddddddddk..",
      ".kddwdddddddrdk.",
      ".kdwwwdddddgdbk.",
      ".kddwdddddddydk.",
      ".kddddkkkkdddddk",
      "kdddddk..kddddk.",
      "kddddk....kdddk.",
      ".kkkk......kkk..",
    ],
    { k: K, d: "#3a3a42", w: "#d8d8d8", r: "#e0313f", g: "#55ff55", b: "#5599ff", y: "#ffff55" },
  ),
  phone: S(
    [
      ".....kkkkkk.....",
      "....kddddddk....",
      "....kssssssk....",
      "....ksrrrrsk....",
      "....ksrwwrsk....",
      "....ksrrrrsk....",
      "....kssssssk....",
      "....ksyyyysk....",
      "....kssssssk....",
      "....ksccccsk....",
      "....kssssssk....",
      "....kssssssk....",
      "....kddddddk....",
      "....kdddwddk....",
      ".....kkkkkk.....",
    ],
    { k: K, d: "#2b2b33", s: "#1b2a3a", r: "#e0313f", w: "#ffffff", y: "#ffff55", c: "#55ffff" },
  ),
  clapper: S(
    [
      "................",
      "..kkkkkkkkkkkk..",
      "..kwkkwwkkwwkk..",
      "..kkwwkkwwkkwk..",
      "..kkkkkkkkkkkk..",
      "..kddddddddddk..",
      "..kdwwwdddwwdk..",
      "..kddddddddddk..",
      "..kdwwdwwwddwk..",
      "..kddddddddddk..",
      "..kdwwwwddwwdk..",
      "..kddddddddddk..",
      "..kkkkkkkkkkkk..",
    ],
    { k: K, w: "#eeeeee", d: "#2b2b33" },
  ),
  mic: S(
    [
      "......kkkk......",
      ".....kmmmmk.....",
      ".....kmwmmk.....",
      ".....kmmmmk.....",
      ".....kmmmmk.....",
      "......kkkk......",
      "....k..kk..k....",
      ".....k.kk.k.....",
      "......kkkk......",
      ".......kk.......",
      ".......kk.......",
      ".....kkkkkk.....",
    ],
    { k: K, m: "#8a8a94", w: "#dddddd" },
  ),
  cricket_bat: S(
    [
      "..............kk",
      ".............krk",
      "............krk.",
      "...........kkk..",
      "..........kwwk..",
      ".........kwwwk..",
      "........kwwwk...",
      ".......kwwwk....",
      "......kwwwk.....",
      ".....kwwwk......",
      "....kwwwk.......",
      "...kwwwk........",
      "..kwwwk.........",
      ".kwwwk..........",
      ".kwwk...........",
      "..kk............",
    ],
    { k: "#5a3d1e", w: "#e8cf98", r: "#e0313f" },
  ),
  tool_brush: S(
    [
      "..............kk",
      ".............kbk",
      "............kbk.",
      "...........kbk..",
      "..........kbk...",
      ".........kbk....",
      "........kbk.....",
      ".......kgk......",
      "......kggk......",
      ".....kpppk......",
      "....kpppk.......",
      "...kpppk........",
      "..kppk..........",
      "..kpk...........",
      "...k............",
    ],
    { k: K, b: "#8a5a2a", g: "#c9c9c9", p: "#55ffff" },
  ),
  tool_reel: grid(16, 16, (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7) return null;
    if (d > 6.2) return "#2a2a30";
    for (const [cx, cy] of [
      [7.5, 4.2],
      [10.8, 9.4],
      [4.2, 9.4],
    ])
      if (Math.hypot(x - cx, y - cy) < 1.6) return "#120c1a";
    if (d < 1.2) return "#120c1a";
    return d < 3 ? "#9a6bff" : "#5a3ea8";
  }),
  tool_shears: S(
    [
      "................",
      ".kk.........kk..",
      "kwwk.......kwwk.",
      "kwwk......kwwk..",
      ".kwwk....kwwk...",
      "..kwwk..kwwk....",
      "...kwwkkwwk.....",
      "....kwrrwk......",
      "....kkrrkk......",
      "...krrkkrrk.....",
      "..krr.kk.rrk....",
      "..kr..k..k.rk...",
      "..krrk....krrk..",
      "...kk......kk...",
    ],
    { k: K, w: "#d8d8de", r: "#55ffff" },
  ),
  tool_palette: grid(16, 16, (x, y) => {
    const d = Math.hypot((x - 7.5) * 1, (y - 8) * 1.25);
    if (d > 7.2) return null;
    if (Math.hypot(x - 10.5, y - 10.5) < 1.6) return null;
    if (d > 6.4) return "#5a3d1e";
    const spots: [number, number, string][] = [
      [4, 6, "#e0313f"],
      [7, 4, "#ffff55"],
      [10.5, 5, "#55ff55"],
      [4.5, 10, "#5599ff"],
      [8, 11.5, "#ff55ff"],
    ];
    for (const [sx, sy, c] of spots) if (Math.hypot(x - sx, y - sy) < 1.3) return c;
    return "#d9b27a";
  }),
  tool_pen: S(
    [
      "...........kk...",
      "..........kppk..",
      ".........kpppk..",
      "........kpppk...",
      ".......kpppk....",
      "......kpppk.....",
      ".....kwwwk......",
      "....kwwwk.......",
      "...kwwkk........",
      "...kwk..........",
      "..kwk...........",
      "..kk............",
      ".k..............",
    ],
    { k: K, p: "#a259ff", w: "#e8e8e8" },
  ),
  tool_redstone: S(
    [
      "................",
      ".......rr.......",
      "......rRRr......",
      "......rRRr......",
      ".......rr.......",
      ".......bb.......",
      ".......bb.......",
      ".......bb.......",
      ".......bb.......",
      "....ssssssss....",
      "...sggggggggs...",
      "...sgrggggrgs...",
      "...ssssssssss...",
    ],
    { r: "#b51b10", R: "#ff4a3a", b: "#6b4a2a", s: "#7a7a7a", g: "#a8a8a8" },
  ),
  tunic: S(
    [
      "................",
      "...kkk....kkk...",
      "..kbbbk..kbbbk..",
      ".kbbbbbkkbbbbbk.",
      ".kbbbbbbbbbbbbk.",
      ".kkkbbbbbbbbkkk.",
      "...kbbbbbbbbk...",
      "...kbbbbbbbbk...",
      "...kbbbbbbbbk...",
      "...kbbbbbbbbk...",
      "...kbbbbbbbbk...",
      "...kkkkkkkkkk...",
    ],
    { k: "#3a2410", b: "#9a6234" },
  ),
  elytra: S(
    [
      "................",
      ".kkk........kkk.",
      "kgggk......kgggk",
      "kggggk....kggggk",
      "kgwgggk..kgggwgk",
      "kgwggggkkggggwgk",
      "kgwgggggggggggwk",
      ".kgwgggggggggwk.",
      ".kgwggk..kggwgk.",
      "..kgwk....kwgk..",
      "..kggk....kggk..",
      "...kgk....kgk...",
      "....k......k....",
    ],
    { k: "#2a2a40", g: "#8f8fb8", w: "#c8c8e6" },
  ),
  map: S(
    [
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kppppppppppppk.",
      ".kpggppppbbbppk.",
      ".kpgggpppbbbppk.",
      ".kppgppppppbppk.",
      ".kpppprrppppppk.",
      ".kppprrrrpgggpk.",
      ".kpppprrppggppk.",
      ".kpbbppppppgppk.",
      ".kpbbbppxpppppk.",
      ".kppppppppppppk.",
      ".kkkkkkkkkkkkkk.",
    ],
    { k: "#5a4020", p: "#e8d9a8", g: "#5a9a3a", b: "#4a7ac9", r: "#c9a24a", x: "#e0313f" },
  ),
  book: S(
    [
      "................",
      "...kkkkkkkkkk...",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbyyyyybbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kbbbbbbbbbwk..",
      "..kkkkkkkkkkkk..",
    ],
    { k: "#3a1a0a", b: "#8a3a1a", y: "#f2c14e", w: "#f0e8d8" },
  ),
  book_quill: S(
    [
      ".............ff.",
      "............fwf.",
      "...kkkkkkkkfwf..",
      "..kbbbbbbbkwfk..",
      "..kbbbbbbbfwbk..",
      "..kbbyyyyfwbbk..",
      "..kbbbbbbkbbbk..",
      "..kbbbbbbbbbbk..",
      "..kbbbbbbbbbbk..",
      "..kbbbbbbbbbbk..",
      "..kkkkkkkkkkkk..",
    ],
    { k: "#3a1a0a", b: "#8a3a1a", y: "#f2c14e", f: "#2a2a2a", w: "#ffffff" },
  ),
  spyglass: S(
    [
      "............kkk.",
      "...........kgggk",
      "..........kgylgk",
      ".........kggggk.",
      "........kcck....",
      ".......kcck.....",
      "......kcck......",
      ".....kcck.......",
      "....kcck........",
      "...kcck.........",
      "..kcck..........",
      "..kkk...........",
    ],
    { k: "#3a2410", c: "#c88a3a", g: "#d8a03a", y: "#bfefff", l: "#ffffff" },
  ),
  spike: S(
    [
      "................",
      "......kkkk......",
      ".....kddddk.....",
      "....kddrrddk....",
      "...kddrRRrddk...",
      "...kdrRRRRrdk...",
      "...kdrRRRRrdk...",
      "...kddrRRrddk...",
      "....kddrrddk....",
      ".....kddddk.....",
      "....kkkkkkkk....",
      "...kmmmmmmmmk...",
      "...kkkkkkkkkk...",
    ],
    { k: K, d: "#3a3a42", r: "#a0141f", R: "#ff4655", m: "#6a6a74" },
  ),
  shulker_shell: S(
    [
      "................",
      "....kkkkkkkk....",
      "...kppppppppk...",
      "..kppPPPPPPppk..",
      "..kpPppppppPpk..",
      "..kppppppppppk..",
      "..kkkkkkkkkkkk..",
      "..kddddddddddk..",
      "...kkkkkkkkkk...",
    ],
    { k: "#3a1a40", p: "#9a64a5", P: "#c08ccb", d: "#6b3a75" },
  ),
  name_tag: S(
    [
      "................",
      "..........kk....",
      ".........k..k...",
      "....kkkkkkk.k...",
      "...kwwwwwwwkk...",
      "..kwwwwwwwwwk...",
      "..kwkkkkkkwwk...",
      "..kwwwwwwwwwk...",
      "..kwkkkkwwwwk...",
      "...kwwwwwwwk....",
      "....kkkkkkk.....",
    ],
    { k: "#3a2a1a", w: "#e8dcc0" },
  ),
  gold_ingot: S(
    [
      "................",
      "................",
      "................",
      "......kkkkkkk...",
      ".....kyyyyyyyk..",
      "....kyYYYYYyyk..",
      "...kyyyyyyyyk...",
      "..kooooooook....",
      "..kkkkkkkkkk....",
    ],
    { k: "#7a5a0a", y: "#f7d23e", Y: "#fff3a0", o: "#d9a51a" },
  ),
  spider: S(
    [
      "................",
      "k..............k",
      ".k..kkkkkkkk..k.",
      "..kkddddddddkk..",
      ".k.kddddddddk.k.",
      "k..kdrrddrrdk..k",
      "...kdRrddrRdk...",
      ".k.kddddddddk.k.",
      "k.kkdkddddkdkk.k",
      "...kddddddddk...",
      "....kkkkkkkk....",
    ],
    { k: "#0d0d10", d: "#2a2228", r: "#a0141f", R: "#ff4655" },
  ),
  brush: S(
    [
      "................",
      "...........kk...",
      "..........kbbk..",
      ".........kbbk...",
      "........kbbk....",
      ".......kbbk.....",
      "......kcck......",
      ".....kwwwk......",
      "....kwwwwk......",
      "...kwwwwk.......",
      "...kwwwk........",
      "....kkk.........",
    ],
    { k: "#3a2410", b: "#8a5a2a", c: "#c88a3a", w: "#e8dcc0" },
  ),
  echo_shard: S(
    [
      "................",
      "..........kk....",
      ".........kcck...",
      "........kcCck...",
      ".......kcCcck...",
      "......kcCcck....",
      ".....kcccck.....",
      "....kcccCk......",
      "...kcccck.......",
      "...kccck........",
      "....kkk.........",
    ],
    { k: "#04161a", c: "#0e8e99", C: "#6af2f8" },
  ),
  dragon_egg: grid(16, 16, (x, y) => {
    const d = Math.hypot((x - 7.5) / 5.5, (y - 8.5) / 6.8);
    if (d > 1) return null;
    if (d > 0.88) return "#0a0510";
    return (x * 7 + y * 13) % 9 === 0 ? "#7a3cbf" : "#1a0f26";
  }),
  ender_pearl: orb("#1f6b5a", "#4fc9a8", "#0f3a30", "#0a2a22"),
  ender_eye: orb("#2f8a5a", "#7fdc9a", "#1a5a3a", "#0f3a24", (x, y) => (Math.abs(x - 7.5) < 1 && Math.abs(y - 7.5) < 3 ? "#0a1a10" : null)),
  slime_ball: orb("#6fd13a", "#a8f07a", "#4a9a24", "#3a7a1a"),
  clock: orb("#f2c14e", "#fff1a8", "#c99a17", "#7a5a0a", (x, y, d) => {
    if (d < 3.6) {
      if (x === 7 && y <= 7 && y >= 4) return "#1a1a1e";
      if (y === 7 && x >= 7 && x <= 10) return "#1a1a1e";
      return "#2a5aa8";
    }
    return null;
  }),
  music_disc: disc("#e0313f"),
  music_disc_2: disc("#55ffff"),
  potion: bottle("#e0313f", "#ff9a9a"),
  blaze_powder: scatter(["#ffb84a", "#ff9a2a", "#ffe066", "#f07a1a"], 7, "diamond"),
  redstone_dust: scatter(["#b51b10", "#e0313f", "#7a0c05"], 11),
  sugar: scatter(["#ffffff", "#e8e8e8", "#d0d0d0"], 23),
  clip_game: filmStrip("#e0313f"),
  clip_talk: filmStrip("#5599ff"),
  clip_brand: filmStrip("#55ff55"),
  chest: S(
    [
      "................",
      ".kkkkkkkkkkkkkk.",
      ".kwwwwwwwwwwwwk.",
      ".kwbbbbbbbbbbwk.",
      ".kwbbbbbbbbbbwk.",
      ".kkkkkkkkkkkkkk.",
      ".kwwwwwggwwwwwk.",
      ".kwbbbbggbbbbwk.",
      ".kwbbbbbbbbbbwk.",
      ".kwbbbbbbbbbbwk.",
      ".kwbbbbbbbbbbwk.",
      ".kkkkkkkkkkkkkk.",
    ],
    { k: "#2a1a0a", w: "#7a5228", b: "#a8763a", g: "#c9c9c9" },
  ),
  gear: grid(16, 16, (x, y) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    const d = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);
    const teeth = Math.cos(a * 8) > 0.3 ? 6.8 : 5.4;
    if (d > teeth) return null;
    if (d < 2) return null;
    return d > teeth - 1 ? "#4a4a50" : "#a8a8b0";
  }),
  speaker: S(
    [
      "................",
      "..........w.....",
      ".......kk..w....",
      "......kgk.w.w...",
      "..kkkkggk..w.w..",
      "..kggggggk.w.w..",
      "..kggggggk.w.w..",
      "..kkkkggk..w.w..",
      "......kgk.w.w...",
      ".......kk..w....",
      "..........w.....",
    ],
    { k: K, g: "#c8c8c8", w: "#ffffff" },
  ),
  speaker_off: S(
    [
      "................",
      "................",
      ".......kk.......",
      "......kgk.r...r.",
      "..kkkkggk..r.r..",
      "..kggggggk..r...",
      "..kggggggk.r.r..",
      "..kkkkggk.r...r.",
      "......kgk.......",
      ".......kk.......",
    ],
    { k: K, g: "#c8c8c8", r: "#e0313f" },
  ),
  note: S(
    [
      "................",
      "........kkkkk...",
      "........kkkkk...",
      "........k...k...",
      "........k...k...",
      "........k...k...",
      "........k...k...",
      ".....kkkk.kkk...",
      "....kkkkkkkkk...",
      "....kkkk.kkk....",
    ],
    { k: "#ffffff" },
  ),
  heart: S(
    [
      "................",
      "..kkk...kkk.....",
      ".krrrk.krrrk....",
      "krRrrrkrrrrrk...",
      "krRrrrrrrrrrk...",
      "krrrrrrrrrrrk...",
      ".krrrrrrrrrk....",
      "..krrrrrrrk.....",
      "...krrrrrk......",
      "....krrrk.......",
      ".....kkk........",
    ],
    { k: "#3a0a0a", r: "#e0313f", R: "#ffffff" },
  ),
  lock: S(
    [
      "................",
      ".....kkkkk......",
      "....kgggggk.....",
      "....kg...gk.....",
      "....kg...gk.....",
      "...kkkkkkkkk....",
      "...kyyyyyyyk....",
      "...kyyykyyyk....",
      "...kyyykyyyk....",
      "...kyyyyyyyk....",
      "...kkkkkkkkk....",
    ],
    { k: "#3a2a0a", g: "#a8a8b0", y: "#f2c14e" },
  ),
  pickaxe: S(
    [
      "...kkkkkkk......",
      "..kccccccck.....",
      ".kccCCCCcck.....",
      "..kkk..kbcck....",
      ".......kbk.ck...",
      "......kbk...ck..",
      ".....kbk.....k..",
      "....kbk.........",
      "...kbk..........",
      "..kbk...........",
      ".kbk............",
      ".kk.............",
    ],
    { k: "#1a1a1e", c: "#3ad6c4", C: "#9ff5ea", b: "#8a5a2a" },
  ),
  axolotl: S(
    [
      "................",
      ".r..r.....r..r..",
      "..rr.......rr...",
      "...kpppppppk....",
      "..kpppppppppk...",
      "..kpkpppppkpk...",
      "..kpppppppppk...",
      "...kpprrppppk...",
      "....kppppppkk...",
      ".....kkkkkk.....",
    ],
    { k: "#7a3a5a", p: "#f7a3bd", r: "#e0313f" },
  ),
  mug: S(
    [
      "................",
      "....s..s........",
      ".....s..s.......",
      "....s..s........",
      "..kkkkkkkk......",
      "..kwccccwkkk....",
      "..kwwwwwwk.k....",
      "..kwwwwwwk.k....",
      "..kwrrrrwkkk....",
      "..kwwwwwwk......",
      "...kkkkkk.......",
    ],
    { k: "#3a2a1a", w: "#f4ecdf", c: "#a8743a", r: "#e0313f", s: "#d8d8d8" },
  ),
  player_head: S(
    [
      "..kkkkkkkkkkkk..",
      "..khhhhhhhhhhk..",
      "..khhhhhhhhhhk..",
      "..kssssssssssk..",
      "..kshhsssshhsk..",
      "..kswesssseWsk..",
      "..kswesssseWsk..",
      "..ksssmmmmsssk..",
      "..kssmddddmssk..",
      "..kssssssssssk..",
      "..kkkkkkkkkkkk..",
    ],
    { k: "#1a120c", h: "#1a120c", s: "#c68863", w: "#f4f4f4", e: "#3a2414", W: "#f4f4f4", m: "#a96d4b", d: "#6b4129" },
  ),
  compass: orb("#9a9aa6", "#d8d8e0", "#5a5a64", "#3a3a42", (x, y, d) => {
    if (d < 4.2) {
      if (y < 8 && Math.abs(x - 7.5) < (8 - y) * 0.35) return "#e0313f";
      if (y >= 8 && Math.abs(x - 7.5) < (y - 7) * 0.3) return "#dddddd";
      return "#2a2a30";
    }
    return null;
  }),
};

// Block-style icons drawn isometrically from the atlas.
export const blockIcons: Record<string, string> = {
  grass_block: "grass",
  crafting_table: "crafting_table",
  structure_block: "structure_block",
  command_block: "command_block",
  sculk_sensor: "sculk_sensor",
  target: "target",
  note_block: "note_block",
  bookshelf: "bookshelf",
  enchanting_table: "enchanting_table",
  loom: "loom",
  cartography_table: "cartography_table",
  jukebox: "jukebox",
  lamp: "lamp_on",
  end_stone: "end_stone",
  netherrack: "netherrack",
  purpur: "purpur",
  obsidian: "obsidian",
  deepslate: "deepslate_bricks",
  pink: "pink_lattice",
  tnt: "red_trim",
  hay: "hay",
};

const urlCache = new Map<string, string>();

function spriteToCanvas(sp: Sprite, scale: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const size = 16 * scale;
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const ox = Math.floor((16 - sp.w) / 2);
  const oy = Math.floor((16 - sp.h) / 2) + (sp.h < 14 ? 1 : 0);
  for (let y = 0; y < sp.h; y++)
    for (let x = 0; x < sp.w; x++) {
      const col = sp.px[y * sp.w + x];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect((x + ox) * scale, (y + oy) * scale, scale, scale);
    }
  return c;
}

function blockIconCanvas(blockName: string, size = 64): HTMLCanvasElement {
  const def = blocks[B[blockName]];
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const top = tileCanvas(def.top);
  const side = tileCanvas(def.side);
  const front = tileCanvas(def.front ?? def.side);
  const s = size / 16;
  const h = size * 0.5;
  const w = size * 0.5;
  // top
  ctx.setTransform(w / 16, (h * 0.5) / 16, -w / 16, (h * 0.5) / 16, size / 2, 1 * s);
  ctx.drawImage(top, 0, 0);
  // left (front)
  ctx.setTransform(w / 16, (h * 0.5) / 16, 0, h / 16, 0, size * 0.25 + s);
  ctx.drawImage(front, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, 0, 16, 16);
  // right
  ctx.setTransform(w / 16, -(h * 0.5) / 16, 0, h / 16, size / 2, size * 0.5 + s);
  ctx.drawImage(side, 0, 0);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, 16, 16);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return c;
}

/** Data URL for any icon id (sprite or block icon). Client only. */
export function iconUrl(id: string, scale = 4): string {
  const key = `${id}@${scale}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  let canvas: HTMLCanvasElement;
  if (blockIcons[id]) canvas = blockIconCanvas(blockIcons[id], 16 * scale);
  else canvas = spriteToCanvas(sprites[id] ?? sprites.book, scale);
  const url = canvas.toDataURL();
  urlCache.set(key, url);
  return url;
}

export function hasIcon(id: string) {
  return !!(sprites[id] || blockIcons[id]);
}
