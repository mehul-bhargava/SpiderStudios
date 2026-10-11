"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { createVoxelMaterial, type VoxelLook } from "@/engine/voxelMaterial";
import { drawPlaceholderFrame } from "@/engine/placeholders";
import type { VideoProject } from "@/content/projects";
import { projectMarkers } from "@/lib/media";
import { useUi, type Tip } from "@/state/ui";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { sfx } from "@/lib/audio";
import type { Built } from "./runtime";
import { colorMat, imageTexture, textTexture, unitBox } from "./extrude";

// ── voxel meshes ────────────────────────────────────────────────────────────
export function VoxelMesh({ built, look }: { built: Built; look: VoxelLook }) {
  const mats = useMemo(() => [createVoxelMaterial(false, look), createVoxelMaterial(true, look)] as const, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    for (const m of mats) {
      if (look.sky !== undefined) m.uniforms.uSky.value = look.sky;
      if (look.skyColor) m.uniforms.uSkyColor.value.set(look.skyColor);
      if (look.ambient) m.uniforms.uAmbient.value.set(look.ambient);
      if (look.blockColor) m.uniforms.uBlockColor.value.set(look.blockColor);
    }
  }, [look.sky, look.skyColor, look.ambient, look.blockColor, mats]);
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
  return (
    <>
      <mesh geometry={built.opaque} material={mats[0]} />
      <mesh geometry={built.cutout} material={mats[1]} />
    </>
  );
}

// ── environment ─────────────────────────────────────────────────────────────
export function Env({
  bg,
  fog,
  ambient = 0.6,
  sun,
  stars = 0,
  starColor = "#ffffff",
}: {
  bg: string;
  fog?: [string, number, number];
  ambient?: number;
  sun?: { pos: [number, number, number]; intensity: number; color?: string };
  stars?: number;
  starColor?: string;
}) {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(bg);
    scene.fog = fog ? new THREE.Fog(fog[0], fog[1], fog[2]) : null;
    return () => {
      scene.fog = null;
    };
  }, [scene, bg, fog?.[0], fog?.[1], fog?.[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <ambientLight intensity={ambient} />
      {sun && <directionalLight position={sun.pos} intensity={sun.intensity} color={sun.color ?? "#ffffff"} />}
      {stars > 0 && <Stars count={stars} color={starColor} />}
    </>
  );
}

export function Stars({ count = 800, radius = 180, color = "#ffffff", size = 1.6 }: { count?: number; radius?: number; color?: string; size?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      p.set([Math.cos(a) * r * radius, Math.abs(u) * radius * 0.9 - radius * 0.15, Math.sin(a) * r * radius], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count, radius]);
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={size} sizeAttenuation={false} fog={false} />
    </points>
  );
}

/** Drifting square particles (embers, souls, petals, ender sparks). */
export function Particles({
  count = 120,
  area = [40, 20, 40],
  center = [0, 10, 0],
  color = "#ffffff",
  size = 0.12,
  velocity = [0, 0.4, 0],
  jitter = 0.3,
}: {
  count?: number;
  area?: [number, number, number];
  center?: [number, number, number];
  color?: string;
  size?: number;
  velocity?: [number, number, number];
  jitter?: number;
}) {
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) p.set([(Math.random() - 0.5) * area[0], (Math.random() - 0.5) * area[1], (Math.random() - 0.5) * area[2]], i * 3);
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count, area[0], area[1], area[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock }, dt) => {
    if (reduced) return;
    const a = geo.getAttribute("position") as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let x = a.getX(i) + (velocity[0] + Math.sin(t + i) * jitter) * dt;
      let y = a.getY(i) + velocity[1] * dt;
      let z = a.getZ(i) + (velocity[2] + Math.cos(t * 0.7 + i) * jitter) * dt;
      if (y > area[1] / 2) y = -area[1] / 2;
      if (y < -area[1] / 2) y = area[1] / 2;
      if (x > area[0] / 2) x = -area[0] / 2;
      if (x < -area[0] / 2) x = area[0] / 2;
      if (z > area[2] / 2) z = -area[2] / 2;
      if (z < -area[2] / 2) z = area[2] / 2;
      a.setXYZ(i, x, y, z);
    }
    a.needsUpdate = true;
  });
  return (
    <points geometry={geo} position={center}>
      <pointsMaterial color={color} size={size} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  );
}

