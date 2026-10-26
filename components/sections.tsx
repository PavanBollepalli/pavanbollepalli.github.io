import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Code2, ShieldCheck } from "lucide-react";
import { profile, projects, notes } from "@/lib/content";
import { Reveal, Tilt, Words } from "./motion";
import { Globe, ProjectArt, StackCard, SystemSculpture, WorkstationDock } from "./diagrams";
import { CopyEmail, LocalTime, SocialLinks } from "./shell";
import { ContactScene, DiscoverLink, LanyardScene } from "./interactive";

export function SectionHeading({ eyebrow, title, accent, centered = false, description }: {eyebrow:string;title:string;accent?:string;centered?:boolean;description?:string}) {
  return <Reveal className={`section-heading ${centered ? "centered" : ""}`}><span className="eyebrow">{eyebrow}</span><h2><Words text={title}/> {accent&&<em className="gradient-text"><Words text={accent} delay={0.12}/></em>}</h2>{description&&<p>{description}</p>}</Reveal>;
}

export function PageHeading({ eyebrow, title, accent, description, className = "" }: {eyebrow:string;title:string;accent?:string;description?:string;className?:string}) {
  return <Reveal className={`page-heading ${className}`}><span className="eyebrow">{eyebrow}</span><h1><Words text={title}/> {accent&&<em className="gradient-text"><Words text={accent} delay={0.12}/></em>}</h1>{description&&<p>{description}</p>}</Reveal>;
}

export function Bento() {
  return <section className="bento-section framed texture" aria-label="How I work"><h2 className="sr-only">The way I engineer</h2><div className="bento-grid">
    <Reveal className="bento-wide"><Link href="/about" className="bento-card how-card"><span className="eyebrow blue-label">HOW I ENGINEER</span><h3>Measure first.<br/>Fix the cause.</h3><SystemSculpture compact/><span className="circle-arrow"><ArrowRight size={19}/></span><span className="bento-bottom micro">BENCHMARK, THEN IMPROVE THE BOTTLENECK</span></Link></Reveal>
    <Reveal className="bento-stack" delay={0.06}><StackCard/></Reveal>
    <Reveal delay={0.04}><div className="bento-card trust-card"><span className="eyebrow">WHAT YOU GET</span><h3>AI output you can check.<br/>Systems teams can maintain.</h3><div className="trust-art" aria-hidden="true"><div className="trust-orbit orbit-one"/><div className="trust-orbit orbit-two"/><div className="trust-center"><ShieldCheck size={48} strokeWidth={1}/></div><span className="trust-chip top"><Code2 size={14}/> Typed APIs</span><span className="trust-chip bottom"><Check size={14}/> Evidence checks</span></div><span className="bento-bottom micro">AUTOMATED CHECKS · REVIEWABLE CHANGES · DEPLOYABLE SERVICES</span></div></Reveal>
    <Reveal delay={0.08}><div className="bento-card location-card"><span className="eyebrow">REMOTE, WORLDWIDE</span><h3>Based in India.<br/>Working globally.</h3><Globe/><span className="bento-bottom micro"><span className="signal"/> <LocalTime/></span></div></Reveal>
    <Reveal className="bento-workstation" delay={0.06}><div className="bento-card workstation-card"><div className="workstation-copy"><span className="eyebrow">WORKSTATION</span><h3>Everything on my desk<br/>and dock.</h3><p className="workstation-note">The tools I use to build, test, and ship.</p></div><WorkstationDock/></div></Reveal>
  </div></section>;
}

