import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { AboutTeaser, Bento, Contact, Credentials, Experience, PageHeading } from "@/components/sections";
import { GitHubSection, GitHubSkeleton } from "@/components/github";

export const metadata = pageMetadata("About & experience", "Pavan Bollepalli's engineering background, open-source work, projects, education, and certifications.", "/about");
export default function AboutPage() {
  return <div className="about-page"><PageHeading eyebrow="ABOUT PAVAN" title="I build the systems" accent="behind useful AI." description="I'm a 2026 Computer Science graduate focused on backend engineering and applied AI. I make the services and data pipelines that help AI products find relevant information, give answers people can verify, and work reliably."/><AboutTeaser/><Experience/><Credentials/><Bento/><Suspense fallback={<GitHubSkeleton/>}><GitHubSection full/></Suspense><Contact/></div>;
}
