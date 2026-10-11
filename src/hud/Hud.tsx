"use client";
import { useEffect, useMemo, useState } from "react";
import { useUi } from "@/state/ui";
import { useSettings } from "@/state/settings";
import { useProgress } from "@/state/progress";
import { dimensionById, dimensions, goldenPath, isDimensionId, nextOnPath } from "@/content/dimensions";
import { loadingTips } from "@/content/splashes";
import { advancements } from "@/content/advancements";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { ItemIcon } from "@/ui/ItemIcon";
import { TitleMenu } from "./TitleMenu";
import { DressingPanel } from "./DressingPanel";
import { PauseMenu, OptionsMenu, HelpMenu } from "./Menus";
import { Inventory } from "./Inventory";
import { Chat } from "./Chat";
import { SpiderGlyph } from "./SpiderGlyph";

function TopBar() {
  const world = useUi((s) => s.world);
  const sound = useSettings((s) => s.sound);
  const dim = world && isDimensionId(world) ? dimensionById[world] : null;
  if (world === "title") return null;
  return (
    <div className="topbar">
      <div className="dim-label" aria-live="polite">
        {dim ? (
          <>
            <b style={{ color: dim.accent }}>{dim.name}</b>
            <span className="c-gray">{dim.purpose}</span>
          </>
        ) : (
          <b>Dressing Room</b>
        )}
      </div>
      <div className="actions">
        {world !== "portal" && (
          <button className="mc-btn red" onClick={() => travel("portal")}>
            Hire Me
          </button>
        )}
        <button className="mc-btn icon" aria-label={sound ? "Mute sound" : "Turn sound on"} onClick={() => useSettings.getState().set({ sound: !sound })}>
          <ItemIcon id={sound ? "speaker" : "speaker_off"} size={24} />
        </button>
        <button className="mc-btn icon hide-m" aria-label="Open inventory" onClick={() => useUi.getState().setMenu("inventory")}>
          E
        </button>
        <button className="mc-btn icon" aria-label="Pause menu" onClick={() => useUi.getState().setMenu("pause")}>
          ☰
        </button>
      </div>
    </div>
  );
}

const HOTBAR: { key: number; icon: string; label: string; run: () => void; world?: string }[] = [
  ...dimensions
    .filter((d) => d.hotkey)
    .map((d) => ({ key: d.hotkey!, icon: d.icon, label: `${d.name} — ${d.purpose}`, run: () => travel(d.id), world: d.id })),
  { key: 8, icon: "map", label: "Map — Select World & treasure", run: () => useUi.getState().open({ type: "selectWorld" }) },
  { key: 9, icon: "book", label: "Inventory & advancements", run: () => useUi.getState().setMenu("inventory") },
];

function Hotbar() {
  const world = useUi((s) => s.world);
  const visited = useProgress((s) => s.visited);
  const advCount = useProgress((s) => Object.keys(s.advancements).length);
  const pct = Math.min(1, visited.filter((v) => goldenPath.includes(v)).length / goldenPath.length);
  return (
    <div className="hotbar-wrap">
      <div className="xp" title={`Journey ${Math.round(pct * 100)}% · ${advCount}/${advancements.length} advancements`}>
        <i style={{ width: `${pct * 100}%` }} />
        <span className="xp-level">{advCount}</span>
      </div>
      <nav className="hotbar" aria-label="Dimensions">
        {HOTBAR.map((h) => (
          <button
            key={h.key}
            aria-current={h.world === world ? "true" : undefined}
            aria-label={`${h.key}: ${h.label}`}
            onMouseEnter={() => useUi.getState().setTooltip({ title: h.label.split(" — ")[0], lore: [h.label.split(" — ")[1] ?? "", `Key ${h.key}`] })}
            onMouseLeave={() => useUi.getState().setTooltip(null)}
            onClick={() => {
              useUi.getState().setTooltip(null);
              sfx("click");
              h.run();
            }}
          >
            <span className="key">{h.key}</span>
            <ItemIcon id={h.icon} size={32} />
          </button>
        ))}
      </nav>
    </div>
  );
}

function TabBar() {
  const world = useUi((s) => s.world);
  const items: { id: string; icon: string; label: string; run: () => void; cls?: string }[] = [
    { id: "overworld", icon: "grass_block", label: "Home", run: () => travel("overworld") },
    { id: "the-end", icon: "ender_eye", label: "Videos", run: () => travel("the-end") },
    { id: "ancient-city", icon: "echo_shard", label: "Thumbs", run: () => travel("ancient-city") },
    { id: "crafting", icon: "crafting_table", label: "Skills", run: () => travel("crafting") },
    { id: "end-city", icon: "elytra", label: "Career", run: () => travel("end-city") },
    { id: "portal", icon: "ender_pearl", label: "Hire", run: () => travel("portal"), cls: "hire" },
    { id: "more", icon: "map", label: "More", run: () => useUi.getState().open({ type: "selectWorld" }) },
  ];
  return (
    <nav className="tabbar" aria-label="Sections">
      {items.map((i) => (
        <button key={i.id} className={i.cls} aria-current={world === i.id ? "true" : undefined} onClick={i.run}>
          <ItemIcon id={i.icon} size={24} />
          {i.label}
        </button>
      ))}
    </nav>
  );
}

