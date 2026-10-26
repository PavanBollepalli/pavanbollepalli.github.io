import { pageMetadata } from "@/lib/seo";
import { Contact, PageHeading, ProjectList } from "@/components/sections";

export const metadata = pageMetadata("Selected work", "Inside SkillVector, Flash Resume and CodeAtlas: the situation, task, action, results and evidence.", "/work");
export default function WorkPage() {
  return <><PageHeading eyebrow="SELECTED WORK / BUILT, NOT JUST IMAGINED" title="Built with purpose." accent="Backed by evidence." description="Not just what I built. Why I built it, what made it difficult, and the decisions that made it work."/><ProjectList/><Contact/></>;
}
