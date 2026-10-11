"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { VoxelWorld } from "@/engine/voxel";
import { fbm2 } from "@/engine/rng";
import { useUi, type Poi } from "@/state/ui";
import { usePois, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Interactable, Label, Particles, PortalPlane, Stars, VoxelMesh } from "../kit";
import { CameraRig, Explorer, SpiderMob } from "../actors";
import { ChestSpot, MehulNPC } from "./common";
import { colorMat, unitBox } from "../extrude";

const T = 14;

export function buildPortal(): VoxelWorld {
  const w = new VoxelWorld(60, 44, 60);
  w.sky = false;
  for (let x = -14; x <= 14; x++)
    for (let z = -14; z <= 14; z++) {
      const d = Math.hypot(x, z) + (fbm2(x * 0.2, z * 0.2, 2, 8) - 0.5) * 4;
      if (d > 12) continue;
      const depth = Math.round((1 - d / 12) * 10) + 1;
      for (let y = T - depth; y <= T; y++) w.set(x, y, z, y === T ? ((x + z) % 5 === 0 ? "crying_obsidian" : (x * z) % 7 === 0 ? "blackstone" : "obsidian") : "obsidian");
    }
  // grand portal frame
  w.fill(-6, T + 1, -7, 6, T + 15, -7, "blackstone_bricks");
  w.clear(-4, T + 1, -7, 4, T + 12, -7);
  w.fill(-6, T + 13, -7, 6, T + 13, -7, "red_trim");
  w.fill(-7, T + 1, -8, -7, T + 16, -6, "blackstone");
  w.fill(7, T + 1, -8, 7, T + 16, -6, "blackstone");
  w.fill(-7, T + 16, -8, 7, T + 16, -6, "gilded_blackstone");
  for (const x of [-7, 7]) for (const y of [T + 4, T + 9, T + 14]) w.set(x, y, -5, "redstone_block");
  // path to lectern
  w.fill(-1, T, -5, 1, T, 5, "blackstone_bricks");
  return w;
}

/** Stars wired into a spider web behind the portal. */
function WebConstellation() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const cx = 0;
    const cy = 34;
    const z = -40;
    const spokes = 10;
    const rings = [4, 8, 13, 19, 26];
    const P = (a: number, r: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, z] as const;
    for (let s = 0; s < spokes; s++) {
      const a = (s / spokes) * Math.PI * 2;
      pts.push(cx, cy, z, ...P(a, rings[rings.length - 1]));
    }
    for (const r of rings)
      for (let s = 0; s < spokes; s++) {
        const a0 = (s / spokes) * Math.PI * 2;
        const a1 = ((s + 1) / spokes) * Math.PI * 2;
        const sag = r * 0.12;
        const mid = (a0 + a1) / 2;
        pts.push(...P(a0, r), ...P(mid, r - sag), ...P(mid, r - sag), ...P(a1, r));
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = geo.getAttribute("position") as THREE.BufferAttribute;
    g.setAttribute("position", p.clone());
    return g;
  }, [geo]);
  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#ff8a95" transparent opacity={0.35} fog={false} />
      </lineSegments>
      <points geometry={stars}>
        <pointsMaterial color="#ffffff" size={3} sizeAttenuation={false} fog={false} />
      </points>
    </group>
  );
}

export default function FinalPortal() {
  const built = useWorldBuild("portal", buildPortal);
  useWorldReady("portal", !!built);
  const open = useUi((s) => s.open);

  const pois: Poi[] = useMemo(
    () => [
      { id: "arrival", label: "Final Portal", sprite: "ender_pearl", stand: [0.5, T + 1, 7.5], look: [0.5, T + 7, -7], cam: [0.5, T + 6, 20] },
      { id: "lectern", label: "Book & Quill · Start a Project", sprite: "book_quill", stand: [0.5, T + 1, 3.5], look: [0.5, T + 1.5, 1], cam: [3.5, T + 4, 7], actionLabel: "Start a Project", action: () => open({ type: "contact" }) },
      { id: "portal", label: "The Portal", sprite: "ender_eye", stand: [0.5, T + 1, -3.5], look: [0.5, T + 7, -7], cam: [0.5, T + 4, 6], actionLabel: "Step through (credits)", action: () => open({ type: "credits" }) },
      { id: "chest", label: "Chest", sprite: "chest", stand: [-3.5, T + 1, 2.5], look: [-4.5, T + 1, 1], cam: [-6, T + 4, 7] },
    ],
    [open],
  );
  usePois(pois, [built]);

  return (
    <>
      <Env bg="#12040e" fog={["#1a0614", 40, 120]} ambient={0.7} sun={{ pos: [0, 30, 20], intensity: 0.6, color: "#ffc8d0" }} />
      <Stars count={1200} color="#ffd6dc" />
      <WebConstellation />
      {built && <VoxelMesh built={built} look={{ sky: 0, ambient: "#4a2a3a", blockColor: "#ff6070", emissive: 1.3 }} />}
      <Particles count={120} area={[40, 26, 40]} center={[0, T + 10, 0]} color="#ff7a88" size={0.1} velocity={[0, 0.4, 0]} />
      <CameraRig />
      <Explorer />

      <Interactable tip={{ title: "The Final Portal", color: "#e0313f", lore: ["Every journey ends with a project", "Click to begin"] }} position={[0.5, T + 1, -6.9]} size={[9, 12, 0.5]} offset={[0, 6, 0]} onSelect={() => open({ type: "contact" })} poi="portal">
        <PortalPlane w={9} h={12} position={[0, 6, 0]} a="#3a0618" b="#e0313f" />
      </Interactable>
      <Label text="START A PROJECT" position={[0.5, T + 18, -7]} size={1.4} color="#ff4655" />

      <Interactable tip={{ title: "Book & Quill", color: "#ffff55", lore: ["Write to Mehul", "Click to open the contact book"] }} position={[0.5, T + 1, 1]} size={[1, 1.4, 1]} offset={[0, 0.7, 0]} onSelect={() => open({ type: "contact" })} poi="lectern">
        <mesh geometry={unitBox} material={colorMat("#7a5228")} scale={[0.5, 0.9, 0.5]} position={[0, 0.45, 0]} />
        <mesh geometry={unitBox} material={colorMat("#a8763a")} scale={[0.8, 0.12, 0.6]} position={[0, 0.95, 0]} rotation={[0.35, 0, 0]} />
        <mesh geometry={unitBox} material={colorMat("#f0e8d8", true)} scale={[0.6, 0.06, 0.45]} position={[0, 1.03, 0.02]} rotation={[0.35, 0, 0]} />
      </Interactable>

      <MehulNPC anim="wave" position={[3.5, T + 1, 0]} rotation={[0, -0.5, 0]} onSelect={() => open({ type: "contact" })} />
      <SpiderMob position={[-2.5, T + 1, -2]} rotation={[0, 0.6, 0]} />
      <ChestSpot chest="portal-lectern" position={[-4.5, T + 1, 1]} rotation={[0, 0.4, 0]} />
    </>
  );
}
