"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUp, ArrowUpRight, Check, Command, Copy, Github, Linkedin, Mail, Moon, Search, Sun, X } from "lucide-react";
import { profile, projects, notes } from "@/lib/content";
import { EASE, useReducedMotionPreference } from "./motion";
import { PbMonogram } from "./pb-monogram";

const NAV_LINKS = [["/","Home"],["/about","About"],["/work","Work"],["/blog","Blog"]] as const;
const PILL_SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.7 } as const;

export function Monogram() {
  return <PbMonogram/>;
}

const searchItems = [
  {title:"Home",category:"PAGE",href:"/"}, {title:"About & experience",category:"PAGE",href:"/about"}, {title:"GitHub activity",category:"SECTION",href:"/about#github"},
  ...projects.map(p=>({title:p.name,category:"PROJECT",href:`/work/${p.slug}`})),
  ...notes.map(n=>({title:n.title,category:"ARTICLE",href:`/blog/${n.slug}`})), {title:"Uses",category:"PAGE",href:"/uses"}, {title:"Milestones",category:"PAGE",href:"/bucket-list"}, {title:"Links",category:"PAGE",href:"/links"}, {title:"Contact",category:"PAGE",href:"/contact"},
  {title:"Résumé PDF",category:"DOWNLOAD",href:profile.resume},
];

/**
 * Hides the floating nav on scroll-down, shows it on scroll-up.
 * Returns "idle" at the top of the page. Reduced-motion users always
 * get "idle" — the nav never moves for them.
 */
function useNavVisibility(soft: boolean) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (soft) { setHidden(false); return; }
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setHidden(y > 320 && y > last + 4);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [soft]);
  return hidden;
}

