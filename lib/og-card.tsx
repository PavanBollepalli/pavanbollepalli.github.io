import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ogImage } from "./seo";

/**
 * The artwork for the social preview card, rendered once at build time.
 *
 * It lives here rather than in the `app/opengraph-image.tsx` metadata convention
 * because that convention exports an extensionless file, which hosts that type by
 * extension serve as `application/octet-stream`. `app/og.png/route.ts` renders
 * this into `out/og.png` instead; see the note there. The dimensions come from
 * `ogImage` so the card and the tags describing it cannot drift apart.
 */
export const alt = ogImage.alt;
export const size = { width: ogImage.width, height: ogImage.height };

const logoData = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "public/assets/pb-monogram.svg")).toString("base64")}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 65px", background: "#0b0b0d", color: "#eeeef0", border: "1px solid #28282d" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 20, letterSpacing: 3 }}><img src={logoData} width={68} height={35}/><span style={{ color: "#a2a2ad" }}>BACKEND & AI ENGINEER</span></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 80, lineHeight: 1.05, letterSpacing: -3 }}><span>Intelligent systems.</span><span>Engineered to <span style={{ color: "#9ab4ff" }}>last.</span></span></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}><span style={{ fontSize: 34 }}>Pavan Bollepalli</span><span style={{ fontSize: 19, color: "#a2a2ad" }}>APIs · Retrieval · Evidence-led AI</span></div>
    </div>, size,
  );
}
