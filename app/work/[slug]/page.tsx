import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/lib/content";
import { EvidenceLab, PipelineLab, ProjectArt } from "@/components/diagrams";
import { Contact } from "@/components/sections";
import { Reveal, Tilt } from "@/components/motion";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() { return projects.map(project=>({slug:project.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params;const project=projects.find(item=>item.slug===slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata(project.name, project.description, `/work/${project.slug}`);
}
export default async function ProjectPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;const project=projects.find(item=>item.slug===slug);if(!project)notFound();
  const starLabels = { situation: "Problem", task: "Goal", action: "Approach", result: "Result" };
  return <div className={`case-page project-${project.color}`}><div className="case-breadcrumb"><Link href="/work"><ArrowLeft size={14}/> SELECTED WORK</Link></div><Reveal className="case-hero"><span className="eyebrow">{project.type}</span><h1>{project.name}<em className="gradient-text">.</em></h1><p>{project.description}</p><div className="tags">{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div><dl className="project-star case-star">{Object.entries(project.star).map(([key,value])=><div key={key}><dt>{starLabels[key as keyof typeof starLabels]}</dt><dd>{value}</dd></div>)}</dl><div className="case-actions"><a href={project.url} className="button button-primary" target="_blank" rel="noreferrer">{slug==="flash-resume"?"Explore on PyPI":"Explore the project"}<ArrowUpRight size={17}/></a><a href={project.source} className="text-link" target="_blank" rel="noreferrer"><Github size={16}/> Read the source</a></div></Reveal><Reveal className="case-visual texture framed"><Tilt className="project-art"><div className="project-art-head"><span>{project.headline}</span><ArrowUpRight size={22}/></div><ProjectArt kind={slug}/></Tilt></Reveal><div className="case-sections"><Reveal className="case-detail"><div><span className="eyebrow">01 / THE PROBLEM</span><h2>The part worth solving.</h2></div><p>{project.problem}</p></Reveal><Reveal className="case-detail"><div><span className="eyebrow">02 / THE GOAL</span><h2>The outcome to aim for.</h2></div><p>{project.star.task}</p></Reveal><Reveal className="case-detail"><div><span className="eyebrow">03 / THE APPROACH</span><h2>How I built it.</h2></div><p>{project.decision}</p></Reveal>{slug==="skillvector"&&<PipelineLab/>}{slug==="flash-resume"&&<EvidenceLab/>}<Reveal className="case-detail"><div><span className="eyebrow">04 / THE RESULT</span><h2>What changed.</h2></div><div><p>{project.star.result}</p><p>{project.points.join(". ")}.</p><div className="case-metric"><strong>{project.proof}</strong><span>{project.proofLabel}</span></div></div></Reveal><Reveal className="case-detail"><div><span className="eyebrow">05 / SCOPE & LIMITS</span><h2>What this result means.</h2></div><p>{project.boundary}</p></Reveal></div><Contact/></div>;
}
