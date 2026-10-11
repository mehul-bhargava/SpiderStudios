"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ingredients, recipes, targetRounds } from "@/content/games";
import { thumbBySlug } from "@/content/thumbnails";
import { designs } from "@/content/designs";
import { thumbSvg, svgUrl } from "@/engine/placeholders";
import { designUrl } from "@/lib/media";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { useSettings, prefersReducedMotion } from "@/state/settings";
import { sfx } from "@/lib/audio";
import { ItemIcon } from "@/ui/ItemIcon";
import { Head, Modal } from "./Modal";

// ── Craft the Edit ──────────────────────────────────────────────────────────
export function CraftTheEdit() {
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [book, setBook] = useState(false);
  const crafted = useProgress((s) => s.crafted);
  const tip = useUi((s) => s.setTooltip);
  const placed = grid.filter(Boolean) as string[];
  const recipe = useMemo(() => {
    if (placed.length !== 3) return null;
    const key = [...placed].sort().join("|");
    return recipes.find((r) => [...r.needs].sort().join("|") === key) ?? null;
  }, [placed]);
  const add = (id: string) => {
    const i = grid.indexOf(null);
    if (i < 0 || grid.includes(id)) return;
    const g = [...grid];
    g[i] = id;
    setGrid(g);
    sfx("click");
  };
  const take = () => {
    if (!recipe) return;
    sfx("levelup");
    useProgress.getState().craft(recipe.id);
    setGrid(Array(9).fill(null));
    useUi.getState().push({ type: "project", slug: recipe.result });
  };
  const byId = (id: string) => ingredients.find((x) => x.id === id)!;
  return (
    <Modal label="Craft the Edit" variant="panel" size="mid">
      <Head title="Craft the Edit">
        <button className="mc-btn small" onClick={() => setBook((b) => !b)} aria-pressed={book}>
          <ItemIcon id="book" size={18} /> Recipe book
        </button>
      </Head>
      <p style={{ marginTop: 0, fontSize: 14 }}>Combine one clip, one track and one effect. Each recipe crafts a real finished edit.</p>
      <div className="craft" style={{ margin: "16px 0" }}>
        <div className="craft-grid" role="grid" aria-label="Crafting grid">
          {grid.map((g, i) => (
            <button
              key={i}
              className="mc-slot"
              aria-label={g ? `Remove ${byId(g).name}` : "Empty slot"}
              onClick={() => {
                if (!g) return;
                const n = [...grid];
                n[i] = null;
                setGrid(n);
              }}
              onMouseEnter={() => g && tip({ title: byId(g).name, lore: [byId(g).lore] })}
              onMouseLeave={() => tip(null)}
            >
              {g && <ItemIcon id={byId(g).sprite} size={36} />}
            </button>
          ))}
        </div>
        <span className="arrow-r" aria-hidden="true">
          ➜
        </span>
        <div className="craft-out">
          <button className="mc-slot" disabled={!recipe} onClick={take} aria-label={recipe ? `Take ${recipe.name}` : "Output (empty)"} style={recipe ? { background: "#b8a6c9" } : undefined}>
            {recipe && <ItemIcon id="clapper" size={44} />}
          </button>
          <p style={{ fontSize: 13, textAlign: "center", minHeight: 18, margin: "6px 0 0" }}>{recipe ? recipe.name : placed.length === 3 ? "No recipe" : ""}</p>
        </div>
      </div>
      {(["clip", "music", "effect"] as const).map((kind) => (
        <div key={kind} style={{ marginBottom: 8 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, textTransform: "capitalize" }}>{kind === "music" ? "Music" : kind + "s"}</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {ingredients
              .filter((x) => x.kind === kind)
              .map((x) => (
                <button key={x.id} className={`mc-slot ${grid.includes(x.id) ? "dim" : ""}`} aria-label={`Add ${x.name}`} onClick={() => add(x.id)} onMouseEnter={() => tip({ title: x.name, lore: [x.lore] })} onMouseLeave={() => tip(null)}>
                  <ItemIcon id={x.sprite} size={32} />
                </button>
              ))}
          </div>
        </div>
      ))}
      {book && (
        <div className="mc-dark" style={{ marginTop: 10 }}>
          <p style={{ marginTop: 0 }}>Recipe book — click one to fill the grid.</p>
          <div style={{ display: "grid", gap: 6 }}>
            {recipes.map((r) => (
              <button key={r.id} className="mc-btn small" style={{ justifyContent: "flex-start" }} onClick={() => setGrid([...r.needs, null, null, null, null, null, null])}>
                {r.needs.map((n) => (
                  <ItemIcon key={n} id={byId(n).sprite} size={20} />
                ))}
                ➜ {r.name} {crafted.includes(r.id) && <span className="c-green">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      <p style={{ fontSize: 12, marginBottom: 0 }}>Crafted {crafted.length}/{recipes.length}</p>
    </Modal>
  );
}

// ── Thumbnail Target Practice ───────────────────────────────────────────────
export function TargetPractice() {
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = round >= targetRounds.length;
  const r = targetRounds[Math.min(round, targetRounds.length - 1)];
  const urls = useMemo(() => r.options.map((o, i) => svgUrl(thumbSvg(o.art, { seed: `${round}-${i}` }))), [r, round]);
  useEffect(() => {
    if (done) useProgress.getState().unlock("bullseye");
  }, [done]);
  if (done)
    return (
      <Modal label="Target practice results" size="narrow">
        <Head title="Bullseye!" />
        <p className="readable">
          You matched {score}/{targetRounds.length} briefs. Every pick taught something — that&apos;s exactly how Mehul reviews his own drafts.
        </p>
        <div style={{ display: "grid", gap: 6 }}>
          {targetRounds.map((t) => (
            <button key={t.reveal} className="mc-btn small" style={{ justifyContent: "flex-start" }} onClick={() => useUi.getState().open({ type: "thumb", slug: t.reveal })}>
              ▶ See the real one: {thumbBySlug[t.reveal]?.title}
            </button>
          ))}
          <button
            className="mc-btn small"
            onClick={() => {
              setRound(0);
              setScore(0);
              setPick(null);
            }}
          >
            Play again
          </button>
        </div>
      </Modal>
    );
  return (
    <Modal label="Thumbnail Target Practice">
      <Head title={`Target Practice · Round ${round + 1}/${targetRounds.length}`} />
      <div className="mc-tooltip readable" style={{ maxWidth: "none", marginBottom: 12 }}>
        <span className="c-yellow">The brief:</span> {r.brief}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {r.options.map((o, i) => {
          const chosen = pick === i;
          const best = pick !== null && i === r.best;
          return (
            <div key={i}>
              <button
                className="work-card"
                style={{ width: "100%", boxShadow: best ? "inset 0 0 0 3px #55ff55" : chosen ? "inset 0 0 0 3px #ff5555" : undefined }}
                disabled={pick !== null}
                data-autofocus={i === 0 ? true : undefined}
                onClick={() => {
                  setPick(i);
                  if (i === r.best) {
                    setScore((s) => s + 1);
                    sfx("levelup");
                  } else sfx("error");
                }}
                aria-label={`Option ${i + 1}`}
              >
                <div className="thumb" style={{ outline: "4px solid #d42a2a", outlineOffset: -4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls[i]} alt={`Option ${i + 1}`} />
                </div>
                <span className="name">🎯 Option {i + 1}</span>
              </button>
              {pick !== null && (
                <p className="readable" style={{ fontSize: 13 }}>
                  <b className={i === r.best ? "c-green" : "c-gray"}>{i === r.best ? "Best fit. " : ""}</b>
                  {o.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {pick !== null && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className="mc-btn"
            data-autofocus
            onClick={() => {
              setPick(null);
              setRound((x) => x + 1);
            }}
          >
            {round + 1 < targetRounds.length ? "Next round ▶" : "Finish"}
          </button>
          <button className="mc-btn" onClick={() => useUi.getState().push({ type: "thumb", slug: r.reveal })}>
            See the real thumbnail
          </button>
        </div>
      )}
    </Modal>
  );
}

// ── Spike Defuse ────────────────────────────────────────────────────────────
export function SpikeDefuse() {
  const [prog, setProg] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const half = useRef(false);
  const reduced = prefersReducedMotion(useSettings((s) => s.motion));
  const DURATION = reduced ? 1.5 : 4;
  useEffect(() => {
    if (!holding || done) return;
    let raf = 0;
    let last = performance.now();
    let beepAt = 0;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setProg((p) => {
        const n = Math.min(1, p + dt / DURATION);
        if (n >= 0.5) half.current = true;
        if (n >= 1) {
          setDone(true);
          setHolding(false);
          sfx("defused");
          useProgress.getState().unlock("ace");
        }
        return n;
      });
      beepAt -= dt;
      if (beepAt <= 0) {
        sfx("beep");
        beepAt = 0.35;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holding, done, DURATION]);
  const release = () => {
    setHolding(false);
    if (!done) setProg((p) => (half.current ? Math.max(0.5, p) : 0));
  };
  return (
    <Modal label="Defuse the spike" size="narrow">
      <Head title={<span className="c-red">Spike Site A</span>} />
      <div className="spike-ui">
        {done ? (
          <>
            <div className="ace">ACE</div>
            <p>Spike defused. Round won.</p>
            <button className="mc-btn red" data-autofocus onClick={() => useUi.getState().open({ type: "project", slug: "ace-montage" })}>
              Watch the ACE montage ▶
            </button>
          </>
        ) : (
          <>
            <ItemIcon id="spike" size={96} />
            <p className="readable">Hold the button (or Space) to defuse. Progress saves at the halfway mark.</p>
            <div className="defuse-bar" aria-hidden="true">
              <i style={{ width: `${prog * 100}%` }} />
            </div>
            <button
              className="mc-btn red wide"
              data-autofocus
              aria-label="Hold to defuse"
              onPointerDown={() => setHolding(true)}
              onPointerUp={release}
              onPointerLeave={release}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  setHolding(true);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") release();
              }}
            >
              {holding ? `Defusing… ${Math.round(prog * 100)}%` : "HOLD TO DEFUSE"}
            </button>
            <p style={{ marginTop: 14 }}>
              <button className="mc-btn small" onClick={() => useUi.getState().open({ type: "project", slug: "ace-montage" })}>
                Skip — just show me the montage
              </button>
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}

// ── Archaeology ─────────────────────────────────────────────────────────────
function Dig({ slug, onDone }: { slug: string; onDone: () => void }) {
  const d = designs.find((x) => x.slug === slug)!;
  const ref = useRef<HTMLCanvasElement>(null);
  const [cleared, setCleared] = useState(false);
  const strokes = useRef(0);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    for (let y = 0; y < c.height; y += 8)
      for (let x = 0; x < c.width; x += 8) {
        const v = Math.random();
        ctx.fillStyle = v < 0.25 ? "#d6c48c" : v < 0.5 ? "#dccb94" : v < 0.75 ? "#e3d4a0" : "#c9b47a";
        ctx.fillRect(x, y, 8, 8);
      }
  }, [slug]);
  const brush = (x: number, y: number, r = 34) => {
    const c = ref.current;
    if (!c || cleared) return;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 6; i++) {
      const bx = Math.round((x + (Math.random() - 0.5) * r) / 8) * 8;
      const by = Math.round((y + (Math.random() - 0.5) * r) / 8) * 8;
      ctx.fillRect(bx, by, 16, 16);
    }
    strokes.current++;
    if (strokes.current % 25 === 0) {
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
      if (clear / (data.length / 64) > 0.55) {
        ctx.clearRect(0, 0, c.width, c.height);
        setCleared(true);
        sfx("levelup");
        onDone();
      }
    }
  };
  const fromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * e.currentTarget.width, ((e.clientY - r.top) / r.height) * e.currentTarget.height] as const;
  };
  return (
    <div>
      <div style={{ position: "relative", width: "100%", maxWidth: 420, aspectRatio: "1", margin: "0 auto", border: "2px solid #000" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={designUrl(d)} alt={d.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <canvas
          ref={ref}
          width={320}
          height={320}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "crosshair", touchAction: "none", imageRendering: "pixelated" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const [x, y] = fromEvent(e);
            brush(x, y);
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1 && e.pointerType === "mouse") return;
            const [x, y] = fromEvent(e);
            brush(x, y);
          }}
          aria-label="Suspicious sand — drag to brush it away"
        />
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
        <button className="mc-btn small" onClick={() => [...Array(12)].forEach(() => brush(Math.random() * 320, Math.random() * 320, 60))}>
          <ItemIcon id="brush" size={18} /> Brush
        </button>
        <button
          className="mc-btn small"
          onClick={() => {
            const c = ref.current;
            c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
            if (!cleared) {
              setCleared(true);
              onDone();
            }
          }}
        >
          Uncover all
        </button>
      </div>
      {cleared && (
        <div className="readable" style={{ marginTop: 12 }}>
          <h3 style={{ margin: "0 0 4px" }}>{d.title}</h3>
          {d.client && <p className="c-aqua" style={{ margin: 0 }}>{d.client}</p>}
          <p className="prose">{d.description}</p>
        </div>
      )}
    </div>
  );
}

export function Archaeology() {
  const [slug, setSlug] = useState(designs[0].slug);
  const brushed = useProgress((s) => s.brushed);
  return (
    <Modal label="Archaeology Wing" size="mid">
      <Head title="Archaeology Wing" />
      <p className="readable" style={{ marginTop: 0 }}>
        Branding & social design, buried in suspicious sand. Drag (or press Brush) to uncover each piece.
      </p>
      <div className="chips" style={{ marginBottom: 12 }}>
        {designs.map((d) => (
          <button key={d.slug} className={`mc-btn small ${slug === d.slug ? "selected" : ""}`} onClick={() => setSlug(d.slug)}>
            {brushed.includes(d.slug) ? "✓ " : ""}
            {d.title}
          </button>
        ))}
      </div>
      <Dig key={slug} slug={slug} onDone={() => useProgress.getState().brush(slug)} />
    </Modal>
  );
}

