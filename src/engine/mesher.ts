// Face-culled voxel mesher with baked smooth lighting (sky + block light flood fill)
// and per-vertex ambient occlusion — the classic Minecraft look at near-zero runtime cost.
import { blocks } from "./blocks";
import { ATLAS_COLS, atlasRows, tileIndex } from "./textures";
import type { VoxelWorld } from "./voxel";

export type MeshData = {
  position: Float32Array;
  uv: Float32Array;
  color: Float32Array;
  light: Float32Array;
  index: Uint32Array;
};

type Face = { n: [number, number, number]; c: [number, number, number][]; shade: number; kind: "top" | "side" | "bottom" | "front" };

const FACES: Face[] = [
  { n: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], shade: 0.62, kind: "side" },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], shade: 0.62, kind: "side" },
  { n: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], shade: 1.0, kind: "top" },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], shade: 0.5, kind: "bottom" },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], shade: 0.82, kind: "front" },
  { n: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], shade: 0.82, kind: "side" },
];
const QUAD_UV: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const AO = [0.5, 0.68, 0.84, 1.0];

class Builder {
  p: number[] = [];
  uv: number[] = [];
  col: number[] = [];
  li: number[] = [];
  idx: number[] = [];
  count = 0;
  build(): MeshData {
    return {
      position: new Float32Array(this.p),
      uv: new Float32Array(this.uv),
      color: new Float32Array(this.col),
      light: new Float32Array(this.li),
      index: new Uint32Array(this.idx),
    };
  }
}

export function tileUV(name: string): [number, number, number, number] {
  const i = tileIndex[name] ?? 0;
  const rows = atlasRows();
  const col = i % ATLAS_COLS;
  const row = Math.floor(i / ATLAS_COLS);
  const eu = 0.02 / ATLAS_COLS;
  const ev = 0.02 / rows;
  const u0 = col / ATLAS_COLS + eu;
  const u1 = (col + 1) / ATLAS_COLS - eu;
  const vTop = 1 - row / rows - ev;
  const vBot = 1 - (row + 1) / rows + ev;
  return [u0, vBot, u1, vTop];
}