// ── interaction ─────────────────────────────────────────────────────────────
const edgeCache = new Map<string, THREE.EdgesGeometry>();
function edges(size: [number, number, number]) {
  const k = size.join(",");
  let e = edgeCache.get(k);
  if (!e) {
    e = new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0] + 0.04, size[1] + 0.04, size[2] + 0.04));
    edgeCache.set(k, e);
  }
  return e;
}
const outlineMat = new THREE.LineBasicMaterial({ color: "#000000" });
const hitMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

export function Interactable({
  tip,
  onSelect,
  size = [1, 1, 1],
  offset = [0, 0.5, 0],
  poi,
  children,
  ...group
}: ThreeElements["group"] & {
  tip: Tip;
  onSelect?: () => void;
  size?: [number, number, number];
  offset?: [number, number, number];
  poi?: string;
  children?: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  useEffect(
    () => () => {
      if (hover) {
        document.body.style.cursor = "";
        useUi.getState().setTooltip(null);
      }
    },
    [hover],
  );
  return (
    <group {...group}>
      {children}
      <mesh
        position={offset}
        scale={size}
        geometry={unitBox}
        material={hitMat}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          useUi.getState().setTooltip(tip);
          document.body.style.cursor = "pointer";
          sfx("hover");
        }}
        onPointerOut={() => {
          setHover(false);
          useUi.getState().setTooltip(null);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          const ui = useUi.getState();
          if (ui.menu || ui.overlay) return;
          if (poi) ui.focusPoi(poi);
          sfx("click");
          ui.setTooltip(null);
          onSelect?.();
        }}
      />
      {hover && <lineSegments geometry={edges(size)} material={outlineMat} position={offset} />}
    </group>
  );
}

// ── screens (video previews) ────────────────────────────────────────────────
const SCREEN_ACTIVE = { count: 0 };

export function Screen({
  project,
  width = 3,
  onSelect,
  poi,
  glow = true,
  ...group
}: ThreeElements["group"] & { project: VideoProject; width?: number; onSelect?: () => void; poi?: string; glow?: boolean }) {
  const vertical = project.aspect === "9:16";
  const w = vertical ? width * 0.5625 : width;
  const h = vertical ? width : width * 0.5625;
  const quality = useSettings((s) => s.quality);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const { canvas, tex, ctx } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = vertical ? 144 : 256;
    c.height = vertical ? 256 : 144;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, tex: t, ctx: c.getContext("2d")! };
  }, [vertical]);
  const markers = useMemo(() => projectMarkers(project), [project]);
  const ref = useRef<THREE.Group>(null);
  const last = useRef(-1);
  const world = useMemo(() => new THREE.Vector3(), []);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    drawPlaceholderFrame(ctx, canvas.width, canvas.height, 1.2, { title: project.title, palette: project.palette, cuts: markers.cuts, bpm: project.bpm, vertical, sample: project.sample });
    tex.needsUpdate = true;
  }, [ctx, canvas, tex, project, markers, vertical]);

  // real preview loops, if provided
  const vidTex = useMemo(() => {
    if (!project.media.loop) return null;
    const v = document.createElement("video");
    v.src = project.media.loop;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    videoRef.current = v;
    const t = new THREE.VideoTexture(v);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [project.media.loop]);
  useEffect(
    () => () => {
      videoRef.current?.pause();
      vidTex?.dispose();
      tex.dispose();
    },
    [vidTex, tex],
  );

  useFrame(({ clock, camera }) => {
    if (!ref.current) return;
    ref.current.getWorldPosition(world);
    const near = world.distanceTo(camera.position) < (quality === "lite" ? 14 : 28);
    if (vidTex && videoRef.current) {
      const v = videoRef.current;
      if (near && v.paused) void v.play().catch(() => {});
      if (!near && !v.paused) v.pause();
      return;
    }
    if (!near || reduced) return;
    const t = clock.elapsedTime % project.durationSec;
    const frame = Math.floor(clock.elapsedTime * 12);
    if (frame === last.current) return;
    last.current = frame;
    drawPlaceholderFrame(ctx, canvas.width, canvas.height, t, { title: project.title, palette: project.palette, cuts: markers.cuts, bpm: project.bpm, vertical, sample: project.sample });
    tex.needsUpdate = true;
  });
  void SCREEN_ACTIVE;

  const rimColor = project.rarity === "epic" ? "#c34dff" : project.rarity === "rare" ? "#3ad6e0" : "#1d1d21";
  return (
    <Interactable
      tip={{ title: project.title, rarity: project.rarity, lore: [project.platform + " · " + Math.round(project.durationSec) + "s", ...(project.client ? [project.client] : []), "Click to watch"] }}
      onSelect={onSelect ?? (() => useUi.getState().open({ type: "project", slug: project.slug }))}
      size={[w + 0.3, h + 0.3, 0.4]}
      offset={[0, 0, 0]}
      poi={poi}
      {...group}
    >
      <group ref={ref}>
        <mesh geometry={unitBox} material={colorMat("#141418")} scale={[w + 0.24, h + 0.24, 0.16]} position={[0, 0, -0.06]} />
        {glow && project.rarity !== "common" && <mesh geometry={unitBox} material={colorMat(rimColor, true)} scale={[w + 0.34, h + 0.34, 0.08]} position={[0, 0, -0.12]} />}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={vidTex ?? tex} toneMapped={false} fog={false} />
        </mesh>
      </group>
    </Interactable>
  );
}

