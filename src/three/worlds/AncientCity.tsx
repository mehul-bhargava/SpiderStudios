"use client";
import { useMemo, useState } from "react";
import { VoxelWorld } from "@/engine/voxel";
import { mulberry32 } from "@/engine/rng";
import { thumbnails, collectionLabels } from "@/content/thumbnails";
import { designs } from "@/content/designs";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { thumbUrl, designUrl } from "@/lib/media";
import { sfx } from "@/lib/audio";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, ImageFrame, Interactable, Label, Lantern, Particles, VoxelMesh } from "../kit";
import { CameraRig, Explorer, Warden } from "../actors";
import { ChestSpot } from "./common";
import { colorMat, unitBox } from "../extrude";

const F = 6; // floor top

export function buildAncient(): VoxelWorld {
  const w = new VoxelWorld(96, 30, 84);
  w.sky = false;
  const r = mulberry32(51);
  // bedrock + floor
  w.fill(-48, 0, -42, 47, F - 1, 41, "deepslate");
  w.fill(-40, F, -34, 40, F, 34, (x, _y, z) => ((x + z) % 7 === 0 ? "deepslate_bricks" : r() < 0.18 ? "sculk" : "deepslate_tiles"));
  // outer walls (low, ruined)
  w.walls(-41, F, -35, 41, F + 8, 35, "deepslate_bricks");
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(r() * 82) - 41;
    const z = Math.floor(r() * 70) - 35;
    w.clear(x, F + 4 + Math.floor(r() * 5), z, x, F + 8, z);
  }
  // main hall gallery walls (west + east), thumbnails hang here
  w.fill(-19, F + 1, -20, -19, F + 7, 14, "deepslate_bricks");
  w.fill(19, F + 1, -20, 19, F + 7, 14, "deepslate_bricks");
  w.fill(-19, F + 8, -20, -19, F + 8, 14, "chiseled_deepslate");
  w.fill(19, F + 8, -20, 19, F + 8, 14, "chiseled_deepslate");
  // the warden frame (north)
  const fz = -24;
  w.fill(-9, F + 1, fz, 9, F + 15, fz, "reinforced_deepslate");
  w.clear(-6, F + 3, fz, 6, F + 12, fz);
  w.fill(-6, F + 3, fz - 1, 6, F + 12, fz - 1, "deepslate_tiles");
  w.fill(-11, F + 1, fz - 1, -10, F + 18, fz + 1, "deepslate_bricks");
  w.fill(10, F + 1, fz - 1, 11, F + 18, fz + 1, "deepslate_bricks");
  w.fill(-11, F + 16, fz - 1, 11, F + 17, fz + 1, "deepslate_bricks");
  for (let x = -8; x <= 8; x += 4) w.set(x, F + 1, fz + 2, "sculk_sensor");
  w.fill(-10, F, fz + 1, 10, F, fz + 6, "sculk");
  // pillars in hall
  for (const [x, z] of [
    [-10, -10],
    [10, -10],
    [-10, 6],
    [10, 6],
  ]) {
    w.column(x, F + 1, z, 9, "deepslate_bricks");
    w.set(x, F + 10, z, "chiseled_deepslate");
  }
  // archaeology wing (south-west)
  w.fill(-38, F, 18, -22, F, 32, "sand");
  w.walls(-38, F + 1, 18, -22, F + 5, 32, "deepslate_tiles");
  w.clear(-30, F + 1, 18, -28, F + 4, 18);
  for (const [x, z] of [
    [-34, 24],
    [-30, 26],
    [-26, 23],
    [-33, 29],
  ])
    w.set(x, F + 1, z, "suspicious_sand");
  // archery range (south-east)
  w.fill(22, F, 18, 38, F, 32, "deepslate_tiles");
  w.walls(22, F + 1, 18, 38, F + 5, 32, "deepslate_bricks");
  w.clear(28, F + 1, 18, 30, F + 4, 18);
  for (const x of [26, 30, 34]) w.set(x, F + 2, 31, "target");
  w.fill(24, F + 1, 31, 36, F + 1, 31, "hay");
  // soul fire + sculk veins
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(r() * 76) - 38;
    const z = Math.floor(r() * 64) - 32;
    if (!w.get(x, F + 1, z) && w.get(x, F, z)) w.set(x, F + 1, z, r() < 0.25 ? "soul_fire" : "sculk_vein");
  }
  return w;
}

