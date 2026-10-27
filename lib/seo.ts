import type { Metadata } from "next";

/**
 * Absolute origin the site is served from, used for canonicals, Open Graph URLs,
 * the sitemap and the RSS feed.
 *
 * The deploy workflow sets NEXT_PUBLIC_SITE_URL to the Pages origin plus its base
 * path, so a project-site deploy keeps its `/Modern-Portfolio-main` prefix while a
 * root deploy (the `PavanBollepalli.github.io` user site) resolves to the bare
 * origin. The fallback is the live root site; point it at a custom domain here
 * (and set it in the workflow) if the site moves.
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
export const siteUrl = configuredSiteUrl || "https://pavanbollepalli.github.io";
export const siteDescription = "Pavan Bollepalli builds reliable APIs, fast retrieval pipelines and evidence-led AI tools. Explore SkillVector, Flash Resume, CodeAtlas and the engineering behind them.";

/**
 * The social preview card. It is rendered by lib/og-card.tsx and served from a
 * route that ends in `.png` rather than from the `app/opengraph-image.tsx`
 * convention, because that convention exports without a file extension and hosts
 * that type by extension then serve it as `application/octet-stream`. See the note
 * in app/og.png/route.ts.
 */
export const ogImage = { url: "/og.png", width: 1200, height: 630, alt: "Pavan Bollepalli — Backend & AI Engineer" };

export function pageMetadata(title: string, description: string, path: string, type: "website" | "article" = "website"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: "Pavan Bollepalli", locale: "en_IN", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}
