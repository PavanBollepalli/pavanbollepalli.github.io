import type { NextConfig } from "next";

/**
 * GitHub Pages serves project sites from a subpath (`/<repo>`), so the exported
 * build has to know its own prefix. The deploy workflow passes it in from
 * `actions/configure-pages`; it stays empty for `next dev` and for custom-domain
 * deploys, where the site sits at the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";

const config: NextConfig = {
  // The site is a static export: fully prerendered HTML uploaded to Pages.
  output: "export",
  // Emits `about/index.html` rather than `about.html`, which is what Pages serves
  // most predictably for nested routes.
  trailingSlash: true,
  basePath,
  // `next/image` needs a server to resize on demand; a static export has none.
  images: { unoptimized: true },
  poweredByHeader: false,
  // NOTE: `headers()` is deliberately absent. A static export is a folder of files
  // with no server to attach them to, so the security headers the site used to set
  // here were never applied once it moved to Pages. If this ever runs on a Node or
  // edge host again, restore the block below:
  //   async headers() { return [{ source: "/:path*", headers: [...] }]; }
};

export default config;
