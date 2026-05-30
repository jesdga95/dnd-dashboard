import aliasData from "./iconAliases.json";

/** Bilingual (EN/ES) search aliases per lucide icon name. */
export const ICON_ALIASES = aliasData as Record<string, string[]>;

/** Lowercase + strip accents/diacritics so "Poción" matches "pocion". */
export function normalize(s: string): string {
  // Strip the combining-diacritic block (U+0300–U+036F) left by NFD decomposition.
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Pre-normalize the alias index once — search runs on every keystroke.
const NORMALIZED: { icon: string; aliases: string[] }[] = Object.entries(ICON_ALIASES).map(
  ([icon, aliases]) => ({ icon, aliases: aliases.map(normalize) })
);
const ALIAS_MAP = new Map(NORMALIZED.map((e) => [e.icon, e.aliases]));

/** Icon-picker search: does this icon's name or any alias contain the (already-normalized) query? */
export function iconMatchesQuery(iconName: string, normalizedQuery: string): boolean {
  if (normalize(iconName).includes(normalizedQuery)) return true;
  const aliases = ALIAS_MAP.get(iconName);
  return aliases ? aliases.some((a) => a.includes(normalizedQuery)) : false;
}

// Strip a trailing EN/ES plural marker so "herramientas" matches "herramienta", "arrows" matches "arrow".
// Only removes a trailing -s/-es (exact stem compare, never a prefix), so it won't over-match unrelated words.
const dePlural = (w: string) => w.replace(/(es|s)$/, "");

/**
 * Auto-suggest an icon from a free-text item name (EN or ES, accent- and plural-insensitive).
 * Priority: (1) the most specific multi-word alias anywhere ("mapa del tesoro" → Map, beating
 * the single word "tesoro" → Coins), then (2) the EARLIEST word in the name that matches a
 * single-word alias (the leading noun is usually the item; "espada del tesoro" → Sword).
 * Icon-list order only breaks ties. Multi-word aliases match as a substring; single-word
 * aliases match whole words/stems (so "key" won't fire on "monkey").
 */
export function suggestIcon(rawName: string): string | null {
  const normalized = normalize(rawName);
  if (!normalized.trim()) return null;

  // (1) Multi-word aliases first — most specific signal.
  for (const { icon, aliases } of NORMALIZED) {
    for (const a of aliases) {
      if (a.includes(" ") && normalized.includes(a)) return icon;
    }
  }

  // (2) Then the earliest matching word in the name wins.
  for (const word of normalized.split(/[^a-z0-9]+/).filter(Boolean)) {
    const stem = dePlural(word);
    for (const { icon, aliases } of NORMALIZED) {
      for (const a of aliases) {
        if (!a.includes(" ") && (a === word || dePlural(a) === stem)) return icon;
      }
    }
  }
  return null;
}
