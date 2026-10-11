"use client";
// Tiny original synth for UI sounds + procedural ambience. No sampled game audio.
import { useSettings } from "@/state/settings";
import type { WorldId } from "@/content/dimensions";

let ctx: AudioContext | null = null;
let sfxBus: GainNode | null = null;
let ambBus: GainNode | null = null;
let ambNodes: AudioNode[] = [];
let ambTimer: number | null = null;
let currentAmb: WorldId | null = null;
let noiseBuf: AudioBuffer | null = null;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    sfxBus = ctx.createGain();
    ambBus = ctx.createGain();
    sfxBus.connect(ctx.destination);
    ambBus.connect(ctx.destination);
    applyVolumes();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function applyVolumes() {
  if (!ctx || !sfxBus || !ambBus) return;
  const s = useSettings.getState();
  const on = s.sound ? 1 : 0;
  sfxBus.gain.setTargetAtTime(on * s.sfx * 0.5, ctx.currentTime, 0.05);
  ambBus.gain.setTargetAtTime(on * s.music * 0.35, ctx.currentTime, 0.4);
}

export function unlockAudio() {
  if (!useSettings.getState().sound) return;
  ensure();
  if (currentAmb) startAmbience(currentAmb, true);
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      // brown-ish noise
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5 + w * 0.15;
    }
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  return src;
}

function tone(
  c: AudioContext,
  { f0, f1 = f0, t = 0.1, type = "square", vol = 0.3, at = 0 }: { f0: number; f1?: number; t?: number; type?: OscillatorType; vol?: number; at?: number },
) {
  const o = c.createOscillator();
  const g = c.createGain();
  const start = c.currentTime + at;
  o.type = type;
  o.frequency.setValueAtTime(f0, start);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + t);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + t);
  o.connect(g).connect(sfxBus!);
  o.start(start);
  o.stop(start + t + 0.02);
}

function burst(c: AudioContext, { t = 0.2, freq = 800, q = 1, vol = 0.4, type = "bandpass" as BiquadFilterType, sweep = 0, at = 0 }) {
  const src = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  const start = c.currentTime + at;
  f.type = type;
  f.frequency.setValueAtTime(freq, start);
  if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * sweep), start + t);
  f.Q.value = q;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + t);
  src.connect(f).connect(g).connect(sfxBus!);
  src.start(start, Math.random());
  src.stop(start + t + 0.05);
}

export type Sfx =
  | "click"
  | "hover"
  | "advancement"
  | "chest"
  | "portal"
  | "pop"
  | "jump"
  | "beep"
  | "defused"
  | "page"
  | "error"
  | "levelup";

export function sfx(name: Sfx) {
  if (!useSettings.getState().sound) return;
  const c = ensure();
  if (!c || !sfxBus) return;
  switch (name) {
    case "click":
      tone(c, { f0: 900, f1: 600, t: 0.05, type: "square", vol: 0.12 });
      break;
    case "hover":
      tone(c, { f0: 1800, f1: 1700, t: 0.02, type: "sine", vol: 0.03 });
      break;
    case "advancement":
      tone(c, { f0: 659, t: 0.18, type: "triangle", vol: 0.3 });
      tone(c, { f0: 988, t: 0.4, type: "triangle", vol: 0.3, at: 0.12 });
      tone(c, { f0: 1319, t: 0.5, type: "sine", vol: 0.15, at: 0.24 });
      break;
    case "levelup":
      [523, 659, 784, 1047].forEach((f, i) => tone(c, { f0: f, t: 0.2, type: "triangle", vol: 0.2, at: i * 0.07 }));
      break;
    case "chest":
      burst(c, { t: 0.25, freq: 300, q: 2, vol: 0.5, sweep: 0.5 });
      tone(c, { f0: 140, f1: 90, t: 0.22, type: "sawtooth", vol: 0.08 });
      break;
    case "portal":
      burst(c, { t: 1.2, freq: 200, q: 3, vol: 0.4, sweep: 8 });
      tone(c, { f0: 110, f1: 440, t: 1.1, type: "sine", vol: 0.15 });
      break;
    case "pop":
      tone(c, { f0: 500, f1: 1500, t: 0.08, type: "sine", vol: 0.25 });
      break;
    case "jump":
      tone(c, { f0: 300, f1: 600, t: 0.12, type: "square", vol: 0.08 });
      break;
    case "beep":
      tone(c, { f0: 1500, t: 0.07, type: "square", vol: 0.1 });
      break;
    case "defused":
      [440, 554, 659, 880].forEach((f) => tone(c, { f0: f, t: 0.6, type: "triangle", vol: 0.12 }));
      break;
    case "page":
      burst(c, { t: 0.12, freq: 4000, q: 0.7, vol: 0.2, type: "highpass" });
      break;
    case "error":
      tone(c, { f0: 200, f1: 150, t: 0.15, type: "square", vol: 0.1 });
      break;
  }
}

