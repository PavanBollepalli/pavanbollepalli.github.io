import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Github, Globe2, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { PageHeading, Contact } from "@/components/sections";
import { BlogExplorer } from "@/components/blog-explorer";
import { Reveal } from "@/components/motion";
import { profile, projects } from "@/lib/content";
import { StackCard, WorkstationDock } from "@/components/diagrams";

export function BlogIndex() {
  return <><PageHeading eyebrow="FROM THE BACKEND" title="Thoughts &" accent="field notes." description="Notes on the systems I build, the decisions behind them, and what I learn along the way."/><BlogExplorer/><Contact/></>;
}

export function GuestbookPage() {
  return <><PageHeading eyebrow="THE GUESTBOOK" title="Leave a little" accent="signal." description="A portfolio is better when it starts a conversation. Tell me what you noticed, what you are building, or what I should explore next."/><section className="guestbook-panel framed texture"><Reveal className="guestbook-card"><span className="guestbook-icon"><BookOpen size={25}/></span><span className="eyebrow">A NOTE TO THE BUILDER</span><h2>The wall is open.</h2><p>Have a thought about the work or an idea to share? Email me a note, and I'll add it to the guestbook with your permission.</p><a className="button button-primary" href={`mailto:${profile.email}?subject=${encodeURIComponent("A note for your guestbook")}`}>Write a note <ArrowUpRight size={17}/></a></Reveal></section><Contact/></>;
}

export function UsesPage() {
  return <><PageHeading eyebrow="TOOLS, SOFTWARE & GEAR" title="The desk behind" accent="the work." description="A practical setup for building, testing, reviewing, and shipping backend and AI products."/><section className="uses-showcase framed texture" aria-label="Workstation and daily tools"><Reveal className="uses-desk-card"><span className="eyebrow">WORKSTATION</span><h2>Everything on my desk and dock</h2><p>The apps I reach for to think, build, and ship.</p><WorkstationDock/><span className="uses-desk-caption micro">AI PAIRING · EDITOR · TERMINAL · CONTAINERS · VERSION CONTROL</span></Reveal><Reveal className="uses-stack-card" delay={0.08}><StackCard/></Reveal></section><Contact/></>;
}

const milestones = [
  { date: "2026", title: "Build systems that earn trust", body: "Keep pushing backend and AI work toward clear evidence, reliable behavior, and maintainable code.", state: "IN PROGRESS" },
  { date: "2025", title: "Contribute to Wikimedia", body: "Shipped community insights tooling and query improvements through open source review.", state: "SHIPPED" },
  { date: "2024—26", title: "Build and share useful tools", body: "SkillVector, Flash Resume, and CodeAtlas explore grounded retrieval, evidence checks, and repository intelligence.", state: "SHIPPED" },
  { date: "NEXT", title: "Keep learning in public", body: "Write about the decisions behind the work and keep contributing to projects other people can use.", state: "ONGOING" },
];

export function BucketListPage() {
  return <><PageHeading eyebrow="MILESTONES & WHAT’S NEXT" title="A career in" accent="the making." description="A living list of work shipped, lessons earned, and the direction I’m moving in."/><section className="milestone-list framed">{milestones.map((item,index)=><Reveal className="milestone-row" key={item.title} delay={index*.06}><span className="milestone-date">{item.date}</span><div><span className={`milestone-state ${item.state === "SHIPPED" ? "complete" : ""}`}><i/>{item.state}</span><h2>{item.title}</h2><p>{item.body}</p></div><span className="milestone-index">0{index+1}</span></Reveal>)}</section><Contact/></>;
}

const profiles = [
  { label: "GitHub", note: "Source, open source, and experiments", href: profile.github, icon: Github },
  { label: "LinkedIn", note: "Professional background and updates", href: profile.linkedin, icon: Linkedin },
  { label: "Email", note: "The fastest way to reach me", href: `mailto:${profile.email}`, icon: Mail },
  { label: "Résumé", note: "Download a copy of my résumé", href: profile.resume, icon: ArrowUpRight },
];

export function LinksPage() {
  return <><PageHeading eyebrow="FIND ME AROUND THE WEB" title="One person," accent="a few places." description="Projects, writing, and ways to get in touch."/><section className="links-grid framed texture">{profiles.map((item,index)=><Reveal key={item.label} delay={index*.06}><a className="profile-link-card" href={item.href} target={item.href.startsWith("mailto:") ? undefined : "_blank"} rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}><span className="profile-link-icon"><item.icon size={21}/></span><span><span className="eyebrow">{item.label}</span><strong>{item.note}</strong></span><ArrowUpRight className="profile-link-arrow" size={18}/></a></Reveal>)}</section><section className="link-projects framed"><span className="eyebrow">BUILT IN THE OPEN</span><div>{projects.map(project=><Link href={`/work/${project.slug}`} key={project.slug}><span>{project.name}</span><span>{project.type}</span><ArrowRight size={16}/></Link>)}</div></section><Contact/></>;
}

export function ContactPage() {
  return <><PageHeading eyebrow="OPEN TO OPPORTUNITIES" title="Let's build" accent="something useful." description="I'm available for backend, AI, and ML engineering roles. I'm open to remote work, hybrid roles, or relocation. Tell me what your team needs help solving."/><section className="contact-page-panel framed texture"><Reveal><span className="contact-page-coordinate"><MapPin size={14}/> {profile.location}</span><h2>Start a conversation.</h2><p>Share the role, the team, or a problem you need solved. I'll reply by email.</p><a className="button button-primary" href={`mailto:${profile.email}?subject=${encodeURIComponent("Let's build something useful")}`}>Email Pavan <ArrowUpRight size={17}/></a><div className="contact-page-links"><a href={profile.github} target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a><a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/> LinkedIn</a><a href={profile.resume} target="_blank" rel="noreferrer"><ArrowUpRight size={17}/> Resume</a><a href={`mailto:${profile.email}`}><Mail size={17}/> {profile.email}</a></div><span className="contact-page-orbit" aria-hidden="true"><Globe2/><Sparkles/></span></Reveal></section><Contact/></>;
}

export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  return <><PageHeading eyebrow="THE DETAILS" title={privacy ? "Privacy, kept" : "Terms, kept"} accent={privacy ? "simple." : "human."} description={privacy ? "What this portfolio stores, and what happens when you use its links and tools." : "A few clear expectations for using this site and getting in touch."}/><article className="legal-article framed"><section><span className="eyebrow">01 / {privacy ? "LOCAL PREFERENCES" : "USING THIS SITE"}</span><h2>{privacy ? "A few settings stay here." : "Use it with care."}</h2><p>{privacy ? "The theme control stores your light or dark preference in this browser’s local storage. The email copy control only accesses the clipboard when you press it. This site does not ask you to create an account." : "The writing, code, and project descriptions are provided for information. You are welcome to learn from the ideas; please do not present my work or words as your own."}</p></section><section><span className="eyebrow">02 / {privacy ? "EXTERNAL SERVICES" : "LINKS & AVAILABILITY"}</span><h2>{privacy ? "Links go elsewhere." : "Things can change."}</h2><p>{privacy ? "Project demos, GitHub, and social profiles are separate sites with their own privacy practices. Emailing me sends your message through your email provider." : "External projects and services may change or become unavailable. I make a reasonable effort to keep this site accurate, but it is provided as-is and is not professional advice."}</p></section><section><span className="eyebrow">03 / CONTACT</span><h2>Questions are welcome.</h2><p>For privacy requests or questions about these terms, email <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p></section><p className="legal-updated">LAST UPDATED · OCTOBER 2026</p></article><Contact/></>;
}
