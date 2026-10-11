import type { ToolId } from "./tools";

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO PROJECTS
// Every entry marked `sample: true` is a PLACEHOLDER SLOT. Replace it with a real
// edit (see docs/CONTENT_INTAKE.md). Samples show a "SAMPLE" badge on the site.
//
// media.full:
//   { kind: "youtube", id: "dQw4w9WgXcQ" }       → click-to-load YouTube embed
//   { kind: "file", src: "/media/videos/x.mp4" } → self-hosted video
//   { kind: "placeholder" }                       → animated stand-in player
// media.loop (optional): short muted MP4 used on in-world screens.
// ─────────────────────────────────────────────────────────────────────────────

export type VideoCategory =
  | "gaming-montage"
  | "beat-sync"
  | "reels-shorts"
  | "meme"
  | "cinematic"
  | "podcast"
  | "color-grading"
  | "experimental";

export const categoryLabels: Record<VideoCategory, string> = {
  "gaming-montage": "Gaming Montages",
  "beat-sync": "Beat-Sync",
  "reels-shorts": "Reels & Shorts",
  meme: "Meme Edits",
  cinematic: "Cinematic",
  podcast: "Podcast / Talking Head",
  "color-grading": "Colour Grading",
  experimental: "Experimental",
};

export const categorySprites: Record<VideoCategory, string> = {
  "gaming-montage": "controller",
  "beat-sync": "music_disc",
  "reels-shorts": "phone",
  meme: "slime_ball",
  cinematic: "clapper",
  podcast: "mic",
  "color-grading": "potion",
  experimental: "redstone_dust",
};

export type VideoMedia = {
  poster?: string;
  loop?: string;
  full: { kind: "youtube"; id: string } | { kind: "file"; src: string } | { kind: "placeholder" };
  raw?: { kind: "youtube"; id: string } | { kind: "file"; src: string } | { kind: "placeholder" };
};

export type VideoProject = {
  slug: string;
  title: string;
  description: string;
  home: "the-end" | "nether" | "lab";
  categories: VideoCategory[];
  platform: "YouTube" | "YouTube Shorts" | "Instagram Reels" | "Client delivery";
  aspect: "16:9" | "9:16";
  client?: string;
  role: string;
  date: string;
  durationSec: number;
  tools: ToolId[];
  techniques: string[];
  media: VideoMedia;
  /** Seconds. Generate real ones from the source file (cut detection) — samples get synthetic markers. */
  markers?: { cuts?: number[]; beats?: number[] };
  bpm?: number;
  stats?: { label: string; value: string }[]; // only with permission
  rarity: "common" | "rare" | "epic";
  sample?: boolean;
  locked?: "lost-frames"; // cosmetic unlock in the Snapshot Lab — never essential work
  palette: [string, string]; // used by placeholder visuals
};

