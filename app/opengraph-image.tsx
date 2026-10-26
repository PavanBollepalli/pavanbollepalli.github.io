import { ImageResponse } from "next/og";

export const alt = "Pavan Bollepalli — Backend & AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 65px", background: "#0b0b0d", color: "#eeeef0", border: "1px solid #28282d" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 20, letterSpacing: 3 }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M12 37V11h11.5a7.5 7.5 0 0 1 0 15H12m0 0h12.5a7 7 0 0 1 0 14H12" stroke="#eeeef0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 11h5v5" stroke="#6d91ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="11" r="2.2" fill="#6d91ff"/></svg><span style={{ color: "#eeeef0", fontSize: 19, fontWeight: 650, letterSpacing: 4 }}>PAVAN BOLLEPALLI</span></div><span style={{ color: "#a2a2ad" }}>BACKEND & AI ENGINEER</span></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 80, lineHeight: 1.05, letterSpacing: -3 }}><span>Intelligent systems.</span><span>Engineered to <span style={{ color: "#9ab4ff" }}>last.</span></span></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}><span style={{ fontSize: 34 }}>Pavan Bollepalli</span><span style={{ fontSize: 19, color: "#a2a2ad" }}>APIs · Retrieval · Evidence-led AI</span></div>
    </div>, size,
  );
}
