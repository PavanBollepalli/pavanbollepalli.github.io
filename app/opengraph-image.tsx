import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "Pavan Bollepalli — Backend & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Rendered once at build time into a static PNG; see the note in app/robots.ts.
export const dynamic = "force-static";
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
