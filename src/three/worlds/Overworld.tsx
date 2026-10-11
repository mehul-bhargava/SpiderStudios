"use client";
import { useMemo, useState } from "react";
import { VoxelWorld } from "@/engine/voxel";
import { B } from "@/engine/blocks";
import { fbm2, mulberry32 } from "@/engine/rng";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { npcLines, questItems, type QuestItemId } from "@/content/about";
import { dimensions } from "@/content/dimensions";
import { sfx } from "@/lib/audio";
import { daylight, standOn, usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Interactable, Kites, Label, Lantern, Particles, Sign, VoxelMesh } from "../kit";
import { CameraRig, Explorer, SpiderMob } from "../actors";
import { ChestSpot, DroppedItem, MehulNPC, TravelPortal } from "./common";
import { colorMat, unitBox } from "../extrude";

const G = 12; // ground level (top block y)

const portalDims = dimensions.filter((d) => !d.secret && d.id !== "overworld");
// one portal every 6 blocks, centred on the plaza
export const PORTAL_X = portalDims.map((_, i) => (i - (portalDims.length - 1) / 2) * 6);

function frameBlock(id: string): string {
  return (
    {
      "the-end": "end_stone_bricks",
      "ancient-city": "deepslate_bricks",
      nether: "obsidian",
      crafting: "oak_log",
      "end-city": "purpur",
      portal: "blackstone_bricks",
    }[id] ?? "stone"
  );
}

