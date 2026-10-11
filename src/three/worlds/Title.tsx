"use client";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { VoxelWorld } from "@/engine/voxel";
import { fbm2, mulberry32 } from "@/engine/rng";
import { mehulSkin } from "@/engine/skin";
import { usePlayer } from "@/state/player";
import { useUi } from "@/state/ui";
import { daylight, useWorldBuild, useWorldReady } from "../runtime";
import { Env, Kites, Particles, VoxelMesh } from "../kit";
import { Character } from "../Character";
import { CameraRig } from "../actors";
import { unitBox, colorMat } from "../extrude";

/** "Thar" bazaar + "Kamal" lotus ruins — Valorant-inspired, rebuilt as Rajasthan originals. */
export function buildThar(): VoxelWorld {
  const w = new VoxelWorld(84, 44, 84);
  const r = mulberry32(7);
  // desert dunes
  w.terrain(-42, -42, 41, 41, (x, z) => 9 + fbm2(x * 0.05, z * 0.05, 3, 3) * 7 - Math.max(0, 10 - Math.hypot(x, z)) * 0.25, (d) => (d < 3 ? "sand" : d < 6 ? "sandstone" : "stone"));
  // central plaza
  for (let x = -12; x <= 12; x++)
    for (let z = -12; z <= 12; z++) {
      w.clear(x, 11, z, x, 30, z);
      w.fill(x, 4, z, x, 10, z, "sandstone");
      w.set(x, 10, z, (x + z) % 4 === 0 ? "red_sandstone" : (Math.abs(x) + Math.abs(z)) % 7 === 0 ? "orange_terracotta" : "smooth_stone");
    }
  // arches around plaza
  for (const [x0, z0, dx, dz] of [
    [-12, -12, 1, 0],
    [-12, 12, 1, 0],
    [-12, -12, 0, 1],
    [12, -12, 0, 1],
  ] as const) {
    for (let i = 0; i <= 24; i += 6) {
      const x = x0 + dx * i;
      const z = z0 + dz * i;
      w.column(x, 11, z, 6, "sandstone");
      if (i < 24) {
        w.fill(x, 17, z, x + dx * 6, 17, z + dz * 6, "red_sandstone");
        w.set(x + dx * 3, 16, z + dz * 3, "red_sandstone");
      }
    }
  }
  // market stalls with wool awnings
  const awnings = ["wool_red", "wool_yellow", "wool_cyan", "wool_pink", "wool_orange", "wool_lime"];
  const stalls: [number, number][] = [
    [-8, -8],
    [8, -8],
    [-8, 8],
    [8, 8],
    [-8, 0],
    [8, 0],
  ];
  stalls.forEach(([x, z], i) => {
    for (const [cx, cz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      w.column(x + cx, 11, z + cz, 3, "oak_log");
    w.fill(x - 2, 14, z - 2, x + 2, 14, z + 2, awnings[i % awnings.length]);
    w.fill(x - 1, 11, z - 1, x + 1, 11, z + 1, "oak_planks");
    w.set(x, 12, z, i % 2 ? "hay" : "pink");
  });
  // teleporter pads (Bind-inspired)
  for (const [x, z] of [
    [0, -5],
    [0, 5],
  ]) {
    w.fill(x - 1, 10, z - 1, x + 1, 10, z + 1, "lapis");
    w.set(x, 10, z, "sea_lantern");
  }
  // Kamal: lotus temple ruins to the north
  const kz = -26;
  w.fill(-10, 9, kz - 8, 10, 10, kz + 6, "smooth_stone");
  w.cylinder(0, 11, kz, 7, 8, "quartz");
  w.cylinder(0, 11, kz, 6, 8, 0);
  for (let i = 0; i < 6; i++) w.disc(0, 19 + i, kz, 7 - i, i % 2 ? "pink" : "quartz");
  w.clear(-2, 11, kz + 5, 2, 16, kz + 7);
  // petals
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    const px = Math.round(Math.cos(ang) * 9);
    const pz = Math.round(Math.sin(ang) * 9) + kz;
    w.fill(px - 1, 11, pz - 1, px + 1, 13, pz + 1, "wool_pink");
    w.set(px, 14, pz, "wool_pink");
  }
  // broken columns
  for (const [x, z, h] of [
    [-14, -18, 7],
    [14, -18, 4],
    [-16, -30, 5],
    [16, -32, 8],
  ]) w.column(x, 11, z, h, "quartz");
  // pink facade backdrop (Hawa Mahal-inspired) to the south-west
  const fx = -30;
  for (let lvl = 0; lvl < 5; lvl++) {
    const half = 12 - lvl * 2;
    for (let z = -half; z <= half; z++)
      for (let y = 12 + lvl * 4; y < 16 + lvl * 4; y++) {
        const win = (z + y) % 3 === 0 && y % 4 !== 3;
        w.set(fx, y, z + 14, win ? "pink_lattice" : y % 4 === 3 ? "cream" : "pink");
        w.set(fx - 1, y, z + 14, "pink");
      }
  }
  // palms + dead bushes
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(r() * 80) - 40;
    const z = Math.floor(r() * 80) - 40;
    if (Math.hypot(x, z) < 16 || Math.hypot(x, z - kz) < 12) continue;
    const y = w.top(x, z) + 1;
    if (!Number.isFinite(y)) continue;
    if (r() < 0.35) w.palm(x, y, z, 5 + Math.floor(r() * 3));
    else w.set(x, y, z, "dead_bush");
  }
  return w;
}

