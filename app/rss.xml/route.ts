import { notes } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

const escape = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
export function GET() {
  const items = notes.map(note => `<item><title>${escape(note.title)}</title><link>${siteUrl}/blog/${note.slug}</link><guid>${siteUrl}/blog/${note.slug}</guid><description>${escape(note.subtitle)}</description></item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Pavan Bollepalli — Engineering notes</title><link>${siteUrl}/blog</link><description>Notes on backend engineering and AI reliability.</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