export function buildPinkCity(): VoxelWorld {
  const w = new VoxelWorld(100, 48, 100);
  const r = mulberry32(26);
  w.terrain(-50, -50, 49, 49, (x, z) => {
    const d = Math.max(Math.abs(x), Math.abs(z));
    const hills = d > 34 ? (d - 34) * 0.45 * fbm2(x * 0.08, z * 0.08, 2, 9) * 2 : 0;
    return G + hills + (d > 26 ? fbm2(x * 0.1, z * 0.1, 2, 4) * 1.6 : 0);
  }, (d) => (d === 0 ? "grass" : d < 4 ? "dirt" : "stone"));

  // ── Portal Plaza ──
  for (let x = -22; x <= 22; x++)
    for (let z = -14; z <= 6; z++) {
      const ring = (x + z) % 6 === 0 || Math.abs(z + 4) === 0;
      w.set(x, G, z, ring ? "pink" : (x * 7 + z * 3) % 5 === 0 ? "cream" : "smooth_stone");
      w.clear(x, G + 1, z, x, G + 12, z);
    }
  portalDims.forEach((d, i) => {
    const x = PORTAL_X[i];
    const fb = frameBlock(d.id);
    w.fill(x - 2, G + 1, -12, x + 2, G + 6, -12, fb);
    w.clear(x - 1, G + 1, -12, x + 1, G + 5, -12);
    w.set(x, G + 7, -12, d.id === "portal" ? "red_trim" : fb);
  });
  // ── Hawa Mahal–inspired facade (west), facing east ──
  const fx = -34;
  for (let lvl = 0; lvl < 6; lvl++) {
    const half = 13 - lvl * 2;
    for (let z = -half; z <= half; z++)
      for (let y = G + 1 + lvl * 4; y <= G + 4 + lvl * 4; y++) {
        const local = y - (G + 1 + lvl * 4);
        const bay = (z + 20) % 3;
        let b = "pink";
        if (local === 3) b = "cream";
        else if (bay === 1 && local >= 1) b = "pink_lattice";
        else if (bay === 1) b = "pink_carved";
        w.set(fx, y, z, b);
        w.fill(fx - 3, y, z, fx - 1, y, z, "pink");
        if (bay === 1 && local === 1) w.set(fx + 1, y, z, "pink"); // jharokha bump
      }
    w.set(fx, G + 5 + lvl * 4, 0, "cream");
  }
  // small domes
  for (const z of [-11, -6, 0, 6, 11]) {
    const top = w.top(fx, z);
    w.set(fx, top + 1, z, "cream");
    w.set(fx, top + 2, z, "gold_block");
  }
  // balcony for quest camera
  w.fill(fx + 1, G + 12, -3, fx + 3, G + 12, 3, "cream");

  // ── studio hut (south-east), open to the west ──
  const hx = 18;
  const hz = 16;
  w.room(hx - 4, G, hz - 4, hx + 4, G + 5, hz + 4, "oak_planks", "spruce_planks", "dark_oak_planks");
  for (const [x, z] of [
    [-4, -4],
    [4, -4],
    [-4, 4],
    [4, 4],
  ])
    w.column(hx + x, G + 1, hz + z, 5, "oak_log");
  w.clear(hx - 4, G + 1, hz - 3, hx - 4, G + 4, hz + 3); // open front
  w.fill(hx - 1, G + 2, hz + 4, hx + 1, G + 3, hz + 4, "glass");
  w.fill(hx - 1, G + 2, hz - 4, hx + 1, G + 3, hz - 4, "glass");
  w.fill(hx + 2, G + 1, hz - 2, hx + 3, G + 1, hz + 2, "dark_oak_planks"); // desk
  w.set(hx - 3, G + 4, hz - 3, "glowstone");
  w.set(hx + 3, G + 4, hz + 3, "glowstone");
  // roof
  for (let i = 0; i < 4; i++) w.fill(hx - 5 + i, G + 6 + i, hz - 5 + i, hx + 5 - i, G + 6 + i, hz + 5 - i, i % 2 ? "pink" : "orange_terracotta");

  // ── cricket pitch (south-west) ──
  for (let z = 10; z <= 30; z++) for (let x = -20; x <= -16; x++) w.set(x, G, z, "sand");
  for (const z of [11, 29]) for (const x of [-19, -18, -17]) w.set(x, G + 1, z, "oak_planks");
  for (let z = 6; z <= 34; z++)
    for (let x = -28; x <= -8; x++) if (Math.abs(Math.hypot(x + 18, (z - 20) * 0.8) - 11) < 0.6 && w.get(x, G, z) === B.grass && !w.get(x, G + 1, z)) w.set(x, G + 1, z, "white_concrete");

  // ── note-block dance stage (east) ──
  w.fill(26, G + 1, -6, 34, G + 1, 4, "dark_oak_planks");
  w.fill(27, G + 2, -5, 33, G + 2, 3, "wool_red");
  for (const z of [-6, 4]) for (const x of [26, 30, 34]) w.column(x, G + 2, z, 4, x === 30 ? "lamp_on" : "note_block");
  w.set(34, G + 2, -1, "jukebox");

  // ── kite stall (south) ──
  w.fill(-10, G + 1, 24, -6, G + 1, 26, "oak_planks");
  for (const [x, z] of [
    [-10, 24],
    [-6, 24],
    [-10, 26],
    [-6, 26],
  ])
    w.column(x, G + 2, z, 3, "oak_log");
  w.fill(-11, G + 5, 23, -5, G + 5, 27, (x) => (x % 2 ? "wool_yellow" : "wool_red"));

  // trees + flowers
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(r() * 96) - 48;
    const z = Math.floor(r() * 96) - 48;
    if (x > -26 && x < 38 && z > -16 && z < 32) continue;
    if (x < -30 && Math.abs(z) < 16) continue;
    const y = w.top(x, z) + 1;
    if (!Number.isFinite(y)) continue;
    const roll = r();
    if (roll < 0.25) w.tree(x, y, z, 4 + Math.floor(r() * 3));
    else if (roll < 0.5) w.set(x, y, z, "marigold");
    else if (roll < 0.62) w.set(x, y, z, "poppy");
    else w.set(x, y, z, "tall_grass");
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(r() * 50) - 25;
    const z = 8 + Math.floor(r() * 24);
    if (w.get(x, G, z) === B.grass && !w.get(x, G + 1, z)) w.set(x, G + 1, z, r() < 0.5 ? "tall_grass" : "marigold");
  }
  return w;
}

const ITEM_POS: Record<QuestItemId, [number, number, number]> = {
  camera: [-32, G + 13, 0],
  headphones: [-14, G + 1, 20],
  memory_card: [30, G + 3, -1],
};

