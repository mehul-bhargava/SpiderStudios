"use client";
import { useEffect, useState } from "react";
import { dimensions, type DimensionId } from "@/content/dimensions";
import { projects } from "@/content/projects";
import { thumbnails, thumbBySlug } from "@/content/thumbnails";
import { skillStations, creatorSkills } from "@/content/skills";
import { tools, toolById } from "@/content/tools";
import { webProjects, designs } from "@/content/designs";
import { sortedMilestones } from "@/content/career";
import { chests } from "@/content/games";
import { projectBySlug } from "@/content/projects";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { designUrl, thumbUrl } from "@/lib/media";
import { ItemIcon } from "@/ui/ItemIcon";
import { Head, Modal } from "./Modal";

/** Follow an internal evidence link: overlays, worlds or games. */
export function followLink(href: string) {
  const ui = useUi.getState();
  if (href === "#game:craft") return ui.open({ type: "craft" });
  const m = href.match(/^\/(the-end|nether|lab|ancient-city)\/([\w-]+)$/);
  if (m) {
    if (thumbBySlug[m[2]]) return ui.open({ type: "thumb", slug: m[2] });
    if (projectBySlug[m[2]]) return ui.open({ type: "project", slug: m[2] });
  }
  const web = href.match(/#(streamico|sid-and-co)$/);
  if (web) return ui.open({ type: "web", slug: web[1] });
  const path = href.split(/[?#]/)[0];
  if (path.includes("ancient-city") && href.includes("archaeology")) return ui.open({ type: "archaeology" });
  travel(path);
}

export function SelectWorld() {
  const visited = useProgress((s) => s.visited);
  const [sel, setSel] = useState<DimensionId>("the-end");
  const counts: Partial<Record<DimensionId, string>> = {
    "the-end": `${projects.filter((p) => p.home === "the-end" && !p.locked).length} edits`,
    nether: `${projects.filter((p) => p.home === "nether").length} edits`,
    "ancient-city": `${thumbnails.length} thumbnails · ${designs.length} designs`,
    crafting: `${skillStations.length} skills · ${tools.length} tools`,
    "end-city": `${sortedMilestones.length} milestones`,
    overworld: "About Mehul · quest",
    portal: "Contact · hire",
    lab: "Secret · WIP",
  };
  const list = dimensions.filter((d) => !d.secret || visited.includes(d.id));
  return (
    <Modal label="Select World" size="mid">
      <Head title="Select World" />
      <div role="listbox" aria-label="Worlds" style={{ display: "grid", gap: 4, maxHeight: "60vh", overflow: "auto" }}>
        {list.map((d) => (
          <button
            key={d.id}
            role="option"
            aria-selected={sel === d.id}
            onClick={() => setSel(d.id)}
            onDoubleClick={() => travel(d.id)}
            data-autofocus={sel === d.id ? true : undefined}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr auto",
              gap: 12,
              alignItems: "center",
              textAlign: "left",
              padding: 8,
              background: sel === d.id ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.35)",
              border: `2px solid ${sel === d.id ? "#fff" : "transparent"}`,
              cursor: "pointer",
            }}
          >
            <span className="mc-slot" style={{ width: 52, height: 52 }}>
              <ItemIcon id={d.icon} size={36} />
            </span>
            <span>
              <span style={{ color: d.accent }}>{d.name}</span>
              <br />
              <span className="c-gray" style={{ fontSize: 13 }}>
                {d.purpose} · {counts[d.id]}
              </span>
            </span>
            <span style={{ fontSize: 12 }} className={visited.includes(d.id) ? "c-gray" : "c-yellow"}>
              {visited.includes(d.id) ? "Visited" : "New!"}
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        <button className="mc-btn" onClick={() => travel(sel)}>
          Play Selected World
        </button>
        <button className="mc-btn" onClick={() => useUi.getState().close()}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export function StationPanel({ id }: { id: string }) {
  const s = skillStations.find((x) => x.id === id);
  if (!s) return null;
  return (
    <Modal label={s.name} size="narrow">
      <Head title={<span className="c-yellow">{s.stationName}</span>} />
      <div className="readable">
        <h3 style={{ marginTop: 0 }}>{s.name}</h3>
        <p className="prose">{s.description}</p>
        <div className="chips" style={{ marginBottom: 14 }}>
          {s.skills.map((k) => (
            <span key={k} className="chip">
              {k}
            </span>
          ))}
        </div>
        {s.id === "video" && (
          <p className="c-gray" style={{ fontSize: 13 }}>
            Also on the resume: {creatorSkills.join(" · ")}
          </p>
        )}
        <h4 style={{ marginBottom: 6 }}>Proof</h4>
        <div style={{ display: "grid", gap: 6 }}>
          {s.evidence.map((e) => (
            <button key={e.label} className="mc-btn small" style={{ justifyContent: "flex-start" }} onClick={() => followLink(e.href)}>
              ▶ {e.label}
            </button>
          ))}
        </div>
        <p className="c-gray" style={{ fontSize: 12, marginTop: 14 }}>
          No percentage bars here — every skill links to the work that shows it.
        </p>
      </div>
    </Modal>
  );
}

export function ToolsPanel() {
  const [sel, setSel] = useState(tools[0].id);
  const t = toolById[sel];
  useEffect(() => {
    useProgress.getState().seeTool(sel, tools.length);
  }, [sel]);
  return (
    <Modal label="Tool chest" size="mid" variant="panel">
      <Head title="Tool Chest" />
      <div className="inv-grid" style={{ gridTemplateColumns: "repeat(6, 52px)", marginBottom: 14 }}>
        {tools.map((x) => (
          <button key={x.id} className="mc-slot" style={{ width: 52, height: 52, background: sel === x.id ? "#a8a8a8" : undefined }} aria-pressed={sel === x.id} aria-label={x.name} onClick={() => setSel(x.id)} data-autofocus={x.id === tools[0].id ? true : undefined}>
            <ItemIcon id={x.sprite} size={36} />
          </button>
        ))}
      </div>
      <div className="mc-tooltip readable" style={{ maxWidth: "none" }}>
        <div className="c-aqua" style={{ fontSize: 16 }}>
          {t.item}
        </div>
        <div style={{ color: "#fff" }}>{t.name}</div>
        <div className="lore" style={{ margin: "6px 0 10px" }}>
          {t.usedFor}
        </div>
        <div className="chips">
          {t.evidence.map((slug) => {
            const label = projectBySlug[slug]?.title ?? thumbBySlug[slug]?.title ?? designs.find((d) => d.slug === slug)?.title ?? webProjects.find((w) => w.slug === slug)?.title ?? slug;
            return (
              <button
                key={slug}
                className="chip"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (projectBySlug[slug]) useUi.getState().push({ type: "project", slug });
                  else if (thumbBySlug[slug]) useUi.getState().push({ type: "thumb", slug });
                  else if (designs.find((d) => d.slug === slug)) useUi.getState().push({ type: "design", slug });
                  else useUi.getState().push({ type: "web", slug });
                }}
              >
                ▶ {label}
              </button>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, marginBottom: 0 }}>Item names are original pixel stand-ins; tooltips name the real software.</p>
    </Modal>
  );
}

export function WebPanel({ slug }: { slug: string }) {
  const w = webProjects.find((x) => x.slug === slug);
  if (!w) return null;
  return (
    <Modal label={w.title} size="narrow">
      <Head title={<span className="c-red">{w.title}</span>} />
      <div className="readable">
        <p className="c-gray" style={{ marginTop: 0 }}>
          {w.role}
          {w.date !== "TBD" ? ` · ${w.date}` : ""}
        </p>
        <p className="prose">{w.summary}</p>
        <ul className="prose">
          {w.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="chips">
          {w.tools.map((t) => (
            <span key={t} className="chip">
              <ItemIcon id={toolById[t].sprite} size={16} /> {toolById[t].name}
            </span>
          ))}
        </div>
        {w.url && (
          <p>
            <a className="mc-btn small" href={w.url} target="_blank" rel="noreferrer">
              Visit site ↗
            </a>
          </p>
        )}
      </div>
    </Modal>
  );
}

export function MilestonePanel({ id }: { id: string }) {
  const i = sortedMilestones.findIndex((m) => m.id === id);
  const m = sortedMilestones[i];
  if (!m) return null;
  const nextM = sortedMilestones[i + 1];
  return (
    <Modal label={m.title} size="narrow">
      <Head title={<span className="c-yellow">Checkpoint {i + 1}</span>} />
      <div className="readable" style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 14 }}>
        <span className="mc-slot" style={{ width: 52, height: 52 }}>
          <ItemIcon id={m.icon} size={36} />
        </span>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>{m.title}</h3>
          <p className="c-gray" style={{ margin: "0 0 10px" }}>
            {[m.org, m.date === "TBD" ? null : m.date].filter(Boolean).join(" · ")}
          </p>
          <p className="prose">{m.body}</p>
          {m.bullets && (
            <ul className="prose">
              {m.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {nextM ? (
          <button
            className="mc-btn small"
            data-autofocus
            onClick={() => {
              const ui = useUi.getState();
              ui.close();
              ui.focusPoi(`m-${nextM.id}`);
            }}
          >
            Jump to next checkpoint ▲
          </button>
        ) : (
          <button
            className="mc-btn small"
            data-autofocus
            onClick={() => {
              const ui = useUi.getState();
              ui.close();
              ui.focusPoi("ship");
            }}
          >
            Climb to the End Ship ▲
          </button>
        )}
        <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "timeline" })}>
          Full timeline
        </button>
      </div>
    </Modal>
  );
}

export function Timeline() {
  return (
    <Modal label="Career timeline" size="mid">
      <Head title="Career Timeline" />
      <ol className="timeline readable">
        {sortedMilestones.map((m) => (
          <li key={m.id}>
            <span className="mc-slot">
              <ItemIcon id={m.icon} size={30} />
            </span>
            <div>
              <b>{m.title}</b>
              <div className="c-gray" style={{ fontSize: 13 }}>
                {[m.org, m.date].filter(Boolean).join(" · ")}
              </div>
              <div style={{ fontSize: 14, marginTop: 4 }}>{m.body}</div>
            </div>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: 14 }}>
        <button className="mc-btn red" onClick={() => travel("portal")}>
          Next milestone: your project →
        </button>
      </div>
    </Modal>
  );
}

export function DesignPanel({ slug }: { slug: string }) {
  const d = designs.find((x) => x.slug === slug);
  if (!d) return null;
  return (
    <Modal label={d.title} size="mid">
      <Head
        title={
          <>
            {d.title} {d.sample && <span className="badge-sample">SAMPLE</span>}
          </>
        }
      />
      <div className="grid-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={designUrl(d)} alt={d.title} style={{ width: "100%", border: "2px solid #000" }} />
        <div className="readable">
          {d.client && <p className="c-aqua">{d.client}</p>}
          <p className="prose">{d.description}</p>
          <div className="chips">
            {d.tools.map((t) => (
              <span key={t} className="chip">
                <ItemIcon id={toolById[t].sprite} size={16} /> {toolById[t].name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ChestLoot({ id }: { id: string }) {
  const c = chests.find((x) => x.id === id);
  const already = useProgress((s) => s.chests.includes(id));
  const [fresh] = useState(!already);
  useEffect(() => {
    if (!c) return;
    sfx("chest");
    const p = useProgress.getState();
    p.openChest(id);
    if (c.frame !== null) p.collectFrame(c.frame);
  }, [c, id]);
  if (!c) return null;
  const loot = c.loot;
  let label = "";
  let icon = "book";
  let run: (() => void) | null = null;
  if (loot.kind === "project") {
    label = projectBySlug[loot.slug]?.title ?? loot.slug;
    icon = "clapper";
    run = () => useUi.getState().open({ type: "project", slug: loot.slug });
  } else if (loot.kind === "thumb") {
    label = thumbBySlug[loot.slug]?.title ?? loot.slug;
    icon = "echo_shard";
    run = () => useUi.getState().open({ type: "thumb", slug: loot.slug });
  } else if (loot.kind === "page") {
    label = loot.label;
    icon = "map";
    run = () => followLink(loot.href);
  } else label = loot.text;
  return (
    <Modal label="Chest" size="narrow" variant="panel">
      <Head title="Chest" />
      <p style={{ marginTop: 0 }}>{fresh ? "You found:" : "Inside, still:"}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className="mc-slot" style={{ width: 52, height: 52 }}>
          <ItemIcon id={icon} size={36} />
        </span>
        {c.frame !== null && (
          <span className="mc-slot" style={{ width: 52, height: 52 }} title="Lost Frame">
            <ItemIcon id="film_frame" size={36} />
          </span>
        )}
      </div>
      <p style={{ fontSize: 15 }}>{label}</p>
      {c.frame !== null && <p style={{ fontSize: 13 }}>+ a Lost Frame ({useProgress.getState().frames.length}/8). Collect all eight for a secret reel.</p>}
      {run && (
        <button className="mc-btn" onClick={run} data-autofocus>
          Take a look ▶
        </button>
      )}
    </Modal>
  );
}

export function Dialog({ speaker, text, actions }: { speaker: string; text: string; actions?: { label: string; run: () => void }[] }) {
  return (
    <div className="dialog mc-dark" role="dialog" aria-label={`${speaker} says`}>
      <div className="speaker">{speaker}</div>
      <div className="readable" style={{ lineHeight: 1.6 }}>
        {text}
      </div>
      <div className="actions">
        {actions?.map((a, i) => (
          <button
            key={a.label}
            className="mc-btn small"
            autoFocus={i === 0}
            onClick={() => {
              sfx("click");
              useUi.getState().close();
              a.run();
            }}
          >
            {a.label}
          </button>
        ))}
        <button className="mc-btn small" autoFocus={!actions?.length} onClick={() => useUi.getState().close()}>
          {actions?.length ? "Later" : "OK"}
        </button>
      </div>
    </div>
  );
}
