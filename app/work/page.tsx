import { pageMetadata } from "@/lib/seo";
import { Contact, PageHeading, ProjectList } from "@/components/sections";

export const metadata = pageMetadata("Selected work", "Three projects, explained clearly: the problem, what I built, and what the results show.", "/work");
export default function WorkPage() {
  return <><PageHeading className="work-page-heading" eyebrow="SELECTED WORK / BUILT, NOT JUST IMAGINED" title="A few things" accent="I’ve put into the world."/><ProjectList/><Contact/></>;
}
