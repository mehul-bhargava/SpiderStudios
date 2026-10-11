"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useUi } from "@/state/ui";
import { usePlayer } from "@/state/player";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { sfx } from "@/lib/audio";
import { Character, type Anim } from "./Character";
import { colorMat, unitBox } from "./extrude";

const ACTION = CameraControlsImpl.ACTION;

// ── the visitor's explorer ──────────────────────────────────────────────────
export function Explorer({ hidden = false, anim: forced }: { hidden?: boolean; anim?: Anim }) {
  const config = usePlayer((s) => s.config);
  const target = useUi((s) => s.pois[s.poiIndex]);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const ref = useRef<THREE.Group>(null);
  const hop = useRef<{ from: THREE.Vector3; to: THREE.Vector3; t: number; d: number; h: number } | null>(null);
  const placed = useRef(false);
  const [anim, setAnim] = useState<Anim>("idle");
  const yaw = useRef(0);

  useEffect(() => {
    if (!target || !ref.current) return;
    const to = new THREE.Vector3(...target.stand);
    const g = ref.current;
    if (!placed.current || reduced) {
      g.position.copy(to);
      placed.current = true;
      yaw.current = Math.atan2(target.look[0] - to.x, target.look[2] - to.z);
      g.rotation.y = yaw.current;
      return;
    }
    const from = g.position.clone();
    const dist = from.distanceTo(to);
    if (dist < 0.05) return;
    hop.current = { from, to, t: 0, d: THREE.MathUtils.clamp(dist * 0.05, 0.4, 1.1), h: Math.min(6, 0.8 + dist * 0.18) };
    yaw.current = Math.atan2(to.x - from.x, to.z - from.z);
    setAnim("jump");
    sfx("jump");
  }, [target, reduced]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const h = hop.current;
    if (h) {
      h.t = Math.min(1, h.t + dt / h.d);
      const e = h.t < 0.5 ? 2 * h.t * h.t : 1 - Math.pow(-2 * h.t + 2, 2) / 2;
      g.position.lerpVectors(h.from, h.to, e);
      g.position.y += Math.sin(Math.PI * h.t) * h.h;
      if (h.t >= 1) {
        hop.current = null;
        setAnim("idle");
        if (target) yaw.current = Math.atan2(target.look[0] - h.to.x, target.look[2] - h.to.z);
      }
    }
    let d = yaw.current - g.rotation.y;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    g.rotation.y += d * Math.min(1, dt * 10);
  });

  return (
    <group ref={ref} visible={!hidden}>
      <Character config={config} anim={forced ?? anim} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── camera ──────────────────────────────────────────────────────────────────
export function CameraRig({
  offset = [5, 3.5, 7],
  orbit = 0,
  minDistance = 2.5,
  maxDistance = 40,
  initial,
}: {
  offset?: [number, number, number];
  orbit?: number;
  minDistance?: number;
  maxDistance?: number;
  initial?: { cam: [number, number, number]; look: [number, number, number] };
}) {
  const ref = useRef<CameraControls>(null);
  const poi = useUi((s) => s.pois[s.poiIndex]);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const first = useRef(true);
  const active = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.mouseButtons.right = ACTION.NONE;
    c.mouseButtons.middle = ACTION.NONE;
    c.mouseButtons.wheel = ACTION.DOLLY;
    c.touches.one = ACTION.TOUCH_ROTATE;
    c.touches.two = ACTION.TOUCH_DOLLY;
    c.touches.three = ACTION.NONE;
    const on = () => (active.current = true);
    const off = () => (active.current = false);
    c.addEventListener("controlstart", on);
    c.addEventListener("controlend", off);
    if (initial) void c.setLookAt(...initial.cam, ...initial.look, false);
    return () => {
      c.removeEventListener("controlstart", on);
      c.removeEventListener("controlend", off);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = ref.current;
    if (!c || !poi) return;
    const L = poi.look;
    const cam = poi.cam ?? [L[0] + offset[0], L[1] + offset[1], L[2] + offset[2]];
    void c.setLookAt(cam[0], cam[1], cam[2], L[0], L[1], L[2], !reduced && !first.current && !initial);
    first.current = false;
  }, [poi]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    if (orbit && !reduced && ref.current && !active.current) void ref.current.rotate(dt * orbit, 0, false);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI * 0.49}
      smoothTime={0.6}
      draggingSmoothTime={0.12}
      dollySpeed={0.5}
    />
  );
}

