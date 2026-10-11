// Advancements never gate content — they unlock cosmetics and titles only.

export type Advancement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  kind?: "task" | "goal" | "challenge";
  title?: string; // Player Card title this unlocks
};

export const advancements: Advancement[] = [
  { id: "spawn", name: "Spawn Point", desc: "Enter the world", icon: "grass_block" },
  { id: "dressed", name: "Dressed to Edit", desc: "Save a look in the Dressing Room", icon: "tunic", title: "Fashion Editor" },
  { id: "inventory", name: "Taking Notes", desc: "Open your inventory", icon: "book" },
  { id: "meet", name: "Meet the Creator", desc: "Talk to Mehul", icon: "player_head" },
  { id: "studio", name: "Welcome to the Studio", desc: "Finish the About quest", icon: "camera", kind: "goal", title: "Studio Regular" },
  { id: "speedrun", name: "Speedrunner", desc: "Skip the About quest (yes, really)", icon: "clock", title: "Speedrunner" },
  { id: "end", name: "Beyond the Void", desc: "Enter The End", icon: "ender_eye" },
  { id: "egg", name: "Free the Egg", desc: "Watch the showreel", icon: "dragon_egg", kind: "goal" },
  { id: "nether", name: "Hot Takes", desc: "Enter the Nether", icon: "blaze_powder" },
  { id: "ace", name: "Ace!", desc: "Defuse the spike", icon: "spike", kind: "challenge", title: "Clutch Viewer" },
  { id: "ancient", name: "Quiet, Please", desc: "Enter the Ancient City", icon: "sculk_sensor" },
  { id: "lens", name: "Under the Lens", desc: "Open a thumbnail breakdown", icon: "spyglass" },
  { id: "bullseye", name: "Bullseye", desc: "Finish Thumbnail Target Practice", icon: "target", kind: "challenge", title: "Thumbnail Connoisseur" },
  { id: "brush", name: "Careful Brushwork", desc: "Uncover a design in the Archaeology Wing", icon: "brush" },
  { id: "crafter", name: "Master Crafter", desc: "Craft 3 different edits", icon: "crafting_table", kind: "goal", title: "Master Crafter" },
  { id: "tools", name: "Know Your Tools", desc: "Inspect every tool in the chest", icon: "chest" },
  { id: "climb", name: "Up We Go", desc: "Reach the top of End City", icon: "shulker_shell" },
  { id: "glide", name: "Cleared for Takeoff", desc: "Glide with the elytra", icon: "elytra", kind: "goal" },
  { id: "treasure", name: "Treasure Hunter", desc: "Open 5 chests", icon: "chest", kind: "goal" },
  { id: "frames", name: "Lost & Found", desc: "Collect all 8 Lost Frames", icon: "film_frame", kind: "challenge", title: "Archivist" },
  { id: "snapshot", name: "Snapshot", desc: "Enter the Snapshot Lab", icon: "structure_block" },
  { id: "command", name: "Command Line", desc: "Use a chat command", icon: "command_block" },
  { id: "six", name: "Howzat!", desc: "Hit a six on the cricket pitch", icon: "cricket_bat" },
  { id: "night", name: "Night Owl", desc: "Visit between midnight and 5 am", icon: "clock" },
  { id: "tourist", name: "Tourist", desc: "Visit every dimension", icon: "map", kind: "goal", title: "Tourist" },
  { id: "recruited", name: "Recruited!", desc: "Send a message from the Final Portal", icon: "book_quill", kind: "challenge", title: "Collaborator" },
  { id: "credits", name: "The End?", desc: "Watch the credits to the end", icon: "dragon_egg", kind: "challenge", title: "Credits Enjoyer" },
];

export const advancementById = Object.fromEntries(advancements.map((a) => [a.id, a])) as Record<string, Advancement>;
