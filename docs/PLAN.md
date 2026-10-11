# SpiderStudios — Master Plan

> An interactive, Minecraft-inspired 3D portfolio for **Mehul Bhargava (SpiderStudios)**: video editor, thumbnail and graphic designer, and Valorant content creator from Jaipur.
>
> Plan v1 · 11 Oct 2026 · This is the source of truth for the build. Your original brief is kept intact. Everything here either implements it or adds to it. Nothing has been removed.

---

## Contents

1. [TL;DR](#1-tldr)
2. [Who we're building for (from the resume)](#2-who-were-building-for)
3. [Upgrades to your vision](#3-upgrades-to-your-vision)
4. [Calls I made where the brief was open](#4-calls-i-made-where-the-brief-was-open)
5. [Experience architecture](#5-experience-architecture)
6. [Global HUD and systems](#6-global-hud-and-systems)
7. [Title screen](#7-title-screen)
8. [Dressing Room (character creator)](#8-dressing-room-character-creator)
9. [Dimensions](#9-dimensions)
10. [Mini-games](#10-mini-games)
11. [Advancements](#11-advancements)
12. [Art direction and brand system](#12-art-direction-and-brand-system)
13. [Technical architecture](#13-technical-architecture)
14. [Performance and quality tiers](#14-performance-and-quality-tiers)
15. [Accessibility](#15-accessibility)
16. [SEO, sharing and analytics](#16-seo-sharing-and-analytics)
17. [Legal and IP guardrails](#17-legal-and-ip-guardrails)
18. [Build roadmap](#18-build-roadmap)
19. [What we need from Mehul](#19-what-we-need-from-mehul)
20. [Open decisions](#20-open-decisions)
- [Appendix A: Splash texts](#appendix-a-splash-texts)
- [Appendix B: Chat commands](#appendix-b-chat-commands)
- [Appendix C: Draft copy](#appendix-c-draft-copy)

---

## 1. TL;DR

- **The idea in one line:** visitors launch *SpiderStudios: Editor's Edition*, spawn in a block-built Pink City, and travel through eight dimensions where every portal, chest, screen and crafting table opens real edits and thumbnails.
- **What the site has to prove:** (1) Mehul's edits hold attention, (2) his thumbnails earn the click, (3) he is a dependable creative partner.
- **Core technical bet:** a small custom voxel engine on React Three Fiber. Worlds are generated from code, block textures are painted procedurally, and characters use the real 64×64 skin format. There are no Mojang or Riot assets and downloads stay small.
- **Guiding principle:** *3D for discovery, DOM for consumption.* The world is where you find work. Watching a video, studying a thumbnail and filling the contact form happen in crisp 2D overlays that are shared with the fallback site.
- **Usability safety net:** a hotbar that works as navigation (keys 1–9) on every screen, a pinned **Hire Me** button, a **Select World** fast lane, and a fully themed **Classic Mode** that also serves as the SEO layer and the low-end-device layer.
- **Build order:** foundations, then title screen, Dressing Room and HUD, then **work and contact first** (at that point the site is already a usable portfolio), then quests and games, then polish and launch.

---

## 2. Who we're building for

### 2.1 Snapshot (from `Mehul_Bhargava_Resume.docx`)

| | |
|---|---|
| **Name / brand** | Mehul Bhargava, trading as **SpiderStudios** |
| **Base** | Jaipur, Rajasthan (IST, UTC+5:30) |
| **Roles** | Graphic designer · video editor · YouTube gaming content creator |
| **Signature work** | Valorant gameplay edits and Shorts; high-CTR YouTube thumbnails for **Bull Commander** (Sep 2024 → present) |
| **Tools** | Adobe Photoshop · Adobe Premiere Pro · CapCut · Canva · Figma (plus WordPress from client work) |
| **Design range** | Graphic design, branding and visual identity, typography, colour theory, layout and composition, social media design, print design |
| **Video range** | Short-form editing, gaming video editing, pacing and sound design, Reels/Shorts |
| **Creator range** | Gaming content creation, YouTube production, entertainment content, gameplay editing, audience engagement |
| **Soft skills** | Creativity, communication, leadership, team collaboration, attention to detail, problem solving |
| **Contact** | mehulbhargava26@gmail.com (the phone number stays off the site unless he asks for it) |

### 2.2 The three claims the site must prove

1. **"My edits keep people watching."** Pacing, sound design, trend-aware Shorts/Reels, Valorant montages.
2. **"My thumbnails get the click."** CTR-focused thumbnails for Bull Commander, built around a consistent creator identity.
3. **"I'm easy to work with."** Ongoing client work, two internships in summer 2025, leading a 15+ member dance crew to 1st place, team sport, a hackathon podium.

Every dimension is designed backwards from one of these three claims.

### 2.3 Resume → world mapping

Every line of the resume has a home in the world.

| Resume item | Where it lives | How it's shown |
|---|---|---|
| Profile summary | Overworld → About quest, chapter 1 | Mehul's NPC greets you; book page |
| Freelance thumbnails for **Bull Commander** (Sep 2024 → present) | Ancient City main hall + End City checkpoint | A "Bull Commander" collection with design breakdowns |
| **InnHouse**, Graphic Design and Video Editing Intern (Jul–Aug 2025) | End City checkpoint · Ancient City *Archaeology Wing* (carousels, posts) · The End (short-form edits) | Milestone shulker box; brush-to-reveal designs; reels |
| Shift to minimal, clean layouts for readability, hierarchy and brand recall | About quest, philosophy chapter · thumbnail breakdown notes | Quoted as a design principle |
| **Sid and Co.**, Web Developer (Jul–Aug 2025): WordPress site in one month | End City checkpoint · Crafting Room *Redstone Corner* | Screenshots plus a live link |
| **Streamico**: UI/UX lead for a SaaS that clips YouTube streams by timestamp | Redstone Corner · End City | Figma flows → shipped WordPress front end |
| YouTube channel: Valorant edits and Shorts | **Nether** (main) · The End (Shorts) | Montage screens, vertical Shorts frames |
| Social media and branding designs (posts, posters, logos, banners) | Ancient City *Archaeology Wing* | Brush suspicious sand to uncover designs |
| Tools (Ps, Pr, CapCut, Canva, Figma) | Crafting Room tool chest | Pixel items with honest tooltips |
| Skill groups (design, video, YouTube) | Crafting Room stations | One station per group, linked to proof |
| Soft skills | Crafting Room lectern · About quest | Short book page |
| **2nd Runner-Up, Webathon at SKIT** | End City checkpoint | Milestone + splash text ("Spun a web, then a website!") |
| **All India Cricket Tournament** | Overworld cricket pitch (About quest) · End City | Quest item + milestone |
| **Dance team leadership** (15+ members, 1st place inter-college) | Overworld note-block stage (About quest) · End City · character emote | Quest item + milestone + "lead the crew" emote |
| Jaipur | Overworld *Pink City* spawn; Rajasthan-flavoured map builds | Hawa Mahal–inspired facade, kites in the sky |

### 2.4 Gaps the resume exposes (handled, not hidden)

- **Categories with no evidence yet.** The brief lists cinematic, podcast/talking-head, colour grading and motion graphics. The resume doesn't show these, and it doesn't list After Effects or DaVinci Resolve. → Categories are **data-driven**: a category with zero projects simply doesn't render. If Mehul does this work, we add the projects (and he should add it to his resume too).
- **Missing dates.** The channel start date, Webathon, cricket tournament, dance competition, education and Streamico are undated. The timeline needs them (see §19).
- **"Portfolio" on the resume has no link.** This site becomes that link.
- **Client permissions.** Showing Bull Commander, InnHouse, Sid and Co. and Streamico work (and any CTR or view stats) needs a yes from each.
- **Phone number.** Not published by default, to avoid spam. The contact form plus email covers it.

---

## 3. Upgrades to your vision

| Your brief says | Upgrade | Why it helps |
|---|---|---|
| Persistent navigation and shortcuts | **Hotbar navigation:** 9 slots, keys 1–9; on mobile it becomes a bottom tab bar | Nav that doesn't feel like a website, and every Minecraft player already knows it |
| Minecraft UI connects everything | **Chat as a command palette** (`T` or `/`): `/tp nether`, `/hire`, `/showreel`, plus hidden commands. Plain text searches projects. | Power-user speed plus easter eggs |
| Lightweight fallback | **Classic Mode:** a themed, server-rendered 2D site with 100% content parity | Low-end phones, recruiters in a hurry, SEO, screen readers |
| Skills without % bars | **Evidence-linked skills:** each skill lists the projects that prove it; any counts are computed from real content | Makes "genuine experience" verifiable |
| Thumbnail design breakdowns | **Breakdown Lens:** focal-point overlay, thirds grid, value/contrast view, squint test, feed-size preview, A/B slider | Shows his *thinking*, not just pictures |
| Video project details | **Edit X-Ray:** cut and beat markers on the scrubber (auto-detected with ffmpeg) and an optional raw-vs-edit toggle | Proves editing skill in a way a reel can't |
| Valorant-inspired block maps | Rebuilt as **Rajasthan-flavoured originals:** *Thar* (desert bazaar, teleporter pads), *Kamal* (lotus-temple ruins, rotating stone doors), *Pink City Plaza* | Original IP that also carries his Jaipur identity |
| SpiderStudios branding | **Spider system:** a red-eyed spider mascot and pet, a spider-on-a-thread loading bar, a spider-web constellation over the Final Portal, and **Redstone Red** as the accent | The brand lives in the world, not only in the logo |
| Featured work | **Item rarity plus enchantment glint:** featured work gets a purple name and a shimmering glint | Hierarchy you can read at a glance, and very Minecraft |
| *(resume work missing from the brief)* | **Archaeology Wing** for branding and social design; **Redstone Corner** for web/UI (Streamico, Sid and Co.) | No real work gets left out |
| Career timeline | Milestones sit in **shulker boxes**; a **levitation** lift for mobile; an **elytra glide** from the top of End City straight into the Final Portal | The career story physically ends at "hire me" |
| Contact form | **Book and Quill** form: *Sign and Close* submits, followed by an **end-credits roll** of the visitor's own run stats | A memorable, shareable finish |
| Optional collectibles | **Lost Frames:** 8 film frames, one per dimension, that unlock a blooper/BTS reel in the Snapshot Lab | Collectibles that lead to content |
| Character creator | Real **64×64 skin format:** import your own Minecraft skin, export your creation, share it by link. Adds a **Player Card with Titles** (the Valorant touch). | Fun to share and cheap to build |
| Main menu | **Select World** screen that lists every dimension as a saved world; **Watch Showreel** is one click from launch | Featured work is never more than one click away |
| Atmosphere | Day/night follows the **visitor's local time**; `F3` opens a debug-overlay easter egg with real render stats | A living world, plus a tech flex |
| Keeping it updated | Content lives in typed files; scripts generate previews and image sizes; an optional **Minecraft schematic importer** lets Mehul build worlds in real Minecraft | The site stays fresh without a developer |

---

## 4. Calls I made where the brief was open

Each of these is a recommendation. Push back on any of them.

1. **Two characters.** Mehul's avatar is the fixed **creator/guide NPC**: on the title screen, in the About quest, and as a cameo in each dimension. The Dressing Room creates the **visitor's explorer**, which persists everywhere they go. Until the visitor customizes, they wear a "Spider" starter skin. Once they've made one, the title screen shows both characters side by side. This covers both the "character representing the creator" and the "character creator" requirements.
2. **Guided exploration, not free roam (v1).** Each dimension is a compact diorama with 5–9 **points of interest (POIs)**. Click, tap or use the arrow keys and your explorer walks or jumps there while the camera follows. Free WASD roam on desktop is a stretch goal (Phase 5). The reasons are speed to content, parity with mobile, and performance.
3. **Splitting The End and the Nether.** **The End** holds polished, client-facing work: cinematic edits, reels and shorts, memes, podcast/talking-head, colour. **The Nether** holds high-energy gaming: Valorant montages, beat-sync, experimental. There is one project database. Each project has a home dimension, but every filter and search covers everything.
4. **The Overworld is Home plus the hub.** A **Portal Plaza** in the Pink City has a framed portal to every dimension, like a server lobby.
5. **Thumbnails get equal billing.** They get their own hotbar slot, their own entry on Select World, the same detail depth as videos, and two games of their own (Target Practice and Archaeology).
6. **Minecraft-*inspired*, not Minecraft.** Every texture, font, sound, model and logo is original or properly licensed (see §17).

---

## 5. Experience architecture

### 5.1 World map

```
                       ┌───────────────────────────────┐
                       │  TITLE SCREEN  "/"            │
                       │  Dressing Room · Select World │
                       │  Showreel · Options · Classic │
                       └──────────────┬────────────────┘
       Start Adventure ▼      Select World ▼      Co-op: Hire Me ▼ (→ Final Portal)
  ┌───────────────── OVERWORLD — Pink City  "/overworld" ──────────────────┐
  │  Mehul's studio hut · About quest · cricket pitch · note-block stage    │
  │  Hawa Mahal facade · kite sky · PORTAL PLAZA (hub)                      │
  └──┬───────────┬──────────────┬───────────┬─────────────┬────────────┬───┘
     ▼           ▼              ▼           ▼             ▼            ▼
  THE END    ANCIENT CITY     NETHER    CRAFTING ROOM   END CITY    FINAL PORTAL
  /the-end   /ancient-city    /nether   /crafting       /end-city   /portal
  videos     thumbnails +     gaming    skills, tools,  career      contact,
             branding         edits     web/UI          timeline    hire me
     │                                                     ▲   │        ▲
     └────────────── end gateway ──────────────────────────┘   └ elytra ┘

         SNAPSHOT LAB  "/lab"  (secret: 8 Lost Frames, /snapshot, or a hidden door)
```

### 5.2 The golden path (a first visit of about 8–12 minutes)

Title → **Overworld** (About quest, ~90 s) → **The End** (videos) → **Ancient City** (thumbnails) → **Nether** (gaming) → **Crafting Room** (skills) → **End City** (career climb) → *elytra glide* → **Final Portal** (contact) → credits.

Every dimension's exit portal suggests the next stop, and the Portal Plaza lets you go anywhere at any time.

### 5.3 Fast lanes (essential content never requires play)

| Need | Path | Clicks |
|---|---|---|
| "Show me your best work" | Title → **Watch Showreel** | 1 |
| "Show me thumbnails" | Title → Select World → Ancient City, or press `3` anywhere | 1–2 |
| "I want to hire you" | **Hire Me** (pinned top-right on every screen), `7`, or `/hire` | 1 |
| "Just give me a normal site" | **Classic Mode** on the title screen, or in the pause menu | 1 |
| Sharing a single piece | Deep links: `/the-end/<slug>`, `/ancient-city/<slug>` | 0 |

### 5.4 Routes

| Route | Place | Purpose |
|---|---|---|
| `/` | Title screen | Brand, fast lanes, Dressing Room |
| `/overworld` | Pink City | Home, About quest, hub |
| `/the-end` · `/the-end/[slug]` | The End | Video portfolio |
| `/ancient-city` · `/ancient-city/[slug]` | Ancient City | Thumbnails, branding and social design |
| `/nether` · `/nether/[slug]` | Nether | Gaming and high-energy edits |
| `/crafting` | Crafting Room | Skills, tools, web/UI |
| `/end-city` | End City | Career timeline and achievements |
| `/portal` | Final Portal | Contact and hiring |
| `/lab` | Snapshot Lab | Upcoming work, BTS, secrets |

Every route is **server-rendered with its real content** (this is the Classic layer). On capable devices, the client then upgrades the page to 3D. A `mode` cookie remembers the visitor's choice.

---

## 6. Global HUD and systems

### 6.1 Hotbar (persistent navigation)

| Slot / key | Item | Goes to |
|---|---|---|
| 1 | Grass block | Overworld (home, about) |
| 2 | Eye of Ender | The End (videos) |
| 3 | Echo shard | Ancient City (thumbnails) |
| 4 | Blaze powder | Nether (gaming edits) |
| 5 | Crafting table | Crafting Room (skills) |
| 6 | Elytra | End City (career) |
| 7 | Ender pearl | Final Portal (contact) |
| 8 | Map | Select World plus the treasure map |
| 9 | Book | Quest log and advancements |

- The current dimension's slot is highlighted with the classic white selection frame. The mouse wheel scrolls the selection and Enter travels.
- **Mobile:** a bottom tab bar with Home · Videos · Thumbs · Skills · Career · **Hire**, plus a "More" sheet for the Nether, the map and the Lab. Every target is at least 48 px.
- **XP bar above the hotbar = journey progress.** It fills as you visit dimensions and see work, and the level number equals advancements earned. It's purely cosmetic.

### 6.2 Other HUD pieces

- **Top-left:** dimension name plus a small coordinate readout (a nod to F3).
- **Top-right:** a **Hire Me** button (the one Redstone Red element), a sound toggle and a menu button.
- **Inventory (`E`):** tabs for **Explorer** (Player Card, character, title), **Collection** (every project and thumbnail; the ones you've already seen get a tick, unseen ones still open, nothing is locked), **Advancements** (a tree), **Treasure Map**, and **Lost Frames** (8 slots).
- **Pause menu (`Esc`):** Back to Game · Advancements · Options · Dressing Room · Classic Mode · Hire Me · Save and Quit to Title.
- **Chat (`T` or `/`):** a command palette with autocomplete. Typing anything that isn't a command searches projects and thumbnails. See Appendix B.
- **Advancement toasts:** slide in at the top right with an icon, a title and a soft chime, queued one at a time. With reduced motion they fade instead.
- **Interaction grammar** (the same in every dimension):
  - Hover → black block-selection outline plus a tooltip (name and lore lines)
  - Click, tap or Enter → walk there and interact
  - Interactable types: **Screen** (video) · **Frame** (image) · **Chest** (loot) · **Sign** (short text) · **NPC** (dialogue) · **Station** (skill) · **Portal** (travel) · **Lectern/Book** (long text) · **Lost Frame** (collectible)

### 6.3 Loading and transitions

- **Loader:** the SpiderStudios spider descends on a silk thread, and the thread's length is the progress. Rotating tips ("Press 1–9 to jump between dimensions", "Press T and type /hire").
- **Dimension intro card** (the Valorant touch): a red tactical side-bar, the dimension name in large pixel type, a one-line purpose, and coordinates. The Overworld card shows **Jaipur's real coordinates (26.91° N, 75.79° E)**, the way Valorant loading screens show map coordinates. The other dimensions show Minecraft-style XYZ.

| Transition | Used for |
|---|---|
| Nether-portal swirl (purple distortion shader) | Entering the Nether or the Lab |
| End-portal starfield | Entering The End or End City |
| Tactical red diagonal wipe | Hotbar jumps (fast and snappy) |
| Elytra glide (camera flight) | End City → Final Portal |
| Plain crossfade | Everything, when reduced motion is on |

### 6.4 Audio

- Silent until the first interaction (this respects browser autoplay rules). Master, music and SFX sliders; `M` mutes.
- **SFX:** generated with ZzFX, a tiny synth (MIT), so every click, chest, chime and portal sound is original.
- **Ambience per dimension:** wind and birds, cave drips and sculk clicks, nether rumble, End hum. Built from Web Audio noise and drones, or licensed loops.
- **Music:** original or properly licensed tracks only. Mehul may have tracks he's allowed to use.

### 6.5 Options

Quality (Auto / High / Lite / Classic) · Sound (master / music / SFX) · Motion (Full / Reduced, defaulting to the OS setting) · **Readable text** (switches body copy to Atkinson Hyperlegible) · Camera sensitivity · Video captions · **Delete World** (resets the save).

---

## 7. Title screen

```
┌──────────────────────────────────────────────────────────────────┐
│            ▓▓ S P I D E R S T U D I O S ▓▓   (voxel wordmark)     │
│                  ─ EDITOR'S EDITION ─        Craft Every Frame! ↗ │
│                                                                    │
│   [Mehul NPC]  [You]          [      Start Adventure      ]        │
│    idle, looks at cursor      [       Select World        ]        │
│                               [      Co-op: Hire Me       ]        │
│   [ Dressing Room ]           [     Watch Showreel ▶      ]        │
│                               [ Options... ] [Classic Mode]  ♿ 🔊 │
│                                                                    │
│ SpiderStudios: Editor's Edition 1.0         © Mehul Bhargava.      │
│                       Not affiliated with Mojang or Riot Games.    │
└──────────────────────────────────────────────────────────────────┘
```

- **Background:** rotating **cubemap panoramas**, exactly how the real title screen works. That makes them authentic and very cheap to render. They're captured from our own builds: *Pink City Plaza* (day), *Thar* (sunset), *Kamal* (night). The one shown matches the visitor's local time.
- **Wordmark:** "SPIDERSTUDIOS" built from extruded voxel letters. "SPIDER" is in a blackstone texture with red-eye glints, and "STUDIOS" is in stone. A small spider hangs off the **R** on a thread. Under it sits an "EDITOR'S EDITION" ribbon, in the spirit of "Java Edition".
- **Splash text:** yellow `#FFFF55`, rotated −20°, pulsing. A new one appears on every load, and clicking it rolls another one (a small extra). The pool is in Appendix A.
- **Buttons:** these mirror the real menu's rhythm.
  - Start Adventure (Singleplayer) → Overworld and the About quest
  - **Select World** → a list of every dimension styled as Minecraft saves (icon, name, "Videos · 12 projects", "Last visited")
  - **Co-op: Hire Me** (Multiplayer, because co-op is collaboration) → Final Portal
  - **Watch Showreel** (where the Realms button sits) → the showreel overlay
  - Options… · **Classic Mode** (where Quit Game sits)
  - Icon buttons for Accessibility and Sound
- **Characters:** Mehul's NPC idles, turns his head toward the cursor (a nod to the inventory screen), waves when you hover *Co-op: Hire Me*, and crouch-spams hello on first load.
- **Footer:** a version string bottom-left, and the copyright plus the not-affiliated disclaimer bottom-right, in the authentic spots.

---

## 8. Dressing Room (character creator)

**Layout:**
- **Left:** category tabs styled like the creative inventory: Skin · Hair · Headwear · Face · Shirt · Jacket · Trousers · Footwear · Accessories · Held Item · Loadouts.
- **Centre:** the character on a pedestal. Drag to rotate, scroll or pinch to zoom, and use pose buttons (Idle / Walk / Wave / Emote).
- **Right:** an item grid plus colour swatches. The swatches are the **16 dye colours**, plus a custom hex value.

**Starter part catalogue (v1)**

| Category | Options |
|---|---|
| Hair (skin layer plus optional voxel volume) | 8 styles |
| Headwear (3D) | Cap · backwards cap · beanie · headphones · gaming headset · bucket hat · carved pumpkin · crown (unlocked by an advancement) |
| Face | 4 eye styles · glasses · shades · stubble/beard · face mask |
| Shirt / Jacket | 8 tees and shirts · 6 jackets (hoodie, bomber, varsity, **spider hoodie with red eyes**, tactical jacket, kurta-jacket) |
| Trousers / Footwear | 6 / 6 |
| Accessories | Cape · backpack · scarf · chain · wristwatch · **spider-on-shoulder pet** · **elytra** (unlocked at End City) |
| Held props (sprite-extruded) | Camera · clapperboard · drawing tablet and pen · pickaxe · **cricket bat** · controller · spider plushie · axolotl plushie · coffee mug · film reel |
| **Loadouts** (Valorant-inspired, original) | Role-themed outfits (*Entry*, *Smokes*, *Recon*, *Anchor*), **Prop Buddy** charms that hang from the held item, Player Card banners, **Titles** earned through advancements |

- **Presets:** "Mehul (Creator)", "Explorer", "Agent", "Spider", plus a 🎲 Randomize button.
- **Import / Export:** upload any standard 64×64 Minecraft skin PNG to wear it, or download your creation as a skin that works in real Minecraft.
- **Share:** the look is encoded in the URL (`#skin=…`), so "check out my explorer" links just work.
- **Persistence:** stored in local storage and visible in every dimension, the inventory and the credits.
- **How it's built:** skins are **composited layers on a 64×64 canvas** (skin → face → trousers → shoes → shirt → jacket → hair → overlay), and each part has tintable colour channels. Headwear, accessories and held items are small voxel props attached to bones. The whole system weighs under 100 KB.

---

## 9. Dimensions

Each dimension is a compact, fog-bounded diorama with its own palette, light, particles and soundscape.

### 9.1 Overworld: *Pink City* (Home, About, hub)

| | |
|---|---|
| **Look** | A pink-terracotta facade inspired by the Hawa Mahal with jharokha lattice windows, sandstone streets, a green maidan, kites drifting in a golden-hour sky (or night, depending on local time) |
| **POIs** | Mehul's studio hut (desk, monitor, chair) · Hawa Mahal facade · cricket pitch · note-block dance stage · kite stall · welcome signs · **Portal Plaza** (7 portals, each framed in its dimension's block) |
| **Content** | Intro, background, personality, creative philosophy (through the About quest) |
| **Extras** | Hit a six off the cricket pitch (an advancement) · a hidden chest under the kite stall |
| **Mobile** | POI carousel: swipe between points, tap to interact |

**About quest: "The Missing Setup"** (about 60–90 s, skippable at every step)

1. Mehul's NPC greets you (crouch-spam hello): *"My setup's missing three things and I can't render today's edit. Help me out?"* The options are **[Sure!]** and **[Skip, just tell me about you]**. → Chapter 1: *Who I am*.
2. 📷 **Camera**, on a Hawa Mahal balcony → Chapter 2: *Where I'm from* (Jaipur, design roots, branding → YouTube → Valorant edits).
3. 🎧 **Headphones**, on the cricket pitch beside a bat → Chapter 3: *How I play* (All India Cricket Tournament, the Webathon podium, team player).
4. 💾 **Memory card**, held by the spider pet at the dance stage → Chapter 4: *How I lead* (15+ dancers, 1st place; "rhythm is why I love beat-sync").
5. Put the items on the desk → the monitor powers on → the **showreel plays** → Chapter 5: *What I believe* (creative philosophy) → advancement **Welcome to the Studio**. The reward is the **Map**, which unlocks treasure markers, and the Portal Plaza lights up.

- Each item has a soft loot-beam and a compass hint. Skipping opens all 5 chapters in a book straight away and still awards an advancement (**Speedrunner**), so skipping is never punished.

### 9.2 The End: video editing (cinematic and client work)

| | |
|---|---|
| **Look** | The central island, a ring of obsidian pillars, end-crystal beams converging on a **Dragon Egg** plinth, starfield void, purple fog, chorus plants |
| **Layout** | Each pillar is a **category** (cinematic · reels and shorts · memes · podcast/talking-head · colour grading · beat-sync · experimental). Its top holds a floating screen playing a looping preview. Clicking a pillar raises the camera to a shelf of 3–6 projects. Categories with no projects aren't built. |
| **Boss reveal** | The Ender Dragon circles overhead. Approach the egg and the dragon swoops, the screen flares and the **Showreel** opens. About 3 s, skippable, and instant with reduced motion. |
| **Filtering** | Press `F` or the "Browse" button to get **creative-inventory tabs** (categories) plus search, sort (featured / newest) and platform chips. Projects appear as items with rarity colours and glint. |
| **Exit** | An end gateway leads to End City |

**Project Focus View** (a DOM overlay, shared with Classic Mode)
- Tabs: **Watch** · **Breakdown** · **Before / After** (only when raw footage exists)
- **Lore panel:** platform, client, role, duration, date, tools, techniques shown as item chips (speed ramp, velocity, shake, SFX layering, captions, colour…), and stats if they're real and approved
- **Edit X-Ray scrubber:** cut markers (white ticks) and beat markers (red ticks), plus "142 cuts · 60 s · avg 0.42 s/shot"
- Vertical 9:16 for Shorts and Reels, 16:9 for long-form. Players never letterbox the wrong way.

### 9.3 Ancient City: thumbnails, branding and social design

| | |
|---|---|
| **Look** | Deepslate bricks, sculk veins, soul lanterns, a cyan glow, a dark hush; the reinforced-deepslate "portal" frame serves as the hero wall |
| **Halls** | **Main Hall** (featured thumbnails in glow item frames) · **Collection corridors** (Bull Commander · Valorant/gaming · his own channel · concepts) · **Archaeology Wing** (carousels, posters, logos, banners: brush suspicious sand to uncover them) · **Archery Range** (Thumbnail Target Practice) |
| **Boss reveal** | Activate a sculk shrieker and the **Warden** rises and "presents" the top-performing thumbnail. Skippable. |
| **Mobile** | Corridor swipe; frames enlarge on tap |

**Thumbnail Detail with the Breakdown Lens**
- A high-resolution image with zoom
- Overlay toggles: **Focal point** · **Thirds grid** · **Value view** (greyscale contrast) · **Squint test** (blur) · **Feed preview** (real feed sizes on desktop and mobile, light and dark) · **A/B slider** against alternates and drafts
- Notes: Brief · Audience · Composition · Contrast · Focal point · Typography · Result (CTR or views, only if allowed)

### 9.4 Nether: high-energy gaming edits

| | |
|---|---|
| **Look** | Netherrack, crimson forest, basalt pillars, lava falls, embers, heat haze, red fog. A bastion remnant is rebuilt as a tactical "spike site" arena with Redstone Red accents. This is the dimension where the red gets loud. |
| **POIs** | **Bastion arena** (featured montage) · **Lava falls** (a row of montage screens) · **Crimson forest** (Shorts in **vertical frames**) · **Blaze Lab** (experimental) |
| **Valorant moment** | **Spike defuse:** hold for 4 s, with a progress bar and defuse sound, until an **ACE** banner appears and the featured montage plays |
| **Piglin bartering** | Hand over a gold ingot and get a random clip, as a shuffle mode |

### 9.5 Crafting Room: skills and tools

| | |
|---|---|
| **Look** | A cozy oak workshop with lanterns, bookshelf walls, a workstation block for each skill, and a redstone corner with lamps and repeaters |

| Station | Skill group (from the resume) | Proof links |
|---|---|---|
| **Crafting table** | Video editing: short-form, gaming, gameplay editing | The *Craft the Edit* game plus edits |
| **Enchanting table** | Thumbnail design (making things irresistible) | Ancient City collections |
| **Loom** | Branding and visual identity, typography (banners!) | Archaeology Wing |
| **Cartography table** | Layout and composition, social media design | Carousels, posts |
| **Jukebox / note blocks** | Pacing and sound design, audio sync | Beat-sync edits |
| **Brewing stand** | Colour theory (potions are colour) | Selected thumbnails |
| **Redstone Corner** | Web and UI: Figma → WordPress (Streamico, Sid and Co.) | Live links, flows |
| **Lectern** | Soft skills: communication, leadership, collaboration, attention to detail, problem solving | About chapters, career |

- **Tool chest:** Photoshop · Premiere Pro · CapCut · Canva · Figma · WordPress as pixel items. Each tooltip says *what he uses it for* and links to work made with it. There are **no percentages and no invented levels**.
- A hidden bookshelf door leads to the Snapshot Lab.

### 9.6 End City: career timeline

| | |
|---|---|
| **Look** | Purpur towers, end rods, banners, floating platforms spiralling up the tower, and the **End Ship** at the top |
| **Mechanic** | **Career Parkour:** each platform is a checkpoint, and each checkpoint has a **shulker box** that opens to a milestone |
| **Top** | The End Ship reads *"Next milestone: your project."* Equip the **elytra** and glide into the **Final Portal**. |
| **Skip** | **"Show full timeline"** opens a 2D timeline styled like the advancement tree |

**Milestones** (dates marked TBD come from §19)

| # | Milestone | Date |
|---|---|---|
| 1 | Started the YouTube gaming channel: Valorant edits and Shorts | TBD |
| 2 | Led a 15+ member dance team to **1st place** (inter-college) | TBD |
| 3 | **All India Cricket Tournament** | TBD |
| 4 | **2nd Runner-Up, Webathon at SKIT** | TBD |
| 5 | **Freelance Thumbnail Designer, Bull Commander** | Sep 2024 → present |
| 6 | **InnHouse**, Graphic Design and Video Editing Intern | Jul–Aug 2025 |
| 7 | **Sid and Co.**, Web Developer: WordPress site in one month | Jul–Aug 2025 |
| 8 | **Streamico**: led UI/UX for a SaaS for streamers | TBD |
| ∞ | *Your project* → Final Portal | Now |

### 9.7 Final Portal: contact and hiring

| | |
|---|---|
| **Look** | A floating obsidian island in a red-violet void, stars forming a **spider-web constellation**, a custom portal frame in blackstone with redstone trim and a swirling shader, and a **lectern holding a Book and Quill** |
| **Form (the book)** | Page 1: name and email → Page 2: project type as items (thumbnail · video edit · Shorts package · branding · website) plus budget range and timeline → Page 3: message → **Sign and Close** submits |
| **After sending** | The portal flares, the **Recruited!** advancement fires, and the **end credits** roll with the visitor's run stats (dimensions visited, work viewed, advancements). Skippable. |
| **Side panel** | Email with one-click copy · socials · **Download Resume (PDF)** · response-time promise · "Based in Jaipur, IST" |
| **Reachable from** | Hire Me (every screen) · hotbar `7` · `/hire` · title-screen *Co-op* · Classic nav |

### 9.8 Snapshot Lab: experimental zone (optional)

| | |
|---|---|
| **Look** | A white and grey superflat grid, structure blocks, scaffolding, wireframe "unfinished" builds, a debug-screen vibe, and a sign reading *"Snapshot 26w41a"* |
| **Content** | Upcoming work, works-in-progress, behind the scenes, the **blooper reel** (the Lost Frames reward), unused thumbnail concepts, dev easter eggs |
| **Unlock** | Collect all 8 Lost Frames, find the bookshelf door, or type `/snapshot`. Nothing essential lives here. |

---

## 10. Mini-games

Every game takes under 2 minutes, works with mouse, touch and keyboard, is skippable, and **always ends on real portfolio content**.

| Game | Where | Loop | Controls | Skip | Leads to |
|---|---|---|---|---|---|
| **1. Craft the Edit** | Crafting Room | Put Clip + Music + Effect (+ optional Captions or Grade) into a 3×3 grid; each recipe crafts a different finished project | Drag, or click/tap to place; keys 1–9 for slots | **Recipe Book** shows every recipe | The project's Focus View |
| **2. Thumbnail Target Practice** | Ancient City, Archery Range | A creative brief appears, three thumbnails sit on target blocks, and you shoot (pick) the best fit. Every pick gets a "why" explanation. 3 rounds. | Click or tap (hold to draw the bow on desktop for fun) | "Show answers" | The thumbnail's Breakdown |
| **3. Career Parkour** | End City | Jump between platforms; each landing opens a milestone. Falling just respawns you at the last checkpoint with a joke. | Space or tap to jump to the next platform; on mobile, a **levitation** lift | "Show full timeline" | Milestones → elytra → contact |
| **4. Treasure Hunt** | Every dimension (1–3 chests each) | Find chests marked on the Map; they hold projects, galleries, advancements and Lost Frames | Click or tap | The Map shows every chest | Projects and galleries |
| *Spike Defuse* | Nether | Hold for 4 s | Hold the mouse, key or finger | Tap "Watch" | Featured montage |
| *Archaeology* | Ancient City | Brush sand to uncover designs | Drag or hold | "Uncover all" | Branding and social work |
| *Piglin Barter* | Nether | Trade gold for a random clip | Click | n/a | A random edit |

**Example Craft the Edit recipes** (each is bound to a real project once the content arrives):
- Gameplay Clip + Phonk Track + Velocity → *Valorant velocity edit*
- Gameplay Clip + Bass Drop + Beat Sync → *Beat-sync montage*
- Talking Head + Lo-fi Track + Captions → *Podcast short*
- Raw Footage + Ambient Track + Colour Grade → *Cinematic edit*
- Meme Clip + Vine Boom + Zoom Punch → *Meme edit*

**Boss reveals** (Ender Dragon → showreel, Warden → top thumbnail) each last about 3 s, can be skipped with any input, and become instant with reduced motion.

---

## 11. Advancements

These are Minecraft-style toasts. **None of them gate content.** They unlock cosmetics, Titles, and XP-bar progress.

| Advancement | Trigger | Icon |
|---|---|---|
| Spawn Point | Enter the world | Grass block |
| Dressed to Edit | Save a look in the Dressing Room | Leather tunic |
| Taking Notes | Open the inventory | Book |
| Meet the Creator | Talk to Mehul | Player head |
| Welcome to the Studio | Finish the About quest | Camera |
| Speedrunner | Skip the About quest (yes, really) | Clock |
| Beyond the Void | Enter The End | Eye of Ender |
| Free the Egg | Watch the showreel | Dragon egg |
| Hot Takes | Enter the Nether | Blaze powder |
| Ace! | Defuse the spike | Red diamond |
| Quiet, Please | Enter the Ancient City | Sculk sensor |
| Under the Lens | Open a Thumbnail Breakdown | Spyglass |
| Bullseye | Finish Target Practice | Target block |
| Careful Brushwork | Uncover a design | Brush |
| Master Crafter | Craft 3 edits | Crafting table |
| Know Your Tools | Inspect every tool in the chest | Chest |
| Up We Go | Reach the top of End City | Shulker shell |
| Cleared for Takeoff | Glide with the elytra | Elytra |
| Treasure Hunter | Open 5 chests | Chest |
| Lost & Found | Collect all 8 Lost Frames | Film frame |
| Snapshot | Enter the Snapshot Lab | Structure block |
| Command Line | Use a chat command | Command block |
| Howzat! | Hit a six on the cricket pitch | Cricket bat |
| Night Owl | Visit between midnight and 5 am (local time) | Moon |
| Tourist | Visit every dimension | Map |
| Recruited! | Send a message from the Final Portal | Book and quill |
| The End? | Watch the credits to the end | Dragon head |

---

## 12. Art direction and brand system

### 12.1 Principles

- **Minecraft dominates, and Valorant seasons.** The red accent covers about 5% of any screen, except in the Nether.
- **Pixel-perfect or nothing.** Pixel sizes snap to multiples of 2 px, `image-rendering: pixelated`, no blurry upscales.
- **The UI snaps and the world flows.** Panels pop in 2–3 stepped frames, as in Minecraft, while the camera and characters ease smoothly.
- **No generic web.** No glassmorphism, no gradient blobs, no SaaS cards. Every surface is a block, a panel, a slot, a book or a sign.

### 12.2 Colour tokens

| Token | Value | Use |
|---|---|---|
| `--panel` | `#C6C6C6` (bevel `#FFFFFF` / `#555555`) | Inventory panels |
| `--slot` | `#8B8B8B` (inset bevels) | Item slots |
| `--button` | Stone grey with noise, hover with a white outline | Menu buttons |
| `--tooltip` | `#100010` with a `#5000FF → #28007F` border | Tooltips |
| `--text` / `--text-shadow` | `#FFFFFF` / `#3F3F3F` (2 px offset) | Pixel text |
| `--splash` | `#FFFF55` | Splash text, advancement titles |
| `--rare` / `--epic` | `#55FFFF` / `#FF55FF` | Project rarity (epic = featured) |
| `--lore` | `#AAAAAA` | Tooltip lore lines |
| `--redstone` | `#E0313F` | **The brand accent:** Hire Me, spider eyes, tactical bars |

**Dimension palettes**

| Dimension | Sky / fog | Key blocks | Light | Particles |
|---|---|---|---|---|
| Overworld | Warm gold / pale blue | Pink terracotta, sandstone, grass | Warm sun, real time of day | Kites, pigeons, petals |
| The End | Black-violet | End stone, obsidian, purpur | Cool, crystal beams | Ender particles |
| Ancient City | Near-black teal | Deepslate, sculk, soul lanterns | Cyan glow, darkness pulse | Sculk souls |
| Nether | Deep red | Netherrack, basalt, blackstone, crimson | Lava orange | Embers, ash |
| Crafting Room | Warm interior | Oak, bookshelves, stations | Lanterns | Dust motes |
| End City | Lilac haze | Purpur, end rods | Soft white rods | Shulker sparkles |
| Final Portal | Red-violet void | Obsidian, blackstone, redstone | Portal glow | Web-constellation stars |
| Snapshot Lab | White fog | Grid, structure blocks | Flat, studio-like | None (the debug vibe) |

### 12.3 Typography

- **Wordmark:** a custom voxel block alphabet (our own glyphs). It's rendered as 3D on the title screen and exported to SVG/PNG for the favicon, OG images and Classic Mode.
- **UI and body:** **Monocraft** (SIL Open Font License), a Minecraft-inspired pixel font, self-hosted as woff2.
- **Readable mode:** **Atkinson Hyperlegible** for long text, toggled in Options.

### 12.4 Pixel UI kit (DOM)

Button · IconButton · Panel · Slot · ItemIcon (with glint) · Tooltip (with lore) · CreativeTabs · Book (pages, *Sign and Close*) · Sign · Toast · Hotbar · XPBar · Dialog (NPC) · Slider · Toggle · ProgressThread (the spider loader) · DimensionCard.

All bevels are made with layered `box-shadow`, so no images are needed. The kit is shared between 3D mode and Classic Mode.

### 12.5 Pixel art and texture pipeline

- **Sprites as text:** every 16×16 icon is an ASCII grid plus a palette in a `.ts` file, so it's easy to author and diff. From one source we get:
  1. a crisp UI icon at 16/32/48/64 px,
  2. an **extruded 3D item** (exactly how Minecraft renders held items) for props, drops and floating icons,
  3. particle sprites.

  About 150 sprites are planned for v1.
- **Block textures:** procedural **"painters"** (noise, dither, palette) produce original 16×16 tiles for grass, dirt, stone, deepslate, sculk, end stone, purpur, obsidian, netherrack, blackstone, basalt, sandstone, pink terracotta, oak, bookshelf and so on. A build script packs them into one atlas, about 256×256 px and under 30 KB.
- **Software icons:** Adobe restricts third-party use of its product icons, and most open icon sets don't ship them. So the tools appear as **original pixel items** (for example, Premiere as an enchanted film reel), with the real product name in the tooltip. Figma, Canva and WordPress logos follow each brand's published guidelines, or get the same pixel treatment.

---

## 13. Technical architecture

### 13.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router, latest stable at scaffold time) + **React 19** + **TypeScript** | Server rendering for the Classic/SEO layer, route-level code splitting, API for contact, OG images |
| 3D | **three.js** + **@react-three/fiber** + **@react-three/drei** + **@react-three/postprocessing** | The brief's recommendation; mature ecosystem |
| State | **Zustand** with `persist` | Tiny; saves the skin, progress and settings to local storage |
| UI animation | **Motion** | Stepped pixel pops and overlays |
| Styling | **Tailwind CSS** for layout, plus CSS modules for the pixel kit | Fast layout with handcrafted pixel surfaces |
| Validation | **Zod** | Content schemas and the contact form |
| Device tiering | **detect-gpu** + runtime `PerformanceMonitor` | Picks High / Lite / Classic automatically |
| Audio | **ZzFX** + Web Audio | Original SFX in a few KB |
| Email | **Resend** (with a Formspree interim option) + honeypot and rate limit | A reliable contact form |
| Media tooling | **sharp**, **ffmpeg** (build scripts) | Image sizes, preview loops, cut detection |
| Testing | **Playwright** (smoke tests for routes and the form) + Lighthouse | Keeps Classic, the fast lanes and contact honest |
| Hosting | **Vercel**; video on YouTube and/or Cloudflare R2 or Bunny | See §20 |

### 13.2 Project structure

```
spiderstudio/
├─ app/
│  ├─ layout.tsx                 # fonts, providers, persistent <WorldCanvas/> + <Hud/>
│  ├─ page.tsx                   # Title screen
│  ├─ [dimension]/page.tsx       # SSR Classic content + mounts the 3D world
│  ├─ [dimension]/[slug]/page.tsx  # deep links (project / thumbnail)
│  ├─ api/contact/route.ts
│  ├─ opengraph-image.tsx        # pixel-styled OG images
│  └─ sitemap.ts · robots.ts
├─ src/
│  ├─ content/                   # ← the only folder Mehul edits
│  │   projects.ts thumbnails.ts designs.ts career.ts skills.ts tools.ts
│  │   about.ts splashes.ts advancements.ts socials.ts
│  ├─ engine/
│  │   blocks/      registry + procedural texture painters
│  │   voxel/       structure DSL · greedy mesher (Web Worker) · vertex AO
│  │   sprites/     ASCII pixel art → icons + extruded 3D items
│  │   character/   skin compositor · parts · rig · animations
│  │   camera/      POI rails · cinematics
│  │   fx/          portal, glint, sky, particles shaders
│  ├─ worlds/                    # one lazy-loaded module per dimension
│  │   title/ overworld/ the-end/ ancient-city/ nether/ crafting/ end-city/ portal/ lab/
│  ├─ games/                     # craft-the-edit/ target-practice/ parkour/ treasure/ spike/ archaeology/
│  ├─ hud/                       # Hotbar, Inventory, PauseMenu, Chat, Toasts, Loader, DimensionCard
│  ├─ overlays/                  # ProjectFocus, BreakdownLens, ContactBook, Timeline (shared with Classic)
│  ├─ ui/                        # pixel UI kit
│  ├─ classic/                   # 2D layouts used by SSR / Classic Mode
│  ├─ state/                     # settings.ts · player.ts · progress.ts
│  ├─ audio/
│  └─ lib/                       # device-tier, analytics, schemas
├─ scripts/
│  ├─ build-atlas.ts             # paint block textures → atlas.png + atlas.json
│  ├─ media.ts                   # thumbnails → 320/640/1280 AVIF + WebP + blur placeholder
│  ├─ video.ts                   # ffmpeg → 6 s preview loops, posters, cut/beat markers
│  ├─ panorama.ts                # capture title-screen cubemaps from our builds
│  └─ schem-import.ts            # optional: Minecraft .schem → our block palette
├─ media-src/                    # original uploads (git-ignored)
└─ docs/  PLAN.md · CONTENT_INTAKE.md
```

### 13.3 Rendering model

- **One persistent `<Canvas>`** sits in the root layout, so the WebGL context survives navigation. Each route tells a scene registry which world to mount. World modules are loaded with `dynamic import()` behind the spider loader, and the next likely dimension is **preloaded during portal transitions**.
- **Dual-layer pages:** every route server-renders its real content as semantic HTML. In 3D mode that DOM stays alive as the **accessibility mirror** (a focusable list of POIs) and powers the overlays. In Classic Mode it *is* the page.
- **Voxel engine:**
  - Worlds are authored in a small TypeScript **structure DSL** (`fill`, `place`, `hollowBox`, `stairs`, `noiseTerrain`, and prefabs like `hawaMahalFacade()`, `endPillar()`, `purpurTower()`).
  - A **Web Worker** voxelizes the world into 32³ chunks and runs **greedy meshing** with **baked vertex ambient occlusion**. That's the soft Minecraft lighting look, and it costs nothing at runtime.
  - One texture atlas and one material per pass (opaque, cutout, emissive) keep draw calls low. Repeated props such as lanterns, kites and particles use instancing.
- **Character:** Minecraft-proportioned box rig (head 8³, body 8×12×4, arms 4×12×4 or slim 3×12×4, legs 4×12×4) mapped to the 64×64 skin UVs, with an inflated outer layer. The animations (idle, walk, wave, crouch, sit, dance emote, glide) are procedural, so no animation files are needed.
- **Camera:** POI rails built on drei `CameraControls` with eased transitions, plus Catmull-Rom spline paths for cinematics.
- **Video in the world:** `VideoTexture` on screen meshes. Loops are short, muted, `playsInline` and `preload="none"`. They start only when in view, **at most 2 play at once**, and they pause when the tab is hidden. Full playback always happens in the DOM overlay.
- **Post-processing** (High tier only): bloom on emissives (crystals, lava, sculk, portal), plus heat haze in the Nether.

### 13.4 Content model (excerpt)

```ts
type VideoProject = {
  slug: string; title: string; description: string;
  home: 'the-end' | 'nether' | 'lab';
  categories: ('gaming-montage'|'cinematic'|'meme'|'beat-sync'|'reels-shorts'|'podcast'|'color-grading'|'experimental')[];
  platform: 'youtube' | 'shorts' | 'reels' | 'client';
  aspect: '16:9' | '9:16' | '1:1';
  client?: string; role: string; date: string; duration: string;
  tools: ToolId[]; techniques: string[];
  media: { loop: string; poster: string; full: { kind: 'youtube'; id: string } | { kind: 'file'; src: string }; raw?: string };
  markers?: { cuts?: number[]; beats?: number[] };  // generated by scripts/video.ts
  stats?: { views?: number; approved: true };
  rarity?: 'common' | 'rare' | 'epic';               // epic = featured + glint
};

type Thumbnail = {
  slug: string; title: string; client?: string; collection: string;
  image: string; alternates?: { image: string; note: string }[];
  brief: string; audience: string;
  breakdown: { composition: string; contrast: string; focalPoint: string; typography: string };
  focal?: { x: number; y: number };                  // drives the overlay
  result?: { ctr?: string; views?: number; approved: true };
  rarity?: 'common' | 'rare' | 'epic';
};

type Milestone = { id: string; date: string; title: string; org?: string;
  kind: 'work' | 'project' | 'achievement' | 'education'; body: string; links?: string[]; icon: SpriteId };

type Skill = { id: string; name: string; station: StationId; description: string;
  tools: ToolId[]; evidence: string[] /* project or thumbnail slugs */ };
```

### 13.5 State and saves

- `settings`: quality, audio, motion, readable font, mode
- `player`: skin layers, cosmetics, title
- `progress`: visited dimensions, advancements, chests, Lost Frames, quest steps, seen work

These persist under `spiderstudios.save.v1` with versioned migrations, and *Delete World* resets them.

### 13.6 Contact backend

1. A server route validates with Zod.
2. Spam is filtered with a honeypot field, a minimum fill time and a per-IP rate limit.
3. **Resend** emails Mehul and sends the visitor an auto-reply ("Delivered by ender pearl").
4. If the API is down, the page falls back to a prefilled `mailto:`.

Environment variables: `RESEND_API_KEY`, `CONTACT_TO`.

---

## 14. Performance and quality tiers

### 14.1 Budgets

| Metric | Target |
|---|---|
| Classic / SSR LCP (mid-range Android, 4G) | < 2.5 s |
| Title screen interactive | < 3 s desktop broadband · < 5 s mid-range Android on 4G |
| JS for the title screen (gzipped, including three.js) | ≤ 350 KB |
| Per-dimension chunk | ≤ 120 KB JS gzipped · ≤ 1.5 MB media before the first interaction |
| Draw calls | ≤ 150 desktop · ≤ 80 mobile |
| Triangles | ≤ 300k desktop · ≤ 120k mobile |
| Frame rate | 60 fps desktop · 30+ fps mid-range mobile (adaptive DPR) |
| Preview loops | ≤ 600 KB each (H.264 + WebM) · max 2 playing |
| Thumbnails | AVIF/WebP at 320/640/1280, with a blur placeholder |

### 14.2 Tiers

| | High | Lite | Classic |
|---|---|---|---|
| Who | Decent desktop or laptop GPU | Phones, tablets, integrated GPUs | No WebGL2, weak devices, Save-Data, or chosen by the visitor |
| World | Full dioramas, bloom, heat haze, particles | Shorter view distance, no post-processing, fewer particles, DPR ≤ 1.5 | No 3D; themed 2D pages with sprite art |
| Interactions | Hover outlines, bow draw, parkour jumps | Tap-first, levitation lift, simplified games | DOM versions of the games, or straight to content |
| Video | In-world loops (max 2) | One loop, or poster images only | Posters + overlay player |

Detection uses `detect-gpu`, a WebGL2 check, `navigator.connection.saveData` and `deviceMemory`. During play, `PerformanceMonitor` steps quality down when the frame rate drops. The visitor can always override the tier in Options.

> **Why this matters:** much of Mehul's audience is likely on mid-range Android phones in India. Lite and Classic are first-class experiences, not afterthoughts.

---

## 15. Accessibility

- **Keyboard first:**
  - `Tab` cycles POIs, `Enter` interacts, `1–9` jump, `E` opens the inventory, `Esc` pauses, `T` opens chat, `M` mutes and `?` shows a keybind overlay.
  - The focus ring is the Minecraft white selection outline.
- **Screen readers:** the canvas is `aria-hidden`, and the server-rendered DOM mirror lists every POI and work item with real labels. Overlays are proper dialogs with a focus trap and restore.
- **Reduced motion:** honours `prefers-reduced-motion`. Panoramas are static, there is no camera bob or shake, cinematics are instant and transitions are fades.
- **Readable text** toggle, WCAG AA contrast on all text, captions on videos where available, and nothing conveyed only by colour.
- **No time pressure:** the parkour has no timer and every game has a skip.
- Sound is never required, and there is a visual cue for every audio cue.

---

## 16. SEO, sharing and analytics

- **SEO:**
  - Server-rendered content on every route, with per-page metadata.
  - JSON-LD: **Person** (Mehul Bhargava, Graphic Designer and Video Editor, Jaipur), plus **VideoObject** and **CreativeWork** for each piece.
  - A `sitemap.xml`.
- **Sharing:**
  - Every project and thumbnail has its own URL and a **dynamic pixel-styled OG image** (title, item frame, rarity colour).
  - Skins can be shared by link.
- **Analytics** (privacy-friendly, Vercel Analytics plus custom events):
  - Events: dimension entered, project opened, video watched to 50% and 100%, thumbnail breakdown opened, quest skipped or completed, Classic Mode chosen, Hire Me clicked, form submitted.
  - These tell Mehul which work actually gets attention.

---

## 17. Legal and IP guardrails

- **Mojang/Minecraft:**
  - No textures, sounds, fonts, models or logos, and no "Minecraft" in the brand or logo.
  - Every asset is original (procedural or hand-made) or licensed.
  - Footer: *"Not an official Minecraft product. Not affiliated with Mojang or Microsoft."*
- **Riot/Valorant:**
  - No Riot logos, agents, map geometry or audio.
  - The maps are **re-imagined originals** (*Thar*, *Kamal*, *Pink City Plaza*), and the role names in the Loadouts are generic FPS terms.
  - Mehul's own gameplay footage inside his edits is a separate matter, governed by Riot's video policy.
  - Footer: *"Not affiliated with Riot Games."*
- **Client work:** written OK from Bull Commander, InnHouse, Sid and Co. and Streamico before their work or stats are published.
- **Fonts and libraries:** OFL or MIT only, with licences kept in `/licenses`.
- **Music:** original or licensed only. Nothing pulled from games.

---

## 18. Build roadmap

Every phase ends in a deployable preview.

### Phase 0: Foundations

- Next.js + TypeScript scaffold, linting, a Vercel preview, design tokens and fonts
- **Pixel UI kit** and a kit showcase page
- **Sprite system** plus the first ~40 icons; **block painters** and the atlas
- **Voxel engine:** structure DSL, worker greedy mesher, vertex AO, a test island
- Content schemas **pre-filled from the resume**, with placeholder media
- State stores, saves, device-tier detection, Classic layout skeleton

**Done when:** the test island runs at 60 fps on desktop and 30+ on a mid-range phone, and Classic routes render the real resume content.

### Phase 1: Launch screen and identity

- Voxel wordmark, splash system, panorama capture, the **title screen**, **Select World**, the showreel overlay
- Character rig, skin compositor, the **Dressing Room** with the v1 catalogue, import/export/share
- HUD: hotbar, Hire Me, pause menu, inventory shell, toasts, chat palette, spider loader, dimension cards, transitions, audio

**Done when:** a visitor can launch, customize, and hotbar-jump between dimensions (stubs at this point) on desktop and mobile.

### Phase 2: Portfolio core (the conversion path first)

- **The End** + Project Focus View + filters + Edit X-Ray
- **Ancient City** + Breakdown Lens + Archaeology Wing
- **Nether** + vertical Shorts frames
- **Final Portal** + live contact form + resume download
- Media scripts (images, loops, markers)

**Done when:** a recruiter on a phone can find a video, watch it, view a thumbnail breakdown and send a message in **under 60 seconds**, and Classic Mode has full parity.

### Phase 3: Story and skills

- **Overworld / Pink City** + Portal Plaza + **About quest**
- **Crafting Room** + evidence-linked skills + tool chest + **Craft the Edit**
- **End City** + **Career Parkour** + elytra finale

**Done when:** the golden path plays end to end and every quest can be skipped.

### Phase 4: The play layer

- Thumbnail Target Practice, Spike Defuse, Piglin Barter, **Treasure Hunt** + Map, **Lost Frames**, **Snapshot Lab**
- Boss reveals, the full advancement set, Player Card and Titles, the credits roll, the `F3` overlay, secret commands

### Phase 5: Polish and launch

- Performance pass per tier
- Accessibility audit (keyboard, screen reader, reduced motion)
- Device QA (iOS Safari, low-end Android, Firefox)
- SEO, OG images and analytics
- Final copy review with Mehul, then domain and production deploy

**Stretch:** free-roam WASD mode, a Hindi language toggle, a headless CMS, and seasonal events (Diwali lights over the Pink City, kites for Makar Sankranti).

---

## 19. What we need from Mehul

The full checklist is in **[CONTENT_INTAKE.md](./CONTENT_INTAKE.md)**, ready to send him. In short:

1. **Videos:** 8–20 of his best edits, as files or links, with title, category, platform, client, date, tools and techniques. Raw footage for 1–3 of them enables Before/After.
2. **Thumbnails:** 15–40 high-resolution finals, plus alternates and drafts for A/B, the brief and audience for each, and stats if they're approved.
3. **Design work:** InnHouse carousels and posts, posters, logos and banners.
4. **Web work:** Streamico screens or Figma flows, and the Sid and Co. site URL.
5. **Dates:** channel start, Webathon, cricket tournament, dance competition, education, Streamico.
6. **Links:** YouTube channel, Instagram, Discord, LinkedIn, Behance, X (whichever apply), plus the Bull Commander channel.
7. **Avatar reference:** a photo or description (hair, glasses, signature outfit), his Valorant main, his favourite colours.
8. **Permissions** from each client to show their work and stats.
9. **Voice:** approve or edit the draft copy in Appendix C.

> We don't need to wait for any of this. Phase 0 and Phase 1 run on placeholders, and real content drops into `src/content/` whenever it arrives.

---

## 20. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | Where full videos live | **Hybrid:** preview loops self-hosted (tiny); full videos on YouTube through a lightweight click-to-load embed, unless he has files he'd rather self-host on R2 or Bunny. Edit X-Ray works either way. |
| 2 | Contact delivery | **Resend** once a domain exists; **Formspree** as a zero-setup interim |
| 3 | Domain | For example `spiderstudios.in`, `.xyz` or `.studio` (Mehul to choose) |
| 4 | Phone or WhatsApp on the site | Off by default; a "Message on WhatsApp" button only if he wants it |
| 5 | Showing client stats (CTR, views) | Only with written approval; otherwise omit |
| 6 | Free-roam WASD | Stretch goal (Phase 5) after the guided version ships |

---

## Appendix A: Splash texts

Edit Your Own Way! · Craft Every Frame! · Make Every Pixel Count! · Made in Jaipur! · Pink City certified! · Thumbnails that click! · Every cut earns its place! · Ctrl+Z is my best friend! · Now with 100% more cuts! · Sound design included! · J-cuts and L-cuts! · Clutch editing! · Ace! · Spike planted! · Beat-synced! · Speed-ramped! · Keyframes all the way down! · Rendered in 4K… eventually! · Shorts? Long-form? Both! · Contrast is king! · Readable at 168 pixels wide! · Spun a web, then a website! · Led a 15-person dance crew! · Hit a six! · Not a spider, a studio! · Retention is everything! · 0% invented stats! · Kites over Jaipur! · Press T for secrets! · Also try Classic Mode! · Co-op mode available! · No creepers were harmed!

## Appendix B: Chat commands

| Command | Effect |
|---|---|
| `/help` | Lists the commands |
| `/tp <overworld\|end\|ancient\|nether\|crafting\|endcity\|portal>` | Travel |
| `/hire` | Final Portal |
| `/showreel` | Plays the showreel |
| `/skin` | Opens the Dressing Room |
| `/gamemode classic` · `/gamemode 3d` | Switches mode |
| `/time set day\|night` · `/weather clear\|rain` | Cosmetic world changes |
| `/locate chest` | Hints at the nearest unopened chest |
| `/resume` | Downloads the resume PDF |
| `/seed` | `Jaipur-26.9124N-75.7873E` |
| `/give @s chai` | ☕ (easter egg) |
| `/snapshot` | Opens the Snapshot Lab |
| `/credits` | Rolls the credits |
| `/kill` | "You fell out of the timeline." Respawns you at spawn. |
| *(any other text)* | Searches projects and thumbnails |

## Appendix C: Draft copy

*These are drafts written from the resume. Mehul should approve or rewrite all of them.*

**About: Ch. 1, Who I am**
> I'm Mehul, the editor behind SpiderStudios. I design thumbnails that earn the click and cut edits that earn the watch time. I'm based in Jaipur and work with creators anywhere.

**About: Ch. 2, Where I'm from**
> I grew up in the Pink City and started in graphic design: posters, logos, social posts. Then gaming pulled me into YouTube, and Valorant clips turned into edits. Now I do both, and each one makes the other better.

**About: Ch. 3, How I play**
> I've played in the All India Cricket Tournament and finished on the podium at SKIT's Webathon. Both taught me the same thing: good teams win, and clear communication wins faster.

**About: Ch. 4, How I lead**
> I once led a 15+ member dance crew to first place. Rhythm is how I think. It's why I love beat-sync edits, and why every cut I make lands on purpose.

**About: Ch. 5, What I believe**
> 1. **Clean beats cluttered.** Minimal layouts, clear hierarchy, instant recall.
> 2. **Every cut earns its place.** Pacing *is* retention.
> 3. **Sound is half the edit.**
> 4. **The audience is the brief.**

**Final Portal invitation**
> Got footage that deserves better, or thumbnails that aren't getting clicked? Let's craft something worth watching.
> **[ Start a Project ]** **[ Hire Me ]**

**Dimension one-liners**
- **The End:** "Where the polished cuts live."
- **Ancient City:** "Quiet, please. The thumbnails are thinking."
- **Nether:** "High heat. High frame rate."
- **Crafting Room:** "Every skill, with receipts."
- **End City:** "The climb so far."
- **Final Portal:** "Your project starts here."
