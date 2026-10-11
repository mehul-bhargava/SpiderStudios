// Tools Mehul lists on his resume. No percentages, no invented levels (docs/PLAN.md §9.5).

export type ToolId = "photoshop" | "premiere" | "capcut" | "canva" | "figma" | "wordpress";

export type Tool = {
  id: ToolId;
  name: string;
  item: string; // in-world item name
  sprite: string;
  usedFor: string;
  evidence: string[]; // project / thumbnail / design slugs
};

export const tools: Tool[] = [
  {
    id: "photoshop",
    name: "Adobe Photoshop",
    item: "Enchanted Brush",
    sprite: "tool_brush",
    usedFor:
      "Thumbnail design, compositing, colour work, social posts and branding assets — the main tool behind the Bull Commander thumbnails.",
    evidence: ["bc-clutch", "bc-ranked", "own-velocity", "poster-event"],
  },
  {
    id: "premiere",
    name: "Adobe Premiere Pro",
    item: "Film Reel of Pacing",
    sprite: "tool_reel",
    usedFor:
      "Long and short-form edits: gaming montages, beat-synced cuts, sound design, and the short-form content made during the InnHouse internship.",
    evidence: ["showreel", "valorant-velocity", "innhouse-reels"],
  },
  {
    id: "capcut",
    name: "CapCut",
    item: "Shears of Speed",
    sprite: "tool_shears",
    usedFor: "Fast-turnaround Shorts and Reels: captions, trend-driven effects and quick vertical edits.",
    evidence: ["retention-shorts", "valorant-shorts", "innhouse-reels"],
  },
  {
    id: "canva",
    name: "Canva",
    item: "Palette of Plenty",
    sprite: "tool_palette",
    usedFor: "Quick social media designs, event posters and promotional creatives.",
    evidence: ["carousel-innhouse", "poster-event"],
  },
  {
    id: "figma",
    name: "Figma",
    item: "Cartographer's Pen",
    sprite: "tool_pen",
    usedFor: "UI design and user flows — led the interface for Streamico before it was built in WordPress.",
    evidence: ["streamico"],
  },
  {
    id: "wordpress",
    name: "WordPress",
    item: "Redstone Comparator",
    sprite: "tool_redstone",
    usedFor: "Built and customised responsive sites — Sid and Co. in one month, and the Streamico front end.",
    evidence: ["sid-and-co", "streamico"],
  },
];

export const toolById = Object.fromEntries(tools.map((t) => [t.id, t])) as Record<ToolId, Tool>;
