export type DimensionId =
  | "overworld"
  | "the-end"
  | "ancient-city"
  | "nether"
  | "crafting"
  | "end-city"
  | "portal"
  | "lab";

export type WorldId = DimensionId | "title" | "dressing";

export type TransitionKind = "wipe" | "nether" | "end" | "glide";

export type Dimension = {
  id: DimensionId;
  path: string;
  name: string;
  short: string; // hotbar / tab label
  purpose: string;
  tagline: string;
  coords: string;
  icon: string; // sprite id
  hotkey: number | null;
  transition: TransitionKind;
  accent: string;
  secret?: boolean;
};

export const dimensions: Dimension[] = [
  {
    id: "overworld",
    path: "/overworld",
    name: "Overworld",
    short: "Home",
    purpose: "Home · About Me · Portal Plaza",
    tagline: "Welcome to the Pink City.",
    coords: "26.91° N  75.79° E",
    icon: "grass_block",
    hotkey: 1,
    transition: "wipe",
    accent: "#e98a9a",
  },
  {
    id: "the-end",
    path: "/the-end",
    name: "The End",
    short: "Videos",
    purpose: "Video Editing Portfolio",
    tagline: "Where the polished cuts live.",
    coords: "X 0  Y 64  Z 0",
    icon: "ender_eye",
    hotkey: 2,
    transition: "end",
    accent: "#c58cff",
  },
  {
    id: "ancient-city",
    path: "/ancient-city",
    name: "Ancient City",
    short: "Thumbs",
    purpose: "Thumbnail & Design Gallery",
    tagline: "Quiet, please. The thumbnails are thinking.",
    coords: "X -512  Y -51  Z 1288",
    icon: "echo_shard",
    hotkey: 3,
    transition: "wipe",
    accent: "#29dfeb",
  },
  {
    id: "nether",
    path: "/nether",
    name: "The Nether",
    short: "Gaming",
    purpose: "High-Energy Gaming Edits",
    tagline: "High heat. High frame rate.",
    coords: "X 64  Y 32  Z -128",
    icon: "blaze_powder",
    hotkey: 4,
    transition: "nether",
    accent: "#ff5a3c",
  },
  {
    id: "crafting",
    path: "/crafting",
    name: "Crafting Room",
    short: "Skills",
    purpose: "Skills · Tools · Web & UI",
    tagline: "Every skill, with receipts.",
    coords: "X 12  Y 70  Z 4",
    icon: "crafting_table",
    hotkey: 5,
    transition: "wipe",
    accent: "#d9a35b",
  },
  {
    id: "end-city",
    path: "/end-city",
    name: "End City",
    short: "Career",
    purpose: "Career Timeline & Achievements",
    tagline: "The climb so far.",
    coords: "X 1024  Y 90  Z 768",
    icon: "elytra",
    hotkey: 6,
    transition: "end",
    accent: "#d6a6e8",
  },
  {
    id: "portal",
    path: "/portal",
    name: "Final Portal",
    short: "Hire",
    purpose: "Contact · Start a Project",
    tagline: "Your project starts here.",
    coords: "X ∞  Y ∞  Z ∞",
    icon: "ender_pearl",
    hotkey: 7,
    transition: "end",
    accent: "#e0313f",
  },
  {
    id: "lab",
    path: "/lab",
    name: "Snapshot Lab",
    short: "Lab",
    purpose: "Upcoming Work · Behind the Scenes",
    tagline: "Snapshot 26w41a — expect bugs.",
    coords: "X 26  Y 41  Z 0",
    icon: "structure_block",
    hotkey: null,
    transition: "nether",
    accent: "#b0b0b0",
    secret: true,
  },
];

export const dimensionById = Object.fromEntries(dimensions.map((d) => [d.id, d])) as Record<
  DimensionId,
  Dimension
>;

export function isDimensionId(v: string): v is DimensionId {
  return v in dimensionById;
}

export function pathForWorld(w: WorldId): string {
  if (w === "title") return "/";
  if (w === "dressing") return "/dressing-room";
  return dimensionById[w].path;
}

// Golden path order (docs/PLAN.md §5.2)
export const goldenPath: DimensionId[] = [
  "overworld",
  "the-end",
  "ancient-city",
  "nether",
  "crafting",
  "end-city",
  "portal",
];

export function nextOnPath(id: DimensionId): DimensionId | null {
  const i = goldenPath.indexOf(id);
  if (i < 0 || i === goldenPath.length - 1) return null;
  return goldenPath[i + 1];
}
