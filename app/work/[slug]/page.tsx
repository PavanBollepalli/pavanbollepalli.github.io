import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/lib/content";
import { EvidenceLab, PipelineLab, ProjectArt } from "@/components/diagrams";
import { Contact } from "@/components/sections";
import { Reveal } from "@/components/motion";
import { ContainerScroll } from "@/components/container-scroll";
import { ProjectDeepDive } from "@/components/project-deep-dive";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map(project => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata(project.name, project.description, `/work/${project.slug}`);
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  const starLabels = { situation: "Problem", task: "Goal", action: "Approach", result: "Result" };

  return (
    <div className={`case-page project-${project.color}`}>
      <div className="case-breadcrumb"><Link href="/work"><ArrowLeft size={14}/> SELECTED WORK</Link></div>
      <Reveal className="case-hero">
        <span className="eyebrow">{project.type}</span>
        <div className={`case-title-row ${slug === "flash-resume" ? "has-traction" : ""}`}>
          <h1>{project.name}<em className="gradient-text">.</em></h1>
          {slug === "flash-resume" && <div className="case-traction" aria-label="Flash Resume usage">
            <span className="eyebrow">IN USE</span>
            <div><strong>850</strong><span>PyPI downloads</span></div>
            <i aria-hidden="true"/>
            <div><strong>20+</strong><span>active users</span></div>
            <a href={project.url} target="_blank" rel="noreferrer" aria-label="View Flash Resume on PyPI">VIEW ON PYPI <ArrowUpRight size={13}/></a>
          </div>}
        </div>
        <p>{project.description}</p>
        <div className="tags">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
        <dl className="project-star case-star">{Object.entries(project.star).map(([key, value]) => <div key={key}><dt>{starLabels[key as keyof typeof starLabels]}</dt><dd>{value}</dd></div>)}</dl>
        <div className="case-actions">
          <a href={project.url} className="button button-primary" target="_blank" rel="noreferrer">{slug === "flash-resume" ? "Explore on PyPI" : "Explore the project"}<ArrowUpRight size={17}/></a>
          <a href={project.source} className="text-link" target="_blank" rel="noreferrer"><Github size={16}/> Read the source</a>
        </div>
      </Reveal>

      <div className="case-visual texture framed"><ContainerScroll><div className="project-art"><div className="project-art-head"><span>{project.headline}</span><ArrowUpRight size={22}/></div><ProjectArt kind={slug}/></div></ContainerScroll></div>

      <ProjectDeepDive project={project}>
        {slug === "skillvector" && <PipelineLab/>}
        {slug === "flash-resume" && <EvidenceLab/>}
      </ProjectDeepDive>
      <Contact/>
    </div>
  );
}