export default function AncientCity() {
  const built = useWorldBuild("ancient-city", buildAncient);
  useWorldReady("ancient-city", !!built);
  const [risen, setRisen] = useState(false);
  const hero = thumbnails.find((t) => t.rarity === "epic") ?? thumbnails[0];
  const gallery = thumbnails.filter((t) => t.slug !== hero.slug);
  const west = gallery.slice(0, Math.ceil(gallery.length / 2));
  const east = gallery.slice(Math.ceil(gallery.length / 2));

  const shriek = () => {
    setRisen(true);
    sfx("portal");
    window.setTimeout(() => useUi.getState().open({ type: "thumb", slug: hero.slug }), 1400);
    window.setTimeout(() => setRisen(false), 6000);
  };

  const pois: Poi[] = useMemo(
    () => [
      { id: "entrance", label: "Ancient City", sprite: "echo_shard", stand: [0.5, F + 1, 22.5], look: [0.5, F + 6, -10], cam: [0.5, F + 9, 32] },
      { id: "hero", label: "The Warden's Frame", sprite: "sculk_sensor", stand: [0.5, F + 1, -15.5], look: [0.5, F + 7.5, -23], cam: [0.5, F + 7, -6], actionLabel: "Activate the shrieker", action: shriek },
      { id: "west", label: `West Gallery`, sprite: "echo_shard", stand: [-14.5, F + 1, -2.5], look: [-18.5, F + 4, -3], cam: [-6, F + 5, -3] },
      { id: "east", label: `East Gallery`, sprite: "echo_shard", stand: [14.5, F + 1, -2.5], look: [18.5, F + 4, -3], cam: [6, F + 5, -3] },
      { id: "archaeology", label: "Archaeology Wing", sprite: "brush", stand: [-29.5, F + 1, 21.5], look: [-30, F + 2, 26], cam: [-29.5, F + 9, 12], actionLabel: "Brush the sand", action: () => useUi.getState().open({ type: "archaeology" }) },
      { id: "archery", label: "Thumbnail Target Practice", sprite: "target", stand: [29.5, F + 1, 21.5], look: [30, F + 2.5, 31], cam: [29.5, F + 7, 12], actionLabel: "Start target practice", action: () => useUi.getState().open({ type: "target" }) },
      { id: "browse", label: "Browse all thumbnails", sprite: "book", stand: [0.5, F + 1, 22.5], look: [0.5, F + 2, -3], cam: [0.5, F + 24, 26], actionLabel: "Open the thumbnail inventory", action: () => useUi.getState().open({ type: "browse", scope: "thumbs" }) },
      { id: "chest", label: "Hidden chest", sprite: "chest", stand: [-25.5, F + 1, 29.5], look: [-24, F + 1, 31], cam: [-29, F + 6, 22] },
    ],
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  usePois(pois, [built]);

  const openThumb = (slug: string) => {
    useProgress.getState().unlock("lens");
    useUi.getState().open({ type: "thumb", slug });
  };

  return (
    <>
      <Env bg="#020608" fog={["#03090c", 12, 60]} ambient={0.55} sun={{ pos: [0, 30, 10], intensity: 0.4, color: "#8ae8f0" }} />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#1b2a30", blockColor: "#4fe8f2", emissive: 1.3 }} />}
      <Particles count={90} area={[70, 12, 60]} center={[0, F + 5, 0]} color="#29dfeb" size={0.1} velocity={[0, 0.3, 0]} />
      <CameraRig />
      <Explorer />

      {/* hero thumbnail in the warden frame */}
      <ImageFrame url={thumbUrl(hero)} width={12} position={[0.5, F + 7.6, -22.4]} frame="#0b1c20" glow="#29dfeb" tip={{ title: hero.title, rarity: hero.rarity, lore: [collectionLabels[hero.collection], "Click for the design breakdown"] }} onSelect={() => openThumb(hero.slug)} poi="hero" />
      <Interactable tip={{ title: "Sculk Shrieker", color: "#29dfeb", lore: ["Make some noise…", "Reveals the top thumbnail"] }} onSelect={shriek} position={[0.5, F + 1, -18.5]} size={[1, 0.6, 1]} offset={[0, 0.3, 0]} poi="hero">
        <mesh geometry={unitBox} material={colorMat("#0d333c")} scale={[1, 0.5, 1]} position={[0, 0.25, 0]} />
        <mesh geometry={unitBox} material={colorMat("#e8e0c8")} scale={[0.7, 0.1, 0.7]} position={[0, 0.55, 0]} />
      </Interactable>
      <Warden risen={risen} position={[5.5, F + 1, -19]} rotation={[0, -0.4, 0]} />

      {/* galleries */}
      {west.map((t, i) => (
        <ImageFrame key={t.slug} url={thumbUrl(t)} width={3.6} position={[-17.85, F + 4, -16 + i * 6.5]} rotation={[0, Math.PI / 2, 0]} frame="#2a2a30" glow={t.rarity === "rare" ? "#3ad6e0" : undefined} tip={{ title: t.title, rarity: t.rarity, lore: [collectionLabels[t.collection], "Click for the breakdown"] }} onSelect={() => openThumb(t.slug)} poi="west" />
      ))}
      {east.map((t, i) => (
        <ImageFrame key={t.slug} url={thumbUrl(t)} width={3.6} position={[18.85, F + 4, -16 + i * 6.5]} rotation={[0, -Math.PI / 2, 0]} frame="#2a2a30" glow={t.rarity === "rare" ? "#3ad6e0" : undefined} tip={{ title: t.title, rarity: t.rarity, lore: [collectionLabels[t.collection], "Click for the breakdown"] }} onSelect={() => openThumb(t.slug)} poi="east" />
      ))}
      <Label text="Thumbnail Gallery" position={[-18.4, F + 9.6, -3]} size={0.9} color="#29dfeb" />
      <Label text="Thumbnail Gallery" position={[18.4, F + 9.6, -3]} size={0.9} color="#29dfeb" />

      {/* archaeology wing: design pieces on the walls */}
      {designs.map((d, i) => (
        <ImageFrame key={d.slug} url={designUrl(d)} width={2.4} aspect={d.kind === "banner" ? 16 / 9 : d.kind === "poster" ? 0.8 : 1} position={[-36 + i * 4, F + 3.4, 31.6]} rotation={[0, Math.PI, 0]} frame="#5a4a2a" tip={{ title: d.title, lore: [d.client ?? "Branding & social", "Click to view"] }} onSelect={() => useUi.getState().open({ type: "design", slug: d.slug })} poi="archaeology" />
      ))}
      <Label text="Archaeology Wing · Branding & Social" position={[-30, F + 7, 18]} size={0.7} color="#e8cf98" />
      <Interactable tip={{ title: "Suspicious Sand", lore: ["Something is buried here", "Click to brush"] }} position={[-30, F + 1, 26]} size={[1, 1, 1]} onSelect={() => useUi.getState().open({ type: "archaeology" })} poi="archaeology" />

      {/* archery range */}
      <Interactable tip={{ title: "Target Practice", color: "#ffff55", lore: ["Match thumbnails to a brief", "Click to start"] }} position={[30.5, F + 2, 31]} size={[10, 2, 1]} offset={[0, 0.5, 0]} onSelect={() => useUi.getState().open({ type: "target" })} poi="archery" />
      <Label text="Target Practice" position={[30, F + 7, 18]} size={0.7} color="#ffff55" />

      {[-12, -4, 4, 12].map((x) => (
        <Lantern key={x} soul position={[x + 0.5, F + 1, -20]} />
      ))}
      <ChestSpot chest="ac-vault" position={[-24, F + 1, 31]} />
    </>
  );
}
