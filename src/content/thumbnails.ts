// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAILS
// `image: null` renders a generated stand-in from `art`. Put real files in
// /public/media/thumbs/ and set `image: "/media/thumbs/<file>.jpg"`.
// Every `sample: true` entry is a placeholder slot (shows a SAMPLE badge).
// ─────────────────────────────────────────────────────────────────────────────

export type ThumbArt = {
  headline: string;
  sub?: string;
  bg: [string, string];
  ink: string;
  stroke: string;
  accent: string;
  subject: "shock" | "hype" | "smug" | "focus";
  side: "left" | "right";
  extras?: ("arrow" | "circle" | "badge" | "glow")[];
  clutter?: boolean;
  lowContrast?: boolean;
};

export type Thumbnail = {
  slug: string;
  title: string;
  collection: "bull-commander" | "valorant" | "own-channel" | "concepts";
  client?: string;
  image: string | null;
  art: ThumbArt;
  alternates?: { label: string; note: string; image: string | null; art: ThumbArt }[];
  brief: string;
  audience: string;
  breakdown: { composition: string; contrast: string; focalPoint: string; typography: string };
  focal: { x: number; y: number }; // 0..1, drives the focal-point overlay
  result?: string; // CTR / views — only with permission
  rarity: "common" | "rare" | "epic";
  sample?: boolean;
};

export const collectionLabels: Record<Thumbnail["collection"], string> = {
  "bull-commander": "Bull Commander",
  valorant: "Valorant Edits",
  "own-channel": "Own Channel",
  concepts: "Concepts",
};

const face = (side: "left" | "right") => ({ x: side === "left" ? 0.27 : 0.73, y: 0.52 });

const commonBreakdown = (headline: string, side: "left" | "right") => ({
  composition: `Subject anchored on the ${side} third; the headline sits in the opposite third so face and words never fight for the same space.`,
  contrast: "Warm subject against a cooler, darker background. Text gets a thick dark stroke so it survives any feed colour.",
  focalPoint: "The face's expression is the hook — eyes land there first, then jump to the headline.",
  typography: `"${headline}" — ${headline.split(" ").length} words max, heavy condensed caps, readable at 168 px wide.`,
});

