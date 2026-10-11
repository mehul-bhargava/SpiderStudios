"use client";
import { useEffect, useMemo, useState } from "react";
import { projects, categoryLabels, categorySprites, categoriesWithWork, type VideoCategory } from "@/content/projects";
import { thumbnails, collectionLabels, type Thumbnail } from "@/content/thumbnails";
import { useUi } from "@/state/ui";
import { useProgress } from "@/state/progress";
import { thumbUrl } from "@/lib/media";
import { posterUrl } from "@/lib/posters";
import { ItemIcon } from "@/ui/ItemIcon";
import { Head, Modal } from "./Modal";

function Poster({ slug }: { slug: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const p = projects.find((x) => x.slug === slug);
    if (p) setSrc(posterUrl(p));
  }, [slug]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" /> : null;
}

export function Browse({ scope: initial, filter: initialFilter }: { scope: "videos" | "thumbs"; filter?: string }) {
  const [scope, setScope] = useState(initial);
  const [filter, setFilter] = useState<string>(initialFilter ?? "all");
  const [q, setQ] = useState("");
  const seen = useProgress((s) => s.seen);
  const open = useUi((s) => s.open);

  const cats = useMemo(() => categoriesWithWork(projects.filter((p) => !p.locked)), []);
  const cols = useMemo(() => [...new Set(thumbnails.map((t) => t.collection))], []);

  const vids = projects
    .filter((p) => !p.locked)
    .filter((p) => filter === "all" || p.categories.includes(filter as VideoCategory))
    .filter((p) => !q || (p.title + p.description + p.techniques.join(" ")).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.rarity === "epic" ? 1 : 0) - (a.rarity === "epic" ? 1 : 0));
  const thumbs = thumbnails
    .filter((t) => filter === "all" || t.collection === filter)
    .filter((t) => !q || (t.title + t.brief + t.collection).toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal label={scope === "videos" ? "Browse edits" : "Browse thumbnails"}>
      <Head title={scope === "videos" ? "Edit Inventory" : "Thumbnail Inventory"}>
        <button
          className={`mc-btn small ${scope === "videos" ? "selected" : ""}`}
          onClick={() => {
            setScope("videos");
            setFilter("all");
          }}
        >
          Edits
        </button>
        <button
          className={`mc-btn small ${scope === "thumbs" ? "selected" : ""}`}
          onClick={() => {
            setScope("thumbs");
            setFilter("all");
          }}
        >
          Thumbnails
        </button>
      </Head>
      <div className="mc-tabs" role="tablist" aria-label="Filter" style={{ marginBottom: 8 }}>
        <button role="tab" className="mc-tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>
          <ItemIcon id="chest" size={18} /> All
        </button>
        {scope === "videos"
          ? cats.map((c) => (
              <button key={c} role="tab" className="mc-tab" aria-selected={filter === c} onClick={() => setFilter(c)}>
                <ItemIcon id={categorySprites[c]} size={18} /> {categoryLabels[c]}
              </button>
            ))
          : cols.map((c) => (
              <button key={c} role="tab" className="mc-tab" aria-selected={filter === c} onClick={() => setFilter(c)}>
                <ItemIcon id="echo_shard" size={18} /> {collectionLabels[c as Thumbnail["collection"]]}
              </button>
            ))}
      </div>
      <input className="mc-input" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search work" data-autofocus style={{ marginBottom: 12 }} />
      <div className="card-grid">
        {scope === "videos"
          ? vids.map((p) => (
              <button key={p.slug} className={`work-card ${p.rarity === "epic" ? "glint" : ""}`} onClick={() => open({ type: "project", slug: p.slug })}>
                <div className="thumb">
                  <Poster slug={p.slug} />
                </div>
                <span className={`name rarity-${p.rarity}`}>
                  {p.title} {seen.includes(p.slug) && <span className="c-green">✓</span>}
                </span>
                <span className="meta">
                  {p.platform} · {p.categories.map((c) => categoryLabels[c]).join(", ")}
                  {p.sample ? " · SAMPLE" : ""}
                </span>
              </button>
            ))
          : thumbs.map((t) => (
              <button key={t.slug} className={`work-card ${t.rarity === "epic" ? "glint" : ""}`} onClick={() => open({ type: "thumb", slug: t.slug })}>
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl(t)} alt="" loading="lazy" />
                </div>
                <span className={`name rarity-${t.rarity}`}>
                  {t.title} {seen.includes(t.slug) && <span className="c-green">✓</span>}
                </span>
                <span className="meta">
                  {collectionLabels[t.collection]}
                  {t.sample ? " · SAMPLE" : ""}
                </span>
              </button>
            ))}
      </div>
      {(scope === "videos" ? vids : thumbs).length === 0 && <p className="c-gray">Nothing matches that search.</p>}
    </Modal>
  );
}
