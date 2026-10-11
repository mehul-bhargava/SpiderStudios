"use client";
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useUi } from "@/state/ui";
import { useSettings } from "@/state/settings";
import type { WorldId } from "@/content/dimensions";

const worlds: Record<WorldId, LazyExoticComponent<ComponentType>> = {
  title: lazy(() => import("./worlds/Title")),
  overworld: lazy(() => import("./worlds/Overworld")),
  "the-end": lazy(() => import("./worlds/TheEnd")),
  "ancient-city": lazy(() => import("./worlds/AncientCity")),
  nether: lazy(() => import("./worlds/Nether")),
  crafting: lazy(() => import("./worlds/Crafting")),
  "end-city": lazy(() => import("./worlds/EndCity")),
  portal: lazy(() => import("./worlds/FinalPortal")),
  lab: lazy(() => import("./worlds/Lab")),
  dressing: lazy(() => import("./worlds/Dressing")),
};

function Stats() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const frames = useRef(0);
  const last = useRef(performance.now());
  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now - last.current > 500) {
      if (useUi.getState().debug)
        useUi.getState().set({ stats: { fps: Math.round((frames.current * 1000) / (now - last.current)), calls: gl.info.render.calls, tris: gl.info.render.triangles, xyz: camera.position.toArray().map((v) => v.toFixed(1)).join(" / ") } });
      frames.current = 0;
      last.current = now;
    }
  });
  return null;
}

export function isLiteDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ?? false;
  return coarse || mem <= 4 || save;
}

export default function WorldCanvas() {
  const world = useUi((s) => s.world);
  const overlay = useUi((s) => s.overlay);
  const quality = useSettings((s) => s.quality);
  const lite = quality === "lite" || (quality === "auto" && isLiteDevice());
  const [dpr, setDpr] = useState(lite ? 1 : Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1.5));
  useEffect(() => setDpr(lite ? 1 : Math.min(2, window.devicePixelRatio)), [lite]);
  const paused = !!overlay && ["project", "thumb", "contact", "credits", "browse", "design"].includes(overlay.type);
  if (!world) return null;
  const W = worlds[world];
  return (
    <div className="world-canvas" aria-hidden="true">
      <Canvas
        dpr={dpr}
        frameloop={paused ? "demand" : "always"}
        gl={{ antialias: !lite, powerPreference: "high-performance" }}
        camera={{ fov: 55, near: 0.1, far: 420, position: [20, 20, 20] }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(0.75, d * 0.75))} />
        <Stats />
        <Suspense fallback={null}>
          <W key={world} />
        </Suspense>
      </Canvas>
    </div>
  );
}