// ── framed images (thumbnails & designs) ────────────────────────────────────
export function ImageFrame({
  url,
  width = 2.4,
  aspect = 16 / 9,
  frame = "#7a5228",
  glow,
  tip,
  onSelect,
  poi,
  ...group
}: ThreeElements["group"] & { url: string; width?: number; aspect?: number; frame?: string; glow?: string; tip: Tip; onSelect?: () => void; poi?: string }) {
  const tex = useMemo(() => imageTexture(url), [url]);
  const h = width / aspect;
  return (
    <Interactable tip={tip} onSelect={onSelect} size={[width + 0.3, h + 0.3, 0.3]} offset={[0, 0, 0]} poi={poi} {...group}>
      <mesh geometry={unitBox} material={colorMat(frame)} scale={[width + 0.22, h + 0.22, 0.1]} position={[0, 0, -0.04]} />
      {glow && <mesh geometry={unitBox} material={colorMat(glow, true)} scale={[width + 0.36, h + 0.36, 0.05]} position={[0, 0, -0.08]} />}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </Interactable>
  );
}

// ── signs & labels ──────────────────────────────────────────────────────────
export function Label({ text, color = "#ffffff", size = 1, bg = "rgba(0,0,0,0.45)", ...group }: ThreeElements["group"] & { text: string; color?: string; size?: number; bg?: string }) {
  const tex = useMemo(() => textTexture([text], { w: 512, h: 64, bg, color, size: 30 }), [text, color, bg]);
  return (
    <group {...group}>
      <sprite scale={[size * 4, size * 0.5, 1]}>
        <spriteMaterial map={tex} transparent depthWrite={false} fog={false} />
      </sprite>
    </group>
  );
}

export function Sign({ lines, ...group }: ThreeElements["group"] & { lines: string[] }) {
  const tex = useMemo(() => textTexture(lines, { w: 256, h: 128, bg: "#a8763a", color: "#1a1a1a", size: 20, shadow: false }), [lines]);
  return (
    <group {...group}>
      <mesh geometry={unitBox} material={colorMat("#7a5228")} scale={[1.6, 0.85, 0.08]} position={[0, 1.4, 0]} />
      <mesh position={[0, 1.4, 0.045]}>
        <planeGeometry args={[1.5, 0.75]} />
        <meshLambertMaterial map={tex} />
      </mesh>
      <mesh geometry={unitBox} material={colorMat("#5a3d1e")} scale={[0.12, 1, 0.12]} position={[0, 0.5, 0]} />
    </group>
  );
}

// ── props ───────────────────────────────────────────────────────────────────
export function ChestModel({ open = false, color = "#a8763a", ...group }: ThreeElements["group"] & { open?: boolean; color?: string }) {
  const lid = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!lid.current) return;
    const target = open ? -1.2 : 0;
    lid.current.rotation.x += (target - lid.current.rotation.x) * Math.min(1, dt * 8);
  });
  return (
    <group {...group}>
      <mesh geometry={unitBox} material={colorMat(color)} scale={[0.875, 0.62, 0.875]} position={[0, 0.31, 0]} />
      <mesh geometry={unitBox} material={colorMat("#2a1a0a")} scale={[0.88, 0.04, 0.88]} position={[0, 0.62, 0]} />
      <group ref={lid} position={[0, 0.62, -0.44]}>
        <mesh geometry={unitBox} material={colorMat(color)} scale={[0.875, 0.26, 0.875]} position={[0, 0.13, 0.44]} />
        <mesh geometry={unitBox} material={colorMat("#c9c9c9")} scale={[0.14, 0.24, 0.06]} position={[0, 0.02, 0.9]} />
      </group>
    </group>
  );
}

