"use client";
import { useMemo, useState } from "react";
import { VoxelWorld } from "@/engine/voxel";
import { sortedMilestones } from "@/content/career";
import { useUi, type Poi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { EndRod, Env, Interactable, Label, Particles, Stars, VoxelMesh } from "../kit";
import { CameraRig, Explorer, Shulker } from "../actors";
import { ChestSpot } from "./common";
import { colorMat, extrudeSprite, itemMaterial, unitBox } from "../extrude";

const BASE = 6;
const STEP = 7; // height between milestones
const RAD = 10;

export function platformAt(i: number): [number, number, number] {
  const a = i * 0.95 + 0.4;
  return [Math.round(Math.cos(a) * RAD), BASE + 4 + i * STEP, Math.round(Math.sin(a) * RAD)];
}

export const SHIP_Y = BASE + 4 + sortedMilestones.length * STEP + 4;

export function buildEndCity(): VoxelWorld {
  const H = SHIP_Y + 10;
  const w = new VoxelWorld(56, H, 56);
  w.sky = false;
  // end-stone island
  for (let y = 0; y <= BASE; y++) w.disc(0, y, 0, 6 + y * 1.8, "end_stone");
  // tower
  let y = BASE + 1;
  let lvl = 0;
  while (y < SHIP_Y - 2) {
    const half = lvl % 2 === 0 ? 4 : 3;
    const h = 8;
    w.room(-half, y, -half, half, y + h, half, "purpur", "purpur", "purpur");
    for (const [x, z] of [
      [-half, -half],
      [half, -half],
      [-half, half],
      [half, half],
    ])
      w.column(x, y, z, h + 1, "purpur_pillar");
    for (let k = -half + 2; k <= half - 2; k += 2) {
      w.set(k, y + 4, -half, "glass");
      w.set(k, y + 4, half, "glass");
      w.set(-half, y + 4, k, "glass");
      w.set(half, y + 4, k, "glass");
    }
    w.fill(-half - 1, y + h, -half - 1, half + 1, y + h, half + 1, "end_stone_bricks");
    y += h;
    lvl++;
  }
  // milestone platforms
  sortedMilestones.forEach((_, i) => {
    const [px, py, pz] = platformAt(i);
    w.fill(px - 1, py - 1, pz - 1, px + 1, py - 1, pz + 1, "purpur");
    w.set(px, py - 2, pz, "end_stone_bricks");
  });
  // end ship at the top
  const sy = SHIP_Y;
  w.fill(-3, sy - 1, -9, 3, sy - 1, 9, "purpur");
  w.fill(-2, sy - 2, -8, 2, sy - 2, 8, "purpur");
  w.walls(-3, sy, -9, 3, sy + 1, 9, "purpur");
  w.clear(-2, sy, -9, 2, sy + 1, -9);
  w.column(0, sy, 2, 8, "purpur_pillar");
  w.fill(-3, sy + 6, 2, 3, sy + 7, 2, "wool_white");
  w.fill(-1, sy - 1, 9, 1, sy + 2, 11, "purpur");
  w.fill(-2, sy - 1, -11, 2, sy - 1, -10, "purpur");
  return w;
}

export default function EndCity() {
  const built = useWorldBuild("end-city", buildEndCity);
  useWorldReady("end-city", !!built);
  const reached = useProgress((s) => s.milestones);
  const [gliding, setGliding] = useState(false);
  const open = useUi((s) => s.open);

  const glide = () => {
    const p = useProgress.getState();
    p.unlock("climb");
    p.unlock("glide");
    setGliding(true);
    sfx("portal");
    useUi.getState().set({ transition: { phase: "out", kind: "glide" } });
    window.setTimeout(() => travel("portal"), 900);
  };

  const pois: Poi[] = useMemo(() => {
    const list: Poi[] = [{ id: "base", label: "End City · Base", sprite: "purpur", stand: [0.5, BASE + 1, 9.5], look: [0.5, BASE + 14, 0.5], cam: [8, BASE + 6, 26] }];
    sortedMilestones.forEach((m, i) => {
      const [x, y, z] = platformAt(i);
      const out = Math.atan2(z, x);
      list.push({
        id: `m-${m.id}`,
        label: `${i + 1}. ${m.title}`,
        sprite: m.icon,
        stand: [x + 0.5, y, z + 0.5],
        look: [x + 0.5, y + 1, z + 0.5],
        cam: [x + 0.5 + Math.cos(out) * 9, y + 4, z + 0.5 + Math.sin(out) * 9],
        actionLabel: "Open milestone",
        action: () => {
          useProgress.getState().reachMilestone(m.id);
          open({ type: "milestone", id: m.id });
        },
      });
    });
    list.push({
      id: "ship",
      label: "The End Ship · Your project",
      sprite: "elytra",
      stand: [0.5, SHIP_Y, -6.5],
      look: [0.5, SHIP_Y + 1.5, 2],
      cam: [9, SHIP_Y + 6, -14],
      actionLabel: "Equip elytra & glide to the Final Portal",
      action: glide,
    });
    return list;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  usePois(pois, [built]);

  return (
    <>
      <Env bg="#140a1c" fog={["#2a1838", 30, 110]} ambient={0.75} sun={{ pos: [20, 80, 20], intensity: 0.6, color: "#f0e0ff" }} />
      <Stars count={900} color="#f2e2ff" />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#5a4868", blockColor: "#f4ecff" }} />}
      <Particles count={120} area={[40, SHIP_Y, 40]} center={[0, SHIP_Y / 2, 0]} color="#e8d0ff" size={0.12} velocity={[0, 0.5, 0]} />
      <CameraRig maxDistance={50} />
      <Explorer anim={gliding ? "glide" : undefined} />

      {sortedMilestones.map((m, i) => {
        const [x, y, z] = platformAt(i);
        const done = reached.includes(m.id);
        return (
          <group key={m.id}>
            <Interactable
              tip={{ title: m.title, color: done ? "#55ff55" : "#ffff55", lore: [m.date, m.org ?? "", "Click to open"].filter(Boolean) }}
              position={[x + 0.5 + (x > 0 ? -0.9 : 0.9), y, z + 0.5]}
              size={[1, 1, 1]}
              offset={[0, 0.5, 0]}
              onSelect={() => {
                useProgress.getState().reachMilestone(m.id);
                open({ type: "milestone", id: m.id });
              }}
              poi={`m-${m.id}`}
            >
              <Shulker open={done} />
            </Interactable>
            <Label text={`${m.date === "TBD" ? "" : m.date + " · "}${m.title}`} position={[x + 0.5, y + 2.4, z + 0.5]} size={0.55} color={done ? "#55ff55" : "#f2e2ff"} />
            <EndRod position={[x - 0.6, y, z + 1.4]} h={1.2} />
          </group>
        );
      })}

      {/* elytra on the ship */}
      <Interactable tip={{ title: "Elytra", rarity: "epic", lore: ["Glide to the Final Portal"] }} position={[0.5, SHIP_Y + 1.2, 1.9]} size={[1.2, 1.2, 0.4]} offset={[0, 0, 0]} onSelect={glide} poi="ship">
        <mesh geometry={unitBox} material={colorMat("#7a5228")} scale={[1.2, 1.2, 0.08]} />
        <mesh geometry={extrudeSprite("elytra")} material={itemMaterial} position={[0, 0, -0.1]} rotation={[0, Math.PI, 0]} scale={0.9} />
      </Interactable>
      <Label text="Next milestone: your project →" position={[0.5, SHIP_Y + 4, -4]} size={0.7} color="#ffff55" />
      <ChestSpot chest="ec-ship" position={[-2, SHIP_Y, 6]} />
    </>
  );
}
