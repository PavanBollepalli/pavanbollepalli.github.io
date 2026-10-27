import { projects } from "@/lib/content";
import { RedirectTo } from "@/components/redirect";

// A static export has to know every URL up front.
export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export default async function ProjectAlias({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RedirectTo href={`/work/${slug}`} label="This project lives under Work now." />;
}
