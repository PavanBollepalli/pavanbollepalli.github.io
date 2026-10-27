import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { Bento, SectionHeading, ProjectList, AboutTeaser, NoteCards, SiteExplore, Contact } from "@/components/sections";
import { GitHubSection, GitHubSkeleton } from "@/components/github";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata = { ...pageMetadata("Pavan Bollepalli — Backend & AI Engineer", siteDescription, "/"), title: { absolute: "Pavan Bollepalli — Backend & AI Engineer" } };
export const revalidate = 21600;

export default function HomePage() {
  return <><Hero/><Bento/><section className="work-section framed" id="work"><SectionHeading eyebrow="SELECTED WORK / BUILT, NOT JUST IMAGINED" title="A few things" accent="I’ve put into the world." centered/><ProjectList/></section><AboutTeaser/><Suspense fallback={<GitHubSkeleton/>}><GitHubSection/></Suspense><section className="notes-section framed" id="notes"><SectionHeading eyebrow="FROM THE BACKEND" title="Thoughts &" accent="field notes."/><NoteCards/></section><SiteExplore/><Contact/></>;
}
