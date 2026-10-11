"use client";
import * as THREE from "three";
import { sprites } from "@/engine/sprites";

const cache = new Map<string, THREE.BufferGeometry>();

/** Turns a 16×16 sprite into a 1-pixel-thick 3D item (unit = 1/16, centred). */
export function extrudeSprite(id: string): THREE.BufferGeometry {
  const hit = cache.get(id);
  if (hit) return hit;
  const sp = sprites[id] ?? sprites.book;
  const pos: number[] = [];
  const col: number[] = [];
  const nor: number[] = [];
  const c = new THREE.Color();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= sp.w || y >= sp.h ? null : sp.px[y * sp.w + x]);
  const quad = (v: number[][], n: number[], color: THREE.Color, k: number) => {
    const order = [0, 1, 2, 0, 2, 3];
    for (const i of order) {
      pos.push(v[i][0], v[i][1], v[i][2]);
      col.push(color.r * k, color.g * k, color.b * k);
      nor.push(n[0], n[1], n[2]);
    }
  };
  const ox = sp.w / 2;
  const oy = sp.h / 2;
  const z0 = -0.5;
  const z1 = 0.5;
  for (let y = 0; y < sp.h; y++)
    for (let x = 0; x < sp.w; x++) {
      const hex = at(x, y);
      if (!hex) continue;
      c.set(hex).convertSRGBToLinear();
      const X0 = x - ox;
      const X1 = X0 + 1;
      const Y1 = oy - y;
      const Y0 = Y1 - 1;
      quad([[X0, Y0, z1], [X1, Y0, z1], [X1, Y1, z1], [X0, Y1, z1]], [0, 0, 1], c, 1);
      quad([[X1, Y0, z0], [X0, Y0, z0], [X0, Y1, z0], [X1, Y1, z0]], [0, 0, -1], c, 0.8);
      if (!at(x - 1, y)) quad([[X0, Y0, z0], [X0, Y0, z1], [X0, Y1, z1], [X0, Y1, z0]], [-1, 0, 0], c, 0.7);
      if (!at(x + 1, y)) quad([[X1, Y0, z1], [X1, Y0, z0], [X1, Y1, z0], [X1, Y1, z1]], [1, 0, 0], c, 0.7);
      if (!at(x, y - 1)) quad([[X0, Y1, z1], [X1, Y1, z1], [X1, Y1, z0], [X0, Y1, z0]], [0, 1, 0], c, 0.9);
      if (!at(x, y + 1)) quad([[X0, Y0, z0], [X1, Y0, z0], [X1, Y0, z1], [X0, Y0, z1]], [0, -1, 0], c, 0.6);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.scale(1 / 16, 1 / 16, 1 / 16);
  cache.set(id, g);
  return g;
}

export const itemMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });

const colorMats = new Map<string, THREE.MeshLambertMaterial>();
export function colorMat(hex: string, emissive = false): THREE.MeshLambertMaterial {
  const key = hex + (emissive ? "e" : "");
  let m = colorMats.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color: hex, emissive: emissive ? hex : "#000000", emissiveIntensity: emissive ? 1 : 0 });
    colorMats.set(key, m);
  }
  return m;
}

export const unitBox = new THREE.BoxGeometry(1, 1, 1);

const textCache = new Map<string, THREE.CanvasTexture>();

/** Pixel-font text rendered to a texture (for signs and labels). */
export function textTexture(
  lines: string[],
  opts: { w?: number; h?: number; bg?: string; color?: string; size?: number; align?: CanvasTextAlign; shadow?: boolean } = {},
): THREE.CanvasTexture {
  const key = JSON.stringify([lines, opts]);
  const hit = textCache.get(key);
  if (hit) return hit;
  const W = opts.w ?? 256;
  const H = opts.h ?? 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, W, H);
  }
  const size = opts.size ?? 22;
  ctx.font = `${size}px Monocraft, monospace`;
  ctx.textAlign = opts.align ?? "center";
  ctx.textBaseline = "middle";
  const x = ctx.textAlign === "center" ? W / 2 : 12;
  const lh = size * 1.25;
  const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => {
    if (opts.shadow !== false) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(l, x + 2, y0 + i * lh + 2);
    }
    ctx.fillStyle = opts.color ?? "#ffffff";
    ctx.fillText(l, x, y0 + i * lh);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  textCache.set(key, t);
  return t;
}

const imgCache = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();

export function imageTexture(url: string): THREE.Texture {
  let t = imgCache.get(url);
  if (!t) {
    t = loader.load(url);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    imgCache.set(url, t);
  }
  return t;
}
