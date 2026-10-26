import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notes, projects } from "@/lib/content";
import { Contact } from "@/components/sections";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams(){return notes.map(note=>({slug:note.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const note=notes.find(item=>item.slug===slug);if(!note)return {title:"Note not found",robots:{index:false}};return pageMetadata(note.title,note.subtitle,`/notes/${note.slug}`,"article");}
export default async function NotePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const note=notes.find(item=>item.slug===slug);if(!note)notFound();
  const source=note.number==="01"?projects[0]:note.number==="02"?projects[1]:null;
  return <><div className="case-breadcrumb"><Link href="/notes"><ArrowLeft size={14}/> ALL FIELD NOTES</Link></div><article className="note-article"><span className="eyebrow">{note.category} / FIELD NOTE {note.number}</span><h1>{note.title}</h1><p className="note-subtitle">{note.subtitle}</p>{note.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}<footer className="note-article-footer"><span>PAVAN BOLLEPALLI / ENGINEERING NOTES</span>{source?<a href={source.source} className="text-link" target="_blank" rel="noreferrer">Explore the source <ArrowUpRight size={15}/></a>:<Link href="/about#experience" className="text-link">The experience <ArrowUpRight size={15}/></Link>}</footer></article><Contact/></>;
}
