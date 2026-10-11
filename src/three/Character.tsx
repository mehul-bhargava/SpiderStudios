"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { composeSkin, drawImported, faceRects, heldSprite, PARTS, type SkinConfig } from "@/engine/skin";
import { colorMat, extrudeSprite, itemMaterial, unitBox } from "./extrude";

export type Anim = "idle" | "walk" | "wave" | "dance" | "crouch" | "sit" | "jump" | "glide" | "greet" | "type";

type PartUV = { u: number; v: number; w: number; h: number; d: number };

const geoCache = new Map<string, THREE.BoxGeometry>();
function partGeo(part: PartUV, w: number, h: number, d: number, inflate = 0): THREE.BoxGeometry {
  const key = `${part.u},${part.v},${w},${h},${d},${inflate}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const g = new THREE.BoxGeometry(w + inflate * 2, h + inflate * 2, d + inflate * 2);
  const f = faceRects({ ...part, w, h, d });
  const order = [f.left, f.right, f.top, f.bottom, f.front, f.back];
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  order.forEach((r, i) => {
    const u0 = r.x / 64;
    const u1 = (r.x + r.w) / 64;
    const vt = 1 - r.y / 64;
    const vb = 1 - (r.y + r.h) / 64;
    const quad = i === 3 ? [u0, vb, u1, vb, u0, vt, u1, vt] : [u0, vt, u1, vt, u0, vb, u1, vb];
    for (let k = 0; k < 4; k++) uv.setXY(i * 4 + k, quad[k * 2], quad[k * 2 + 1]);
  });
  uv.needsUpdate = true;
  geoCache.set(key, g);
  return g;
}

function useSkinTexture(config: SkinConfig) {
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  useEffect(() => {
    if (config.imported) {
      const img = new Image();
      img.onload = () => {
        drawImported(img, canvas);
        texture.needsUpdate = true;
      };
      img.src = config.imported;
    } else {
      composeSkin(config, canvas);
      texture.needsUpdate = true;
    }
  }, [config, canvas, texture]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

type Box = { p: [number, number, number]; s: [number, number, number]; c: string; e?: boolean; r?: [number, number, number] };

function Boxes({ boxes }: { boxes: Box[] }) {
  return (
    <>
      {boxes.map((b, i) => (
        <mesh key={i} geometry={unitBox} material={colorMat(b.c, b.e)} position={b.p} scale={b.s} rotation={b.r ?? [0, 0, 0]} castShadow />
      ))}
    </>
  );
}

function headwearBoxes(kind: SkinConfig["headwear"], c: string): Box[] {
  const dark = "#1d1d21";
  switch (kind) {
    case "cap":
      return [
        { p: [0, 7.6, 0], s: [9, 1.8, 9], c },
        { p: [0, 6.9, 6], s: [8, 0.6, 3.6], c },
        { p: [0, 8.7, 0], s: [1, 0.6, 1], c: dark },
      ];
    case "backcap":
      return [
        { p: [0, 7.6, 0], s: [9, 1.8, 9], c },
        { p: [0, 6.9, -6], s: [8, 0.6, 3.6], c },
      ];
    case "beanie":
      return [
        { p: [0, 7.4, 0], s: [9.2, 3, 9.2], c },
        { p: [0, 5.6, 0], s: [9.4, 1.2, 9.4], c: dark },
        { p: [0, 9.3, 0], s: [2, 1, 2], c: "#f9fffe" },
      ];
    case "headphones":
    case "headset": {
      const b: Box[] = [
        { p: [0, 8.8, 0], s: [9.6, 1, 1.6], c: dark },
        { p: [-4.6, 7.2, 0], s: [1, 3, 1.6], c: dark },
        { p: [4.6, 7.2, 0], s: [1, 3, 1.6], c: dark },
        { p: [-5, 3.8, 0], s: [1.6, 3.6, 3], c },
        { p: [5, 3.8, 0], s: [1.6, 3.6, 3], c },
      ];
      if (kind === "headset") b.push({ p: [-4.6, 2.2, 2.6], s: [0.6, 0.6, 4.6], c: dark, r: [0.25, 0, 0] }, { p: [-4.3, 1.4, 4.8], s: [1, 1, 1], c, e: true });
      return b;
    }
    case "bucket":
      return [
        { p: [0, 8, 0], s: [9, 2.6, 9], c },
        { p: [0, 6.6, 0], s: [12.5, 0.5, 12.5], c },
      ];
    case "crown":
      return [
        { p: [0, 8.7, 0], s: [9, 1.4, 9], c: "#f2c14e" },
        ...[-3.5, -1.2, 1.2, 3.5].flatMap((x) => [
          { p: [x, 10, 4.2] as [number, number, number], s: [1, 1.6, 0.6] as [number, number, number], c: "#f2c14e" },
          { p: [x, 10, -4.2] as [number, number, number], s: [1, 1.6, 0.6] as [number, number, number], c: "#f2c14e" },
        ]),
        { p: [0, 8.7, 4.6], s: [1.2, 1.2, 0.4], c: "#e0313f", e: true },
      ];
    case "pumpkin":
      return [
        { p: [0, 4, 0], s: [9, 9, 9], c: "#e07a1a" },
        { p: [-2, 4.6, 4.55], s: [1.6, 1.4, 0.2], c: "#ffcc33", e: true },
        { p: [2, 4.6, 4.55], s: [1.6, 1.4, 0.2], c: "#ffcc33", e: true },
        { p: [0, 2.2, 4.55], s: [4.5, 1, 0.2], c: "#ffcc33", e: true },
        { p: [0, 9, 0], s: [1.2, 1.4, 1.2], c: "#3f7f2f" },
      ];
    default:
      return [];
  }
}

function SpiderPet() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = Math.sin(clock.elapsedTime * 1.3) * 0.4;
  });
  const legs: Box[] = [];
  for (let i = 0; i < 4; i++) {
    const z = -1.2 + i * 0.8;
    legs.push({ p: [-2.2, 0.2, z], s: [2.6, 0.35, 0.35], c: "#1a1a1e", r: [0, 0, 0.5] }, { p: [2.2, 0.2, z], s: [2.6, 0.35, 0.35], c: "#1a1a1e", r: [0, 0, -0.5] });
  }
  return (
    <group ref={ref}>
      <Boxes
        boxes={[
          { p: [0, 0.8, -0.6], s: [2.4, 1.6, 2.4], c: "#2a2228" },
          { p: [0, 0.8, 1.2], s: [1.8, 1.4, 1.4], c: "#2a2228" },
          { p: [-0.45, 1, 1.95], s: [0.4, 0.4, 0.1], c: "#ff4655", e: true },
          { p: [0.45, 1, 1.95], s: [0.4, 0.4, 0.1], c: "#ff4655", e: true },
          ...legs,
        ]}
      />
    </group>
  );
}

function Accessory({ kind, color, anim }: { kind: SkinConfig["accessory"]; color: string; anim: Anim }) {
  const capeRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (capeRef.current) {
      const t = clock.elapsedTime;
      const base = anim === "walk" ? 0.35 : anim === "glide" ? 1.1 : 0.08;
      capeRef.current.rotation.x = base + Math.sin(t * (anim === "walk" ? 8 : 1.5)) * 0.06;
    }
  });
  switch (kind) {
    case "cape":
      return (
        <group ref={capeRef} position={[0, 24, -2.2]}>
          <Boxes boxes={[{ p: [0, -8, -0.5], s: [10, 16, 1], c: color }, { p: [0, -2, -1.05], s: [3, 3, 0.2], c: "#1d1d21" }, { p: [-0.6, -1.6, -1.2], s: [0.5, 0.5, 0.1], c: "#ff4655", e: true }, { p: [0.6, -1.6, -1.2], s: [0.5, 0.5, 0.1], c: "#ff4655", e: true }]} />
        </group>
      );
    case "backpack":
      return <Boxes boxes={[{ p: [0, 18.5, -3.7], s: [7, 8, 3], c: color }, { p: [0, 16.5, -5.3], s: [5, 3, 0.6], c: "#1d1d21" }, { p: [-2.5, 20, 0], s: [0.8, 8, 4.6], c: "#1d1d21" }, { p: [2.5, 20, 0], s: [0.8, 8, 4.6], c: "#1d1d21" }]} />;
    case "scarf":
      return <Boxes boxes={[{ p: [0, 23.6, 0], s: [9, 2.2, 5.4], c: color }, { p: [-2, 20.5, 2.9], s: [2.2, 5, 0.8], c: color }]} />;
    case "chain":
      return (
        <Boxes
          boxes={[
            { p: [-2, 22.6, 2.2], s: [1.5, 0.6, 0.4], c: "#f2c14e", r: [0, 0, -0.6] },
            { p: [2, 22.6, 2.2], s: [1.5, 0.6, 0.4], c: "#f2c14e", r: [0, 0, 0.6] },
            { p: [-1, 21.6, 2.2], s: [1.5, 0.6, 0.4], c: "#f2c14e", r: [0, 0, -0.6] },
            { p: [1, 21.6, 2.2], s: [1.5, 0.6, 0.4], c: "#f2c14e", r: [0, 0, 0.6] },
            { p: [0, 20.6, 2.3], s: [1.4, 1.6, 0.5], c: "#e0313f", e: true },
          ]}
        />
      );
    case "spider_pet":
      return (
        <group position={[6, 24.4, 0]} scale={0.9}>
          <SpiderPet />
        </group>
      );
    case "elytra":
      return (
        <group ref={capeRef} position={[0, 24, -2.4]}>
          <Boxes
            boxes={[
              { p: [-3, -7, -0.6], s: [6, 14, 1], c: "#8f8fb8", r: [0, 0.25, 0.12] },
              { p: [3, -7, -0.6], s: [6, 14, 1], c: "#8f8fb8", r: [0, -0.25, -0.12] },
              { p: [-3.6, -4, -1.2], s: [3, 6, 0.4], c: "#c8c8e6", r: [0, 0.25, 0.12] },
              { p: [3.6, -4, -1.2], s: [3, 6, 0.4], c: "#c8c8e6", r: [0, -0.25, -0.12] },
            ]}
          />
        </group>
      );
    default:
      return null;
  }
}

export type CharacterProps = ThreeElements["group"] & {
  config: SkinConfig;
  anim?: Anim;
  /** world-space point the head should look at */
  gaze?: THREE.Vector3 | null;
  height?: number; // world units, default 1.8
};

export function Character({ config, anim = "idle", gaze = null, height = 1.8, ...rest }: CharacterProps) {
  const tex = useSkinTexture(config);
  const base = useMemo(() => new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5 }), [tex]);
  const over = useMemo(() => new THREE.MeshLambertMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide }), [tex]);
  useEffect(
    () => () => {
      base.dispose();
      over.dispose();
    },
    [base, over],
  );

  const aw = config.slim ? 3 : 4;
  const armX = config.slim ? 5.5 : 6;
  const g = useMemo(
    () => ({
      head: partGeo(PARTS.head, 8, 8, 8),
      hat: partGeo(PARTS.hat, 8, 8, 8, 0.5),
      body: partGeo(PARTS.body, 8, 12, 4),
      jacket: partGeo(PARTS.jacket, 8, 12, 4, 0.25),
      rarm: partGeo(PARTS.rarm, aw, 12, 4),
      rsleeve: partGeo(PARTS.rsleeve, aw, 12, 4, 0.25),
      larm: partGeo(PARTS.larm, aw, 12, 4),
      lsleeve: partGeo(PARTS.lsleeve, aw, 12, 4, 0.25),
      rleg: partGeo(PARTS.rleg, 4, 12, 4),
      rpant: partGeo(PARTS.rpant, 4, 12, 4, 0.25),
      lleg: partGeo(PARTS.lleg, 4, 12, 4),
      lpant: partGeo(PARTS.lpant, 4, 12, 4, 0.25),
    }),
    [aw],
  );

  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ra = useRef<THREE.Group>(null);
  const la = useRef<THREE.Group>(null);
  const rl = useRef<THREE.Group>(null);
  const ll = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const [phase] = useState(() => Math.random() * 10);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime + phase;
    if (!torso.current || !head.current || !ra.current || !la.current || !rl.current || !ll.current) return;
    const lerp = (o: THREE.Object3D, x: number, y: number, z: number) => {
      const k = Math.min(1, dt * 12);
      o.rotation.x += (x - o.rotation.x) * k;
      o.rotation.y += (y - o.rotation.y) * k;
      o.rotation.z += (z - o.rotation.z) * k;
    };
    let tx = 0;
    let ty = 0;
    let tz = 0;
    let rax = 0;
    let raz = 0;
    let lax = 0;
    let laz = 0;
    let rlx = 0;
    let llx = 0;
    let hx = 0;
    let torsoY = 12;
    const breathe = Math.sin(t * 1.6) * 0.04;
    switch (anim) {
      case "walk": {
        const s = Math.sin(t * 9) * 0.75;
        rax = s;
        lax = -s;
        rlx = -s;
        llx = s;
        break;
      }
      case "wave":
        rax = Math.PI;
        raz = -0.3 + Math.sin(t * 9) * 0.35;
        lax = breathe;
        break;
      case "dance": {
        const b = Math.sin(t * 6);
        rax = Math.PI * 0.85 + b * 0.3;
        lax = Math.PI * 0.85 - b * 0.3;
        raz = -0.3;
        laz = 0.3;
        tz = b * 0.12;
        torsoY = 12 - Math.abs(b) * 0.8;
        rlx = b * 0.3;
        llx = -b * 0.3;
        hx = Math.abs(b) * 0.2;
        break;
      }
      case "crouch":
        tx = 0.45;
        hx = -0.2;
        rax = 0.4;
        lax = 0.4;
        torsoY = 10.6;
        break;
      case "greet": {
        const on = Math.floor(t * 4) % 2 === 0;
        tx = on ? 0.45 : 0;
        torsoY = on ? 10.6 : 12;
        rax = on ? 0.4 : 0;
        lax = rax;
        break;
      }
      case "sit":
        rlx = -1.5;
        llx = -1.5;
        torsoY = 6;
        rax = -0.6;
        lax = -0.6;
        break;
      case "type":
        rlx = -1.5;
        llx = -1.5;
        torsoY = 6;
        rax = -1.2 + Math.sin(t * 14) * 0.08;
        lax = -1.2 + Math.cos(t * 13) * 0.08;
        hx = 0.15;
        break;
      case "jump":
        rax = -0.5;
        lax = -0.5;
        raz = -0.6;
        laz = 0.6;
        rlx = -0.4;
        llx = 0.3;
        break;
      case "glide":
        tx = 1.2;
        raz = -0.25;
        laz = 0.25;
        rax = 0.2;
        lax = 0.2;
        hx = -1.0;
        break;
      default:
        rax = breathe;
        lax = -breathe;
        raz = -0.04 - Math.sin(t * 1.1) * 0.03;
        laz = 0.04 + Math.sin(t * 1.1) * 0.03;
    }
    if (config.held !== "none" && (anim === "idle" || anim === "walk")) rax = rax * 0.3 - 0.35;
    lerp(torso.current, tx, ty, tz);
    torso.current.position.y += (torsoY - torso.current.position.y) * Math.min(1, dt * 12);
    lerp(ra.current, -rax, 0, raz);
    lerp(la.current, -lax, 0, laz);
    lerp(rl.current, -rlx, 0, 0);
    lerp(ll.current, -llx, 0, 0);
    // head look
    let yaw = 0;
    let pitch = hx;
    if (gaze && root.current) {
      head.current.getWorldPosition(tmp);
      const local = root.current.worldToLocal(gaze.clone());
      const headLocal = root.current.worldToLocal(tmp.clone());
      const d = local.sub(headLocal);
      yaw = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -1.1, 1.1);
      pitch = THREE.MathUtils.clamp(-Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.6, 0.6) + hx;
    }
    lerp(head.current, pitch - tx, yaw, 0);
  });

  const held = heldSprite[config.held];
  const s = height / 32;
  return (
    <group {...rest}>
      <group ref={root} scale={s}>
        <group ref={rl} position={[-2, 12, 0]}>
          <mesh geometry={g.rleg} material={base} position={[0, -6, 0]} castShadow />
          <mesh geometry={g.rpant} material={over} position={[0, -6, 0]} />
        </group>
        <group ref={ll} position={[2, 12, 0]}>
          <mesh geometry={g.lleg} material={base} position={[0, -6, 0]} castShadow />
          <mesh geometry={g.lpant} material={over} position={[0, -6, 0]} />
        </group>
        <group ref={torso} position={[0, 12, 0]}>
          <mesh geometry={g.body} material={base} position={[0, 6, 0]} castShadow />
          <mesh geometry={g.jacket} material={over} position={[0, 6, 0]} />
          <group ref={head} position={[0, 12, 0]}>
            <mesh geometry={g.head} material={base} position={[0, 4, 0]} castShadow />
            <mesh geometry={g.hat} material={over} position={[0, 4, 0]} />
            <Boxes boxes={headwearBoxes(config.headwear, config.headwearColor)} />
          </group>
          <group ref={ra} position={[-armX, 10, 0]}>
            <mesh geometry={g.rarm} material={base} position={[0, -4, 0]} castShadow />
            <mesh geometry={g.rsleeve} material={over} position={[0, -4, 0]} />
            {held && (
              <mesh geometry={extrudeSprite(held)} material={itemMaterial} position={[0, -10, 3.2]} rotation={[-Math.PI / 2 + 0.4, Math.PI / 2, 0]} scale={11} />
            )}
          </group>
          <group ref={la} position={[armX, 10, 0]}>
            <mesh geometry={g.larm} material={base} position={[0, -4, 0]} castShadow />
            <mesh geometry={g.lsleeve} material={over} position={[0, -4, 0]} />
          </group>
          <group position={[0, -12, 0]}>
            <Accessory kind={config.accessory} color={config.accessoryColor} anim={anim} />
          </group>
        </group>
      </group>
    </group>
  );
}