export function meshWorld(w: VoxelWorld): { opaque: MeshData; cutout: MeshData; faces: number } {
  const { sx, sy, sz, data } = w;
  const layer = sx * sz;
  const N = sx * sy * sz;
  const opaque = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (data[i] && blocks[data[i]].opaque) opaque[i] = 1;

  // ── sky light ──
  const sky = new Uint8Array(N);
  const blk = new Uint8Array(N);
  const q: number[] = [];
  if (w.sky) {
    for (let z = 0; z < sz; z++)
      for (let x = 0; x < sx; x++) {
        let l = 15;
        for (let y = sy - 1; y >= 0; y--) {
          const i = y * layer + z * sx + x;
          if (opaque[i]) l = 0;
          else if (data[i] && !blocks[data[i]].cross) l = Math.max(0, l - 2);
          sky[i] = l;
        }
      }
    for (let i = 0; i < N; i++) {
      if (sky[i] !== 15) continue;
      const x = i % sx;
      const z = ((i / sx) | 0) % sz;
      if (
        (x > 0 && !opaque[i - 1] && sky[i - 1] < 14) ||
        (x < sx - 1 && !opaque[i + 1] && sky[i + 1] < 14) ||
        (z > 0 && !opaque[i - sx] && sky[i - sx] < 14) ||
        (z < sz - 1 && !opaque[i + sx] && sky[i + sx] < 14)
      )
        q.push(i);
    }
    flood(sky, q);
  }

  // ── block light ──
  q.length = 0;
  for (let i = 0; i < N; i++) {
    const b = data[i];
    if (b && blocks[b].light) {
      blk[i] = blocks[b].light;
      q.push(i);
    }
  }
  flood(blk, q);

  function flood(arr: Uint8Array, queue: number[]) {
    let head = 0;
    while (head < queue.length) {
      const i = queue[head++];
      const l = arr[i] - 1;
      if (l <= 0) continue;
      const x = i % sx;
      const z = ((i / sx) | 0) % sz;
      const y = (i / layer) | 0;
      if (x > 0) {
        const n = i - 1;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
      if (x < sx - 1) {
        const n = i + 1;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
      if (z > 0) {
        const n = i - sx;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
      if (z < sz - 1) {
        const n = i + sx;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
      if (y > 0) {
        const n = i - layer;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
      if (y < sy - 1) {
        const n = i + layer;
        if (!opaque[n] && arr[n] < l) {
          arr[n] = l;
          queue.push(n);
        }
      }
    }
  }

  const outSky = w.sky ? 15 : 0;
  const inB = (x: number, y: number, z: number) => x >= 0 && y >= 0 && z >= 0 && x < sx && y < sy && z < sz;
  const solid = (x: number, y: number, z: number) => (inB(x, y, z) ? opaque[y * layer + z * sx + x] : 0);

  const ob = new Builder();
  const cb = new Builder();
  let faces = 0;
  const { ox, oy, oz } = w;

  for (let y = 0; y < sy; y++)
    for (let z = 0; z < sz; z++)
      for (let x = 0; x < sx; x++) {
        const i = y * layer + z * sx + x;
        const b = data[i];
        if (!b) continue;
        const def = blocks[b];
        const emissive = def.light > 0 ? 1 : 0;

        if (def.cross) {
          const [u0, v0, u1, v1] = tileUV(def.top);
          const s = sky[i] / 15;
          const bl = blk[i] / 15;
          const quads: [number, number, number][][] = [
            [
              [0.15, 0, 0.15],
              [0.85, 0, 0.85],
              [0.85, 1, 0.85],
              [0.15, 1, 0.15],
            ],
            [
              [0.15, 0, 0.85],
              [0.85, 0, 0.15],
              [0.85, 1, 0.15],
              [0.15, 1, 0.85],
            ],
          ];
          for (const qd of quads) {
            const base = cb.count;
            for (let k = 0; k < 4; k++) {
              cb.p.push(x + ox + qd[k][0], y + oy + qd[k][1], z + oz + qd[k][2]);
              cb.uv.push(u0 + (u1 - u0) * QUAD_UV[k][0], v0 + (v1 - v0) * QUAD_UV[k][1]);
              cb.col.push(0.92, 0.92, 0.92);
              cb.li.push(s, bl, emissive);
            }
            cb.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
            cb.count += 4;
            faces++;
          }
          continue;
        }

        for (const f of FACES) {
          const nx = x + f.n[0];
          const ny = y + f.n[1];
          const nz = z + f.n[2];
          const nb = inB(nx, ny, nz) ? data[ny * layer + nz * sx + nx] : 0;
          if (nb) {
            const nd = blocks[nb];
            if (nd.opaque) continue;
            if (nb === b && def.cutout) continue;
          }
          const tile = f.kind === "top" ? def.top : f.kind === "bottom" ? def.bottom : f.kind === "front" ? def.front ?? def.side : def.side;
          const [u0, v0, u1, v1] = tileUV(tile);
          const bld = def.cutout ? cb : ob;
          const base = bld.count;
          // tangent axes
          const axes = f.n[0] !== 0 ? [1, 2] : f.n[1] !== 0 ? [0, 2] : [0, 1];
          const ao: number[] = [];
          for (let k = 0; k < 4; k++) {
            const c = f.c[k];
            const d = [0, 0, 0];
            d[axes[0]] = c[axes[0]] === 1 ? 1 : -1;
            const e = [0, 0, 0];
            e[axes[1]] = c[axes[1]] === 1 ? 1 : -1;
            const s1 = solid(nx + d[0], ny + d[1], nz + d[2]);
            const s2 = solid(nx + e[0], ny + e[1], nz + e[2]);
            const cr = solid(nx + d[0] + e[0], ny + d[1] + e[1], nz + d[2] + e[2]);
            const lvl = s1 && s2 ? 0 : 3 - (s1 + s2 + cr);
            ao.push(lvl);
            // smooth light: average of non-opaque samples in the face plane
            let ss = 0;
            let sb = 0;
            let cnt = 0;
            const samples: [number, number, number, number][] = [
              [nx, ny, nz, 1],
              [nx + d[0], ny + d[1], nz + d[2], s1 ? 0 : 1],
              [nx + e[0], ny + e[1], nz + e[2], s2 ? 0 : 1],
              [nx + d[0] + e[0], ny + d[1] + e[1], nz + d[2] + e[2], cr || (s1 && s2) ? 0 : 1],
            ];
            for (const [px, py, pz, ok] of samples) {
              if (!ok) continue;
              if (inB(px, py, pz)) {
                const j = py * layer + pz * sx + px;
                ss += sky[j];
                sb += blk[j];
              } else ss += outSky;
              cnt++;
            }
            const shade = f.shade * AO[lvl];
            bld.p.push(x + ox + c[0], y + oy + c[1], z + oz + c[2]);
            bld.uv.push(u0 + (u1 - u0) * QUAD_UV[k][0], v0 + (v1 - v0) * QUAD_UV[k][1]);
            bld.col.push(shade, shade, shade);
            bld.li.push(ss / cnt / 15, Math.max(sb / cnt / 15, emissive ? 1 : 0), emissive);
          }
          if (ao[0] + ao[2] < ao[1] + ao[3]) bld.idx.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
          else bld.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
          bld.count += 4;
          faces++;
        }
      }

  return { opaque: ob.build(), cutout: cb.build(), faces };
}