export default function Overworld() {
  const built = useWorldBuild("overworld", buildPinkCity);
  useWorldReady("overworld", !!built);
  const day = useMemo(() => daylight(), []);
  const quest = useProgress((s) => s.quest);
  const [sixHit, setSixHit] = useState(false);

  const talk = () => {
    const ui = useUi.getState();
    const p = useProgress.getState();
    p.unlock("meet");
    const q = p.quest;
    if (q.done) {
      ui.open({ type: "book", id: "about", page: 0 });
      return;
    }
    if (q.found.length === 3) {
      p.setQuest({ done: true });
      p.unlock("studio");
      sfx("levelup");
      ui.open({
        type: "dialog",
        speaker: "Mehul",
        text: npcLines.done,
        actions: [
          { label: "Read my story", run: () => useUi.getState().open({ type: "book", id: "about", page: 4 }) },
          { label: "Watch the showreel", run: () => useUi.getState().open({ type: "project", slug: "showreel" }) },
        ],
      });
      return;
    }
    if (q.talked) {
      ui.open({ type: "dialog", speaker: "Mehul", text: npcLines.progress(q.found.length), actions: [{ label: "Skip — just tell me", run: skipQuest }] });
      return;
    }
    ui.open({
      type: "dialog",
      speaker: "Mehul",
      text: npcLines.greet,
      actions: [
        {
          label: "Sure!",
          run: () => {
            useProgress.getState().setQuest({ talked: true });
            useUi.getState().open({ type: "book", id: "about", page: 0 });
          },
        },
        { label: "Skip — just tell me about you", run: skipQuest },
      ],
    });
  };
  const skipQuest = () => {
    const p = useProgress.getState();
    p.setQuest({ talked: true, done: true, skipped: true, found: ["camera", "headphones", "memory_card"] });
    p.unlock("meet");
    p.unlock("speedrun");
    useUi.getState().open({ type: "book", id: "about", page: 0 });
  };
  const pick = (id: QuestItemId) => {
    const p = useProgress.getState();
    if (p.quest.found.includes(id)) return;
    sfx("pop");
    p.setQuest({ found: [...p.quest.found, id] });
    const item = questItems.find((q) => q.id === id)!;
    const page = ["who", "where", "play", "lead", "believe"].indexOf(item.chapter);
    useUi.getState().open({ type: "book", id: "about", page });
  };

  const pois: Poi[] = useMemo(() => {
    if (!built) return [];
    const W = built.world;
    return [
      { id: "spawn", label: "Spawn", sprite: "grass_block", stand: standOn(W, 0.5, 4.5), look: [0.5, G + 4, -10], cam: [0.5, G + 7, 14] },
      { id: "studio", label: "Mehul's Studio", sprite: "player_head", stand: standOn(W, 12.5, 16.5), look: [17, G + 2, 16.5], cam: [8, G + 5, 22], actionLabel: "Talk to Mehul", action: talk },
      { id: "hawa", label: "Hawa Mahal", sprite: "camera", stand: [-30.5, G + 13, 0.5], look: [-34, G + 14, 0.5], cam: [-18, G + 16, 8] },
      { id: "cricket", label: "Cricket Pitch", sprite: "cricket_bat", stand: standOn(W, -14.5, 20.5), look: [-18, G + 1, 20], cam: [-8, G + 6, 28] },
      { id: "stage", label: "Dance Stage", sprite: "note", stand: [29.5, G + 3, -0.5], look: [30, G + 3, -1], cam: [22, G + 7, 6] },
      { id: "plaza", label: "Portal Plaza", sprite: "ender_eye", stand: standOn(W, 0.5, -6.5), look: [0.5, G + 4, -12], cam: [0.5, G + 6, 4], actionLabel: "Select a world", action: () => useUi.getState().open({ type: "selectWorld" }) },
      { id: "kites", label: "Kite Stall", sprite: "chest", stand: standOn(W, -8, 21.5), look: [-8, G + 2, 25], cam: [-2, G + 6, 18] },
    ];
  }, [built]); // eslint-disable-line react-hooks/exhaustive-deps
  usePois(pois, [pois]);

  const sky = day > 0.5 ? "#8fc6ff" : day > 0 ? "#f0a070" : "#0b1026";
  return (
    <>
      <Env bg={sky} fog={[sky, 40, 110]} ambient={0.55 + day * 0.4} sun={{ pos: [30, 50, 20], intensity: 0.4 + day, color: day > 0.5 ? "#fff4e0" : "#ffb070" }} stars={day < 0.4 ? 900 : 0} />
      {built && <VoxelMesh built={built} look={{ sky: 0.3 + day * 0.75, skyColor: day > 0.5 ? "#ffffff" : "#ffc8a0", ambient: day > 0.3 ? "#1c1a20" : "#0a0c18", blockColor: "#ffc070" }} />}
      <Kites count={8} center={[0, 34, 0]} radius={34} />
      <Particles count={40} area={[80, 10, 80]} center={[0, G + 6, 0]} color="#ffb6c8" size={0.14} velocity={[0.4, -0.15, 0.2]} />
      <CameraRig />
      <Explorer />

      {/* Mehul at his desk */}
      <MehulNPC anim={quest.done ? "wave" : quest.talked ? "idle" : "greet"} position={[17, G + 1, 16.5]} rotation={[0, -Math.PI / 2, 0]} onSelect={talk} poi="studio" />
      <group position={[20.6, G + 2, 16.5]}>
        <mesh geometry={unitBox} material={colorMat("#141418")} scale={[0.2, 1.1, 1.8]} position={[0, 0.6, 0]} />
        <mesh geometry={unitBox} material={colorMat(quest.done ? "#c58cff" : "#2a3a5a", true)} scale={[0.05, 0.9, 1.6]} position={[-0.11, 0.6, 0]} />
      </group>
      <Lantern position={[13, G + 1, 12]} />

      {/* Portal plaza */}
      {portalDims.map((d, i) => (
        <TravelPortal key={d.id} to={d.id} position={[PORTAL_X[i] + 0.5, G + 1, -11.5]} w={3} h={5} stars={d.id === "the-end" || d.id === "end-city"} />
      ))}
      <Sign position={[3.5, G + 1, 6.5]} lines={["Welcome to the", "Pink City!", "Press 1-7 to travel"]} />
      <Sign position={[10.5, G + 1, 13.5]} rotation={[0, -0.8, 0]} lines={["Mehul's Studio", "→"]} />

      {/* quest items */}
      {quest.talked && !quest.found.includes("camera") && <DroppedItem sprite="camera" tip="Mehul's Camera" position={ITEM_POS.camera} onSelect={() => pick("camera")} />}
      {quest.talked && !quest.found.includes("headphones") && <DroppedItem sprite="headphones" tip="Mehul's Headphones" position={ITEM_POS.headphones} onSelect={() => pick("headphones")} />}
      {quest.talked && !quest.found.includes("memory_card") && <DroppedItem sprite="memory_card" tip="Memory Card" position={ITEM_POS.memory_card} onSelect={() => pick("memory_card")} />}
      <SpiderMob position={[31.5, G + 3, 1]} rotation={[0, -0.6, 0]} />

      {/* cricket: hit a six */}
      <Interactable
        tip={{ title: "Cricket bat", lore: ["Swing for the boundary"] }}
        position={[-16.5, G + 1, 23.5]}
        size={[1, 1.2, 1]}
        offset={[0, 0.6, 0]}
        poi="cricket"
        onSelect={() => {
          setSixHit(true);
          sfx("levelup");
          useProgress.getState().unlock("six");
          window.setTimeout(() => setSixHit(false), 2500);
        }}
      >
        <mesh geometry={unitBox} material={colorMat("#e8cf98")} scale={[0.2, 0.9, 0.08]} position={[0, 0.55, 0]} rotation={[0, 0, 0.3]} />
      </Interactable>
      {sixHit && <Label text="SIX! Howzat!" position={[-18, G + 6, 20]} color="#ffff55" size={1} />}

      <ChestSpot chest="ow-kite" position={[-8, G + 1, 25]} />
    </>
  );
}
