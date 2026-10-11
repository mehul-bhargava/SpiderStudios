"use client";
import { useState } from "react";
import { chapters, questItems } from "@/content/about";
import { site } from "@/content/site";
import { useProgress } from "@/state/progress";
import { useUi } from "@/state/ui";
import { travel } from "@/lib/nav";
import { sfx } from "@/lib/audio";
import { ItemIcon } from "@/ui/ItemIcon";
import { Modal } from "./Modal";

export function BookPage({ index, locked }: { index: number; locked: boolean }) {
  const ch = chapters[index];
  const item = questItems.find((q) => q.chapter === ch.id);
  if (locked && item)
    return (
      <>
        <h2>Chapter {index + 1}: ???</h2>
        <p>This page is still blank.</p>
        <p style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ItemIcon id={item.sprite} size={32} /> Find Mehul&apos;s <b>{item.name}</b> near the {item.where} to write it.
        </p>
      </>
    );
  return (
    <>
      <h2>
        Chapter {index + 1}: {ch.title}
      </h2>
      {ch.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {ch.list && (
        <ol>
          {ch.list.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      )}
    </>
  );
}

export function AboutBook({ page: initial }: { page: number }) {
  const [page, setPage] = useState(initial);
  const quest = useProgress((s) => s.quest);
  const open = useUi((s) => s.open);
  const free = quest.done || quest.skipped;
  const lockedAt = (i: number) => {
    if (free) return false;
    const item = questItems.find((q) => q.chapter === chapters[i].id);
    if (item) return !quest.found.includes(item.id);
    return chapters[i].id === "believe";
  };
  const last = chapters.length - 1;
  const turn = (d: number) => {
    sfx("page");
    setPage((p) => Math.max(0, Math.min(last, p + d)));
  };
  const skip = () => {
    const p = useProgress.getState();
    p.setQuest({ talked: true, done: true, skipped: true, found: ["camera", "headphones", "memory_card"] });
    p.unlock("meet");
    p.unlock("speedrun");
  };

  return (
    <Modal label="About Mehul" variant="bare" size="narrow">
      <div className="book readable">
        <span className="page-no">
          Page {page + 1} of {chapters.length}
        </span>
        {page === 0 && (
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#7a6a52" }}>
            {site.brand} · {site.location}
          </p>
        )}
        {lockedAt(page) && chapters[page].id === "believe" ? (
          <>
            <h2>Chapter {page + 1}: ???</h2>
            <p>Bring Mehul all three missing items to finish his story.</p>
          </>
        ) : (
          <BookPage index={page} locked={lockedAt(page)} />
        )}
        {!free && (
          <p style={{ fontSize: 13, marginTop: 18 }}>
            <button className="mc-btn small" onClick={skip}>
              Skip the quest — show every page
            </button>
          </p>
        )}
        {page === last && !lockedAt(page) && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <button className="mc-btn small" onClick={() => open({ type: "project", slug: "showreel" })}>
              Watch the showreel
            </button>
            <button className="mc-btn small" onClick={() => travel("the-end")}>
              See the edits
            </button>
            <button className="mc-btn small red" onClick={() => travel("portal")}>
              Hire Mehul
            </button>
          </div>
        )}
        <div className="nav">
          <button className="mc-btn small" onClick={() => turn(-1)} disabled={page === 0} aria-label="Previous page">
            ◀ Back
          </button>
          <button className="mc-btn small" onClick={() => useUi.getState().close()} data-autofocus>
            Done
          </button>
          <button className="mc-btn small" onClick={() => turn(1)} disabled={page === last} aria-label="Next page">
            Next ▶
          </button>
        </div>
      </div>
    </Modal>
  );
}
