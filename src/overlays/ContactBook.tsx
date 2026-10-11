"use client";
import { useRef, useState } from "react";
import { site, socials } from "@/content/site";
import { useProgress } from "@/state/progress";
import { useUi } from "@/state/ui";
import { sfx } from "@/lib/audio";
import { ItemIcon } from "@/ui/ItemIcon";
import { Modal } from "./Modal";

const TYPES = [
  { id: "thumbnail", label: "Thumbnails", icon: "echo_shard" },
  { id: "video", label: "Video edit", icon: "clapper" },
  { id: "shorts", label: "Shorts / Reels pack", icon: "phone" },
  { id: "branding", label: "Branding / social", icon: "tool_palette" },
  { id: "website", label: "Website / UI", icon: "tool_redstone" },
  { id: "other", label: "Something else", icon: "book" },
];
const BUDGETS = ["Let's discuss", "Under ₹5,000 / $60", "₹5,000–15,000 / $60–180", "₹15,000–50,000 / $180–600", "₹50,000+ / $600+"];
const TIMELINES = ["Flexible", "ASAP (this week)", "Within 2 weeks", "Within a month", "Ongoing / retainer"];

type Form = { name: string; email: string; types: string[]; budget: string; timeline: string; link: string; message: string; company: string };

export function ContactBook({ inline = false }: { inline?: boolean }) {
  const [page, setPage] = useState(0);
  const [f, setF] = useState<Form>({ name: "", email: "", types: [], budget: BUDGETS[0], timeline: TIMELINES[0], link: "", message: "", company: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "fallback" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const started = useRef(Date.now());
  const set = (p: Partial<Form>) => setF((x) => ({ ...x, ...p }));

  const validPage = (n: number) => {
    if (n === 0) {
      if (f.name.trim().length < 2) return "Please add your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return "That email doesn't look right.";
    }
    if (n === 2 && f.message.trim().length < 10) return "Tell Mehul a little more about the project (10+ characters).";
    return null;
  };
  const next = () => {
    const e = validPage(page);
    setErr(e);
    if (!e) {
      sfx("page");
      setPage((p) => p + 1);
    }
  };
  const mailto = () => {
    const body = `Name: ${f.name}\nEmail: ${f.email}\nProject: ${f.types.join(", ") || "—"}\nBudget: ${f.budget}\nTimeline: ${f.timeline}\nReference: ${f.link || "—"}\n\n${f.message}`;
    return `mailto:${site.email}?subject=${encodeURIComponent(`Project enquiry from ${f.name}`)}&body=${encodeURIComponent(body)}`;
  };
  const submit = async () => {
    const e = validPage(2);
    setErr(e);
    if (e) return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, elapsed: Date.now() - started.current }),
      });
      const data = (await res.json()) as { ok: boolean; fallback?: boolean; error?: string };
      if (data.ok) {
        setState("sent");
        sfx("levelup");
        useProgress.getState().unlock("recruited");
      } else if (data.fallback) {
        setState("fallback");
        useProgress.getState().unlock("recruited");
      } else {
        setState("error");
        setErr(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("fallback");
    }
  };

  let body;
  if (state === "sent")
    body = (
      <>
        <h2>Signed & sent!</h2>
        <p>Your book is on its way to Mehul by ender pearl. {site.responseTime}.</p>
        <p>Mehul will reply to {f.email}.</p>
        {!inline && (
          <button className="mc-btn" onClick={() => useUi.getState().open({ type: "credits" })}>
            Roll the credits
          </button>
        )}
      </>
    );
  else if (state === "fallback")
    body = (
      <>
        <h2>Almost there</h2>
        <p>The mailbox isn&apos;t connected yet, so your message is ready in your email app instead:</p>
        <p>
          <a className="mc-btn" href={mailto()}>
            Open in email app
          </a>
        </p>
        <p style={{ fontSize: 13 }}>
          Or write directly to <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </>
    );
  else
    body = (
      <>
        <span className="page-no">Page {page + 1} of 3</span>
        {page === 0 && (
          <>
            <h2>Start a Project</h2>
            <p>Got footage that deserves better, or thumbnails that aren&apos;t getting clicked? Let&apos;s craft something worth watching.</p>
            <label htmlFor="c-name">Your name</label>
            <input id="c-name" className="mc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" data-autofocus />
            <label htmlFor="c-email">Email</label>
            <input id="c-email" className="mc-input" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" />
          </>
        )}
        {page === 1 && (
          <>
            <h2>What are we crafting?</h2>
            <div className="opt-grid" role="group" aria-label="Project type">
              {TYPES.map((t) => {
                const on = f.types.includes(t.id);
                return (
                  <button key={t.id} type="button" className={`mc-btn small ${on ? "selected" : ""}`} aria-pressed={on} onClick={() => set({ types: on ? f.types.filter((x) => x !== t.id) : [...f.types, t.id] })}>
                    <ItemIcon id={t.icon} size={18} /> {t.label}
                  </button>
                );
              })}
            </div>
            <label htmlFor="c-budget">Budget</label>
            <select id="c-budget" className="mc-input" value={f.budget} onChange={(e) => set({ budget: e.target.value })}>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <label htmlFor="c-time">Timeline</label>
            <select id="c-time" className="mc-input" value={f.timeline} onChange={(e) => set({ timeline: e.target.value })}>
              {TIMELINES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </>
        )}
        {page === 2 && (
          <>
            <h2>The details</h2>
            <label htmlFor="c-msg">Your message</label>
            <textarea id="c-msg" className="mc-input" value={f.message} onChange={(e) => set({ message: e.target.value })} placeholder="What's the channel, the video, the deadline?" />
            <label htmlFor="c-link">Reference link (optional)</label>
            <input id="c-link" className="mc-input" value={f.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://" />
            <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
              <label htmlFor="c-company">Company</label>
              <input id="c-company" tabIndex={-1} autoComplete="off" value={f.company} onChange={(e) => set({ company: e.target.value })} />
            </div>
          </>
        )}
        {err && (
          <p role="alert" style={{ color: "#b02e26", fontSize: 14 }}>
            {err}
          </p>
        )}
        <div className="nav">
          <button className="mc-btn small" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            ◀ Back
          </button>
          {page < 2 ? (
            <button className="mc-btn small" onClick={next}>
              Next ▶
            </button>
          ) : (
            <button className="mc-btn small red" onClick={submit} disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Sign and Close"}
            </button>
          )}
        </div>
      </>
    );

  return <div className="book readable" style={inline ? { margin: 0 } : undefined}>{body}</div>;
}

export function ContactSide() {
  const [copied, setCopied] = useState(false);
  const live = socials.filter((s) => s.url);
  return (
    <div className="mc-dark readable" style={{ alignSelf: "start" }}>
      <h3 style={{ marginTop: 0 }}>Reach Mehul directly</h3>
      <p style={{ margin: "0 0 8px" }}>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <button
        className="mc-btn small"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(site.email);
            setCopied(true);
          } catch {}
        }}
      >
        {copied ? "Copied!" : "Copy email"}
      </button>
      {site.whatsapp && (
        <p>
          <a className="mc-btn small green" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </p>
      )}
      {live.length > 0 && (
        <div className="chips" style={{ marginTop: 12 }}>
          {live.map((s) => (
            <a key={s.id} className="chip" href={s.url!} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      )}
      {site.resumeUrl && (
        <p>
          <a className="mc-btn small" href={site.resumeUrl} download>
            Download resume
          </a>
        </p>
      )}
      <ul className="c-gray" style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
        <li>{site.responseTime}</li>
        <li>Based in {site.location}</li>
        <li>{site.timezone}</li>
      </ul>
    </div>
  );
}

export function ContactOverlay() {
  return (
    <Modal label="Start a project" variant="bare" size="mid">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 560px) minmax(0, 1fr)", gap: 16, alignItems: "start" }} className="contact-grid">
        <ContactBook />
        <div style={{ display: "grid", gap: 8 }}>
          <ContactSide />
          <button className="mc-btn" onClick={() => useUi.getState().close()}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
