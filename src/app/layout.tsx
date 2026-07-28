import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  AUTHOR,
  KEYWORDS,
  LANGUAGE_ALTERNATES,
  OG_IMAGE_URL,
  ROOT_URL,
  SITE_NAME,
  SITE_URL,
  jsonLd,
  ogImage,
} from "@/lib/site";

const OG_ALT =
  "D&D Dashboard: one sheet for the whole table. A character sheet showing HP, armor, speed, initiative, spell save DC and a live party list.";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// `/` is a client-side language redirect, so with no metadata here the site root
// — the URL crawlers and LLM fetchers reach first — shipped an empty <head>.
// These values describe the site as a whole; the locale layout overrides title,
// description, canonical and og for /en and /es.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} · Live 5e Character Sheet`,
  description:
    "A live D&D 5e character sheet for the whole table. Track abilities, HP, spells, inventory and combat, synced in real time between every player and the DM.",
  applicationName: SITE_NAME,
  authors: [AUTHOR],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  keywords: KEYWORDS,
  category: "games",
  alternates: { canonical: ROOT_URL, languages: LANGUAGE_ALTERNATES },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  // Declared rather than using the app/icon file convention: the mark's source of
  // truth is public/favicon.svg, which scripts/make-icons.py rasterises into the
  // .ico and PNGs beside it. Pointing at those files keeps one copy of the mark
  // and gives the manifest and these tags the same stable URLs.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "D&D Sheet", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: ROOT_URL,
    title: `${SITE_NAME} · Live 5e Character Sheet`,
    description:
      "Abilities, HP, spells, inventory and combat, synced live between every player and the DM.",
    images: [ogImage(OG_ALT)],
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · Live 5e Character Sheet`,
    description:
      "Abilities, HP, spells, inventory and combat, synced live between every player and the DM.",
    images: [{ url: OG_IMAGE_URL, alt: OG_ALT }],
  },
};

export const viewport: Viewport = {
  // Matches --color-bg, so mobile browser chrome blends into the page.
  themeColor: "#f4f1ec",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        {/* Site-level entity for search engines and LLM fetchers. Every value is
            a static constant from lib/site, so there is no user input to escape. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