// ── Ambience ────────────────────────────────────────────────────────────────

function stopAmbience() {
  ambNodes.forEach((n) => {
    try {
      (n as AudioScheduledSourceNode).stop?.();
    } catch {}
    n.disconnect();
  });
  ambNodes = [];
  if (ambTimer) window.clearInterval(ambTimer);
  ambTimer = null;
}

type AmbSpec = { noise?: { freq: number; q: number; vol: number }; drones?: { f: number; type: OscillatorType; vol: number }[]; blips?: { every: number; f: [number, number]; vol: number; type: OscillatorType } };

const ambSpecs: Partial<Record<WorldId, AmbSpec>> = {
  title: { noise: { freq: 500, q: 0.4, vol: 0.18 }, drones: [{ f: 110, type: "sine", vol: 0.05 }, { f: 164.8, type: "sine", vol: 0.03 }] },
  overworld: { noise: { freq: 600, q: 0.3, vol: 0.2 }, blips: { every: 2600, f: [2400, 3600], vol: 0.04, type: "sine" } },
  "the-end": { drones: [{ f: 55, type: "sine", vol: 0.12 }, { f: 82.4, type: "triangle", vol: 0.04 }, { f: 220.5, type: "sine", vol: 0.02 }] },
  "ancient-city": { drones: [{ f: 41, type: "sine", vol: 0.14 }], blips: { every: 1700, f: [180, 260], vol: 0.05, type: "square" } },
  nether: { noise: { freq: 120, q: 0.8, vol: 0.35 }, drones: [{ f: 48, type: "sawtooth", vol: 0.02 }] },
  crafting: { noise: { freq: 900, q: 0.2, vol: 0.06 }, drones: [{ f: 196, type: "sine", vol: 0.02 }] },
  "end-city": { drones: [{ f: 65.4, type: "sine", vol: 0.1 }, { f: 98, type: "sine", vol: 0.04 }] },
  portal: { drones: [{ f: 73.4, type: "sine", vol: 0.1 }, { f: 110, type: "triangle", vol: 0.03 }, { f: 146.8, type: "sine", vol: 0.02 }] },
  lab: { drones: [{ f: 60, type: "square", vol: 0.008 }] },
  dressing: { drones: [{ f: 130.8, type: "sine", vol: 0.03 }] },
};

export function startAmbience(world: WorldId, force = false) {
  if (!force && currentAmb === world) return;
  currentAmb = world;
  if (!useSettings.getState().sound || !ctx || !ambBus) return;
  stopAmbience();
  const spec = ambSpecs[world];
  if (!spec) return;
  const c = ctx;
  if (spec.noise) {
    const src = noise(c);
    src.loop = true;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = spec.noise.freq;
    f.Q.value = spec.noise.q;
    const g = c.createGain();
    g.gain.value = spec.noise.vol;
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.frequency.value = 0.08;
    lfoG.gain.value = spec.noise.freq * 0.4;
    lfo.connect(lfoG).connect(f.frequency);
    src.connect(f).connect(g).connect(ambBus);
    src.start();
    lfo.start();
    ambNodes.push(src, f, g, lfo, lfoG);
  }
  spec.drones?.forEach((d) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = d.type;
    o.frequency.value = d.f;
    o.detune.value = Math.random() * 8 - 4;
    g.gain.value = d.vol;
    o.connect(g).connect(ambBus!);
    o.start();
    ambNodes.push(o, g);
  });
  if (spec.blips) {
    const b = spec.blips;
    ambTimer = window.setInterval(() => {
      if (!ctx || Math.random() < 0.4) return;
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime;
      o.type = b.type;
      const f = b.f[0] + Math.random() * (b.f[1] - b.f[0]);
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.25, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(b.vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(ambBus!);
      o.start(t);
      o.stop(t + 0.15);
    }, b.every);
  }
}

if (typeof window !== "undefined") {
  useSettings.subscribe((s, prev) => {
    if (s.sound !== prev.sound) {
      if (s.sound) {
        ensure();
        if (currentAmb) startAmbience(currentAmb, true);
      } else stopAmbience();
    }
    applyVolumes();
  });
}
