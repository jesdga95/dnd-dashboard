// Everything that identifies this site to crawlers, LLM fetchers and share
// cards. The metadata exports, the JSON-LD block and the static files in
// public/ (robots.txt, sitemap.xml, llms.txt, site.webmanifest) all describe the
// same app, so the values they share live here — a canonical URL that has
// drifted from the sitemap is worse than no canonical at all.

export const SITE_URL = "https://dnd.jgulfo.com";
export const SITE_NAME = "D&D Dashboard";
export const AUTHOR = { name: "Jesus Gulfo", url: "https://jgulfo.com" };
export const REPO_URL = "https://github.com/jesdga95/dnd-dashboard";

// Rasterised from scripts/og-card.html — see scripts/make-icons.py.
export const OG_IMAGE_URL = "/assets/og.png";

// The alt text is localised, so callers pass their own.
export const ogImage = (alt: string) => ({
  url: OG_IMAGE_URL,
  width: 1200,
  height: 630,
  type: "image/png",
  alt,
});

export const LOCALES = ["en", "es"] as const;
export const OG_LOCALE = { en: "en_US", es: "es_ES" } as const;

// The homepage, in the conventional trailing-slash form used by the sitemap's
// <loc> and the JSON-LD url. Note that Next normalises this to the bare origin
// when it renders <link rel="canonical">, whichever form it is given; the two
// are the same URL (RFC 3986 §6.2.3 treats an empty http(s) path as "/"), so the
// difference is cosmetic and not worth working around.
export const ROOT_URL = `${SITE_URL}/`;

// `/` detects the visitor's language in the browser and replaces itself with one
// of the locale routes, so it is the x-default rather than a page of its own.
export const LANGUAGE_ALTERNATES: Record<string, string> = {
  en: `${SITE_URL}/en`,
  es: `${SITE_URL}/es`,
  "x-default": ROOT_URL,
};

// Same in both locales, so it isn't worth a dictionary round-trip.
export const KEYWORDS = [
  "D&D character sheet",
  "D&D 5e",
  "digital character sheet",
  "dungeons and dragons",
  "DM party tracker",
  "initiative tracker",
  "combat tracker",
  "spell slot tracker",
];

// One site-level entity, emitted from the root layout so `/`, `/en` and `/es`
// all carry it. Author points at jgulfo.com to tie the project to its author.
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "D&D 5e Character Sheet",
  url: ROOT_URL,
  description:
    "A live Dungeons & Dragons 5e character sheet. Players track abilities, skills, HP, spells, inventory, equipment and class resources; the Dungeon Master watches the whole party's HP, conditions and spell slots update in real time and runs initiative from the same data.",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  inLanguage: ["en", "es"],
  image: `${SITE_URL}${OG_IMAGE_URL}`,
  screenshot: `${SITE_URL}${OG_IMAGE_URL}`,
  author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  codeRepository: REPO_URL,
  about: { "@type": "Thing", name: "Dungeons & Dragons 5th Edition" },
  featureList: [
    "Auto-derived ability modifiers, saving throws, spell save DC and passive perception",
    "HP, temporary HP and death saving throw tracking",
    "Spell slots and prepared spells with concentration and ritual flags",
    "Inventory, equipment slots and coin purse",
    "Custom class resource trackers with short and long rest resets",
    "Dungeon Master party view with live HP, conditions and spell slots",
    "Initiative and combat tracker with per-monster reveal and damage attribution",
    "English and Spanish",
  ],
  disambiguatingDescription:
    "An unofficial, non-commercial fan project. Not affiliated with or endorsed by Wizards of the Coast. Character data is private to each signed-in account.",
};