export const thumbnails: Thumbnail[] = [
  {
    slug: "bc-clutch",
    title: "High-Stakes Clutch",
    collection: "bull-commander",
    client: "Bull Commander",
    image: null,
    art: { headline: "1 VS 5", sub: "NO WAY", bg: ["#0b1a3a", "#1f5fbf"], ink: "#ffffff", stroke: "#0a0a0a", accent: "#ffcc00", subject: "shock", side: "left", extras: ["arrow", "glow"] },
    alternates: [
      {
        label: "Draft A",
        note: "Too many words and a small face — the hook got lost at feed size.",
        image: null,
        art: { headline: "INSANE 1 VS 5 CLUTCH IN RANKED", sub: "WATCH TILL END", bg: ["#0b1a3a", "#1f5fbf"], ink: "#ffffff", stroke: "#0a0a0a", accent: "#ffcc00", subject: "shock", side: "left", clutter: true },
      },
    ],
    brief: "Make a clutch round feel like a must-watch moment without spoiling the outcome.",
    audience: "Valorant players, 16–24, browsing on mobile.",
    breakdown: commonBreakdown("1 VS 5", "left"),
    focal: face("left"),
    rarity: "epic",
    sample: true,
  },
  {
    slug: "bc-ranked",
    title: "Ranked Is Broken",
    collection: "bull-commander",
    client: "Bull Commander",
    image: null,
    art: { headline: "RANKED?!", sub: "BROKEN", bg: ["#2a0a0a", "#a3121f"], ink: "#ffffff", stroke: "#000000", accent: "#ffffff", subject: "hype", side: "right", extras: ["circle"] },
    brief: "Opinion video — the thumbnail has to promise a strong take.",
    audience: "Competitive players who follow the creator's commentary.",
    breakdown: commonBreakdown("RANKED?!", "right"),
    focal: face("right"),
    rarity: "rare",
    sample: true,
  },
  {
    slug: "bc-meta",
    title: "New Meta Explained",
    collection: "bull-commander",
    client: "Bull Commander",
    image: null,
    art: { headline: "NEW META", bg: ["#06281f", "#11a36b"], ink: "#ffffff", stroke: "#03140f", accent: "#ffff55", subject: "focus", side: "left", extras: ["badge"] },
    brief: "Educational guide — must look trustworthy and current.",
    audience: "Players looking to climb.",
    breakdown: commonBreakdown("NEW META", "left"),
    focal: face("left"),
    rarity: "common",
    sample: true,
  },
  {
    slug: "bc-radiant",
    title: "Zero to Radiant",
    collection: "bull-commander",
    client: "Bull Commander",
    image: null,
    art: { headline: "0 → TOP", sub: "DAY 1", bg: ["#1a0b3a", "#7a3cff"], ink: "#ffff55", stroke: "#0a0014", accent: "#55ffff", subject: "smug", side: "right", extras: ["arrow"] },
    brief: "Series episode — keep the series look consistent while making the episode feel new.",
    audience: "Returning subscribers.",
    breakdown: commonBreakdown("0 → TOP", "right"),
    focal: face("right"),
    rarity: "common",
    sample: true,
  },
  {
    slug: "bc-secret",
    title: "Secret Spot",
    collection: "bull-commander",
    client: "Bull Commander",
    image: null,
    art: { headline: "SECRET?", bg: ["#2b1d05", "#d48a12"], ink: "#ffffff", stroke: "#1a0f00", accent: "#e0313f", subject: "shock", side: "left", extras: ["circle", "arrow"] },
    brief: "Curiosity gap — show that something is hidden without showing what.",
    audience: "Casual players, 13–24.",
    breakdown: commonBreakdown("SECRET?", "left"),
    focal: { x: 0.68, y: 0.55 },
    rarity: "common",
    sample: true,
  },
  {
    slug: "own-velocity",
    title: "Velocity Edit Cover",
    collection: "valorant",
    image: null,
    art: { headline: "VELOCITY", bg: ["#1a0505", "#e0313f"], ink: "#ffffff", stroke: "#000000", accent: "#ffffff", subject: "focus", side: "right", extras: ["glow"] },
    brief: "Cover for a velocity edit — sell the energy, not the story.",
    audience: "Edit enthusiasts and Valorant fans.",
    breakdown: commonBreakdown("VELOCITY", "right"),
    focal: face("right"),
    rarity: "rare",
    sample: true,
  },
  {
    slug: "own-ace",
    title: "ACE Montage Cover",
    collection: "valorant",
    image: null,
    art: { headline: "ACE", sub: "MONTAGE", bg: ["#0a0a0a", "#3b3b3b"], ink: "#e0313f", stroke: "#ffffff", accent: "#e0313f", subject: "hype", side: "left", extras: ["glow"] },
    brief: "Montage cover with one word and maximum punch.",
    audience: "Valorant fans.",
    breakdown: commonBreakdown("ACE", "left"),
    focal: face("left"),
    rarity: "common",
    sample: true,
  },
  {
    slug: "own-clip",
    title: "Clip of the Week",
    collection: "own-channel",
    image: null,
    art: { headline: "WAIT...", bg: ["#0b2a2e", "#1b8a94"], ink: "#ffffff", stroke: "#001214", accent: "#ffff55", subject: "smug", side: "right", extras: ["arrow"] },
    brief: "Shorts cover that reads in a split second.",
    audience: "Shorts feed scrollers.",
    breakdown: commonBreakdown("WAIT...", "right"),
    focal: face("right"),
    rarity: "common",
    sample: true,
  },
  {
    slug: "concept-tried",
    title: "I Tried It So You Don't",
    collection: "concepts",
    image: null,
    art: { headline: "I TRIED IT", bg: ["#33230b", "#e8a03a"], ink: "#ffffff", stroke: "#1a1000", accent: "#55ff55", subject: "shock", side: "left", extras: ["badge"] },
    alternates: [
      {
        label: "Low-contrast draft",
        note: "Text colour too close to the background — vanished on light-mode feeds.",
        image: null,
        art: { headline: "I TRIED IT", bg: ["#e8c58a", "#f0d9a8"], ink: "#f5e6c0", stroke: "#e8c58a", accent: "#f0d9a8", subject: "shock", side: "left", lowContrast: true },
      },
    ],
    brief: "Challenge video — expression has to sell the pain.",
    audience: "General gaming audience.",
    breakdown: commonBreakdown("I TRIED IT", "left"),
    focal: face("left"),
    rarity: "common",
    sample: true,
  },
  {
    slug: "concept-day100",
    title: "Day 1 vs Day 100",
    collection: "concepts",
    image: null,
    art: { headline: "DAY 100", sub: "VS DAY 1", bg: ["#0a1f0a", "#2f8a2f"], ink: "#ffffff", stroke: "#000000", accent: "#ffcc00", subject: "hype", side: "right", extras: ["arrow"] },
    brief: "Progress video — before/after contrast in one frame.",
    audience: "Long-form viewers.",
    breakdown: commonBreakdown("DAY 100", "right"),
    focal: face("right"),
    rarity: "common",
    sample: true,
  },
];

export const thumbBySlug = Object.fromEntries(thumbnails.map((t) => [t.slug, t])) as Record<string, Thumbnail>;
