import { projects } from "@/lib/content";
import { RedirectTo } from "@/components/redirect";

// A static export has to know every URL up front.
export function generateStaticParams() {
  return [...projects.map(project => ({ slug: project.slug })), { slug: "codeatlas" }];
}

export default async function ProjectAlias({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "codeatlas") return <RedirectTo href="/work" label="That project is no longer featured. Explore the current work and see what’s coming next."/>;
  return <RedirectTo href={`/work/${slug}`} label="This project lives under Work now." />;
}
