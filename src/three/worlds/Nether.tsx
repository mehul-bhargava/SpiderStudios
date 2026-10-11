"use client";
import { useMemo } from "react";
import { VoxelWorld } from "@/engine/voxel";
import { fbm2, mulberry32 } from "@/engine/rng";
import { projectsIn, projectBySlug } from "@/content/projects";
import { useUi, type Poi } from "@/state/ui";
import { standOn, usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Interactable, Label, Particles, Screen, VoxelMesh } from "../kit";
import { CameraRig, Explorer, Piglin } from "../actors";
import { ChestSpot } from "./common";
import { colorMat, extrudeSprite, itemMaterial, unitBox } from "../extrude";

const F = 10;

export function buildNether(): VoxelWorld {
  const w = new VoxelWorld(100, 44, 84);
  w.sky = false;
  const r = mulberry32(666);
  w.terrain(-50, -42, 49, 41, (x, z) => F + Math.round((fbm2(x * 0.07, z * 0.07, 3, 13) - 0.5) * 6) + (Math.abs(x) > 40 || Math.abs(z) > 34 ? 6 : 0), (d, _y, x, z) => (d === 0 && x > 18 && Math.abs(z) < 26 ? "crimson_nylium" : r() < 0.04 ? "magma" : "netherrack"));
  // lava lake (west)
  for (let x = -44; x <= -24; x++)
    for (let z = -26; z <= 20; z++)
      if (Math.hypot((x + 34) * 1.2, z * 0.7) < 14) {
        w.clear(x, F - 2, z, x, F + 8, z);
        w.set(x, F - 3, z, "lava");
      }
  // lava falls wall
  w.fill(-46, F - 3, -24, -45, F + 20, 18, "blackstone");
  for (const z of [-18, -8, 2, 12]) w.fill(-44, F - 2, z - 1, -44, F + 19, z + 1, "lava");
  // bastion arena (centre)
  w.fill(-10, F, -18, 10, F, 2, (x, _y, z) => ((x + z) % 5 === 0 ? "gilded_blackstone" : "blackstone_bricks"));
  w.clear(-10, F + 1, -18, 10, F + 14, 2);
  w.walls(-11, F + 1, -19, 11, F + 6, 3, "blackstone_bricks");
  w.fill(-11, F + 7, -19, 11, F + 7, -19, "red_trim");
  w.fill(-8, F + 1, -19, 8, F + 12, -19, "blackstone");
  w.clear(-3, F + 1, 3, 3, F + 5, 3);
  for (let x = -11; x <= 11; x += 4) w.set(x, F + 7, 3, "gilded_blackstone");
  // spike site "A" marking
  const A = ["..X..", ".X.X.", "XXXXX", "X...X", "X...X"];
  A.forEach((row, j) => [...row].forEach((c, i) => c === "X" && w.set(i - 2 + 5, F, -12 + j, "red_concrete")));
  // basalt pillars
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(r() * 90) - 45;
    const z = Math.floor(r() * 74) - 37;
    if (Math.abs(x) < 14 && z > -22 && z < 6) continue;
    if (x < -22 && Math.abs(z) < 24) continue;
    const y = w.top(x, z);
    if (!Number.isFinite(y)) continue;
    w.column(x, y + 1, z, 3 + Math.floor(r() * 10), "basalt");
  }
  // crimson forest (east)
  for (let i = 0; i < 12; i++) {
    const x = 22 + Math.floor(r() * 22);
    const z = -24 + Math.floor(r() * 46);
    const y = w.top(x, z) + 1;
    if (!Number.isFinite(y)) continue;
    const h = 5 + Math.floor(r() * 5);
    w.column(x, y, z, h, "crimson_stem");
    w.sphere(x, y + h, z, 2.3, "wart_block", 1.4);
    w.set(x + 1, y + h - 1, z, "shroomlight");
    w.set(x, y + h + 1, z - 1, "shroomlight");
  }
  for (let i = 0; i < 60; i++) {
    const x = 20 + Math.floor(r() * 26);
    const z = -26 + Math.floor(r() * 50);
    const y = w.top(x, z) + 1;
    if (Number.isFinite(y) && !w.get(x, y, z)) w.set(x, y, z, "crimson_roots");
  }
  // blaze lab (south)
  w.fill(-6, F + 1, 22, 6, F + 1, 32, "nether_bricks");
  w.walls(-6, F + 2, 22, 6, F + 6, 32, "nether_bricks");
  w.clear(-2, F + 2, 22, 2, F + 5, 22);
  w.set(-4, F + 2, 30, "magma");
  w.set(4, F + 2, 30, "glowstone");
  w.set(0, F + 7, 27, "glowstone");
  // glowstone clusters overhead
  for (let i = 0; i < 10; i++) w.sphere(Math.floor(r() * 80) - 40, 34 + Math.floor(r() * 6), Math.floor(r() * 60) - 30, 1.5, "glowstone");
  return w;
}

