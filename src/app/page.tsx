"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["en", "es"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

// Locale detection runs in the browser: a static export has no server, so
// there is no request whose `accept-language` we could read. `navigator
// .languages` is the same preference list, already sorted by q-value.
function detectLocale(): Locale {
  const preferred =
    typeof navigator === "undefined"
      ? []
      : navigator.languages ?? [navigator.language];

  for (const tag of preferred) {
    const lower = tag.toLowerCase();
    const match = LOCALES.find((l) => lower === l || lower.startsWith(`${l}-`));
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${detectLocale()}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-line border-t-muted animate-spin" />
    </div>
  );
}
