// Block registry. id 0 = air.

export type BlockDef = {
  id: number;
  name: string;
  top: string;
  side: string;
  bottom: string;
  front?: string; // used on the +z face when set
  opaque: boolean;
  cutout: boolean;
  cross: boolean;
  light: number; // 0..15 emitted block light
};

type Spec = [name: string, tex: string | [top: string, side: string, bottom?: string, front?: string], flags?: { cutout?: boolean; cross?: boolean; light?: number; opaque?: boolean }];

const specs: Spec[] = [
  ["stone", "stone"],
  ["cobblestone", "cobblestone"],
  ["smooth_stone", "smooth_stone"],
  ["dirt", "dirt"],
  ["grass", ["grass_top", "grass_side", "dirt"]],
  ["sand", "sand"],
  ["suspicious_sand", "suspicious_sand"],
  ["sandstone", ["sandstone_top", "sandstone_side", "sandstone_top"]],
  ["red_sandstone", "red_sandstone"],
  ["pink", "pink_terracotta"],
  ["pink_carved", ["pink_terracotta", "pink_carved", "pink_terracotta"]],
  ["pink_lattice", ["pink_terracotta", "pink_lattice", "pink_terracotta"]],
  ["cream", "cream"],
  ["yellow_terracotta", "yellow_terracotta"],
  ["orange_terracotta", "orange_terracotta"],
  ["oak_planks", "oak_planks"],
  ["dark_oak_planks", "dark_oak_planks"],
  ["spruce_planks", "spruce_planks"],
  ["oak_log", ["oak_log_top", "oak_log", "oak_log_top"]],
  ["jungle_log", ["oak_log_top", "jungle_log", "oak_log_top"]],
  ["leaves", "leaves", { cutout: true, opaque: false }],
  ["palm_leaves", "palm_leaves", { cutout: true, opaque: false }],
  ["glass", "glass", { cutout: true, opaque: false }],
  ["bookshelf", ["oak_planks", "bookshelf", "oak_planks"]],
  ["crafting_table", ["crafting_top", "crafting_side", "oak_planks", "crafting_side"]],
  ["deepslate", "deepslate"],
  ["deepslate_bricks", "deepslate_bricks"],
  ["deepslate_tiles", "deepslate_tiles"],
  ["reinforced_deepslate", "reinforced_deepslate"],
  ["chiseled_deepslate", "chiseled_deepslate"],
  ["sculk", "sculk"],
  ["sculk_sensor", ["sculk_sensor_top", "sculk", "sculk"], { light: 4 }],
  ["soul_sand", "soul_sand"],
  ["end_stone", "end_stone"],
  ["end_stone_bricks", "end_stone_bricks"],
  ["purpur", "purpur"],
  ["purpur_pillar", ["purpur", "purpur_pillar", "purpur"]],
  ["obsidian", "obsidian"],
  ["crying_obsidian", "crying_obsidian", { light: 10 }],
  ["bedrock", "bedrock"],
  ["netherrack", "netherrack"],
  ["nether_bricks", "nether_bricks"],
  ["blackstone", "blackstone"],
  ["blackstone_bricks", "blackstone_bricks"],
  ["gilded_blackstone", "gilded_blackstone"],
  ["red_trim", "red_trim"],
  ["basalt", ["basalt_top", "basalt", "basalt_top"]],
  ["crimson_nylium", ["crimson_nylium", "crimson_side", "netherrack"]],
  ["crimson_stem", ["oak_log_top", "crimson_stem", "oak_log_top"]],
  ["wart_block", "wart_block"],
  ["shroomlight", "shroomlight", { light: 15 }],
  ["glowstone", "glowstone", { light: 15 }],
  ["lava", "lava", { light: 15 }],
  ["magma", "magma", { light: 6 }],
  ["redstone_block", "redstone_block", { light: 7 }],
  ["lamp_on", "lamp_on", { light: 15 }],
  ["lamp_off", "lamp_off"],
  ["note_block", "note_block"],
  ["jukebox", ["jukebox_top", "note_block", "dark_oak_planks"]],
  ["enchanting_table", ["enchant_top", "enchant_side", "obsidian"]],
  ["loom", ["loom_top", "loom_side", "oak_planks"]],
  ["cartography_table", ["cartography_top", "cartography_side", "dark_oak_planks"]],
  ["target", ["target_top", "hay", "target_top"]],
  ["hay", ["hay", "hay", "hay"]],
  ["white_concrete", "white_concrete"],
  ["light_gray_concrete", "light_gray_concrete"],
  ["gray_concrete", "gray_concrete"],
  ["black_concrete", "black_concrete"],
  ["red_concrete", "red_concrete"],
  ["grid", "grid"],
  ["structure_block", "structure_block", { light: 3 }],
  ["command_block", "command_block"],
  ["scaffold", "scaffold", { cutout: true, opaque: false }],
  ["wool_white", "wool_white"],
  ["wool_red", "wool_red"],
  ["wool_black", "wool_black"],
  ["wool_yellow", "wool_yellow"],
  ["wool_cyan", "wool_cyan"],
  ["wool_purple", "wool_purple"],
  ["wool_lime", "wool_lime"],
  ["wool_orange", "wool_orange"],
  ["wool_pink", "wool_pink"],
  ["wool_blue", "wool_blue"],
  ["gold_block", "gold_block"],
  ["iron_block", "iron_block"],
  ["quartz", "quartz"],
  ["lapis", "lapis"],
  ["emerald_block", "emerald_block"],
  ["sea_lantern", "sea_lantern", { light: 15 }],
  ["froglight", "froglight", { light: 15 }],
  ["portal_frame", ["portal_frame_top", "end_stone_bricks", "end_stone"]],
  ["chorus", "chorus"],
  ["chorus_flower", "chorus_flower", { light: 2 }],
  ["shulker", "shulker"],
  ["tall_grass", "tall_grass", { cross: true, cutout: true, opaque: false }],
  ["poppy", "poppy", { cross: true, cutout: true, opaque: false }],
  ["marigold", "marigold", { cross: true, cutout: true, opaque: false }],
  ["crimson_roots", "crimson_roots", { cross: true, cutout: true, opaque: false }],
  ["dead_bush", "dead_bush", { cross: true, cutout: true, opaque: false }],
  ["soul_fire", "soul_fire", { cross: true, cutout: true, opaque: false, light: 12 }],
  ["sculk_vein", "sculk_vein", { cross: true, cutout: true, opaque: false, light: 1 }],
];

export const blocks: BlockDef[] = [
  { id: 0, name: "air", top: "", side: "", bottom: "", opaque: false, cutout: false, cross: false, light: 0 },
];

for (const [name, tex, flags = {}] of specs) {
  const [top, side, bottom, front] = typeof tex === "string" ? [tex, tex, tex] : [tex[0], tex[1], tex[2] ?? tex[0], tex[3]];
  const cutout = !!flags.cutout;
  blocks.push({
    id: blocks.length,
    name,
    top,
    side,
    bottom,
    front,
    opaque: flags.opaque ?? !cutout,
    cutout,
    cross: !!flags.cross,
    light: flags.light ?? 0,
  });
}

export const B = Object.fromEntries(blocks.map((b) => [b.name, b.id])) as Record<string, number>;

export function blockId(name: string): number {
  const id = B[name];
  if (id === undefined) throw new Error(`Unknown block: ${name}`);
  return id;
}