export const projects: VideoProject[] = [
  {
    slug: "showreel",
    title: "SpiderStudios Showreel",
    description:
      "The best cuts in under a minute — gaming, Shorts and brand work stitched to one track. Replace with Mehul's real showreel.",
    home: "the-end",
    categories: ["beat-sync", "gaming-montage"],
    platform: "YouTube",
    aspect: "16:9",
    role: "Edit · Sound design · Titles",
    date: "2026",
    durationSec: 58,
    tools: ["premiere", "photoshop"],
    techniques: ["Beat sync", "Speed ramps", "SFX layering", "Title design", "Match cuts"],
    media: { full: { kind: "placeholder" }, raw: { kind: "placeholder" } },
    bpm: 128,
    rarity: "epic",
    sample: true,
    palette: ["#2a0f4a", "#c58cff"],
  },
  {
    slug: "innhouse-reels",
    title: "Brand Reels — InnHouse",
    description:
      "Short-form social videos for multiple brands during the InnHouse internship, each adapted to the brand's identity and audience.",
    home: "the-end",
    categories: ["reels-shorts"],
    platform: "Instagram Reels",
    aspect: "9:16",
    client: "InnHouse (internship)",
    role: "Editor",
    date: "Jul–Aug 2025",
    durationSec: 30,
    tools: ["premiere", "capcut"],
    techniques: ["2-second hook", "Kinetic captions", "Brand-safe pacing", "Clean typography"],
    media: { full: { kind: "placeholder" } },
    bpm: 110,
    rarity: "rare",
    sample: true,
    palette: ["#14324a", "#55ffff"],
  },
  {
    slug: "retention-shorts",
    title: "Retention Shorts Pack",
    description:
      "Trend-driven Shorts built for watch-time: pattern interrupts every few seconds, punchy captions and sound design that carries the joke.",
    home: "the-end",
    categories: ["reels-shorts"],
    platform: "YouTube Shorts",
    aspect: "9:16",
    client: "Own channel",
    role: "Editor · Creator",
    date: "2025",
    durationSec: 42,
    tools: ["capcut", "premiere"],
    techniques: ["Pattern interrupts", "Zoom punches", "Captions", "Sound design"],
    media: { full: { kind: "placeholder" } },
    bpm: 120,
    rarity: "common",
    sample: true,
    palette: ["#3a1d0b", "#ffaa00"],
  },
  {
    slug: "meme-edit",
    title: "Meme Edit: Ranked Pain",
    description: "Entertainment cut of the funniest ranked moments — timing is the whole joke.",
    home: "the-end",
    categories: ["meme"],
    platform: "YouTube Shorts",
    aspect: "9:16",
    client: "Own channel",
    role: "Editor · Creator",
    date: "2025",
    durationSec: 35,
    tools: ["capcut"],
    techniques: ["Comedic timing", "Freeze frames", "Sound effects", "Zoom punches"],
    media: { full: { kind: "placeholder" } },
    rarity: "common",
    sample: true,
    palette: ["#1d3a12", "#55ff55"],
  },
  {
    slug: "valorant-velocity",
    title: "1v4 Clutch — Velocity Edit",
    description:
      "Valorant gameplay cut into a velocity edit: ramps that breathe with the music, shake on every kill, layered SFX for impact.",
    home: "nether",
    categories: ["gaming-montage", "beat-sync"],
    platform: "YouTube",
    aspect: "16:9",
    client: "Own channel",
    role: "Editor · Creator",
    date: "2025",
    durationSec: 64,
    tools: ["premiere"],
    techniques: ["Velocity", "Camera shake", "SFX layering", "Beat sync", "Speed ramps"],
    media: { full: { kind: "placeholder" }, raw: { kind: "placeholder" } },
    bpm: 140,
    rarity: "rare",
    sample: true,
    palette: ["#4a0b0b", "#ff4a3c"],
  },
  {
    slug: "ace-montage",
    title: "ACE — Valorant Montage",
    description: "The flagship gaming montage. Defuse the spike in the Nether to reveal it.",
    home: "nether",
    categories: ["gaming-montage", "beat-sync"],
    platform: "YouTube",
    aspect: "16:9",
    client: "Own channel",
    role: "Editor · Creator",
    date: "2026",
    durationSec: 90,
    tools: ["premiere", "photoshop"],
    techniques: ["Beat sync", "Velocity", "Transitions", "Colour pop", "SFX layering"],
    media: { full: { kind: "placeholder" } },
    bpm: 150,
    rarity: "epic",
    sample: true,
    palette: ["#2b0505", "#e0313f"],
  },
  {
    slug: "valorant-shorts",
    title: "Valorant Shorts — Clip of the Week",
    description: "Vertical gameplay Shorts: one moment, one hook, maximum retention.",
    home: "nether",
    categories: ["reels-shorts", "gaming-montage"],
    platform: "YouTube Shorts",
    aspect: "9:16",
    client: "Own channel",
    role: "Editor · Creator",
    date: "2025",
    durationSec: 28,
    tools: ["capcut"],
    techniques: ["Vertical reframing", "Captions", "Hook-first structure"],
    media: { full: { kind: "placeholder" } },
    rarity: "common",
    sample: true,
    palette: ["#3b0a1f", "#ff55ff"],
  },
  {
    slug: "phonk-sync",
    title: "Phonk Beat-Sync Edit",
    description: "Every cut lands on the beat — a rhythm-first gaming edit.",
    home: "nether",
    categories: ["beat-sync"],
    platform: "YouTube Shorts",
    aspect: "9:16",
    client: "Own channel",
    role: "Editor",
    date: "2025",
    durationSec: 32,
    tools: ["premiere"],
    techniques: ["Beat sync", "Flash frames", "Speed ramps"],
    media: { full: { kind: "placeholder" } },
    bpm: 130,
    rarity: "common",
    sample: true,
    palette: ["#1a0b2e", "#ffff55"],
  },
  {
    slug: "experimental-transitions",
    title: "Experimental: Glitch Transitions",
    description: "A playground for new transitions and effects before they make it into client work.",
    home: "nether",
    categories: ["experimental"],
    platform: "YouTube Shorts",
    aspect: "9:16",
    client: "Own channel",
    role: "Editor",
    date: "2026",
    durationSec: 24,
    tools: ["premiere"],
    techniques: ["Glitch transitions", "Masking", "RGB split"],
    media: { full: { kind: "placeholder" } },
    rarity: "common",
    sample: true,
    palette: ["#0b2a2e", "#29dfeb"],
  },
  {
    slug: "next-edit-wip",
    title: "Next Edit (Work in Progress)",
    description: "What's on the timeline right now. Snapshot builds may contain bugs.",
    home: "lab",
    categories: ["experimental"],
    platform: "YouTube",
    aspect: "16:9",
    client: "Own channel",
    role: "Editor",
    date: "Coming soon",
    durationSec: 20,
    tools: ["premiere"],
    techniques: ["Rough cut", "Temp music"],
    media: { full: { kind: "placeholder" } },
    rarity: "common",
    sample: true,
    palette: ["#2e2e2e", "#e6e6e6"],
  },
  {
    slug: "blooper-reel",
    title: "Blooper Reel",
    description: "Everything that went wrong on the way to the final cut. Unlocked by collecting all 8 Lost Frames.",
    home: "lab",
    categories: ["experimental"],
    platform: "YouTube",
    aspect: "16:9",
    client: "Own channel",
    role: "Editor",
    date: "Always",
    durationSec: 40,
    tools: ["premiere"],
    techniques: ["Honesty"],
    media: { full: { kind: "placeholder" } },
    rarity: "epic",
    sample: true,
    locked: "lost-frames",
    palette: ["#3a2a0b", "#ffaa00"],
  },
];

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<string, VideoProject>;

export function projectsIn(home: VideoProject["home"]) {
  return projects.filter((p) => p.home === home);
}

export function categoriesWithWork(list: VideoProject[] = projects): VideoCategory[] {
  const set = new Set<VideoCategory>();
  list.forEach((p) => p.categories.forEach((c) => set.add(c)));
  return (Object.keys(categoryLabels) as VideoCategory[]).filter((c) => set.has(c));
}