export function Navigation() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const soft = useReducedMotionPreference();
  const navHidden = useNavVisibility(soft);
  const [open,setOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [greeting,setGreeting] = useState<string | null>(null);
  const [greetingShown,setGreetingShown] = useState(false);
  const [ready,setReady] = useState(false);
  useEffect(()=>{
    setReady(true);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    setGreetingShown(true);
    const timer = window.setTimeout(()=>setGreetingShown(false),2400);
    const dismiss = (event:KeyboardEvent)=>{if(event.key === "Tab" || event.key === "Escape")setGreetingShown(false);};
    window.addEventListener("keydown",dismiss);
    return ()=>{window.clearTimeout(timer);window.removeEventListener("keydown",dismiss);};
  },[]);
  useEffect(()=>{
    const handler = (e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setGreetingShown(false);setGreeting(null);setOpen(value=>!value);} };
    window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler);
  },[]);
  useEffect(()=>{if(previousPathname.current===pathname)return;previousPathname.current=pathname;setOpen(false);setQuery("");setGreetingShown(false);setGreeting(null);document.querySelector(".nav-more")?.removeAttribute("open");},[pathname]);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = searchItems.filter(item=>item.title.toLowerCase().includes(query.toLowerCase()));
  const clampedIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));
  const isActive = (href:string) => href==="/" ? pathname===href : pathname.startsWith(href);
  return <><header className="site-header"><Link href="/" className="brand" aria-label="Pavan Bollepalli home"><Monogram/></Link><div className="header-availability"><span className="signal"/> OPEN TO OPPORTUNITIES</div></header>
    <div className={`floating-nav ${greetingShown ? "is-greeting" : ""} ${navHidden ? "is-hidden" : ""}`}><div className="nav-stage">
      {/* CSS owns enter and exit so the greeting leaves on the compositor clock, not on JS frames. */}
      {greeting&&<button className={`welcome-greeting ${greetingShown ? "" : "is-leaving"}`} aria-label={`${greeting}. Show navigation`} aria-hidden={greetingShown ? undefined : true} tabIndex={greetingShown ? undefined : -1} onClick={()=>setGreetingShown(false)}
        onTransitionEnd={event=>{if(!greetingShown&&event.propertyName==="opacity")setGreeting(null);}}>{greeting==="Good evening"?<Moon size={21}/>:<Sun size={21}/>}<span>{greeting}</span></button>}
      <nav aria-label="Primary navigation" inert={greetingShown ? true : undefined}>{NAV_LINKS.map(([href,label])=><Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={isActive(href) ? "nav-active" : ""}>{isActive(href)&&<motion.span className="nav-pill" layoutId="nav-pill" transition={PILL_SPRING} aria-hidden="true"/>}<span className="nav-label">{label}</span></Link>)}<details className="nav-more"><summary>More </summary><div className="nav-more-menu"><Link href="/uses">Uses</Link><Link href="/bucket-list">Milestones</Link><Link href="/links">Links</Link></div></details><a className="nav-contact" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRight size={14}/></a></nav></div>
    <Dialog.Root open={open} onOpenChange={value=>{setOpen(value);if(value){setGreetingShown(false);setGreeting(null);}}}><Dialog.Trigger className="search-trigger" disabled={!ready} aria-label="Search portfolio (Control or Command K)"><Search size={19}/></Dialog.Trigger>
      <AnimatePresence>{open&&<Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount><motion.div className="dialog-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:{duration:.18}}} transition={{duration:.24}}/></Dialog.Overlay>
        <Dialog.Content asChild forceMount><motion.div className="command-dialog" initial={{opacity:0,y:soft?0:-14,scale:soft?1:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:soft?0:-8,scale:soft?1:.98,transition:{duration:.16,ease:EASE}}} transition={{duration:.32,ease:EASE}}>
          <div className="command-top"><Search size={20}/><Dialog.Title className="sr-only">Search this portfolio</Dialog.Title><Dialog.Description className="sr-only">Find pages, projects and engineering notes.</Dialog.Description><label className="sr-only" htmlFor="portfolio-search">Search pages and projects</label><input id="portfolio-search" placeholder="Find something interesting…" value={query} onChange={event=>{setQuery(event.target.value);setActiveIndex(0);}} autoComplete="off" onKeyDown={event=>{if(event.key==="ArrowDown"){event.preventDefault();setActiveIndex(value=>Math.min(value+1,results.length-1));}if(event.key==="ArrowUp"){event.preventDefault();setActiveIndex(value=>Math.max(value-1,0));}if(event.key==="Enter"&&results[clampedIndex]){window.location.href=results[clampedIndex].href;setOpen(false);}}}/><Dialog.Close className="icon-button" aria-label="Close search"><X size={18}/></Dialog.Close></div>
          <div className="command-results">{results.map((item,index)=><motion.div key={item.href} initial={{opacity:0,y:soft?0:6}} animate={{opacity:1,y:0}} transition={{duration:.26,delay:Math.min(index,8)*.025+.04,ease:EASE}}><Link href={item.href} onClick={()=>setOpen(false)} className={index===clampedIndex?"is-active":""} aria-current={index===clampedIndex?"true":undefined}><span><small>{item.category}</small>{item.title}</span><ArrowUpRight size={17}/></Link></motion.div>)}{results.length===0&&<p className="search-empty">No matches. Try “RAG”, “SkillVector” or “About”.</p>}</div>
          <div className="command-footer"><span><Command size={12}/> K to open</span><span>Tab to navigate · Esc to close</span></div>
        </motion.div></Dialog.Content>
      </Dialog.Portal>}</AnimatePresence></Dialog.Root></div></>;
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
  return <div className={`copy-email ${compact ? "compact" : ""}`}><a href={`mailto:${profile.email}`}>{compact ? "Email me" : profile.email}</a><button className="icon-button" data-state={copied ? "copied" : "idle"} aria-label="Copy email address" onClick={async()=>{try{await navigator.clipboard.writeText(profile.email);setCopied(true);setFailed(false);}catch{setCopied(false);setFailed(true);}}}><SwapIcon id={copied ? "check" : "copy"}>{copied ? <Check size={16}/> : <Copy size={16}/>}</SwapIcon></button><span className="copy-feedback" role="status"><AnimatePresence mode="wait">{(copied||failed)&&<motion.span key={copied?"ok":"fail"} initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,transition:{duration:.15}}} transition={{duration:.25,ease:EASE}}>{copied?"Copied!":"Please copy the email manually."}</motion.span>}</AnimatePresence></span></div>;
}

