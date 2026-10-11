"use client";
import { useEffect, useState } from "react";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { usePlayer } from "@/state/player";
import { advancements } from "@/content/advancements";
import { projects } from "@/content/projects";
import { thumbnails } from "@/content/thumbnails";
import { chests, FRAME_COUNT } from "@/content/games";
import { dimensionById, goldenPath } from "@/content/dimensions";
import { travel } from "@/lib/nav";
import { ItemIcon } from "@/ui/ItemIcon";
import { SkinPreview } from "@/ui/SkinPreview";

type Tab = "explorer" | "collection" | "advancements" | "frames" | "map";

export function Inventory() {
  const [tab, setTab] = useState<Tab>("explorer");
  const setMenu = useUi((s) => s.setMenu);
  const p = useProgress();
  const player = usePlayer();
  const tip = useUi((s) => s.setTooltip);
  useEffect(() => {
    useProgress.getState().unlock("inventory");
    return () => useUi.getState().setTooltip(null);
  }, []);
  const titles = advancements.filter((a) => a.title && p.advancements[a.title ? a.id : ""]).map((a) => a.title!);

  const tabs: [Tab, string, string][] = [
    ["explorer", "Explorer", "player_head"],
    ["collection", "Collection", "chest"],
    ["advancements", "Advancements", "book"],
    ["frames", "Lost Frames", "film_frame"],
    ["map", "Treasure Map", "map"],
  ];

  return (
    <div className="menu-screen" role="dialog" aria-modal="true" aria-label="Inventory" onClick={(e) => e.target === e.currentTarget && setMenu(null)}>
      <div style={{ width: "min(820px, 100%)" }}>
        <div className="mc-tabs" role="tablist">
          {tabs.map(([id, label, icon]) => (
            <button key={id} role="tab" aria-selected={tab === id} className="mc-tab" onClick={() => setTab(id)}>
              <ItemIcon id={icon} size={20} />
              <span className="hide-m">{label}</span>
            </button>
          ))}
        </div>
        <div className="mc-panel" style={{ maxHeight: "72vh", overflow: "auto" }}>
          <div className="overlay-head">
            <h2>{tabs.find((t) => t[0] === tab)?.[1]}</h2>
            <button className="mc-btn icon close-x" onClick={() => setMenu(null)} aria-label="Close inventory" autoFocus>
              ✕
            </button>
          </div>

          {tab === "explorer" && (
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
              <div style={{ background: "#000", padding: 12, border: "2px solid #000", boxShadow: "inset 0 0 0 2px #555" }}>
                <SkinPreview config={player.config} scale={6} />
              </div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 18 }}>Player Card</p>
                <p style={{ margin: "0 0 12px" }}>
                  Title: <b>{player.title ?? "Explorer"}</b>
                </p>
                {titles.length > 0 ? (
                  <div className="chips" style={{ marginBottom: 12 }}>
                    {["Explorer", ...titles].map((t) => (
                      <button key={t} className={`mc-btn small ${(player.title ?? "Explorer") === t ? "selected" : ""}`} onClick={() => player.setTitle(t === "Explorer" ? null : t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13 }}>Earn advancements to unlock titles.</p>
                )}
                <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 18 }}>
                  <li>
                    Dimensions visited: {p.visited.filter((v) => goldenPath.includes(v)).length}/{goldenPath.length}
                  </li>
                  <li>Work viewed: {p.seen.length}</li>
                  <li>
                    Advancements: {Object.keys(p.advancements).length}/{advancements.length}
                  </li>
                  <li>
                    Lost Frames: {p.frames.length}/{FRAME_COUNT}
                  </li>
                </ul>
                <button className="mc-btn" onClick={() => travel("dressing")}>
                  Open Dressing Room
                </button>
              </div>
            </div>
          )}

          {tab === "collection" && (
            <>
              <p style={{ fontSize: 13, marginTop: 0 }}>Everything is open — ticked items are the ones you have already looked at.</p>
              <h3 style={{ fontSize: 15 }}>Edits</h3>
              <div className="inv-grid">
                {projects
                  .filter((x) => !x.locked)
                  .map((x) => (
                    <button
                      key={x.slug}
                      className="mc-slot"
                      aria-label={x.title}
                      onMouseEnter={() => tip({ title: x.title, rarity: x.rarity, lore: [x.platform, dimensionById[x.home].name] })}
                      onMouseLeave={() => tip(null)}
                      onClick={() => {
                        setMenu(null);
                        useUi.getState().open({ type: "project", slug: x.slug });
                      }}
                    >
                      <ItemIcon id={x.aspect === "9:16" ? "phone" : "clapper"} size={32} />
                      {p.seen.includes(x.slug) && <span className="check">✓</span>}
                    </button>
                  ))}
              </div>
              <h3 style={{ fontSize: 15 }}>Thumbnails</h3>
              <div className="inv-grid">
                {thumbnails.map((t) => (
                  <button
                    key={t.slug}
                    className="mc-slot"
                    aria-label={t.title}
                    onMouseEnter={() => tip({ title: t.title, rarity: t.rarity, lore: [t.client ?? "Own work"] })}
                    onMouseLeave={() => tip(null)}
                    onClick={() => {
                      setMenu(null);
                      useUi.getState().open({ type: "thumb", slug: t.slug });
                    }}
                  >
                    <ItemIcon id="echo_shard" size={32} />
                    {p.seen.includes(t.slug) && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === "advancements" && (
            <div className="inv-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}>
              {advancements.map((a) => {
                const got = !!p.advancements[a.id];
                return (
                  <button
                    key={a.id}
                    className={`mc-slot ${got ? "" : "dim"}`}
                    style={{ width: 52, height: 52, background: got ? (a.kind === "challenge" ? "#7a3a8a" : a.kind === "goal" ? "#3a6a8a" : "#c9a43a") : undefined }}
                    aria-label={`${a.name}: ${a.desc}${got ? " (earned)" : ""}`}
                    onMouseEnter={() => tip({ title: a.name, color: got ? "#55ff55" : "#aaaaaa", lore: [a.desc, a.title ? `Unlocks title: ${a.title}` : ""] })}
                    onMouseLeave={() => tip(null)}
                    onFocus={() => tip({ title: a.name, lore: [a.desc] })}
                    onBlur={() => tip(null)}
                  >
                    <ItemIcon id={a.icon} size={32} />
                  </button>
                );
              })}
            </div>
          )}

          {tab === "frames" && (
            <>
              <p style={{ fontSize: 14, marginTop: 0 }}>
                Collect all {FRAME_COUNT} Lost Frames to unlock the blooper reel in the Snapshot Lab. One hangs off the title-screen logo; the rest hide in chests.
              </p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {Array.from({ length: FRAME_COUNT }, (_, i) => (
                  <span key={i} className={`mc-slot ${p.frames.includes(i) ? "" : "dim"}`} style={{ width: 52, height: 52 }} aria-label={`Lost Frame ${i + 1} ${p.frames.includes(i) ? "found" : "missing"}`}>
                    <ItemIcon id="film_frame" size={36} />
                  </span>
                ))}
              </div>
            </>
          )}

          {tab === "map" && (
            <ul className="timeline">
              {chests.map((c) => {
                const opened = p.chests.includes(c.id);
                const dim = c.dimension === "title" ? null : dimensionById[c.dimension];
                return (
                  <li key={c.id}>
                    <span className={`mc-slot ${opened ? "" : "dim"}`}>
                      <ItemIcon id="chest" size={32} />
                    </span>
                    <div>
                      <b>{dim?.name}</b> — {c.hint} {opened ? <span className="c-green" style={{ color: "#2a7a1a" }}>✓ opened</span> : null}
                      <br />
                      <button className="mc-btn small" style={{ marginTop: 6 }} onClick={() => dim && travel(dim.id)}>
                        Travel there
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