export function Lantern({ soul = false, ...group }: ThreeElements["group"] & { soul?: boolean }) {
  const c = soul ? "#29dfeb" : "#ffc45a";
  return (
    <group {...group}>
      <mesh geometry={unitBox} material={colorMat("#2a2a30")} scale={[0.4, 0.08, 0.4]} position={[0, 0.5, 0]} />
      <mesh geometry={unitBox} material={colorMat(c, true)} scale={[0.32, 0.4, 0.32]} position={[0, 0.25, 0]} />
      <mesh geometry={unitBox} material={colorMat("#2a2a30")} scale={[0.4, 0.06, 0.4]} position={[0, 0.03, 0]} />
      <mesh geometry={unitBox} material={colorMat("#2a2a30")} scale={[0.06, 0.2, 0.06]} position={[0, 0.62, 0]} />
    </group>
  );
}

export function EndRod({ h = 1, ...group }: ThreeElements["group"] & { h?: number }) {
  return (
    <group {...group}>
      <mesh geometry={unitBox} material={colorMat("#f4ecff", true)} scale={[0.12, h, 0.12]} position={[0, h / 2, 0]} />
      <mesh geometry={unitBox} material={colorMat("#c8b8d8")} scale={[0.3, 0.08, 0.3]} position={[0, 0.04, 0]} />
    </group>
  );
}

/** Vertical loot beam — marks quest items / chests. */
export function Beam({ color = "#ffff55", height = 6, ...group }: ThreeElements["group"] & { color?: string; height?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(clock.elapsedTime * 3) * 0.1;
  });
  return (
    <group {...group}>
      <mesh ref={ref} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.18, height, 6, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Floating, spinning dropped item (sprite-extruded). */
export function FloatingItem({ children, ...group }: ThreeElements["group"] & { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 1.4;
    ref.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group {...group}>
      <group ref={ref}>{children}</group>
    </group>
  );
}

// ── portals ─────────────────────────────────────────────────────────────────
const portalVert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const portalFrag = /* glsl */ `
uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform float uStars; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  vec2 px = floor(vUv * 32.0) / 32.0;
  vec2 c = px - 0.5;
  float a = atan(c.y, c.x);
  float r = length(c);
  float swirl = sin(a * 3.0 + r * 18.0 - uTime * 2.2) * 0.5 + 0.5;
  float n = h(px + floor(uTime * 6.0) * 0.013);
  vec3 col = mix(uA, uB, swirl * 0.8 + n * 0.2);
  if (uStars > 0.5) { col = uA * 0.3 + uB * 0.25 * n; if (h(px * 3.1 + floor(uTime*2.0)) > 0.96) col = vec3(0.8,1.0,0.95); }
  gl_FragColor = vec4(col, uStars > 0.5 ? 1.0 : 0.88);
}`;

export function PortalPlane({ w = 2, h = 3, a = "#5a1aa8", b = "#c58cff", stars = false, ...rest }: ThreeElements["mesh"] & { w?: number; h?: number; a?: string; b?: string; stars?: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) }, uStars: { value: stars ? 1 : 0 } },
        vertexShader: portalVert,
        fragmentShader: portalFrag,
        transparent: !stars,
        side: THREE.DoubleSide,
        depthWrite: stars,
      }),
    [a, b, stars],
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh material={mat} {...rest}>
      <planeGeometry args={[w, h]} />
    </mesh>
  );
}

// ── kites over Jaipur ───────────────────────────────────────────────────────
export function Kites({ count = 7, center = [0, 26, 0] as [number, number, number], radius = 30 }) {
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const kites = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        a: (i / count) * Math.PI * 2,
        r: radius * (0.5 + Math.random() * 0.5),
        y: Math.random() * 8,
        c: ["#e0313f", "#ffcc00", "#3ab3da", "#80c71f", "#c74ebd", "#f9801d"][i % 6],
        s: 0.6 + Math.random() * 0.5,
      })),
    [count, radius],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    kites.forEach((k, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = k.a + (reduced ? 0 : t * 0.03 * k.s);
      g.position.set(Math.cos(a) * k.r, k.y + Math.sin(t * 0.8 + i) * (reduced ? 0 : 0.8), Math.sin(a) * k.r);
      g.rotation.z = Math.sin(t * 1.5 + i) * 0.25;
      g.lookAt(0, k.y, 0);
    });
  });
  return (
    <group position={center}>
      {kites.map((k, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[1.4, 1.4]} />
            <meshBasicMaterial color={k.c} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -1.6, 0]}>
            <planeGeometry args={[0.05, 2.2]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
