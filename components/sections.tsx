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

export function PageHeading({ eyebrow, title, accent, description }: {eyebrow:string;title:string;accent?:string;description?:string}) {
  return <Reveal className="page-heading"><span className="eyebrow">{eyebrow}</span><h1><Words text={title}/> {accent&&<em className="gradient-text"><Words text={accent} delay={0.12}/></em>}</h1>{description&&<p>{description}</p>}</Reveal>;
}

export function Bento() {
  return <section className="bento-section framed texture" aria-label="How I work"><h2 className="sr-only">The way I engineer</h2><div className="bento-grid">
    <Reveal className="bento-wide"><Link href="/about" className="bento-card how-card"><span className="eyebrow blue-label">HOW I ENGINEER</span><h3>Correct. Reviewable. Fast.<br/>In that order.</h3><SystemSculpture compact/><span className="circle-arrow"><ArrowRight size={19}/></span><span className="bento-bottom micro">GOOD SYSTEMS START WITH GOOD BOUNDARIES</span></Link></Reveal>
    <Reveal className="bento-stack" delay={0.06}><StackCard/></Reveal>
    <Reveal delay={0.04}><div className="bento-card trust-card"><span className="eyebrow">WHAT YOU GET</span><h3>Not an AI wrapper.<br/>An engineered system.</h3><div className="trust-art" aria-hidden="true"><div className="trust-orbit orbit-one"/><div className="trust-orbit orbit-two"/><div className="trust-center"><ShieldCheck size={48} strokeWidth={1}/></div><span className="trust-chip top"><Code2 size={14}/> Typed APIs</span><span className="trust-chip bottom"><Check size={14}/> Evidence gates</span></div><span className="bento-bottom micro">CSE AI &amp; ML · CLOUD CERTIFIED · ACM WINNER</span></div></Reveal>
    <Reveal delay={0.08}><div className="bento-card location-card"><span className="eyebrow">REMOTE, WORLDWIDE</span><h3>Based in India.<br/>Built for everywhere.</h3><Globe/><span className="bento-bottom micro"><span className="signal"/> <LocalTime/></span></div></Reveal>
    <Reveal className="bento-workstation" delay={0.06}><div className="bento-card workstation-card"><div className="workstation-copy"><span className="eyebrow">WORKSTATION</span><h3>Everything on my desk<br/>and dock.</h3><p className="workstation-note">The tools I use to build, test, and ship.</p></div><WorkstationDock/></div></Reveal>
  </div></section>;
}

export function ProjectList({ limit }: {limit?:number}) {
  return <div className="project-list">{projects.slice(0,limit).map((project,index)=><article className={`project-row project-${project.color}`} key={project.slug} id={project.slug}>
    <Reveal className="project-visual texture"><DiscoverLink href={`/work/${project.slug}`} label={`Explore the ${project.name} case study`}><Tilt className="project-art"><div className="project-art-head"><span>{project.headline}</span><ArrowUpRight size={23}/></div><ProjectArt kind={project.slug}/><span className="project-art-index">SELECTED WORK / 0{index+1}</span></Tilt></DiscoverLink></Reveal>
    <Reveal className="project-copy"><div className="project-copy-top"><span className="project-number">0{index+1}</span><span className="eyebrow">{project.type}</span></div><h3><Link href={`/work/${project.slug}`}>{project.name}</Link></h3><div className="project-impact"><strong>{project.proof}</strong><span>{project.proofLabel}</span></div>
      <dl className="project-star">{Object.entries(project.star).map(([key,value])=><div key={key} className={`star-${key}`}><dt>{key==="result"?"Response / result":key}</dt><dd>{value}</dd></div>)}</dl>
      <div className="tags">{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div><Link href={`/work/${project.slug}`} className="text-link">Inside the build <span className="small-circle"><ArrowRight size={16}/></span></Link>
    </Reveal></article>)}</div>;
}

export function AboutTeaser() {
  return <section className="about-teaser texture framed"><Reveal className="about-teaser-copy"><span className="eyebrow">A LITTLE ABOUT ME</span><h2><Words text="Backend by craft."/><br/><em className="gradient-text"><Words text="Curious by default." delay={0.12}/></em></h2><p>I’m Pavan, a backend and AI engineer who enjoys the unglamorous half of intelligent products: the retrieval layer, the database indexes, the caches, and the checks that keep it all from falling over.</p><p>From open-source work at Wikimedia to evidence-led AI tooling, I care about systems that are correct, reviewable, and fast.</p><SocialLinks/><Link href="/about" className="text-link">The person behind the code <span className="small-circle"><ArrowRight size={16}/></span></Link></Reveal><Reveal delay={0.1}><LanyardScene/></Reveal></section>;
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
  return <section className="contact-section framed texture" id="contact"><ContactScene/><Reveal className="contact-content"><span className="availability"><span className="signal"/> OPEN TO BACKEND & AI ENGINEERING ROLES</span><h2>A hard problem?<br/>Let’s build <em className="gradient-text"><Words text="a good answer." delay={0.14}/></em></h2><p>Have an ambitious product, a system worth improving,<br/>or a team I should meet? I’d love to hear it.</p><a href={`mailto:${profile.email}`} className="button button-primary contact-button">Start a conversation <ArrowUpRight size={18}/></a><CopyEmail compact/></Reveal><div className="contact-coordinate left" aria-hidden="true">IDEAS IN.<br/>GOOD SYSTEMS OUT.</div><div className="contact-coordinate right" aria-hidden="true">AVAILABLE FOR<br/>THE NEXT CHAPTER.</div></section>;
}

export function Experience() {
  return <section id="experience" className="experience-section framed"><SectionHeading eyebrow="THE JOURNEY" title="Real code." accent="Real responsibility."/><div className="experience-list"><Reveal className="experience-row"><div><span className="eyebrow">JUL 2024 — SEP 2025</span><span className="experience-location">Remote · Open source</span></div><div><h3>Wikimedia Foundation</h3><span className="experience-role">Open Source Developer</span><p>Built community insights tooling in Python, Streamlit and MySQL. Composite indexes and restructured queries cut SQL execution time by approximately 25% on replicated production datasets.</p><p>Reusable, unit-tested query modules. International code review. Contributions merged into the main repository.</p><div className="tags"><span>Python</span><span>MySQL</span><span>Streamlit</span><span>Query optimisation</span></div></div><div className="experience-metric"><strong>~25%</strong><small>faster SQL queries</small></div></Reveal><Reveal className="experience-row"><div><span className="eyebrow">2022 — 2026</span><span className="experience-location">Guntur, India</span></div><div><h3>Vasireddy Venkatadri Institute of Technology</h3><span className="experience-role">B.Tech · Computer Science (AI & ML)</span><p>Core computer science with an AI/ML specialisation. First place in the ACM Programming Contest against 200+ participants.</p></div><div className="experience-metric"><strong>8.28</strong><small>CGPA / 10</small></div></Reveal></div></section>;
}
