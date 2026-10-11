import Link from "next/link";
import { chapters } from "@/content/about";
import { site } from "@/content/site";
import { projects, projectsIn, categoryLabels, type VideoProject } from "@/content/projects";
import { thumbnails, collectionLabels } from "@/content/thumbnails";
import { designs, webProjects } from "@/content/designs";
import { skillStations } from "@/content/skills";
import { tools } from "@/content/tools";
import { sortedMilestones } from "@/content/career";
import { dimensions, type DimensionId } from "@/content/dimensions";
import { thumbUrl, designUrl } from "@/lib/media";
import { ContactBook, ContactSide } from "@/overlays/ContactBook";
import { DressingPanel } from "@/hud/DressingPanel";
import { ClientPoster, OpenButton } from "./islands";

function Sample({ on }: { on?: boolean }) {
  return on ? <span className="badge-sample">SAMPLE</span> : null;
}

export function WorkGrid({ list }: { list: VideoProject[] }) {
  return (
    <div className="card-grid">
      {list.map((p) => (
        <OpenButton key={p.slug} overlay={{ type: "project", slug: p.slug }} className={`work-card ${p.rarity === "epic" ? "glint" : ""}`} label={`Watch ${p.title}`}>
          <div className="thumb" style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }}>
            <ClientPoster slug={p.slug} />
          </div>
          <span className={`name rarity-${p.rarity}`}>
            {p.title} <Sample on={p.sample} />
          </span>
          <span className="meta">
            {p.platform} · {p.categories.map((c) => categoryLabels[c]).join(", ")}
            {p.client ? ` · ${p.client}` : ""}
          </span>
        </OpenButton>
      ))}
    </div>
  );
}

