import type { Metadata } from "next";

export const siteUrl = "https://pavanbollepalli.me";
export const siteDescription = "Pavan Bollepalli builds reliable APIs, fast retrieval pipelines and evidence-led AI tools. Explore SkillVector, Flash Resume, CodeAtlas and the engineering behind them.";

export function pageMetadata(title: string, description: string, path: string, type: "website" | "article" = "website"): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type, siteName: "Pavan Bollepalli", locale: "en_IN", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Pavan Bollepalli — Backend & AI Engineer" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
