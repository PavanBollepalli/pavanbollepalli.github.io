"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Container,
  Database,
  FileCode2,
  GitBranch,
  Hexagon,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Zap,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { siClaudecode, siDocker, siGit, siGhostty, siOpenaigym, type SimpleIcon } from "simple-icons";

export function SystemSculpture({ compact = false }: { compact?: boolean }) {
  return <div className={`system-sculpture ${compact ? "compact" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 620 410" className="system-svg">
      <defs>
        <linearGradient id={compact ? "panel-small" : "panel"} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#191d29"/><stop offset="1" stopColor="#0c0e14"/></linearGradient>
        <linearGradient id={compact ? "wire-small" : "wire"}><stop stopColor="#3159ff"/><stop offset="1" stopColor="#a5b6ff"/></linearGradient>
      </defs>
      <g className="sculpture-grid" stroke="currentColor" opacity=".13" fill="none">
        {[0,1,2,3,4,5,6,7].map(i => <g key={i}><path d={`M${70+i*50} 350 l300 -170`}/><path d={`M${100+i*48} 120 l280 170`}/></g>)}
      </g>
      <g fill="none" stroke={`url(#${compact ? "wire-small" : "wire"})`} strokeWidth="1.2">
        <path className="data-wire" d="M112 256 L238 183 L385 267 L500 202"/>
        <path className="data-wire second" d="M240 124 L390 210 L500 146"/>
        <path strokeDasharray="3 7" opacity=".35" d="M100 292 320 165 542 292"/>
      </g>
      {[{x:100,y:208,w:102,h:74,label:"API",num:"01"},{x:238,y:112,w:120,h:104,label:"VECTOR DB",num:"02"},{x:386,y:208,w:100,h:88,label:"INFERENCE",num:"03"}].map((p,i) => <g key={p.label} className={`iso-block block-${i}`}>
        <path d={`M${p.x-p.w/2} ${p.y} l${p.w/2} -29 l${p.w/2} 29 l-${p.w/2} 29Z`} fill={`url(#${compact ? "panel-small" : "panel"})`} stroke="#7794ff"/>
        <path d={`M${p.x-p.w/2} ${p.y} v${p.h} l${p.w/2} 29 v-${p.h}Z`} fill="#10131b" stroke="#40495c"/>
        <path d={`M${p.x} ${p.y+29} v${p.h} l${p.w/2} -29 v-${p.h}Z`} fill="#141c34" stroke="#5681ff"/>
        <text x={p.x} y={p.y+5} textAnchor="middle" fill="#a8bdff" fontFamily="monospace" fontSize="12">{p.num}</text>
        <text x={p.x} y={p.y+p.h+65} textAnchor="middle" fill="#858c9d" fontFamily="monospace" fontSize="10" letterSpacing="2">{p.label}</text>
        <circle className="signal-dot" cx={p.x+p.w/2} cy={p.y+p.h} r="3" fill="#6992ff"/>
      </g>)}
      <g fill="#858c9d" fontSize="10" fontFamily="monospace" letterSpacing="1.5"><text x="325" y="82">CONTEXT IN. INTELLIGENCE OUT.</text><text x="206" y="363">DESIGNED FOR THE REAL WORLD</text></g>
      <path d="M315 69 h-32 v16 M512 338 h27 v-16" fill="none" stroke="#44517a"/>
    </svg>
    {!compact && <div className="sculpture-badge"><span className="signal"/> SYSTEMS, NOT JUST PROMPTS <ArrowRight size={13}/></div>}
  </div>;
}

export function PipelineLab() {
  const [mode, setMode] = useState("warm");
  const steps = ["Request lock", "Cache", "Hybrid search", "Live retrieval", "Generation"];
  const active = mode === "warm" ? [0,1,4] : mode === "cold" ? [0,2,3,4] : [0];
  return <div className="pipeline-lab">
    <div className="lab-top"><span className="eyebrow">INTERACTIVE ARCHITECTURE</span><span className="micro">Illustration, not live telemetry</span></div>
    <h3>Take a request through the system.</h3>
    <div className="segmented" aria-label="Illustrated request path">{[["warm","Warm query"],["cold","Cold query"],["duplicate","Duplicate request"]].map(([value,label]) => <button key={value} onClick={() => setMode(value)} aria-pressed={mode===value}>{label}</button>)}</div>
    <div className="pipeline-flow">{steps.map((step,i) => <div className={`pipeline-node ${active.includes(i) ? "active" : ""}`} key={step}><span>0{i+1}</span>{[<LockKeyhole key="lock"/>,<Zap key="zap"/>,<Database key="db"/>,<Network key="net"/>,<Sparkles key="spark"/>][i]}<strong>{step}</strong>{i<4 && <ArrowRight className="flow-arrow" size={16}/>}</div>)}</div>
    <p className="lab-explanation" role="status">{mode === "warm" ? "A cache hit skips the expensive retrieval layers. Context moves directly to generation." : mode === "cold" ? "A cold miss moves through hybrid vector search and live retrieval before generating an answer." : "The request lock stops a duplicate from starting another expensive generation run."}</p>
  </div>;
}

export function EvidenceLab() {
  const [unsupported, setUnsupported] = useState(false);
  return <div className="evidence-lab"><div className="lab-top"><span className="eyebrow">THE EVIDENCE GATE</span><span className="micro">Fixed illustrative samples</span></div><h3>Fluent isn’t the same as factual.</h3>
    <div className="segmented" aria-label="Illustrative résumé claim"><button aria-pressed={!unsupported} onClick={() => setUnsupported(false)}>Documented skill</button><button aria-pressed={unsupported} onClick={() => setUnsupported(true)}>Unsupported claim</button></div>
    <div className="evidence-path"><div><Sparkles/><small>AI PROPOSAL</small><strong>{unsupported ? "Kubernetes experience" : "FastAPI services"}</strong></div><ArrowRight/><div className={unsupported ? "gate rejected" : "gate"}><ShieldCheck/><small>EVIDENCE CHECK</small><strong>{unsupported ? "No source evidence" : "Master résumé match"}</strong></div><ArrowRight/><div><FileCode2/><small>OUTPUT</small><strong>{unsupported ? "Excluded from claims" : "Eligible for tailoring"}</strong></div></div>
    <p role="status" className="lab-explanation">{unsupported ? "The model's suggestion doesn't become a qualification. Unsupported experience stays out of the résumé." : "Only documented experience makes it through the gate. Every change is traceable in the diff report."}</p>
  </div>;
}

const stack = [
  { name: "Python", mark: "Py", tone: "#f2c94c", group: "Backend" },
  { name: "Next.js", mark: "N", tone: "#f4f4f5", group: "Frontend" },
  { name: "React", mark: "⚛", tone: "#61dafb", group: "Frontend" },
  { name: "TypeScript", mark: "TS", tone: "#3178c6", group: "Frontend" },
  { name: "Tailwind CSS", mark: "≈", tone: "#38bdf8", group: "Frontend" },
  { name: "Motion.dev", mark: "〰", tone: "#e5dc00", group: "Frontend" },
  { name: "TanStack Query", mark: "✿", tone: "#ef4770", group: "Frontend" },
  { name: "Zustand", mark: "◉", tone: "#f4f4f5", group: "Frontend" },
  { name: "Expo", mark: "⌃", tone: "#f4f4f5", group: "Frontend" },
  { name: "CSS", mark: "CSS", tone: "#bd75ed", group: "Frontend" },
  { name: "Figma", mark: "●", tone: "#f46b75", group: "Frontend" },
  { name: "RAG pipelines", mark: "RAG", tone: "#66a8ff", group: "AI" },
  { name: "Docker", mark: "D", tone: "#2496ed", group: "Tools" },
  { name: "PostgreSQL", mark: "PG", tone: "#6ca6d9", group: "Backend" },
  { name: "FastAPI", mark: "F", tone: "#00b48a", group: "Backend" },
  { name: "pgvector", mark: "V", tone: "#79a9ff", group: "AI" },
  { name: "AWS", mark: "aws", tone: "#ffad35", group: "Tools" },
  { name: "ChromaDB", mark: "C", tone: "#9c70ed", group: "AI" },
  { name: "GitHub Actions", mark: "GH", tone: "#f4f4f5", group: "Tools" },
  { name: "Node.js", mark: "JS", tone: "#83cd29", group: "Backend" },
  { name: "Groq", mark: "G", tone: "#f55036", group: "AI" },
  { name: "Google Cloud", mark: "G", tone: "#4285f4", group: "Tools" },
  { name: "MySQL", mark: "SQL", tone: "#e48e36", group: "Backend" },
  { name: "Embeddings", mark: "∑", tone: "#a689ff", group: "AI" },
  { name: "Typst", mark: "T", tone: "#239dad", group: "Tools" },
  { name: "Streamlit", mark: "S", tone: "#ff4b4b", group: "Frontend" },
  { name: "Evidence gates", mark: "✓", tone: "#87d4bb", group: "AI" },
  { name: "Chrome MV3", mark: "CH", tone: "#64a3ff", group: "Tools" },
  { name: "Git", mark: "⌘", tone: "#f16b54", group: "Tools" },
] as const;

const stackFilters = ["All", "Frontend", "Backend", "AI", "Tools"] as const;

export function StackCard() {
  const [filter, setFilter] = useState<(typeof stackFilters)[number]>("All");
  const visibleStack = stack.filter(item => filter === "All" || item.group === filter);
  const rows = Array.from({ length: 4 }, (_, row) => visibleStack.filter((_, index) => index % 4 === row));

  return (
    <div className="bento-card stack-card">
      <div className="stack-heading">
        <div>
          <span className="eyebrow">DAILY DRIVERS</span>
          <h3>The stack behind everything I ship.</h3>
        </div>
      </div>

      <div className={`stack-chip-grid ${filter !== "All" ? "is-filtered" : ""}`} aria-label={`${filter} technologies`}>
        {filter !== "All" ? visibleStack.map(item => (
          <span className={`tech-tag tech-${item.group.toLowerCase()}`} key={item.name}>
            <span className="tech-mark" style={{ "--mark-color": item.tone } as CSSProperties} aria-hidden="true">{item.mark}</span>
            {item.name}
          </span>
        )) : rows.map((row, rowIndex) => row.length > 0 && (
          <div className="stack-marquee-row" key={`${filter}-${rowIndex}`}>
            <div className={`stack-marquee-track ${rowIndex % 2 ? "reverse" : ""}`} style={{ "--row-speed": `${28 + rowIndex * 3}s`, "--row-delay": `${-rowIndex * 2.4}s` } as CSSProperties}>
              {[0, 1, 2].map(copy => (
                <div className="stack-marquee-group" key={copy} aria-hidden={copy > 0}>
                  {row.map(item => (
                    <motion.span className={`tech-tag tech-${item.group.toLowerCase()}`} key={item.name}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
                      <span className="tech-mark" style={{ "--mark-color": item.tone } as CSSProperties} aria-hidden="true">{item.mark}</span>
                      {item.name}
                    </motion.span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {visibleStack.length} technologies shown{filter === "All" ? "." : ` in ${filter}.`}
      </span>

      <div className="stack-filters" role="group" aria-label="Filter technologies">
        {stackFilters.map(item => <button type="button" key={item} aria-pressed={item === filter} onClick={() => setFilter(item)}>
          <span aria-hidden="true" />{item}
        </button>)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- workstation */

const deskTools = [
  { name: "Claude Code", brand: siClaudecode, tone: "#d97757" },
  { name: "Codex", brand: siOpenaigym, tone: "#f4f4f5" },
  { name: "VS Code", brand: null, tone: "#42a5f5" },
  { name: "Ghostty", brand: siGhostty, tone: "#a9a1ff" },
  { name: "Docker", brand: siDocker, tone: "#2496ed" },
  { name: "Git", brand: siGit, tone: "#f03c2e" },
] as const;

const DOCK_REACH = 74;

/**
 * A dock that magnifies under the cursor. Each tile reads the shared pointer
 * position and scales by its own distance from it, so neighbours lift in sequence.
 */
function DockTile({ label, brand, tone, pointer }: { label: string; brand: SimpleIcon | null; tone: string; pointer: MotionValue<number> }) {
  const ref = useRef<HTMLLIElement>(null);

  const scale = useTransform(pointer, (value: number) => {
    const node = ref.current;
    if (!node || value < -500) return 1;
    const centre = node.offsetLeft + node.offsetWidth / 2;
    const distance = Math.abs(value - centre);
    return 1 + 0.62 * Math.exp(-(distance * distance) / (2 * DOCK_REACH * DOCK_REACH));
  });
  const smooth = useSpring(scale, { stiffness: 420, damping: 30, mass: 0.5 });
  const rise = useTransform(smooth, value => -(value - 1) * 34);

  return (
    <motion.li ref={ref} className="dock-tile" style={{ scale: smooth, y: rise, "--tone": tone } as unknown as CSSProperties}>
      <span className="dock-icon">
        {brand ? (
          <svg className="dock-brand-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={brand.path} /></svg>
        ) : (
          <svg className="dock-brand-icon vscode-brand" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.4 2.2 8 9.5 4 6.4 1.2 7.6v8.8L4 17.6l4-3.1 9.4 7.3 5.4-2.4V4.6l-5.4-2.4Zm0 4.2v11.2L10.2 12l7.2-5.6ZM4.2 9.1 7 11.3v1.4l-2.8 2.2V9.1Z" />
          </svg>
        )}
      </span>
      <span className="dock-label">{label}</span>
    </motion.li>
  );
}

export function WorkstationDock() {
  const pointer = useMotionValue(-9999);
  return (
    <div className="workstation-dock">
      <div className="dock-shelf">
        <ul
          aria-label="Apps in my daily workstation"
          onPointerMove={event => {
            if (event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            pointer.set(event.clientX - bounds.left);
          }}
          onPointerLeave={() => pointer.set(-9999)}
        >
          {deskTools.map(tool => <DockTile key={tool.name} label={tool.name} brand={tool.brand} tone={tool.tone} pointer={pointer} />)}
        </ul>
        <span className="dock-plinth" />
      </div>
      <div className="desk-view">
        <span className="desk-screen"><i /></span>
        <span className="desk-caption micro">AGENTS · EDITOR · TERMINAL · CONTAINERS · VERSION CONTROL</span>
      </div>
    </div>
  );
}

export function Globe() {
  return <div className="globe-art" aria-hidden="true"><svg viewBox="0 0 400 225"><defs><pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor"/></pattern><radialGradient id="globe-glow"><stop stopColor="#3767ff" stopOpacity=".2"/><stop offset="1" stopColor="#3767ff" stopOpacity="0"/></radialGradient></defs><ellipse cx="242" cy="139" rx="150" ry="100" fill="url(#globe-glow)"/><g fill="url(#dots)" opacity=".65"><path d="M30 53 72 37 103 42 137 60 122 81 94 92 86 116 65 101 47 77Z M94 115 130 130 143 153 124 184 111 208 97 177 85 149Z M172 59 208 44 219 57 250 38 281 45 303 64 348 57 371 85 341 109 313 101 294 124 264 120 248 146 232 121 222 85 203 78 185 91Z M189 91 226 94 236 128 214 176 195 159 180 123Z M302 166 330 151 358 166 364 186 332 196 307 184Z"/></g><circle cx="250" cy="126" r="5" fill="#6c91ff"/><circle className="location-ring" cx="250" cy="126" r="12" fill="none" stroke="#6c91ff"/><path d="M261 126 h53" stroke="#6c91ff" opacity=".5"/><text x="267" y="117" fill="#c9d3f8" fontSize="9" fontFamily="monospace" letterSpacing="1">GUNTUR, IN</text></svg></div>;
}

export function MiniTerminal() {
  return <div className="mini-terminal" aria-hidden="true"><header><i/><i/><i/><span>pavan / engineering.py</span></header><div><p><span className="syntax-purple">class</span> <span className="syntax-blue">Engineer</span>:</p><p>&nbsp; priorities = [</p><p>&nbsp;&nbsp; <span className="syntax-green">"correctness"</span>,</p><p>&nbsp;&nbsp; <span className="syntax-green">"clarity"</span>,</p><p>&nbsp;&nbsp; <span className="syntax-green">"performance"</span></p><p>&nbsp; ]</p><p className="terminal-comment"># in that order.</p></div></div>;
}

export function ProjectArt({ kind }: { kind: string }) {
  if (kind === "skillvector") return <div className="project-interface vector-interface" aria-hidden="true"><header><span><Network size={16}/> skillvector</span><span className="micro">YOUR NEXT CHAPTER</span></header><div className="interface-sidebar"><span>Overview</span><strong>Skill roadmap</strong><span>Career explorer</span><span>Evidence</span></div><div className="vector-content"><span className="micro">CAREER INTELLIGENCE</span><h4>Your ambition.<br/><em>A clear direction.</em></h4><div className="search-mock">Machine Learning Engineer <ArrowRight size={16}/></div><div className="roadmap-path">{["Foundations","Build & deploy","Go deeper"].map((text,i)=><div key={text}><span>0{i+1}</span><strong>{text}</strong><small>{["Python · Linear algebra","FastAPI · Model serving","Retrieval · Evaluation"][i]}</small></div>)}</div><span className="interface-foot">ILLUSTRATIVE PRODUCT VIEW · O*NET-GROUNDED RETRIEVAL</span></div></div>;
  if (kind === "flash-resume") return <div className="project-interface flash-interface" aria-hidden="true"><header><span><Zap size={17}/> flash resume</span><span className="micro">LOCAL-FIRST ENGINE</span></header><div className="flash-content"><span className="micro">FROM RELEVANCE TO EVIDENCE</span><h4>Make the fit.<br/><em>Keep the truth.</em></h4><div className="resume-sheet"><span>PAVAN BOLLEPALLI</span><small>BACKEND & AI ENGINEER</small><hr/><div className="resume-line long"/><div className="resume-line"/><div className="resume-highlight"><ShieldCheck size={14}/> Verified against source evidence</div><div className="resume-line long"/><div className="resume-line"/><div className="resume-line short"/></div><div className="verified-stamp"><Check size={18}/><span>COMPILED<br/>PAGE-CHECKED</span></div><span className="interface-foot">ILLUSTRATIVE PRODUCT VIEW · HUMAN REVIEW REQUIRED</span></div></div>;
  return <div className="project-interface atlas-interface" aria-hidden="true"><header><span><FileCode2 size={17}/> codeatlas</span><span className="micro">REPOSITORY INTELLIGENCE</span></header><div className="atlas-content"><h4>Understand the code.<br/><em>See the connections.</em></h4><div className="atlas-tree"><span>⌁ repository</span><span>├ backend /</span><span>│ ├ routes /</span><span>│ └ services /</span><span>└ frontend /</span></div><div className="atlas-nodes"><span><Network/> Repository</span><i/><div><span><Database/> Retrieval</span><span><Sparkles/> AI chat</span></div></div><span className="interface-foot">ILLUSTRATIVE PRODUCT VIEW · EXPLORE THE REAL SOURCE</span></div></div>;
}
