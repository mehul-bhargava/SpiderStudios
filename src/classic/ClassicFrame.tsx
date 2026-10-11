import Link from "next/link";
import type { ReactNode } from "react";
import { dimensions } from "@/content/dimensions";
import { site } from "@/content/site";
import { ModeToggle } from "./islands";
import { ItemIcon } from "@/ui/ItemIcon";

export function ClassicFrame({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="classic">
      <header className="classic-head">
        <Link href="/" className="classic-brand" aria-label={`${site.brand} home`}>
          <ItemIcon id="spider" size={28} />
          <span>
            <span style={{ color: "#ff4655" }}>SPIDER</span>STUDIOS
          </span>
        </Link>
        <nav className="classic-nav" aria-label="Sections">
          {dimensions
            .filter((d) => !d.secret)
            .map((d) => (
              <Link key={d.id} href={d.path} aria-current={active === d.id ? "page" : undefined}>
                {d.id === "overworld" ? "About" : d.id === "the-end" ? "Videos" : d.id === "ancient-city" ? "Thumbnails" : d.id === "nether" ? "Gaming edits" : d.id === "crafting" ? "Skills" : d.id === "end-city" ? "Career" : "Contact"}
              </Link>
            ))}
        </nav>
        <ModeToggle />
      </header>
      <main>{children}</main>
      <footer className="classic-foot">
        © {site.owner} · {site.brand} · {site.location}
        <br />
        Minecraft-inspired. Not an official Minecraft product. Not affiliated with Mojang, Microsoft or Riot Games.
      </footer>
    </div>
  );
}