function PoiNav() {
  const pois = useUi((s) => s.pois);
  const idx = useUi((s) => s.poiIndex);
  const [list, setList] = useState(false);
  if (!pois.length) return null;
  const p = pois[idx];
  const go = (i: number) => {
    useUi.getState().goPoi(i);
    sfx("click");
  };
  return (
    <div className="poi-nav" role="navigation" aria-label="Points of interest">
      {list && (
        <div className="poi-list mc-dark" style={{ padding: 6 }}>
          {pois.map((q, i) => (
            <button
              key={q.id}
              aria-current={i === idx ? "true" : undefined}
              onClick={() => {
                go(i);
                setList(false);
              }}
            >
              {q.sprite && <ItemIcon id={q.sprite} size={20} />}
              {q.label}
            </button>
          ))}
        </div>
      )}
      <div className="poi-row">
        <button className="mc-btn icon" aria-label="Previous point of interest" onClick={() => go(idx - 1)}>
          ◀
        </button>
        <button className="poi-current" onClick={() => setList((v) => !v)} aria-expanded={list} aria-label={`Current: ${p.label}. Show all points of interest`}>
          {p.sprite && <ItemIcon id={p.sprite} size={24} />}
          <span>{p.label}</span>
          <span className="c-gray" style={{ marginLeft: "auto" }}>
            {idx + 1}/{pois.length}
          </span>
        </button>
        <button className="mc-btn icon" aria-label="Next point of interest" onClick={() => go(idx + 1)}>
          ▶
        </button>
      </div>
      {p.action && (
        <button
          className="mc-btn wide"
          onClick={() => {
            sfx("click");
            p.action?.();
          }}
        >
          {p.actionLabel ?? "Interact"} <span className="c-gray">↵</span>
        </button>
      )}
    </div>
  );
}

function NextPortal() {
  const world = useUi((s) => s.world);
  if (!world || !isDimensionId(world)) return null;
  const next = nextOnPath(world);
  if (!next) return null;
  const d = dimensionById[next];
  return (
    <div className="next-portal">
      <button className="mc-btn" onClick={() => travel(next)} aria-label={`Next: ${d.name}`}>
        <ItemIcon id={d.icon} size={24} /> Next: {d.short} ▶
      </button>
    </div>
  );
}

function Loader() {
  const loading = useUi((s) => s.loading);
  const tip = useMemo(() => loadingTips[Math.floor(Math.random() * loadingTips.length)], [loading === null]); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading === null) return null;
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-inner">
        <div className="thread" style={{ height: 40 + loading * 160 }} />
        <SpiderGlyph size={48} />
        <p className="shadow" style={{ marginTop: 18 }}>
          Building terrain… {Math.round(loading * 100)}%
        </p>
        <p className="tip">Tip: {tip}</p>
      </div>
    </div>
  );
}

function DimensionCard() {
  const card = useUi((s) => s.card);
  if (!card) return null;
  const d = dimensionById[card];
  return (
    <div className="dim-card" aria-hidden="true">
      <div className="bar" style={{ background: d.accent }} />
      <div className="body">
        <h2>{d.name}</h2>
        <p>{d.tagline}</p>
        <small>{d.coords}</small>
      </div>
    </div>
  );
}

function Transition() {
  const t = useUi((s) => s.transition);
  const [key, setKey] = useState(0);
  useEffect(() => setKey((k) => k + 1), [t.phase]);
  if (t.phase === "idle") return null;
  return <div key={key} className={`transition ${t.kind} ${t.phase}`} />;
}

function F3() {
  const debug = useUi((s) => s.debug);
  const stats = useUi((s) => s.stats);
  const world = useUi((s) => s.world);
  const seen = useProgress((s) => s.seen.length);
  if (!debug) return null;
  return (
    <div className="f3" aria-hidden="true">
      <div>SpiderStudios Editor&apos;s Edition 1.0 (F3)</div>
      <div>{stats.fps} fps · {stats.calls} draw calls · {stats.tris.toLocaleString()} tris</div>
      <div>XYZ: {stats.xyz}</div>
      <div>Dimension: {world}</div>
      <div>Edits viewed: {seen}</div>
      <div>Seed: Jaipur-26.9124N-75.7873E</div>
    </div>
  );
}

export default function Hud() {
  const world = useUi((s) => s.world);
  const menu = useUi((s) => s.menu);
  return (
    <>
      <div className="hud">
        {world === "title" && <TitleMenu />}
        {world === "dressing" && <DressingPanel />}
        <TopBar />
        {world !== "title" && world !== "dressing" && (
          <>
            <PoiNav />
            <Hotbar />
            <TabBar />
            <NextPortal />
          </>
        )}
        <F3 />
      </div>
      <DimensionCard />
      <Transition />
      <Loader />
      {menu === "pause" && <PauseMenu />}
      {menu === "options" && <OptionsMenu />}
      {menu === "help" && <HelpMenu />}
      {menu === "inventory" && <Inventory />}
      {menu === "chat" && <Chat />}
    </>
  );
}