function Characters() {
  const { camera, scene, size, pointer } = useThree();
  const player = usePlayer((s) => s.config);
  const customized = usePlayer((s) => s.customized);
  const look = useMemo(() => new THREE.Vector3(), []);
  const holder = useRef<THREE.Group>(null);
  useMemo(() => {
    if (!camera.parent) scene.add(camera);
  }, [camera, scene]);
  useFrame(() => {
    const v = new THREE.Vector3(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    look.copy(camera.position).addScaledVector(v, 6);
    if (holder.current) {
      const narrow = size.width < 820;
      const aspect = size.width / size.height;
      holder.current.position.set(narrow ? 0 : -Math.min(3.4, aspect * 1.45), narrow ? -0.9 : -1.55, narrow ? -9 : -6);
      holder.current.visible = !(narrow && size.height < 700);
    }
  });
  return createPortal(
    <group ref={holder}>
      <group rotation={[0.08, 0.35, 0]}>
        <Character config={mehulSkin} anim="idle" gaze={look} position={[customized ? -0.7 : 0, 0, 0]} height={1.6} />
        {customized && <Character config={player} anim="idle" gaze={look} position={[0.75, 0, 0.1]} height={1.6} />}
        <mesh geometry={unitBox} material={colorMat("#3a3a3a")} position={[0, -0.12, 0]} scale={[customized ? 2.8 : 1.4, 0.24, 1.4]} />
      </group>
      <ambientLight intensity={0.3} />
    </group>,
    camera,
  );
}

export default function Title() {
  const built = useWorldBuild("title", buildThar);
  const day = useMemo(() => daylight(), []);
  useWorldReady("title", !!built);
  const showChars = useUi((s) => s.overlay?.type !== "selectWorld");
  const bg = day > 0.5 ? "#f2b77a" : "#0b1026";
  return (
    <>
      <Env bg={bg} fog={[bg, 30, 90]} ambient={day > 0.5 ? 0.9 : 0.45} sun={{ pos: [20, 30, 10], intensity: day > 0.5 ? 1.4 : 0.4, color: day > 0.5 ? "#ffd8a0" : "#8aa0ff" }} stars={day < 0.5 ? 900 : 0} />
      {built && <VoxelMesh built={built} look={{ sky: 0.35 + day * 0.7, skyColor: day > 0.5 ? "#fff0d8" : "#9fb0ff", ambient: day > 0.5 ? "#2a1a10" : "#0a0c1a", blockColor: "#ffb060" }} />}
      <Kites count={6} center={[0, 30, 0]} radius={26} />
      <Particles count={80} area={[60, 14, 60]} center={[0, 16, 0]} color="#ffe2b0" size={0.12} velocity={[0.6, 0.05, 0.2]} />
      <CameraRig orbit={0.035} initial={{ cam: [22, 22, 22], look: [0, 12, 0] }} />
      {showChars && <Characters />}
    </>
  );
}
