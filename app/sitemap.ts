import type { MetadataRoute } from "next";
import { notes, projects } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

// Frozen at build time; see the note in app/robots.ts.
export const dynamic = "force-static";

const pages = ["", "/about", "/work", "/notes", "/blog", "/guestbook", "/uses", "/bucket-list", "/links", "/contact", "/legal/privacy", "/legal/terms", "/attribution", "/rss.xml"];
export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...projects.map(project => `/work/${project.slug}`), ...notes.flatMap(note => [`/notes/${note.slug}`, `/blog/${note.slug}`])]
    .map(path => ({ url: `${siteUrl}${path}`, changeFrequency: "monthly", priority: path === "" ? 1 : 0.7 }));
}