// ── box-model mobs ──────────────────────────────────────────────────────────
type B = { p: [number, number, number]; s: [number, number, number]; c: string; e?: boolean };
function Parts({ parts }: { parts: B[] }) {
  return (
    <>
      {parts.map((b, i) => (
        <mesh key={i} geometry={unitBox} material={colorMat(b.c, b.e)} position={b.p} scale={b.s} />
      ))}
    </>
  );
}

export function EnderDragon({ radius = 32, height = 24, speed = 0.12, swoop = false }: { radius?: number; height?: number; speed?: number; swoop?: boolean }) {
  const root = useRef<THREE.Group>(null);
  const wl = useRef<THREE.Group>(null);
  const wr = useRef<THREE.Group>(null);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const swoopT = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (!root.current) return;
    swoopT.current = THREE.MathUtils.clamp(swoopT.current + (swoop ? dt : -dt) * 0.7, 0, 1);
    const a = reduced ? 1 : t * speed;
    const r = radius * (1 - swoopT.current * 0.55);
    const y = height - swoopT.current * (height - 9) + Math.sin(t * 0.7) * 1.5;
    root.current.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    root.current.rotation.y = -a;
    const flap = reduced ? 0.2 : Math.sin(t * 3) * 0.6;
    if (wl.current) wl.current.rotation.z = flap;
    if (wr.current) wr.current.rotation.z = -flap;
  });
  const D = "#141018";
  return (
    <group ref={root}>
      <group scale={0.55}>
        <Parts
          parts={[
            { p: [0, 0, 0], s: [4, 3, 8], c: D },
            { p: [0, 0.6, 5.5], s: [1.6, 1.6, 3], c: D },
            { p: [0, 0.9, 8], s: [1.4, 1.4, 2.2], c: D },
            { p: [0, 1.1, 10.4], s: [3, 2.2, 3], c: D },
            { p: [0, 0.6, 12.4], s: [2, 1.2, 2], c: D },
            { p: [-0.9, 1.7, 11.9], s: [0.7, 0.4, 0.2], c: "#d36bff", e: true },
            { p: [0.9, 1.7, 11.9], s: [0.7, 0.4, 0.2], c: "#d36bff", e: true },
            { p: [0, 0, -5.5], s: [1.6, 1.6, 3], c: D },
            { p: [0, -0.2, -8.5], s: [1.2, 1.2, 3], c: D },
            { p: [0, -0.4, -11.2], s: [0.8, 0.8, 2.6], c: D },
            { p: [0, 1.8, 0], s: [0.5, 0.8, 0.8], c: "#2a2030" },
            { p: [0, 1.8, -2.5], s: [0.5, 0.8, 0.8], c: "#2a2030" },
          ]}
        />
        <group ref={wl} position={[-2, 0.8, 1]}>
          <Parts parts={[{ p: [-5, 0, 0], s: [10, 0.3, 1.2], c: D }, { p: [-5, -0.1, -2.5], s: [10, 0.12, 4.2], c: "#3a2a48" }]} />
        </group>
        <group ref={wr} position={[2, 0.8, 1]}>
          <Parts parts={[{ p: [5, 0, 0], s: [10, 0.3, 1.2], c: D }, { p: [5, -0.1, -2.5], s: [10, 0.12, 4.2], c: "#3a2a48" }]} />
        </group>
      </group>
    </group>
  );
}

export function Warden({ risen = false, ...g }: ThreeElements["group"] & { risen?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Mesh>(null);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const target = risen ? 0 : -4.2;
    ref.current.position.y += (target - ref.current.position.y) * Math.min(1, dt * 2);
    if (heart.current) heart.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.12);
  });
  const T = "#0f3a44";
  return (
    <group {...g}>
      <group ref={ref} position={[0, -4.2, 0]}>
        <Parts
          parts={[
            { p: [-0.6, 0.65, 0], s: [0.9, 1.3, 0.9], c: T },
            { p: [0.6, 0.65, 0], s: [0.9, 1.3, 0.9], c: T },
            { p: [0, 2.3, 0], s: [2.2, 2, 1.2], c: "#123f48" },
            { p: [-1.4, 2.1, 0], s: [0.7, 2.2, 0.7], c: T },
            { p: [1.4, 2.1, 0], s: [0.7, 2.2, 0.7], c: T },
            { p: [0, 3.9, 0], s: [1.8, 1.4, 1.4], c: T },
            { p: [-1.3, 4.4, 0], s: [0.8, 0.9, 0.2], c: "#29dfeb", e: true },
            { p: [1.3, 4.4, 0], s: [0.8, 0.9, 0.2], c: "#29dfeb", e: true },
          ]}
        />
        <mesh ref={heart} geometry={unitBox} material={colorMat("#29dfeb", true)} position={[0, 2.5, 0.62]} scale={[0.6, 0.6, 0.1]} />
      </group>
    </group>
  );
}

