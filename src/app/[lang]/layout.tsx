import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/getDictionary";
import { DictProvider } from "@/lib/DictContext";
import {
  LANGUAGE_ALTERNATES,
  OG_IMAGE_URL,
  OG_LOCALE,
  SITE_NAME,
  ogImage,
} from "@/lib/site";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const { title, description, ogDescription, ogAlt } = dict.meta;
  return {
    title,
    description,
    // Each locale is canonical for itself, and both advertise the whole set so
    // Google serves the right one instead of picking a winner.
    alternates: { canonical: `/${lang}`, languages: LANGUAGE_ALTERNATES },
    // Metadata merges shallowly: openGraph and twitter here REPLACE the root
    // layout's, so both have to be spelled out in full, images included.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: `/${lang}`,
      title,
      description: ogDescription,
      images: [ogImage(ogAlt)],
      locale: OG_LOCALE[lang],
      alternateLocale: Object.values(OG_LOCALE).filter(
        (l) => l !== OG_LOCALE[lang],
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: [{ url: OG_IMAGE_URL, alt: ogAlt }],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  return <DictProvider dict={dict}>{children}</DictProvider>;
}
