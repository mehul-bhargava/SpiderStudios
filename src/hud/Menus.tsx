"use client";
import { useState } from "react";
import { useUi } from "@/state/ui";
import { useSettings, type Quality, type Motion } from "@/state/settings";
import { useProgress } from "@/state/progress";
import { travel } from "@/lib/nav";

export function PauseMenu() {
  const setMenu = useUi((s) => s.setMenu);
  return (
    <div className="menu-screen" role="dialog" aria-modal="true" aria-label="Game menu">
      <div className="menu-col">
        <h2>Game Menu</h2>
        <button className="mc-btn wide" autoFocus onClick={() => setMenu(null)}>
          Back to Game
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button className="mc-btn" onClick={() => setMenu("inventory")}>
            Advancements
          </button>
          <button className="mc-btn" onClick={() => setMenu("help")}>
            Controls
          </button>
          <button className="mc-btn" onClick={() => setMenu("options")}>
            Options…
          </button>
          <button className="mc-btn" onClick={() => travel("dressing")}>
            Dressing Room
          </button>
        </div>
        <button className="mc-btn wide" onClick={() => {
            setMenu(null);
            useUi.getState().open({ type: "selectWorld" });
          }}>
          Select World
        </button>
        <button
          className="mc-btn wide"
          onClick={() => {
            setMenu(null);
            useSettings.getState().set({ mode: "classic" });
          }}
        >
          Switch to Classic Mode
        </button>
        <button className="mc-btn wide red" onClick={() => travel("portal")}>
          Hire Me
        </button>
        <button className="mc-btn wide" onClick={() => travel("title")}>
          Save and Quit to Title
        </button>
      </div>
    </div>
  );
}

export function OptionsMenu() {
  const s = useSettings();
  const setMenu = useUi((x) => x.setMenu);
  const [confirm, setConfirm] = useState(false);
  const qualities: Quality[] = ["auto", "high", "lite"];
  const motions: Motion[] = ["system", "full", "reduced"];
  const cycle = <T,>(list: T[], v: T) => list[(list.indexOf(v) + 1) % list.length];
  return (
    <div className="menu-screen" role="dialog" aria-modal="true" aria-label="Options">
      <div className="menu-col mc-dark">
        <h2>Options</h2>
        <div className="opt-row">
          <span>Graphics</span>
          <button className="mc-btn small" onClick={() => s.set({ quality: cycle(qualities, s.quality) })}>
            {s.quality === "auto" ? "Auto" : s.quality === "high" ? "Fancy" : "Fast"}
          </button>
        </div>
        <div className="opt-row">
          <span>Sound</span>
          <button className="mc-btn small" onClick={() => s.set({ sound: !s.sound })}>
            {s.sound ? "ON" : "OFF"}
          </button>
        </div>
        <label className="opt-row">
          <span>Ambience {Math.round(s.music * 100)}%</span>
          <input className="slider" type="range" min={0} max={1} step={0.05} value={s.music} onChange={(e) => s.set({ music: Number(e.target.value) })} />
        </label>
        <label className="opt-row">
          <span>Effects {Math.round(s.sfx * 100)}%</span>
          <input className="slider" type="range" min={0} max={1} step={0.05} value={s.sfx} onChange={(e) => s.set({ sfx: Number(e.target.value) })} />
        </label>
        <div className="opt-row">
          <span>Motion</span>
          <button className="mc-btn small" onClick={() => s.set({ motion: cycle(motions, s.motion) })}>
            {s.motion === "system" ? "Match system" : s.motion === "full" ? "Full" : "Reduced"}
          </button>
        </div>
        <div className="opt-row">
          <span>Readable text</span>
          <button className="mc-btn small" onClick={() => s.set({ readable: !s.readable })}>
            {s.readable ? "ON" : "OFF"}
          </button>
        </div>
        <div className="opt-row">
          <span>Mode</span>
          <button className="mc-btn small" onClick={() => s.set({ mode: s.mode === "3d" ? "classic" : "3d" })}>
            {s.mode === "3d" ? "3D World" : "Classic"}
          </button>
        </div>
        <div className="opt-row">
          <span>Progress</span>
          {confirm ? (
            <button
              className="mc-btn small red"
              onClick={() => {
                useProgress.getState().reset();
                setConfirm(false);
              }}
            >
              Really delete?
            </button>
          ) : (
            <button className="mc-btn small" onClick={() => setConfirm(true)}>
              Delete World
            </button>
          )}
        </div>
        <button className="mc-btn wide" autoFocus onClick={() => setMenu(null)} style={{ marginTop: 8 }}>
          Done
        </button>
      </div>
    </div>
  );
}

const KEYS: [string, string][] = [
  ["1 – 7", "Jump between dimensions"],
  ["8", "Map · Select World"],
  ["9 / E", "Inventory & advancements"],
  ["← →", "Previous / next point of interest"],
  ["Enter", "Interact"],
  ["F", "Browse all work"],
  ["T or /", "Chat & commands (/help)"],
  ["M", "Mute / unmute"],
  ["Esc", "Close · pause menu"],
  ["F3", "Debug overlay"],
  ["Drag / scroll", "Look around · zoom"],
];

export function HelpMenu() {
  const setMenu = useUi((s) => s.setMenu);
  return (
    <div className="menu-screen" role="dialog" aria-modal="true" aria-label="Controls">
      <div className="menu-col mc-dark" style={{ width: "min(520px,100%)" }}>
        <h2>Controls</h2>
        <dl className="lore-list" style={{ gridTemplateColumns: "auto 1fr", display: "grid", columnGap: 16 }}>
          {KEYS.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt className="c-yellow" style={{ fontSize: 14 }}>
                {k}
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="c-gray" style={{ fontSize: 13, lineHeight: 1.6 }}>
          Every quest is skippable and nothing important is locked. Prefer a normal website? Switch to Classic Mode anytime.
        </p>
        <button className="mc-btn wide" autoFocus onClick={() => setMenu(null)}>
          Done
        </button>
      </div>
    </div>
  );
}
