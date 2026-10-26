import { pageMetadata } from "@/lib/seo";
import { Contact, NoteCards, PageHeading } from "@/components/sections";

export const metadata = pageMetadata("Engineering notes", "Field notes on retrieval, evidence-led AI and backend fundamentals, grounded in projects I've built.", "/notes");
export default function NotesPage() {
  return <><PageHeading eyebrow="FROM THE BACKEND" title="Decisions, details" accent="& a little curiosity." description="Short engineering notes from real projects. No invented publication history. Just the reasoning behind the work."/><NoteCards/><Contact/></>;
}
