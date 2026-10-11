"use client";
import { useUi } from "@/state/ui";
import { ProjectFocus } from "./ProjectFocus";
import { ThumbDetail } from "./ThumbDetail";
import { Browse } from "./Browse";
import { AboutBook } from "./AboutBook";
import { ContactOverlay } from "./ContactBook";
import { ChestLoot, DesignPanel, Dialog, MilestonePanel, SelectWorld, StationPanel, Timeline, ToolsPanel, WebPanel } from "./Panels";
import { CraftTheEdit, TargetPractice, SpikeDefuse, Archaeology } from "./Games";
import { Credits } from "./Credits";

export function OverlayHost() {
  const o = useUi((s) => s.overlay);
  if (!o) return null;
  switch (o.type) {
    case "project":
      return <ProjectFocus key={o.slug} slug={o.slug} initialTab={o.tab} />;
    case "thumb":
      return <ThumbDetail key={o.slug} slug={o.slug} />;
    case "browse":
      return <Browse scope={o.scope} filter={o.filter} />;
    case "book":
      return <AboutBook page={o.page ?? 0} />;
    case "contact":
      return <ContactOverlay />;
    case "timeline":
      return <Timeline />;
    case "station":
      return <StationPanel id={o.id} />;
    case "tools":
      return <ToolsPanel />;
    case "web":
      return <WebPanel slug={o.slug} />;
    case "craft":
      return <CraftTheEdit />;
    case "target":
      return <TargetPractice />;
    case "spike":
      return <SpikeDefuse />;
    case "archaeology":
      return <Archaeology />;
    case "chest":
      return <ChestLoot id={o.id} />;
    case "credits":
      return <Credits />;
    case "selectWorld":
      return <SelectWorld />;
    case "milestone":
      return <MilestonePanel id={o.id} />;
    case "design":
      return <DesignPanel slug={o.slug} />;
    case "dialog":
      return <Dialog speaker={o.speaker} text={o.text} actions={o.actions} />;
    default:
      return null;
  }
}
