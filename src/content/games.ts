import type { ThumbArt } from "./thumbnails";
import type { DimensionId } from "./dimensions";

// ── Craft the Edit ──────────────────────────────────────────────────────────
export type Ingredient = { id: string; name: string; kind: "clip" | "music" | "effect"; sprite: string; lore: string };

export const ingredients: Ingredient[] = [
  { id: "gameplay", name: "Gameplay Clip", kind: "clip", sprite: "clip_game", lore: "Raw Valorant footage" },
  { id: "talking", name: "Talking-Head Clip", kind: "clip", sprite: "clip_talk", lore: "Creator on camera" },
  { id: "brand", name: "Brand Footage", kind: "clip", sprite: "clip_brand", lore: "Product & lifestyle shots" },
  { id: "meme", name: "Meme Clip", kind: "clip", sprite: "slime_ball", lore: "The funny bit" },
  { id: "phonk", name: "Phonk Track", kind: "music", sprite: "music_disc", lore: "Cowbells included" },
  { id: "pop", name: "Trending Audio", kind: "music", sprite: "music_disc_2", lore: "Whatever's hot this week" },
  { id: "boom", name: "Vine Boom", kind: "music", sprite: "note_block", lore: "Use responsibly" },
  { id: "velocity", name: "Velocity", kind: "effect", sprite: "sugar", lore: "Speed ramps + shake" },
  { id: "beatsync", name: "Beat Sync", kind: "effect", sprite: "redstone_dust", lore: "Cuts on every beat" },
  { id: "captions", name: "Captions", kind: "effect", sprite: "name_tag", lore: "Kinetic, readable" },
  { id: "zoom", name: "Zoom Punch", kind: "effect", sprite: "spyglass", lore: "Comedic emphasis" },
];

export type Recipe = { id: string; needs: [string, string, string]; result: string; name: string };

export const recipes: Recipe[] = [
  { id: "velocity", needs: ["gameplay", "phonk", "velocity"], result: "valorant-velocity", name: "Velocity Edit" },
  { id: "beat", needs: ["gameplay", "phonk", "beatsync"], result: "phonk-sync", name: "Beat-Sync Edit" },
  { id: "shorts", needs: ["gameplay", "pop", "captions"], result: "valorant-shorts", name: "Gaming Short" },
  { id: "brand", needs: ["brand", "pop", "captions"], result: "innhouse-reels", name: "Brand Reel" },
  { id: "meme", needs: ["meme", "boom", "zoom"], result: "meme-edit", name: "Meme Edit" },
  { id: "retention", needs: ["talking", "pop", "zoom"], result: "retention-shorts", name: "Retention Short" },
];

// ── Thumbnail Target Practice ───────────────────────────────────────────────
export type TargetRound = {
  brief: string;
  options: { art: ThumbArt; why: string }[];
  best: number;
  reveal: string; // thumbnail slug
};

const base = (o: Partial<ThumbArt>): ThumbArt => ({
  headline: "1 VS 5",
  bg: ["#0b1a3a", "#1f5fbf"],
  ink: "#ffffff",
  stroke: "#0a0a0a",
  accent: "#ffcc00",
  subject: "shock",
  side: "left",
  ...o,
});

export const targetRounds: TargetRound[] = [
  {
    brief: "Clutch round video. Audience scrolls on phones. It must read at 168 px wide.",
    options: [
      { art: base({ headline: "INSANE 1 VS 5 CLUTCH RANKED", sub: "WATCH TILL END", clutter: true }), why: "Seven words at feed size become noise — the eye has nowhere to land." },
      { art: base({ extras: ["arrow", "glow"] }), why: "One face, three characters of text, high contrast. Reads instantly at any size." },
      { art: base({ bg: ["#c9d6ff", "#e2e9ff"], ink: "#dfe7ff", stroke: "#c9d6ff", lowContrast: true }), why: "Pale text on a pale background disappears on light-mode feeds." },
    ],
    best: 1,
    reveal: "bc-clutch",
  },
  {
    brief: "Opinion video. The thumbnail must promise a strong take — without clickbait lies.",
    options: [
      { art: base({ headline: "VIDEO #42", subject: "focus", bg: ["#333", "#555"], accent: "#888" }), why: "Accurate, but gives nobody a reason to click." },
      { art: base({ headline: "RANKED?!", sub: "BROKEN", bg: ["#2a0a0a", "#a3121f"], subject: "hype", side: "right", extras: ["circle"] }), why: "A clear emotion plus a question creates curiosity while staying honest." },
      { art: base({ headline: "RANKED?!", bg: ["#2a0a0a", "#a3121f"], subject: "hype", side: "right", clutter: true, sub: "MUST WATCH OMG" }), why: "Right idea, but the extra text competes with the face." },
    ],
    best: 1,
    reveal: "bc-ranked",
  },
  {
    brief: "Montage cover. Sell the energy in a single word.",
    options: [
      { art: base({ headline: "ACE", sub: "MONTAGE", bg: ["#0a0a0a", "#3b3b3b"], ink: "#e0313f", stroke: "#ffffff", accent: "#e0313f", subject: "hype", extras: ["glow"] }), why: "One word, one colour accent, maximum punch." },
      { art: base({ headline: "MY BEST CLIPS COMPILATION", bg: ["#0a0a0a", "#3b3b3b"], subject: "hype", clutter: true }), why: "Describes the video instead of selling the feeling." },
      { art: base({ headline: "ACE", bg: ["#3b3b3b", "#444"], ink: "#555", stroke: "#3b3b3b", subject: "hype", lowContrast: true }), why: "Great word, but grey on grey has no energy." },
    ],
    best: 0,
    reveal: "own-ace",
  },
];

// ── Treasure Hunt & Lost Frames ─────────────────────────────────────────────
export type ChestLoot =
  | { kind: "project"; slug: string }
  | { kind: "thumb"; slug: string }
  | { kind: "page"; href: string; label: string }
  | { kind: "note"; text: string };

export type Chest = { id: string; dimension: DimensionId | "title"; hint: string; loot: ChestLoot; frame: number | null };

export const chests: Chest[] = [
  { id: "ow-kite", dimension: "overworld", hint: "Under the kite stall", loot: { kind: "thumb", slug: "concept-day100" }, frame: 1 },
  { id: "end-pillar", dimension: "the-end", hint: "Behind the dragon egg", loot: { kind: "project", slug: "retention-shorts" }, frame: 2 },
  { id: "ac-vault", dimension: "ancient-city", hint: "In the Archaeology Wing", loot: { kind: "thumb", slug: "bc-secret" }, frame: 3 },
  { id: "nether-bastion", dimension: "nether", hint: "Bastion treasure room", loot: { kind: "project", slug: "experimental-transitions" }, frame: 4 },
  { id: "craft-shelf", dimension: "crafting", hint: "Next to the redstone corner", loot: { kind: "page", href: "/crafting#streamico", label: "Streamico case study" }, frame: 5 },
  { id: "ec-ship", dimension: "end-city", hint: "On the End Ship", loot: { kind: "note", text: "Captain's log: every milestone up here started as a 'yes' to a new project." }, frame: 6 },
  { id: "portal-lectern", dimension: "portal", hint: "Beside the lectern", loot: { kind: "note", text: "Pro tip: briefs with a reference link get a reply first." }, frame: 7 },
];

export const FRAME_COUNT = 8; // frame 0 hangs off the wordmark on the title screen
