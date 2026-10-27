import OpenGraphImage from "@/lib/og-card";

/**
 * The Open Graph card, served from `/og.png`.
 *
 * The rendered PNG is 1200×630 and meant to be rendered by a scraper, not a
 * browser tab, so its content type matters. Routing it through the
 * `app/opengraph-image.tsx` convention would export it as an extensionless
 * `out/opengraph-image`, and a host that types responses by extension — GitHub
 * Pages among them — would serve that as `application/octet-stream`, which no
 * social scraper will render. Naming the segment `og.png` makes the export write
 * `out/og.png`, so the extension is present and carries the type with it. Keep
 * the metadata in `lib/seo.ts` and `app/layout.tsx` pointed here.
 */
export const dynamic = "force-static";

// ImageResponse is a Response, so the metadata route's renderer doubles as the handler.
export function GET() {
  return OpenGraphImage();
}
