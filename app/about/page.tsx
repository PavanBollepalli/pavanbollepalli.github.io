import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { AboutTeaser, Bento, Contact, Experience, PageHeading } from "@/components/sections";
import { GitHubSection, GitHubSkeleton } from "@/components/github";

export const revalidate = 21600;
export const metadata = pageMetadata("About & experience", "The person behind the systems. Pavan's backend and AI engineering journey, Wikimedia experience, skills and real GitHub activity.", "/about");
export default function AboutPage() {
  return <div className="about-page"><PageHeading eyebrow="BEHIND THE CODE" title="A builder at heart." accent="An engineer by choice." description="I’m Pavan Bollepalli. A 2026 Computer Science (AI & ML) graduate, open-source contributor, and someone who thinks the best AI products start with solid backend engineering."/><AboutTeaser/><Experience/><Bento/><Suspense fallback={<GitHubSkeleton/>}><GitHubSection full/></Suspense><Contact/></div>;
}
