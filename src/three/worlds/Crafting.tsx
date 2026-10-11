"use client";
import { useMemo } from "react";
import { VoxelWorld } from "@/engine/voxel";
import { skillStations } from "@/content/skills";
import { webProjects } from "@/content/designs";
import { useUi, type Poi } from "@/state/ui";
import { travel } from "@/lib/nav";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { ChestModel, Env, Interactable, Label, Lantern, Particles, VoxelMesh } from "../kit";
import { CameraRig, Explorer } from "../actors";
import { ChestSpot, MehulNPC } from "./common";
import { colorMat, textTexture, unitBox } from "../extrude";

const F = 2;
// station block positions (x, z) inside the room; y = F + 1
const STATION_POS: Record<string, [number, number]> = {
  crafting_table: [0, -2],
  enchanting_table: [-9, -6],
  loom: [-11, 1],
  cartography_table: [-11, 5],
  jukebox: [9, -6],
  brewing_stand: [11, 1],
  redstone: [10, 6],
  lectern: [-4, 7],
};

export function buildCrafting(): VoxelWorld {
  const w = new VoxelWorld(40, 20, 34);
  w.sky = false;
  w.fill(-20, 0, -17, 19, F, 16, "stone");
  // room
  w.room(-14, F, -10, 14, F + 9, 10, "spruce_planks", "oak_planks", "dark_oak_planks");
  // wall details: bookshelves + log pillars
  for (let x = -13; x <= 13; x++)
    for (let y = F + 1; y <= F + 4; y++) {
      if (x % 4 !== 0) w.set(x, y, -10, "bookshelf");
    }
  for (const x of [-14, -7, 0, 7, 14]) {
    w.column(x, F + 1, -10, 8, "oak_log");
    w.column(x, F + 1, 10, 8, "oak_log");
  }
  for (const z of [-10, -3, 3, 10]) {
    w.column(-14, F + 1, z, 8, "oak_log");
    w.column(14, F + 1, z, 8, "oak_log");
  }
  // windows
  for (const x of [-11, -4, 4, 11]) w.fill(x - 1, F + 5, -10, x + 1, F + 7, -10, "glass");
  // ceiling beams + lights
  for (let x = -12; x <= 12; x += 6) w.fill(x, F + 8, -9, x, F + 8, 9, "oak_log");
  for (const [x, z] of [
    [-9, -5],
    [-9, 5],
    [0, 0],
    [9, -5],
    [9, 5],
  ])
    w.set(x, F + 9, z, "glowstone");
  // rug
  w.fill(-3, F, -5, 3, F, 1, (x, _y, z) => ((x + z) % 2 ? "wool_red" : "wool_yellow"));
  // stations
  w.set(...xz(STATION_POS.crafting_table), "crafting_table");
  w.set(...xz(STATION_POS.enchanting_table), "enchanting_table");
  for (let dx = -2; dx <= 2; dx++) {
    w.set(STATION_POS.enchanting_table[0] + dx, F + 1, STATION_POS.enchanting_table[1] - 2, "bookshelf");
    w.set(STATION_POS.enchanting_table[0] + dx, F + 2, STATION_POS.enchanting_table[1] - 2, "bookshelf");
  }
  w.set(...xz(STATION_POS.loom), "loom");
  w.set(...xz(STATION_POS.cartography_table), "cartography_table");
  w.set(...xz(STATION_POS.jukebox), "jukebox");
  w.set(STATION_POS.jukebox[0] + 1, F + 1, STATION_POS.jukebox[1], "note_block");
  w.set(STATION_POS.jukebox[0] - 1, F + 1, STATION_POS.jukebox[1], "note_block");
  // redstone corner
  w.fill(8, F + 1, 8, 12, F + 1, 9, "smooth_stone");
  w.set(12, F + 2, 9, "redstone_block");
  w.set(8, F + 2, 9, "lamp_on");
  w.set(10, F + 3, 9, "lamp_on");
  w.set(12, F + 4, 9, "lamp_off");
  // hidden door (bookshelf) to the lab
  w.set(-13, F + 1, 8, "bookshelf");
  w.set(-13, F + 2, 8, "bookshelf");
  return w;
}

function xz([x, z]: [number, number]): [number, number, number] {
  return [x, F + 1, z];
}

function Monitor({ title, lines, ...g }: { title: string; lines: string[]; position: [number, number, number]; rotation?: [number, number, number] }) {
  const tex = useMemo(() => textTexture([title, ...lines], { w: 384, h: 216, bg: "#101820", color: "#55ffff", size: 22 }), [title, lines]);
  return (
    <group {...g}>
      <mesh geometry={unitBox} material={colorMat("#141418")} scale={[1.9, 1.15, 0.12]} />
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[1.75, 1]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh geometry={unitBox} material={colorMat("#2a2a30")} scale={[0.15, 0.5, 0.15]} position={[0, -0.8, 0]} />
    </group>
  );
}

