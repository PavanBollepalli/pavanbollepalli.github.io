"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, ArrowUpRight, Check, Command, Copy, Github, Linkedin, Mail, Moon, Search, Sun, X } from "lucide-react";
import { profile, projects, notes } from "@/lib/content";

export function Monogram() {
  return <svg viewBox="0 0 45 35" fill="none" aria-hidden="true"><path d="M4 29V5h9c11 0 11 15 0 15H4 M26 5h7c10 0 10 12 0 12h-7m7 0c11 0 11 12 0 12h-7V5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

const searchItems = [
  {title:"Home",category:"PAGE",href:"/"}, {title:"About & experience",category:"PAGE",href:"/about"}, {title:"GitHub activity",category:"SECTION",href:"/about#github"},
  ...projects.map(p=>({title:p.name,category:"PROJECT",href:`/work/${p.slug}`})),
  ...notes.map(n=>({title:n.title,category:"ARTICLE",href:`/blog/${n.slug}`})), {title:"Guestbook",category:"PAGE",href:"/guestbook"}, {title:"Uses",category:"PAGE",href:"/uses"}, {title:"Milestones",category:"PAGE",href:"/bucket-list"}, {title:"Links",category:"PAGE",href:"/links"}, {title:"Contact",category:"PAGE",href:"/contact"},
  {title:"Résumé PDF",category:"DOWNLOAD",href:profile.resume},
];

export function Navigation() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [open,setOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [ready,setReady] = useState(false);
  useEffect(()=>{setReady(true);},[]);
  useEffect(()=>{
    const handler = (e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(value=>!value);} };
    window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);
  },[]);
  useEffect(()=>{if(previousPathname.current===pathname)return;previousPathname.current=pathname;setOpen(false);setQuery("");document.querySelector(".nav-more")?.removeAttribute("open");},[pathname]);
  return <><header className="site-header"><Link href="/" className="brand" aria-label="Pavan Bollepalli home"><Monogram/></Link><div className="header-availability"><span className="signal"/> OPEN TO OPPORTUNITIES</div></header>
    <div className="floating-nav"><div className="nav-stage"><nav aria-label="Primary navigation">{[["/","Home"],["/about","About"],["/work","Work"],["/blog","Blog"]].map(([href,label])=><Link key={href} href={href} aria-current={(href==="/" ? pathname===href : pathname.startsWith(href)) ? "page" : undefined} className={(href==="/" ? pathname===href : pathname.startsWith(href)) ? "nav-active" : ""}>{label}</Link>)}<details className="nav-more"><summary>More </summary><div className="nav-more-menu"><Link href="/guestbook">Guestbook</Link><Link href="/uses">Uses</Link><Link href="/bucket-list">Milestones</Link><Link href="/links">Links</Link></div></details><a className="nav-contact" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRight size={14}/></a></nav></div>
    <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger className="search-trigger" disabled={!ready} aria-label="Search portfolio (Control or Command K)"><Search size={19}/></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="command-dialog"><div className="command-top"><Search size={20}/><Dialog.Title className="sr-only">Search this portfolio</Dialog.Title><Dialog.Description className="sr-only">Find pages, projects and engineering notes.</Dialog.Description><label className="sr-only" htmlFor="portfolio-search">Search pages and projects</label><input id="portfolio-search" placeholder="Find something interesting…" value={query} onChange={event=>setQuery(event.target.value)} autoComplete="off"/><Dialog.Close className="icon-button" aria-label="Close search"><X size={18}/></Dialog.Close></div><div className="command-results">{searchItems.filter(item=>item.title.toLowerCase().includes(query.toLowerCase())).map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}><span><small>{item.category}</small>{item.title}</span><ArrowUpRight size={17}/></Link>)}{!searchItems.some(item=>item.title.toLowerCase().includes(query.toLowerCase()))&&<p className="search-empty">No matches. Try “RAG”, “SkillVector” or “About”.</p>}</div><div className="command-footer"><span><Command size={12}/> K to open</span><span>Tab to navigate · Esc to close</span></div></Dialog.Content></Dialog.Portal></Dialog.Root></div></>;
}

export function LocalTime() {
  const [time,setTime] = useState<string>();
  useEffect(()=>{const update=()=>setTime(new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:true}).format(new Date()));update();const timer=setInterval(update,60000);return()=>clearInterval(timer);},[]);
  return <span>{time ? `${time} IST` : "India Standard Time"} <span className="time-divider">/</span> Guntur, India</span>;
}

export function CopyEmail({ compact = false }: {compact?:boolean}) {
  const [copied,setCopied] = useState(false);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{if(!copied)return;const id=setTimeout(()=>setCopied(false),2500);return()=>clearTimeout(id);},[copied]);
  return <div className={`copy-email ${compact ? "compact" : ""}`}><a href={`mailto:${profile.email}`}>{compact ? "Email me" : profile.email}</a><button className="icon-button" aria-label="Copy email address" onClick={async()=>{try{await navigator.clipboard.writeText(profile.email);setCopied(true);setFailed(false);}catch{setCopied(false);setFailed(true);}}}>{copied ? <Check size={16}/> : <Copy size={16}/>}</button><span className="copy-feedback" role="status">{copied?"Copied!":failed?"Please copy the email manually.":""}</span></div>;
}

export function ThemeToggle() {
  const [theme,setTheme]=useState("dark");
  useEffect(()=>{setTheme(document.documentElement.dataset.theme||"dark");},[]);
  return <button className="theme-toggle" aria-label={`Switch to ${theme==="dark"?"light":"dark"} theme`} onClick={()=>{const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem("portfolio-theme",next);}catch{}}}>{theme==="dark"?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==="dark"?"Light":"Dark"}</span></button>;
}

export function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div className="footer-intro"><Link href="/" className="footer-logo" aria-label="Back to home"><Monogram/></Link><p>Built with intention.<br/>Engineered with evidence.</p></div><div className="footer-column"><span className="eyebrow">EXPLORE</span><Link href="/work">Selected work</Link><Link href="/about">About & experience</Link><Link href="/blog">Blog</Link></div><div className="footer-column"><span className="eyebrow">SITE</span><Link href="/guestbook">Guestbook</Link><Link href="/uses">Uses</Link><Link href="/bucket-list">Milestones</Link><Link href="/links">Links</Link><Link href="/contact">Contact</Link></div><div className="footer-column"><span className="eyebrow">ELSEWHERE</span><a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={profile.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={14}/></a></div><div className="footer-location"><span className="eyebrow">LOCAL TIME</span><LocalTime/><span className="eyebrow email-label">LET’S CONNECT</span><CopyEmail/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Pavan Bollepalli</span><span>Next.js · Built to be explored</span><span className="footer-legal"><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/attribution">Attribution</Link><Link href="/rss.xml">RSS</Link></span><ThemeToggle/></div><div className="footer-name" aria-hidden="true">Pavan Bollepalli</div></footer>;
}

export function SocialLinks() {
  return <div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer" aria-label="Pavan on GitHub"><Github size={21}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Pavan on LinkedIn"><Linkedin size={21}/></a><a href={`mailto:${profile.email}`} aria-label="Email Pavan"><Mail size={21}/></a></div>;
}