/** Cross-fades one icon into the next with a small turn, so a state change reads at a glance. */
function SwapIcon({ id, children }: { id: string; children: ReactNode }) {
  return <AnimatePresence mode="popLayout" initial={false}><motion.span key={id} className="swap-icon" initial={{opacity:0,scale:.6,rotate:-40}} animate={{opacity:1,scale:1,rotate:0}} exit={{opacity:0,scale:.6,rotate:40}} transition={{duration:.22,ease:EASE}}>{children}</motion.span></AnimatePresence>;
}

export function ThemeToggle() {
  const [theme,setTheme]=useState("dark");
  useEffect(()=>{setTheme(document.documentElement.dataset.theme||"dark");},[]);
  return <button className="theme-toggle" aria-label={`Switch to ${theme==="dark"?"light":"dark"} theme`} onClick={()=>{const next=theme==="dark"?"light":"dark";setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem("portfolio-theme",next);}catch{}}}><SwapIcon id={theme}>{theme==="dark"?<Sun size={17}/>:<Moon size={17}/>}</SwapIcon><span>{theme==="dark"?"Light":"Dark"}</span></button>;
}

/** The giant wordmark in the footer drifts sideways as it scrolls into view. */
function FooterName() {
  const ref = useRef<HTMLDivElement>(null);
  const soft = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [soft ? 0 : 46, soft ? 0 : -46]);
  const smooth = useSpring(x, { stiffness: 90, damping: 26, mass: 0.4 });
  const opacity = useTransform(scrollYProgress, [0, 1], [soft ? 0.35 : 0.12, 0.35]);
  return (
    <div ref={ref} className="footer-name-wrap" aria-hidden="true">
      <motion.div className="footer-name" style={{ x: smooth, opacity }}>Pavan Bollepalli</motion.div>
    </div>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <AnimatePresence>{visible&&<motion.button type="button" className="back-to-top" aria-label="Back to top" title="Back to top" initial={{opacity:0,y:12,scale:.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.9,transition:{duration:.16}}} transition={{duration:.28,ease:EASE}} onClick={()=>window.scrollTo({top:0,behavior:document.documentElement.dataset.motion==="soft"?"auto":"smooth"})}><ArrowUp size={18}/></motion.button>}</AnimatePresence>;
}

export function Footer() {
  return <footer className="site-footer"><BackToTop/><div className="footer-top"><div className="footer-intro"><Link href="/" className="footer-logo" aria-label="Back to home"><Monogram/></Link><p>Built with intention.<br/>Engineered with evidence.</p></div><div className="footer-column"><span className="eyebrow">EXPLORE</span><Link href="/work">Selected work</Link><Link href="/about">About & experience</Link><Link href="/blog">Blog</Link></div><div className="footer-column"><span className="eyebrow">SITE</span><Link href="/uses">Uses</Link><Link href="/bucket-list">Milestones</Link><Link href="/links">Links</Link><Link href="/contact">Contact</Link></div><div className="footer-column"><span className="eyebrow">ELSEWHERE</span><a href={profile.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14}/></a><a href={profile.resume} target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={14}/></a></div><div className="footer-location"><span className="eyebrow">LOCAL TIME</span><LocalTime/><span className="eyebrow email-label">LET’S CONNECT</span><CopyEmail/></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Pavan Bollepalli</span><span>Next.js · Built to be explored</span><span className="footer-legal"><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/attribution">Attribution</Link><Link href="/rss.xml">RSS</Link></span><ThemeToggle/></div><FooterName/></footer>;
}

export function SocialLinks() {
  return <div className="social-links"><a href={profile.github} target="_blank" rel="noreferrer" aria-label="Pavan on GitHub"><Github size={21}/></a><a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Pavan on LinkedIn"><Linkedin size={21}/></a><a href={`mailto:${profile.email}`} aria-label="Email Pavan"><Mail size={21}/></a></div>;
}
