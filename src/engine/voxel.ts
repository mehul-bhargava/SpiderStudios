// A dense voxel grid + a tiny structure DSL used to author every world in code.
import { B } from "./blocks";

export type BlockRef = string | number;

const resolve = (b: BlockRef): number => {
  if (typeof b === "number") return b;
  const id = B[b];
  if (id === undefined) throw new Error(`Unknown block "${b}"`);
  return id;
};

export class VoxelWorld {
  readonly sx: number;
  readonly sy: number;
  readonly sz: number;
  readonly ox: number;
  readonly oy: number;
  readonly oz: number;
  readonly data: Uint8Array;
  sky = true;

  constructor(sx: number, sy: number, sz: number, origin?: [number, number, number]) {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
    [this.ox, this.oy, this.oz] = origin ?? [-Math.floor(sx / 2), 0, -Math.floor(sz / 2)];
    this.data = new Uint8Array(sx * sy * sz);
  }

  inside(x: number, y: number, z: number) {
    const lx = x - this.ox;
    const ly = y - this.oy;
    const lz = z - this.oz;
    return lx >= 0 && ly >= 0 && lz >= 0 && lx < this.sx && ly < this.sy && lz < this.sz;
  }

  index(x: number, y: number, z: number) {
    return (y - this.oy) * this.sx * this.sz + (z - this.oz) * this.sx + (x - this.ox);
  }

  get(x: number, y: number, z: number): number {
    if (!this.inside(x, y, z)) return 0;
    return this.data[this.index(x, y, z)];
  }

  set(x: number, y: number, z: number, b: BlockRef) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    if (!this.inside(x, y, z)) return;
    this.data[this.index(x, y, z)] = resolve(b);
  }

  /** Inclusive box fill. */
  fill(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, b: BlockRef | ((x: number, y: number, z: number) => BlockRef | null)) {
    const [ax, bx] = [Math.min(x0, x1), Math.max(x0, x1)];
    const [ay, by] = [Math.min(y0, y1), Math.max(y0, y1)];
    const [az, bz] = [Math.min(z0, z1), Math.max(z0, z1)];
    const fixed = typeof b === "function" ? null : resolve(b);
    for (let y = ay; y <= by; y++)
      for (let z = az; z <= bz; z++)
        for (let x = ax; x <= bx; x++) {
          if (fixed !== null) this.set(x, y, z, fixed);
          else {
            const r = (b as (x: number, y: number, z: number) => BlockRef | null)(x, y, z);
            if (r !== null) this.set(x, y, z, r);
          }
        }
  }

  clear(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    this.fill(x0, y0, z0, x1, y1, z1, 0);
  }

  /** Four walls, no floor / ceiling. */
  walls(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, b: BlockRef) {
    this.fill(x0, y0, z0, x1, y1, z0, b);
    this.fill(x0, y0, z1, x1, y1, z1, b);
    this.fill(x0, y0, z0, x0, y1, z1, b);
    this.fill(x1, y0, z0, x1, y1, z1, b);
  }

  /** Hollow box with floor + ceiling. */
  room(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, wall: BlockRef, floor?: BlockRef, ceiling?: BlockRef) {
    this.walls(x0, y0, z0, x1, y1, z1, wall);
    this.fill(x0, y0, z0, x1, y0, z1, floor ?? wall);
    this.fill(x0, y1, z0, x1, y1, z1, ceiling ?? wall);
  }

  sphere(cx: number, cy: number, cz: number, r: number, b: BlockRef, squash = 1) {
    const R = Math.ceil(r);
    for (let y = -R; y <= R; y++)
      for (let z = -R; z <= R; z++)
        for (let x = -R; x <= R; x++) if (x * x + (y * squash) ** 2 + z * z <= r * r) this.set(cx + x, cy + y, cz + z, b);
  }

  disc(cx: number, y: number, cz: number, r: number, b: BlockRef) {
    const R = Math.ceil(r);
    for (let z = -R; z <= R; z++) for (let x = -R; x <= R; x++) if (x * x + z * z <= r * r + 0.5) this.set(cx + x, y, cz + z, b);
  }

  ring(cx: number, y: number, cz: number, r: number, b: BlockRef, thickness = 1) {
    const R = Math.ceil(r);
    for (let z = -R; z <= R; z++)
      for (let x = -R; x <= R; x++) {
        const d = Math.sqrt(x * x + z * z);
        if (d <= r + 0.5 && d > r - thickness + 0.5) this.set(cx + x, y, cz + z, b);
      }
  }

  cylinder(cx: number, y0: number, cz: number, r: number, h: number, b: BlockRef) {
    for (let y = y0; y < y0 + h; y++) this.disc(cx, y, cz, r, b);
  }

  column(x: number, y0: number, z: number, h: number, b: BlockRef) {
    for (let y = y0; y < y0 + h; y++) this.set(x, y, z, b);
  }

  /** Top-most non-air y at (x,z), or -Infinity. */
  top(x: number, z: number): number {
    for (let y = this.oy + this.sy - 1; y >= this.oy; y--) if (this.get(x, y, z)) return y;
    return -Infinity;
  }

  /** Each column gets a height from fn; fills with layers. */
  terrain(
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    height: (x: number, z: number) => number | null,
    layers: (depth: number, y: number, x: number, z: number) => BlockRef,
    bottom = 0,
  ) {
    for (let z = z0; z <= z1; z++)
      for (let x = x0; x <= x1; x++) {
        const h = height(x, z);
        if (h === null) continue;
        const top = Math.round(h);
        for (let y = bottom; y <= top; y++) this.set(x, y, z, layers(top - y, y, x, z));
      }
  }

  tree(x: number, y: number, z: number, h = 5, log: BlockRef = "oak_log", leaves: BlockRef = "leaves") {
    for (let i = 0; i < h; i++) this.set(x, y + i, z, log);
    for (let ly = h - 2; ly <= h + 1; ly++) {
      const r = ly > h - 1 ? 1 : 2;
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && (ly === h + 1 || (dx + dz + ly) % 2 === 0)) continue;
          if (!this.get(x + dx, y + ly, z + dz)) this.set(x + dx, y + ly, z + dz, leaves);
        }
    }
  }

  palm(x: number, y: number, z: number, h = 6) {
    for (let i = 0; i < h; i++) this.set(x + (i > h - 3 ? 1 : 0), y + i, z, "jungle_log");
    const tx = x + 1;
    const ty = y + h;
    this.set(tx, ty, z, "palm_leaves");
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      for (let k = 1; k <= 3; k++) this.set(tx + dx * k, ty - (k === 3 ? 1 : 0), z + dz * k, "palm_leaves");
    }
  }
}
