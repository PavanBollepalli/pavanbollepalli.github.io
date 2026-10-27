import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Metadata routes are dynamic by default. A static export has no server to run them
// on, so they must be frozen into files at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` };
}
