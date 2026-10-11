import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { GameShell } from "@/hud/GameShell";
import { site } from "@/content/site";

const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — ${site.owner} · Video Editor & Thumbnail Designer`,
    template: `%s · ${site.brand}`,
  },
  description: `${site.owner} (${site.brand}) — video editor, thumbnail & graphic designer and Valorant content creator from Jaipur. Explore the portfolio as a Minecraft-inspired 3D world, or switch to Classic Mode.`,
  keywords: ["video editor", "thumbnail designer", "YouTube thumbnails", "Valorant edits", "Jaipur", "graphic designer", "SpiderStudios", site.owner],
  openGraph: {
    title: `${site.brand} — ${site.owner}`,
    description: "Thumbnails that earn the click. Edits that earn the watch time. Explore the world.",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e0b12",
  width: "device-width",
  initialScale: 1,
};

// Runs before paint: picks 3D or Classic so the right layer shows without a flash.
const modeScript = `(function(){try{var d=document.documentElement;var q=new URLSearchParams(location.search).get('mode');var s=(JSON.parse(localStorage.getItem('ss-settings')||'{}').state)||{};var m=(q==='classic'||q==='3d')?q:(s.mode||'3d');d.dataset.mode=m;d.dataset.readable=s.readable?'true':'false';if(s.motion==='reduced')d.dataset.motion='reduced';}catch(e){document.documentElement.dataset.mode='3d';}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.owner,
  alternateName: site.brand,
  jobTitle: "Video Editor & Thumbnail Designer",
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Jaipur", addressRegion: "Rajasthan", addressCountry: "IN" },
  knowsAbout: ["Video editing", "Thumbnail design", "Graphic design", "Branding", "Short-form video", "Valorant gameplay edits"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="3d" className={atkinson.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
        <noscript>
          <style>{`html[data-mode="3d"] .page-layer{position:static!important;width:auto!important;height:auto!important;clip:auto!important;overflow:visible!important}html[data-mode="3d"],html[data-mode="3d"] body{overflow:auto!important;height:auto!important}`}</style>
        </noscript>
        <link rel="preload" href="/fonts/Monocraft.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <GameShell>{children}</GameShell>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