function Spike({ onSelect }: { onSelect: () => void }) {
  return (
    <Interactable tip={{ title: "The Spike", color: "#ff4655", rarity: "epic", lore: ["Hold to defuse", "Reveals the ACE montage"] }} position={[0.5, F + 1, -9.5]} size={[1.2, 1.2, 1.2]} offset={[0, 0.5, 0]} onSelect={onSelect} poi="spike">
      <mesh geometry={extrudeSprite("spike")} material={itemMaterial} position={[0, 0.6, 0]} scale={1.3} />
      <mesh geometry={unitBox} material={colorMat("#ff4655", true)} position={[0, 0.15, 0]} scale={[0.9, 0.1, 0.9]} />
      <pointLight color="#ff4655" intensity={5} distance={6} position={[0, 1.2, 0]} />
    </Interactable>
  );
}

export default function Nether() {
  const built = useWorldBuild("nether", buildNether);
  useWorldReady("nether", !!built);
  const list = useMemo(() => projectsIn("nether"), []);
  const featured = projectBySlug["ace-montage"];
  const montages = list.filter((p) => p.aspect === "16:9" && p.slug !== "ace-montage");
  const shorts = list.filter((p) => p.aspect === "9:16" && !p.categories.includes("experimental"));
  const experimental = list.filter((p) => p.categories.includes("experimental"));

  const barter = () => {
    const pool = list.filter((p) => !p.locked);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    useUi.getState().open({ type: "dialog", speaker: "Piglin", text: "Hrrm… gold! *rummages* …here, take this clip.", actions: [{ label: `Watch "${pick.title}"`, run: () => useUi.getState().open({ type: "project", slug: pick.slug }) }] });
  };

  const pois: Poi[] = useMemo(
    () => !built ? [] : [
      { id: "arrival", label: "The Nether", sprite: "blaze_powder", stand: standOn(built.world, 0.5, 10.5), look: [0.5, F + 5, -10], cam: [0.5, F + 9, 24] },
      { id: "spike", label: "Spike Site A · ACE", sprite: "spike", stand: [0.5, F + 1, -6.5], look: [0.5, F + 6, -18.5], cam: [0.5, F + 6, 0], actionLabel: "Defuse the spike", action: () => useUi.getState().open({ type: "spike" }) },
      { id: "falls", label: "Lava Falls · Montages", sprite: "controller", stand: standOn(built.world, -21.5, -2.5), look: [-30, F + 6, -3], cam: [-14, F + 8, 4] },
      { id: "forest", label: "Crimson Forest · Shorts", sprite: "phone", stand: standOn(built.world, 24.5, 0.5), look: [32, F + 5, 0.5], cam: [16, F + 7, 6] },
      { id: "lab", label: "Blaze Lab · Experimental", sprite: "redstone_dust", stand: [0.5, F + 2, 25.5], look: [0.5, F + 4, 30], cam: [0.5, F + 6, 16] },
      { id: "piglin", label: "Piglin Barter", sprite: "gold_ingot", stand: standOn(built.world, 12.5, 8.5), look: [15, F + 2, 10], cam: [8, F + 5, 15], actionLabel: "Trade gold for a clip", action: barter },
      { id: "browse", label: "Browse all edits", sprite: "book", stand: standOn(built.world, 0.5, 10.5), look: [0.5, F + 3, -5], cam: [0.5, F + 24, 26], actionLabel: "Open the edit inventory", action: () => useUi.getState().open({ type: "browse", scope: "videos" }) },
      { id: "chest", label: "Bastion treasure", sprite: "chest", stand: [-7.5, F + 1, -14.5], look: [-8.5, F + 1, -16.5], cam: [-3, F + 5, -8] },
    ],
    [built], // eslint-disable-line react-hooks/exhaustive-deps
  );
  usePois(pois, [pois]);

  return (
    <>
      <Env bg="#2a0606" fog={["#3a0a08", 18, 75]} ambient={0.65} sun={{ pos: [0, 30, 0], intensity: 0.6, color: "#ff9a6a" }} />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#4a1c18", blockColor: "#ff9a50", emissive: 1.25 }} />}
      <Particles count={200} area={[90, 24, 70]} center={[0, F + 10, 0]} color="#ffb070" size={0.1} velocity={[0.2, 0.6, 0]} jitter={0.5} />
      <Particles count={80} area={[90, 24, 70]} center={[0, F + 10, 0]} color="#5a5a5a" size={0.16} velocity={[0.3, -0.2, 0]} />
      <CameraRig />
      <Explorer />

      {/* bastion: featured montage + spike */}
      {featured && <Screen project={featured} width={9} position={[0.5, F + 6.5, -18.3]} poi="spike" />}
      <Label text="SPIKE SITE A" position={[0.5, F + 12, -18]} size={1} color="#ff4655" />
      <Spike onSelect={() => useUi.getState().open({ type: "spike" })} />

      {/* lava falls montages */}
      {montages.map((p, i) => (
        <Screen key={p.slug} project={p} width={5} position={[-30.5, F + 6, -6 + i * 7]} rotation={[0, Math.PI / 2, 0]} poi="falls" />
      ))}
      <Label text="Gaming Montages" position={[-30.5, F + 10.5, -3]} size={0.9} color="#ffaa00" />

      {/* crimson forest shorts */}
      {shorts.map((p, i) => (
        <Screen key={p.slug} project={p} width={3.6} position={[32, F + 4.2, -4.5 + i * 4.2]} rotation={[0, -Math.PI / 2, 0]} poi="forest" />
      ))}
      <Label text="Shorts & Beat-Sync" position={[32, F + 8, 0]} size={0.9} color="#ff55ff" />

      {/* blaze lab */}
      {experimental.map((p, i) => (
        <Screen key={p.slug} project={p} width={3.6} position={[0.5 + (i - (experimental.length - 1) / 2) * 3, F + 4.5, 31.4]} rotation={[0, Math.PI, 0]} poi="lab" />
      ))}
      {/* over the lab's centre: behind the arrival camera (z 24), in view from the lab POI */}
      <Label text="Blaze Lab · Experimental" position={[0.5, F + 8, 27]} size={0.7} color="#ffcc33" />

      <Interactable tip={{ title: "Piglin", color: "#f2c14e", lore: ["Barter gold for a random clip"] }} position={[15, F + 1, 10]} size={[1, 2, 1]} offset={[0, 1, 0]} onSelect={barter} poi="piglin">
        <Piglin rotation={[0, -2.4, 0]} />
      </Interactable>

      <ChestSpot chest="nether-bastion" position={[-8.5, F + 1, -16.5]} />
    </>
  );
}