export function HomeSection() {
  return (
    <>
      <section>
        <h1>
          {site.owner} <span className="c-gray" style={{ fontSize: "0.5em" }}>· {site.brand}</span>
        </h1>
        <p className="lede readable">{site.summary}</p>
        <p className="lede readable">Thumbnails that earn the click. Edits that earn the watch time. Based in {site.location}.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <OpenButton overlay={{ type: "project", slug: "showreel" }} className="mc-btn">
            Watch Showreel ▶
          </OpenButton>
          <Link className="mc-btn" href="/the-end">
            Video edits
          </Link>
          <Link className="mc-btn" href="/ancient-city">
            Thumbnails
          </Link>
          <Link className="mc-btn red" href="/portal">
            Hire Me
          </Link>
        </div>
      </section>
      <section>
        <h2>Featured work</h2>
        <WorkGrid list={projects.filter((p) => p.rarity === "epic" && !p.locked)} />
      </section>
      <section>
        <h2>Explore</h2>
        <div className="card-grid">
          {dimensions
            .filter((d) => !d.secret)
            .map((d) => (
              <Link key={d.id} href={d.path} className="work-card">
                <span className="name" style={{ color: d.accent }}>
                  {d.name}
                </span>
                <span className="meta">{d.purpose}</span>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}

export function AboutSection() {
  return (
    <section className="readable">
      <h1>About Mehul</h1>
      <p className="lede">{site.summary}</p>
      {chapters.map((c, i) => (
        <article key={c.id} className="mc-dark" style={{ marginBottom: 10 }}>
          <h2 style={{ marginTop: 0 }}>
            {i + 1}. {c.title}
          </h2>
          {c.paragraphs.map((p, k) => (
            <p key={k} className="prose">
              {p}
            </p>
          ))}
          {c.list && (
            <ol className="prose">
              {c.list.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ol>
          )}
        </article>
      ))}
    </section>
  );
}

export function ThumbSection() {
  return (
    <>
      <section>
        <h1>Thumbnail Design</h1>
        <p className="lede readable">High-CTR YouTube thumbnails — designed for Bull Commander since September 2024, plus Mehul&apos;s own channel. Open any thumbnail for the design breakdown: focal point, contrast, composition and feed-size preview.</p>
        <div className="card-grid">
          {thumbnails.map((t) => (
            <OpenButton key={t.slug} overlay={{ type: "thumb", slug: t.slug }} className={`work-card ${t.rarity === "epic" ? "glint" : ""}`} label={`View ${t.title}`}>
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl(t)} alt="" loading="lazy" />
              </div>
              <span className={`name rarity-${t.rarity}`}>
                {t.title} <Sample on={t.sample} />
              </span>
              <span className="meta">{collectionLabels[t.collection]}</span>
            </OpenButton>
          ))}
        </div>
      </section>
      <section>
        <h2>Branding & Social Design</h2>
        <div className="card-grid">
          {designs.map((d) => (
            <OpenButton key={d.slug} overlay={{ type: "design", slug: d.slug }} label={`View ${d.title}`}>
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={designUrl(d)} alt="" loading="lazy" />
              </div>
              <span className="name">
                {d.title} <Sample on={d.sample} />
              </span>
              <span className="meta">{d.client ?? "Branding & social"}</span>
            </OpenButton>
          ))}
        </div>
        <p style={{ marginTop: 14 }}>
          <OpenButton overlay={{ type: "target" }} className="mc-btn">
            Play: Thumbnail Target Practice
          </OpenButton>
        </p>
      </section>
    </>
  );
}

export function SkillsSection() {
  return (
    <>
      <section>
        <h1>Skills & Tools</h1>
        <p className="lede readable">No percentage bars — every skill links to the work that proves it.</p>
        <div className="card-grid">
          {skillStations.map((s) => (
            <OpenButton key={s.id} overlay={{ type: "station", id: s.id }} label={`${s.name} details`}>
              <span className="name c-yellow">{s.name}</span>
              <span className="meta readable">{s.skills.join(" · ")}</span>
            </OpenButton>
          ))}
        </div>
        <p>
          <OpenButton overlay={{ type: "craft" }} className="mc-btn">
            Play: Craft the Edit
          </OpenButton>
        </p>
      </section>
      <section>
        <h2>Tools</h2>
        <ul className="readable prose">
          {tools.map((t) => (
            <li key={t.id}>
              <b>{t.name}</b> — {t.usedFor}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Web & UI</h2>
        {webProjects.map((w) => (
          <article key={w.slug} id={w.slug} className="mc-dark readable" style={{ marginBottom: 10 }}>
            <h3 style={{ marginTop: 0 }}>
              {w.title} <span className="c-gray" style={{ fontSize: 13 }}>· {w.role}</span>
            </h3>
            <p className="prose">{w.summary}</p>
            <ul className="prose">
              {w.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}

export function CareerSection() {
  return (
    <section className="readable">
      <h1>Career</h1>
      <ol className="timeline">
        {sortedMilestones.map((m) => (
          <li key={m.id} className="mc-dark">
            <span />
            <div>
              <h2 style={{ margin: 0, fontSize: 17 }}>{m.title}</h2>
              <div className="c-gray" style={{ fontSize: 13 }}>
                {[m.org, m.date].filter(Boolean).join(" · ")}
              </div>
              <p className="prose" style={{ marginBottom: 0 }}>
                {m.body}
              </p>
              {m.bullets && (
                <ul className="prose">
                  {m.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ContactSection() {
  return (
    <section>
      <h1>Start a Project</h1>
      <p className="lede readable">Got footage that deserves better, or thumbnails that aren&apos;t getting clicked? Let&apos;s craft something worth watching.</p>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <ContactBook inline />
        <ContactSide />
      </div>
    </section>
  );
}

export function DressingSection() {
  return (
    <section>
      <h1>Dressing Room</h1>
      <DressingPanel classic />
    </section>
  );
}

export function DimensionSection({ id }: { id: DimensionId }) {
  switch (id) {
    case "overworld":
      return <AboutSection />;
    case "the-end":
      return (
        <section>
          <h1>Video Editing</h1>
          <p className="lede readable">Short-form, brand and cinematic-leaning edits. Each one opens with a playable preview and an Edit X-Ray of its cuts and beats.</p>
          <WorkGrid list={projectsIn("the-end").filter((p) => !p.locked)} />
        </section>
      );
    case "nether":
      return (
        <section>
          <h1>Gaming Edits</h1>
          <p className="lede readable">High-energy Valorant montages, beat-sync edits, Shorts and experiments.</p>
          <WorkGrid list={projectsIn("nether")} />
          <p style={{ marginTop: 14 }}>
            <OpenButton overlay={{ type: "spike" }} className="mc-btn red">
              Defuse the spike
            </OpenButton>
          </p>
        </section>
      );
    case "ancient-city":
      return <ThumbSection />;
    case "crafting":
      return <SkillsSection />;
    case "end-city":
      return <CareerSection />;
    case "portal":
      return <ContactSection />;
    case "lab":
      return (
        <section>
          <h1>Snapshot Lab</h1>
          <p className="lede readable">Work in progress and behind the scenes.</p>
          <WorkGrid list={projectsIn("lab").filter((p) => !p.locked)} />
        </section>
      );
  }
}