export function Piglin(props: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.3;
  });
  return (
    <group {...props}>
      <group ref={ref}>
        <Parts
          parts={[
            { p: [-0.2, 0.37, 0], s: [0.3, 0.75, 0.3], c: "#5a3a1a" },
            { p: [0.2, 0.37, 0], s: [0.3, 0.75, 0.3], c: "#5a3a1a" },
            { p: [0, 1.1, 0], s: [0.6, 0.75, 0.32], c: "#8a5a2a" },
            { p: [-0.42, 1.1, 0], s: [0.22, 0.72, 0.25], c: "#e89a8a" },
            { p: [0.42, 1.1, 0], s: [0.22, 0.72, 0.25], c: "#e89a8a" },
            { p: [0, 1.75, 0], s: [0.62, 0.55, 0.55], c: "#e89a8a" },
            { p: [0, 1.66, 0.32], s: [0.28, 0.2, 0.12], c: "#c46a5a" },
            { p: [-0.16, 1.84, 0.28], s: [0.08, 0.08, 0.02], c: "#1a1a1a" },
            { p: [0.16, 1.84, 0.28], s: [0.08, 0.08, 0.02], c: "#1a1a1a" },
            { p: [-0.35, 1.9, 0], s: [0.1, 0.25, 0.22], c: "#e89a8a" },
            { p: [0.35, 1.9, 0], s: [0.1, 0.25, 0.22], c: "#e89a8a" },
            { p: [0, 1.38, 0.17], s: [0.55, 0.08, 0.02], c: "#f2c14e" },
            { p: [0.45, 0.8, 0.12], s: [0.12, 0.3, 0.12], c: "#f2c14e" },
          ]}
        />
      </group>
    </group>
  );
}

export function Shulker({ open = false, color = "#9a64a5", ...g }: ThreeElements["group"] & { open?: boolean; color?: string }) {
  const lid = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    if (!lid.current) return;
    const target = open ? 0.55 : Math.max(0, Math.sin(clock.elapsedTime * 0.9) * 0.08);
    lid.current.position.y += (target + 0.5 - lid.current.position.y) * Math.min(1, dt * 6);
  });
  return (
    <group {...g}>
      <Parts parts={[{ p: [0, 0.25, 0], s: [1, 0.5, 1], c: color }, { p: [0, 0.4, 0], s: [0.5, 0.5, 0.5], c: "#e8e0a8" }, { p: [0.12, 0.5, 0.25], s: [0.08, 0.08, 0.02], c: "#1a1a1a" }]} />
      <group ref={lid} position={[0, 0.5, 0]}>
        <Parts parts={[{ p: [0, 0.2, 0], s: [1.02, 0.4, 1.02], c: color }]} />
      </group>
    </group>
  );
}

/** The SpiderStudios mascot spider, life-size-ish. */
export function SpiderMob({ ...g }: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null);
  const legs = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((c, i) => {
      if (c.userData.leg) c.rotation.z = c.userData.base + Math.sin(clock.elapsedTime * 6 + i) * 0.12;
    });
  });
  return (
    <group {...g}>
      <group ref={ref}>
        <mesh geometry={unitBox} material={colorMat("#2a2228")} position={[0, 0.45, -0.35]} scale={[0.9, 0.6, 0.9]} />
        <mesh geometry={unitBox} material={colorMat("#2a2228")} position={[0, 0.45, 0.35]} scale={[0.6, 0.5, 0.5]} />
        <mesh geometry={unitBox} material={colorMat("#ff4655", true)} position={[-0.15, 0.55, 0.61]} scale={[0.12, 0.08, 0.02]} />
        <mesh geometry={unitBox} material={colorMat("#ff4655", true)} position={[0.15, 0.55, 0.61]} scale={[0.12, 0.08, 0.02]} />
        {legs.map((i) => {
          const side = i < 4 ? -1 : 1;
          const z = -0.45 + (i % 4) * 0.28;
          const base = side * -0.5;
          return (
            <mesh key={i} userData={{ leg: true, base }} geometry={unitBox} material={colorMat("#1a1a1e")} position={[side * 0.55, 0.42, z]} rotation={[0, 0, base]} scale={[0.8, 0.08, 0.08]} />
          );
        })}
      </group>
    </group>
  );
}