export default function Crafting() {
  const built = useWorldBuild("crafting", buildCrafting);
  useWorldReady("crafting", !!built);
  const open = useUi((s) => s.open);

  const pois: Poi[] = useMemo(() => {
    const list: Poi[] = [{ id: "overview", label: "Crafting Room", sprite: "crafting_table", stand: [0.5, F + 1, 5.5], look: [0.5, F + 2, -3], cam: [0.5, F + 7, 9] }];
    for (const s of skillStations) {
      const [x, z] = STATION_POS[s.station];
      const toward = z < 0 ? 1 : -1;
      list.push({
        id: s.id,
        label: `${s.stationName} · ${s.name}`,
        sprite: s.station === "redstone" ? "tool_redstone" : s.station === "brewing_stand" ? "potion" : s.station === "lectern" ? "book" : s.station,
        stand: [x + 0.5 + (x < -5 ? 1.5 : x > 5 ? -1.5 : 0), F + 1, z + 0.5 + toward * 1.5],
        look: [x + 0.5, F + 1.5, z + 0.5],
        cam: [x * 0.55 + 0.5, F + 4.5, z + toward * 5.5],
        actionLabel: s.id === "video" ? "Play: Craft the Edit" : "Inspect",
        action: () => (s.id === "video" ? open({ type: "craft" }) : open({ type: "station", id: s.id })),
      });
    }
    list.push({ id: "tools", label: "Tool Chest · Software", sprite: "chest", stand: [3.5, F + 1, 3.5], look: [5, F + 1, 2], cam: [1, F + 5, 7], actionLabel: "Open the tool chest", action: () => open({ type: "tools" }) });
    list.push({ id: "door", label: "Suspicious bookshelf", sprite: "bookshelf", stand: [-11.5, F + 1, 8.5], look: [-13, F + 2, 8.5], cam: [-8, F + 4, 6], actionLabel: "Push the bookshelf", action: () => travel("lab") });
    return list;
  }, [open]);
  usePois(pois, [built]);

  return (
    <>
      <Env bg="#1a120a" fog={["#1a120a", 20, 50]} ambient={0.7} sun={{ pos: [5, 10, 5], intensity: 0.7, color: "#ffd8a0" }} />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#3a2c20", blockColor: "#ffcf8a" }} />}
      <Particles count={50} area={[26, 8, 18]} center={[0, F + 4, 0]} color="#ffe8b0" size={0.06} velocity={[0.05, 0.05, 0]} />
      <CameraRig minDistance={2} maxDistance={18} />
      <Explorer />

      {skillStations.map((s) => {
        const [x, z] = STATION_POS[s.station];
        const isModel = s.station === "brewing_stand" || s.station === "lectern" || s.station === "redstone";
        return (
          <Interactable
            key={s.id}
            tip={{ title: s.stationName, color: "#ffff55", lore: [s.name, s.id === "video" ? "Click to play Craft the Edit" : "Click to inspect"] }}
            position={[x + 0.5, F + 1, z + 0.5]}
            size={s.station === "redstone" ? [5, 3, 2] : [1.05, 1.05, 1.05]}
            offset={s.station === "redstone" ? [0, 1, 8.5 - z] : [0, 0.5, 0]}
            onSelect={() => (s.id === "video" ? open({ type: "craft" }) : open({ type: "station", id: s.id }))}
            poi={s.id}
          >
            {isModel && s.station === "brewing_stand" && (
              <group>
                <mesh geometry={unitBox} material={colorMat("#5a5a5a")} scale={[0.1, 0.9, 0.1]} position={[0, 0.45, 0]} />
                <mesh geometry={unitBox} material={colorMat("#3a3a3a")} scale={[0.8, 0.1, 0.8]} position={[0, 0.05, 0]} />
                {[-0.3, 0.3, 0].map((dx, i) => (
                  <mesh key={i} geometry={unitBox} material={colorMat(["#e0313f", "#3ab3da", "#c74ebd"][i], true)} scale={[0.18, 0.3, 0.18]} position={[dx, 0.25, i === 2 ? 0.3 : -0.1]} />
                ))}
              </group>
            )}
            {isModel && s.station === "lectern" && (
              <group>
                <mesh geometry={unitBox} material={colorMat("#7a5228")} scale={[0.5, 0.9, 0.5]} position={[0, 0.45, 0]} />
                <mesh geometry={unitBox} material={colorMat("#a8763a")} scale={[0.8, 0.12, 0.6]} position={[0, 0.95, 0]} rotation={[0.35, 0, 0]} />
                <mesh geometry={unitBox} material={colorMat("#f0e8d8")} scale={[0.6, 0.06, 0.45]} position={[0, 1.03, 0.02]} rotation={[0.35, 0, 0]} />
              </group>
            )}
          </Interactable>
        );
      })}
      <Label text="Redstone Corner · Web & UI" position={[10.5, F + 5.5, 8]} size={0.6} color="#ff5555" />
      {webProjects.map((p, i) => (
        <Monitor key={p.slug} title={p.title} lines={[p.role, p.date === "TBD" ? "" : p.date]} position={[9 + i * 2.2, F + 2.6, 7.3]} rotation={[0, Math.PI, 0]} />
      ))}

      <Interactable tip={{ title: "Tool Chest", color: "#ffff55", lore: ["Photoshop · Premiere Pro · CapCut", "Canva · Figma · WordPress"] }} position={[5, F + 1, 2]} size={[1, 1, 1]} offset={[0, 0.45, 0]} onSelect={() => open({ type: "tools" })} poi="tools">
        <ChestModel color="#c9953f" />
      </Interactable>

      <MehulNPC anim="idle" position={[-4.5, F + 1, -6.5]} rotation={[0, 0.5, 0]} onSelect={() => open({ type: "station", id: "soft" })} />
      <Lantern position={[-2.5, F + 1, -8]} />
      <Lantern position={[3.5, F + 1, -8]} />
      <ChestSpot chest="craft-shelf" position={[12.5, F + 1, 3.5]} rotation={[0, -Math.PI / 2, 0]} />
    </>
  );
}
