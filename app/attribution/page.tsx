import type { Metadata } from "next";
import { PageHeading, Contact } from "@/components/sections";
import { Reveal } from "@/components/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Attribution", "The tools and open-source projects that make this site possible.", "/attribution");
const credits = [
  ["Framework", "Next.js and React"], ["Motion", "Motion for React"], ["UI primitives", "Radix UI"], ["Icons", "Lucide and Simple Icons"], ["Type", "Instrument Serif, Inter, and JetBrains Mono"],
];
export default function AttributionPage() { return <><PageHeading eyebrow="BUILT WITH OPEN TOOLS" title="Good work" accent="stands on work." description="A short list of the software and open-source projects used to build this portfolio."/><section className="attribution-list framed">{credits.map(([label,value],index)=><Reveal key={label} className="attribution-row" delay={index*.05}><span className="eyebrow">0{index+1} / {label}</span><h2>{value}</h2></Reveal>)}</section><Contact/></>; }