export function ProjectList({ limit }: {limit?:number}) {
  return <div className="project-list">{projects.slice(0,limit).map((project,index)=><article className={`project-row project-${project.color}`} key={project.slug} id={project.slug}>
    <Reveal className="project-visual texture"><DiscoverLink href={`/work/${project.slug}`} label={`Explore the ${project.name} case study`}><Tilt className="project-art"><div className="project-art-head"><span>{project.headline}</span><ArrowUpRight size={23}/></div><ProjectArt kind={project.slug}/><span className="project-art-index">SELECTED WORK / 0{index+1}</span></Tilt></DiscoverLink></Reveal>
    <Reveal className="project-copy"><div className="project-copy-top"><span className="project-number">0{index+1}</span><span className="eyebrow">{project.type}</span></div><h3><Link href={`/work/${project.slug}`}>{project.name}</Link></h3><div className="project-impact"><strong>{project.proof}</strong><span>{project.proofLabel}</span></div>
      <dl className="project-star">{Object.entries(project.star).map(([key,value])=><div key={key} className={`star-${key}`}><dt>{{situation:"Problem",task:"Goal",action:"Approach",result:"Result"}[key as keyof typeof project.star]}</dt><dd>{value}</dd></div>)}</dl>
      <div className="tags">{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div><Link href={`/work/${project.slug}`} className="text-link">Inside the build <span className="small-circle"><ArrowRight size={16}/></span></Link>
    </Reveal></article>)}</div>;
}

export function AboutTeaser() {
  return <section className="about-teaser texture framed"><Reveal className="about-teaser-copy"><span className="eyebrow">A LITTLE ABOUT ME</span><h2><Words text="Backend by craft."/><br/><em className="gradient-text"><Words text="Curious by default." delay={0.12}/></em></h2><p>I'm Pavan, a backend and AI engineer. I build the software and data systems behind AI products so they can find useful information, show where answers come from, and complete tasks reliably.</p><p>I've contributed to Wikimedia's open-source analytics work, built a resume tool that checks AI suggestions against a source resume, and improved repeat-query retrieval in a career guidance app. I focus on work that teams can measure, review, and maintain.</p><SocialLinks/><Link href="/about" className="text-link">The person behind the code <span className="small-circle"><ArrowRight size={16}/></span></Link></Reveal><Reveal delay={0.1}><LanyardScene/></Reveal></section>;
}

export function NoteCards() {
  return <div className="notes-grid texture">{notes.map((note,index)=><Reveal key={note.slug} delay={index*0.07}><Link href={`/notes/${note.slug}`} className={`note-card note-${note.theme}`}><div className="note-art" aria-hidden="true"><span className="note-art-index">FIELD NOTES / {note.number}</span>{note.number==="01"?<div className="note-bars"><i/><i/><i/><i/><span>9.6s → 0.48s</span></div>:note.number==="02"?<div className="note-shield"><ShieldCheck size={94} strokeWidth={0.8}/><span>EVIDENCE &gt; CONFIDENCE</span></div>:<div className="note-code"><span>CREATE INDEX</span><strong>better_answers</strong><span>ON the_fundamentals;</span></div>}</div><div className="note-copy"><span className="eyebrow">{note.category}</span><h3>{note.title}</h3><p>{note.subtitle}</p><span className="note-read">Read the note <ArrowUpRight size={16}/></span></div></Link></Reveal>)}</div>;
}

export function SiteExplore() {
  return <section className="site-explore framed" id="more"><SectionHeading eyebrow="MY SITE" title="Explore, experiment" accent="& say hello." centered/><div className="site-explore-grid texture">
    <Link href="/uses" className="site-explore-card site-tools-card"><span className="eyebrow">WORKSTATION</span><h3>Everything on my desk and dock</h3><div className="site-tools-dock"><WorkstationDock/></div><small>HARDWARE · EDITOR · TERMINAL · TOOLS</small><span className="site-card-arrow"><ArrowRight size={18}/></span></Link>
    <Link href="/about#experience" className="site-explore-card site-about-card"><span className="eyebrow">BEHIND THE CODE</span><h3>Journey, skills &amp; experience</h3><div className="site-id-preview"><Image src="/assets/avatar.jpg" alt="Pavan Bollepalli" width={220} height={260} sizes="120px"/></div><span className="site-card-arrow"><ArrowRight size={18}/></span></Link>
    <Link href="/guestbook" className="site-explore-card site-guestbook-card"><span className="eyebrow">GUESTBOOK</span><h3>Sign the wall, leave a note</h3><div className="site-note-stack" aria-hidden="true"><span>Good work, keep building.</span><span>Thoughtful details matter.</span><span>Your note here →</span></div><span className="site-card-arrow"><ArrowRight size={18}/></span></Link>
  </div></section>;
}

export function Contact() {
  return <section className="contact-section framed texture" id="contact"><ContactScene/><Reveal className="contact-content"><span className="availability"><span className="signal"/> AVAILABLE FOR BACKEND, AI & ML ENGINEERING ROLES</span><h2>A hard problem?<br/>Let's build <em className="gradient-text"><Words text="a good answer." delay={0.14}/></em></h2><p>Tell me what your team is building or where you need help. I'll reply by email. If you have a role in mind, I'd be glad to hear about it.</p><a href={`mailto:${profile.email}`} className="button button-primary contact-button">Start a conversation <ArrowUpRight size={18}/></a><CopyEmail compact/></Reveal><div className="contact-coordinate left" aria-hidden="true">IDEAS IN.<br/>GOOD SYSTEMS OUT.</div><div className="contact-coordinate right" aria-hidden="true">AVAILABLE FOR<br/>THE NEXT CHAPTER.</div></section>;
}

export function Experience() {
  return <section id="experience" className="experience-section framed"><SectionHeading eyebrow="THE JOURNEY" title="Real code." accent="Real responsibility."/><div className="experience-list"><Reveal className="experience-row"><div><span className="eyebrow">JUL 2024 — SEP 2025</span><span className="experience-location">Remote · Open source</span></div><div><h3>Wikimedia Foundation</h3><span className="experience-role">Open Source Developer</span><p>Built a Python, Streamlit and MySQL dashboard for exploring Wikipedia editor contribution trends. Composite indexes and query restructuring reduced SQL execution time by about 25% on test copies of production data.</p><p>Created reusable query modules with unit tests, replacing one-off analysis scripts. Contributions passed international code review and were merged into the main repository.</p><div className="tags"><span>Python</span><span>MySQL</span><span>Streamlit</span><span>Query optimisation</span></div></div><div className="experience-metric"><strong>~25%</strong><small>faster SQL queries</small></div></Reveal><Reveal className="experience-row"><div><span className="eyebrow">2022 — 2026</span><span className="experience-location">Guntur, India</span></div><div><h3>Vasireddy Venkatadri Institute of Technology</h3><span className="experience-role">B.Tech · Computer Science (AI & ML)</span><p>Studied core computer science and AI/ML. Placed first in the ACM Programming Contest, competing against more than 200 participants.</p></div><div className="experience-metric"><strong>8.28</strong><small>CGPA / 10</small></div></Reveal></div></section>;
}

export function Credentials() {
  return <section className="credentials-section framed"><SectionHeading eyebrow="CREDENTIALS & RECOGNITION" title="Foundations that" accent="back up the work." description="Formal training, cloud certifications, and a competitive programming result."/><div className="credentials-grid"><Reveal className="credential-card"><span className="credential-icon"><ShieldCheck size={20}/></span><span className="eyebrow">AWS</span><h3>Certified Cloud Practitioner</h3><p>Foundational knowledge of cloud services, security, and AWS architecture.</p></Reveal><Reveal className="credential-card" delay={0.06}><span className="credential-icon"><ShieldCheck size={20}/></span><span className="eyebrow">GOOGLE CLOUD</span><h3>Associate Cloud Engineer</h3><p>Credential in deploying, operating, and maintaining services on Google Cloud.</p></Reveal><Reveal className="credential-card" delay={0.12}><span className="credential-icon"><Code2 size={20}/></span><span className="eyebrow">ACM PROGRAMMING CONTEST</span><h3>1st place · 200+ participants</h3><p>A competitive programming result during my Computer Science degree.</p></Reveal></div></section>;
}
