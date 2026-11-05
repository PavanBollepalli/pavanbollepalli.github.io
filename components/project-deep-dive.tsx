"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowRight, ArrowUpRight, Blocks, Code2, Database, FileText, GitBranch, Pause, Play, ShieldCheck, Workflow } from "lucide-react";
import { useReducedMotionPreference } from "@/components/motion";
import type { Project } from "@/lib/content";

type Step = { title: string; label: string; detail: string };
type NoteGroup = { title: string; items: string[] };
type DeepDive = {
  eyebrow: string;
  title: string;
  intro: string;
  flowName: string;
  steps: Step[];
  metrics: { value: string; label: string; note: string }[];
  capabilities: { title: string; text: string }[];
  decisions: string[];
  repoMap: string[];
  notes: NoteGroup[];
  caveat: string;
};

const deepDives: Record<Project["slug"], DeepDive> = {
  skillvector: {
    eyebrow: "SYSTEM ARCHITECTURE / CAREER INTELLIGENCE",
    title: "From a target role to a grounded learning plan.",
    intro: "O*NET and live Exa research establish a deduplicated skill set first. AI builds a timeline-based path, then adds courses, articles, projects, and progress tracking.",
    flowName: "PERSONALIZED LEARNING SYSTEM / SELECT A STEP",
    steps: [
      { title: "Choose a target role", label: "LEARNER PROFILE", detail: "The learner selects a role and adds current skills, experience, and learning preferences. Their profile anchors recommendations to their own starting point." },
      { title: "Find the skills employers need", label: "O*NET + LIVE EXA", detail: "SkillVector checks O*NET role data and researches live web results with Exa. It combines and deduplicates both skill lists before generating the learning path." },
      { title: "Set a learning timeline", label: "1 · 3 · 6 · 12 MONTHS", detail: "The path is generated to fit the learner's chosen 1, 3, 6, or 12-month timeline, with phases, milestones, weekly tasks, and practical projects." },
      { title: "Learn with the right resources", label: "VIDEOS + ARTICLES + PROJECTS", detail: "Each section has articles and YouTube courses in the learner's preferred language. Videos play inside the site, and every phase includes a project to apply the skills." },
      { title: "Check off real progress", label: "SECTION CHECKLISTS", detail: "Learners check off tasks as they finish each section. Phase progress, assessments, and activity are saved with their learning path." },
    ],
    metrics: [
      { value: "9.6s → 0.48s", label: "repeat search speed", note: "About 95% faster retrieval; this measures finding results, not generating the full answer." },
      { value: "~18s", label: "new learning plan", note: "Reported run with 13 web searches happening in parallel." },
      { value: "N → 1", label: "database calls per search", note: "Many separate skill lookups are sent together." },
      { value: "Role aware", label: "find related skills", note: "Meaning-based search keeps results tied to the learner's target role." },
    ],
    capabilities: [
      { title: "Role skills, checked two ways", text: "Five O*NET 29.0 datasets support role matching across 900+ occupations. Live Exa research adds the current skills employers ask for. SkillVector merges and deduplicates both sources before generating a path." },
      { title: "A plan that fits the learner's timeline", text: "Choose 1, 3, 6, or 12 months. The resulting path is organized into phases with topics, weekly tasks, progress checklists, and practical projects." },
      { title: "Courses and reading in the learner's language", text: "YouTube courses are found in the learner's preferred language and can be watched inside the site. Each section has articles, and each phase includes a project to put new skills to work." },
      { title: "Assessment and progression", text: "Each phase can have 15 questions across easy, medium, and hard levels. Answers stay server-side; 70% is the passing threshold and passing can add phase skills to the profile." },
      { title: "Checklists and weekly progress", text: "Learners check off tasks as they finish each section. Completion is saved per learner, phase, and week so progress stays with the path." },
      { title: "Video assignments", text: "Playback heartbeats track legitimate watch time, detect large seek jumps, and feed assignment progress to the learner and admin views." },
      { title: "Contextual career assistant", text: "Groq Compound can answer with web citations using the learner’s path, skills, role, and progress, with a Llama fallback when the primary model fails." },
      { title: "Profile, admin, and 3D product", text: "The Next.js app includes account onboarding, a career dashboard, market insights, learning views, assignments, and administration. The landing experience uses React Three Fiber, Drei, Framer Motion, and Zustand." },
      { title: "Identity and safeguards", text: "Learners can sign in with Google or email, recover access with a one-time code, and keep assessment answers protected on the server. A request lock stops duplicate path-generation work." },
    ],
    decisions: [
      "Combine and deduplicate skills from O*NET role data and live Exa research before asking the model to build the path.",
      "Let the learner choose a 1, 3, 6, or 12-month timeline so the path fits the time they have.",
      "Use one model to design the learning roadmap and a smaller, faster model to plan resource searches.",
      "Search for current roles and learning resources instead of relying only on a model's stored knowledge.",
      "Keep learner records and meaning-based search in one PostgreSQL system to reduce infrastructure and simplify operations.",
      "Cache learner context, search plans, resources, and market data separately, with clear size limits and expiration times.",
      "Lock duplicate requests so the same expensive roadmap is not generated twice, while different learners can work at the same time.",
      "Measure model and pipeline latency, and keep correct assessment answers on the server until submission.",
    ],
    repoMap: [
      "Learner experience · Role choice, timeline, preferred language, and progress dashboard",
      "Application service · Secure accounts, career planning, progress, and assistant APIs",
      "Career intelligence · O*NET skills combined with live Exa research and deduplication",
      "AI orchestration · Timeline-based path generation and resource search",
      "Learning experience · In-site videos, section articles, projects, and checklists",
      "Progress data · Completed tasks, assessments, weekly activity, and assignments",
      "Storage and search · PostgreSQL records with pgvector similarity search",
    ],
    notes: [
      { title: "How search stays useful and fast", items: ["Repeated resources can come from a one-hour in-memory cache or a 30-day semantic-search cache. Similarity thresholds and role filters prevent loosely related results from being reused.", "Search plans are keyed by target role, skill set, and language, so equivalent requests can share work. Market context and market insights use separate expiration windows.", "Article and video searches run concurrently on a cache miss. YouTube results exclude Shorts, account for non-English searches, and avoid duplicate links across the learning path."] },
      { title: "API surface", items: ["Auth: registration, login, Google OAuth, password reset and OTP verification.", "Profile + market: profile CRUD, role and skill suggestions, skill updates, role analysis, cached market insights.", "Learning: path generation, phase progress, tests and submissions, weekly progress, skill-add-and-regenerate.", "Assistant + assignments: context-aware chat and citations, assigned videos, playback heartbeat.", "Admin: analytics, users, activation and role controls, video management, assignments, activity log."] },
      { title: "Development and tools", items: ["The interface uses Next.js, React, and Tailwind. The service uses Python, FastAPI, SQLAlchemy, and Pydantic.", "PostgreSQL with pgvector keeps learner records and similarity search together; Supabase provides a hosted PostgreSQL option.", "Groq and Mistral power the planning and embedding stages. Tavily, Exa, and YouTube provide current resources and market context.", "PDF exports bring market insights together with the learner's career plan. The codebase includes tracing for model and pipeline latency."] },
    ],
    caveat: "The 9.6s → 0.48s figure is the warm repeat-query retrieval measurement. The résumé reports a cold path around 18 seconds with 13 concurrent web fetches. Neither number represents every user’s full response time.",
  },
  "flash-resume": {
    eyebrow: "SYSTEM ARCHITECTURE / EVIDENCE-LED TOOLING",
    title: "AI suggests. Your evidence decides.",
    intro: "Flash Resume compares a job post with the résumé you already have, suggests only useful edits, and checks each claim before creating a one-page PDF.",
    flowName: "REVIEWABLE RESUME WORKFLOW / SELECT A STEP",
    steps: [
      { title: "Choose a job post", label: "BROWSER OR COMMAND LINE", detail: "Select the job description in Chrome, or send it through the pip-installable CLI. Both connect to a local FastAPI service; only the selected job text is sent to an AI provider." },
      { title: "Find what the employer wants", label: "GROQ READS THE JOB POST", detail: "Groq extracts and organizes the requested skills and qualifications so the tool can compare them with the candidate's actual experience." },
      { title: "Edit only what's relevant", label: "GEMINI PLANS A SHORT DIFF", detail: "Gemini suggests changes only to relevant résumé bullets. It returns a small, reviewable diff instead of rewriting the whole document, using about 80% fewer tokens." },
      { title: "Reject unsupported claims", label: "CHECKED AGAINST YOUR RÉSUMÉ", detail: "A separate evidence gate checks every proposed edit against the master résumé, blocks unsupported claims, and limits rewrites to about two words." },
      { title: "Deliver a checked PDF", label: "ONE PAGE / UNDER 100 MS", detail: "Typst compiles the PDF locally in under 100ms. pypdf verifies it is one page, then the tool saves it with a readable report of edits and evidence." },
    ],
    metrics: [
      { value: "~3 min → <10s", label: "tailoring time", note: "Measured in the résumé project notes; job length and provider response affect the exact time." },
      { value: "~80% less", label: "AI rewriting", note: "Around 600 generated tokens instead of a full ~3,000-token rewrite." },
      { value: "±2 words", label: "typical edit limit", note: "A résumé-reported cap that keeps supported rewrites close to the source." },
      { value: "<100ms", label: "PDF compilation", note: "Résumé-reported local Typst compile time." },
    ],
    capabilities: [
      { title: "Evidence-based ATS matching", text: "The coverage score summarizes extracted requirements supported by the source résumé. It is not a prediction of an external ATS score, recruiter response, or interview outcome." },
      { title: "Truthful mode", text: "The default mode can emphasize supported experience and keywords; it cannot add a framework, employer, degree, certification, metric, or production claim without evidence." },
      { title: "Interview mode", text: "Adjacent skills can appear in a separate Familiarity section. Those items are excluded from the evidence matcher and never increase the coverage score." },
      { title: "Reviewable output", text: "Each run produces a one-page PDF and evidence-backed diff report. It shows covered, partial, and unsupported requirements, accepted edits, rejected suggestions, and why changes were skipped." },
      { title: "Import and preserve", text: "Import PDF, text, Markdown, or JSON résumés; recover structured details including hyperlinks, education, projects, and certifications, then review the master record before use." },
      { title: "Browser, CLI, and application tracker", text: "Use the selection-first Chrome extension or pip-installable CLI with clipboard, file, or terminal input. An application-history tracker records job applications." },
    ],
    decisions: [
      "Groq handles keyword extraction and Gemini handles rewrite reasoning, separating fast requirement parsing from focused edit planning.",
      "The model proposes targeted diffs; a deterministic evidence matcher checks every claim against the master résumé.",
      "The edit manifest states the identity, facts, supported terms, and size budget before the model writes. The engine restores the source text by ID rather than trusting retyped bullets.",
      "The matcher handles alternatives and compound requirements, partial evidence, education equivalents, and related technical terms; it filters role-context text that is not actually a skill.",
      "Core and project tailoring are split into focused calls; the project call is skipped when no project bullet has a supported term to add.",
      "The output is compiled locally with Typst, checked with pypdf, and retried at denser layouts before saving.",
      "The local daemon keeps the master résumé, API keys, and generated files on the device. Only the selected job description is sent to the configured AI providers.",
    ],
    repoMap: [
      "Browser add-on · Select job text and send it to the local tool",
      "Command-line app · Configure, import, tailor, and inspect results",
      "Local service · Route requests and connect the clients to the workflow",
      "Tailoring workflow · Extract requirements and coordinate focused AI calls",
      "Evidence gate · Check every proposed claim against the source résumé",
      "PDF and report · Compile the one-page result and explain every change",
      "Quality checks · Test the evidence rules, page count, and change report",
    ],
    notes: [
      { title: "Local API and setup", items: ["GET /api/status reports local service health; POST /api/tailor accepts selected job text, optional company and role, and editing mode.", "Local settings control Gemini and Groq keys, provider selection, and the output folder.", "The pip-installable CLI configures providers, keys, output, source résumé, and application history; a health check confirms the daemon is ready.", "GitHub Actions runs unit checks and publishes the CLI to PyPI when a version tag is pushed."] },
      { title: "AI providers and product use", items: ["Groq handles keyword extraction and Gemini handles rewrite reasoning, balancing latency and free-tier quotas.", "Unit tests cover evidence checks and generated reports. PDF import lets users bring in their master résumé.", "The Chrome extension and local daemon work with the application-history tracker and browser-based workflow."] },
    ],
    caveat: "Only the selected job-description text is sent to the configured AI provider. The résumé, provider key, local engine, and generated files remain on the device. Imported source résumés still need human review.",
  },
  codeatlas: {
    eyebrow: "SYSTEM ARCHITECTURE / REPOSITORY INTELLIGENCE",
    title: "Turn a public repository into a source-linked map.",
    intro: "CodeAtlas turns a public GitHub repository into an explorable map. It indexes understandable sections of the code, answers questions with links back to source files, and generates diagrams that help explain how the project fits together.",
    flowName: "CODEBASE EXPLORER / SELECT A STEP",
    steps: [
      { title: "Validate the source", label: "START WITH A PUBLIC REPOSITORY", detail: "A developer pastes a GitHub link into the Next.js interface. FastAPI checks the address and applies repository-size and file-count limits before analysis." },
      { title: "Clone and read the code", label: "SOURCE ANALYSIS", detail: "The service makes a shallow local copy, then reads supported code, configuration, and documentation. Python is read with its syntax structure; other supported languages use lighter pattern-based parsing." },
      { title: "Build a searchable project map", label: "SEARCHABLE CODE INDEX", detail: "The code is split into meaningful sections and indexed with repository and file details. ChromaDB keeps that searchable map on disk, so a backend restart does not require a fresh index." },
      { title: "Find and explain relevant code", label: "SOURCE-LINKED ANSWERS", detail: "A question searches the indexed source and gives the most relevant code to Groq as context. Answers stream as they are generated, with citations back to the source; a standard response format is also available." },
      { title: "Explore and diagram", label: "05 / DASHBOARD", detail: "The Next.js dashboard combines file exploration, language statistics, chat, and Groq-generated Mermaid class, dependency, flow, or architecture diagrams. Repository metadata and diagrams persist locally." },
    ],
    metrics: [
      { value: "10", label: "code sections per answer", note: "The search selects up to ten relevant sections to ground a response." },
      { value: "100 MB", label: "maximum repository size", note: "Default limit for a single analysis; the file count is limited too." },
      { value: "5,000", label: "maximum files scanned", note: "Default limit that keeps repository analysis bounded." },
      { value: "Live", label: "streamed answers", note: "Explanations arrive as they are generated, with links back to source files." },
    ],
    capabilities: [
      { title: "Repository dashboard", text: "A file explorer, language breakdown, architecture diagrams, and code-aware chat live together for each analyzed repository." },
      { title: "Multi-language parsing", text: "Primary source parsers cover Python, JavaScript/JSX, TypeScript/TSX, Java, Go, Rust, C, and C++. Markdown, YAML, JSON, TOML, XML, HTML, CSS/SCSS, SQL, and shell are also supported." },
      { title: "Grounded chat", text: "The system gives relevant indexed code to Groq as context, then returns source-linked explanations as they are written. A standard JSON response is also available." },
      { title: "Architecture diagrams", text: "Groq generates Mermaid class, dependency, flow, and architecture views. Generated diagrams are cached with repository metadata." },
      { title: "Persistent local state", text: "Cloned sources, ChromaDB collections, and repository metadata live in separate local runtime directories. Metadata allows dashboard recovery after a backend restart." },
      { title: "Safe development reload", text: "The documented uv run dev command excludes cloned_repos, chroma_data, repo_metadata, and .venv from file watching so a running analysis does not restart its own server." },
    ],
    decisions: [
      "Use shallow cloning, a 100 MB repository-size cap, and a 5,000-file default cap to bound repository analysis.",
      "Use AST structure for Python and lighter regex extraction for the other documented languages.",
      "Keep vectors and generated analysis persistent locally so reloads do not discard indexed repositories.",
      "Stream answers over Server-Sent Events while retaining a synchronous endpoint for simpler clients.",
      "Persist generated Mermaid output and repository metadata so diagrams do not need regeneration after restart.",
    ],
    repoMap: [
      "Developer workspace · Submit a repository and explore its project dashboard",
      "API service · Coordinate repository analysis, chat, and diagram requests",
      "Repository intake · Validate a GitHub URL and make a bounded local clone",
      "Code understanding · Parse supported languages and split files into searchable sections",
      "Search and answers · Find relevant code and return source-linked explanations",
      "Architecture views · Generate Mermaid diagrams from the analyzed repository",
      "Local project data · Save index, repository details, and diagrams between restarts",
    ],
    notes: [
      { title: "API surface", items: ["GET / and /health for service state; POST /api/repo/analyze, poll /status, read /info, or DELETE /api/repo/{id}.", "POST /api/chat/{id} streams SSE; /sync returns a JSON answer.", "POST /api/diagrams/{id}/generate accepts diagram types; GET /api/diagrams/{id} returns cached or persisted diagrams.", "Backend config includes GROQ_API_KEY, GROQ_MODEL, CHROMA_PERSIST_DIR, CLONE_DIR, REPO_METADATA_DIR, MAX_REPO_SIZE_MB, MAX_FILES, and TOP_K. Frontend API origin uses NEXT_PUBLIC_API_URL."] },
      { title: "Local development", items: ["Start the Python API from backend/ with its environment file configured, then start the Next.js interface from frontend/.", "Development reload excludes generated repository clones, the local vector database, repository metadata, and the virtual environment so live analysis does not restart the service.", "The development workflow includes frontend lint/build checks and Python compilation checks.", "The project has no repository license yet."] },
    ],
    caveat: "This is an early-stage development tool. It does not yet have authentication or a durable job queue, and analysis state is held in process with local metadata. Cloned code is untrusted; production use needs sandboxing, resource controls, and reliable background jobs.",
  },
};

const accents = { blue: "#7898ff", pink: "#ed83bd", violet: "#b29aff" } as const;

export function ProjectDeepDive({ project, children }: { project: Project; children?: ReactNode }) {
  const config = deepDives[project.slug];
  const [paused, setPaused] = useState(false);
  const soft = useReducedMotionPreference();
  const [active, setActive] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const flowInView = useInView(flowRef, { amount: .25 });
  const accent = accents[project.color];
  const selected = config.steps[active];

  useEffect(() => {
    if (soft || paused || !flowInView) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % config.steps.length), 2600);
    return () => window.clearInterval(timer);
  }, [config.steps.length, flowInView, paused, soft]);

  useEffect(() => {
    const flow = flowRef.current;
    const activeNode = nodeRefs.current[active];
    if (!flow || !activeNode || flow.scrollWidth <= flow.clientWidth) return;
    flow.scrollTo({ left: activeNode.offsetLeft - (flow.clientWidth - activeNode.offsetWidth) / 2, behavior: soft ? "auto" : "smooth" });
  }, [active, soft]);

  return (
    <section className={`project-deep-dive project-deep-${project.color}`} style={{ "--deep-accent": accent } as CSSProperties} aria-labelledby="deep-dive-title">
      <header className="deep-dive-heading">
        <span className="eyebrow">{config.eyebrow}</span>
        <h2 id="deep-dive-title">{config.title}</h2>
        <p>{config.intro}</p>
      </header>

      <div className="deep-architecture-panel">
        <div className="deep-panel-bar"><span><i className="signal"/> {config.flowName}</span><div className="deep-flow-controls"><span className="deep-panel-hint"><Blocks size={13}/> SYSTEM FLOW</span><button type="button" disabled={soft} onClick={() => setPaused(value => !value)} aria-label={soft ? "Architecture animation paused for reduced motion" : paused ? "Play architecture animation" : "Pause architecture animation"} aria-pressed={paused || soft}>{paused || soft ? <Play size={13} fill="currentColor"/> : <Pause size={13} fill="currentColor"/>}<span>{soft ? "REDUCED" : paused ? "PLAY" : "PAUSE"}</span></button></div></div>
        <div className="architecture-flow" ref={flowRef} role="group" aria-label={`${project.name} architecture stages`}>
          {config.steps.map((step, index) => (
            <div className="architecture-flow-item" key={step.title}>
              <motion.button ref={element => { nodeRefs.current[index] = element; }} type="button" className={`architecture-node ${active === index ? "is-active" : ""}`} onClick={() => { setActive(index); setPaused(true); }} aria-pressed={active === index} initial={soft ? { opacity: 0 } : { opacity: 0, y: 16 }} whileInView={soft ? { opacity: 1 } : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .4 }} transition={{ duration: soft ? .3 : .55, delay: soft ? 0 : index * .075, ease: [0.16, 1, 0.3, 1] }} whileHover={{ y: -4, transition: { type: "spring", stiffness: 360, damping: 23 } }} whileTap={{ scale: .985 }}>
                {active === index && <motion.span className="architecture-active-glow" layoutId={`architecture-glow-${project.slug}`} transition={{ type: "spring", stiffness: 300, damping: 28 }}/>}
                <span className="architecture-node-index">0{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.label}</small>
              </motion.button>
              {index < config.steps.length - 1 && <motion.div className={`architecture-arrow-wrap ${active === index ? "is-flowing" : ""}`} aria-hidden="true" initial={{ opacity: .25 }} animate={{ opacity: active >= index ? 1 : .3 }} transition={{ duration: .3 }}><ArrowRight className="architecture-arrow" size={17}/></motion.div>}
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="architecture-inspector" key={selected.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .22 }} aria-live="polite">
            <span className="architecture-inspector-number">STAGE 0{active + 1} / {String(config.steps.length).padStart(2, "0")}</span>
            <div><h3>{selected.title}</h3><p>{selected.detail}</p></div>
            <Workflow size={22} aria-hidden="true"/>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="deep-metrics" aria-label={`${project.name} engineering measurements`}>
        {config.metrics.map((metric, index) => <article className="deep-metric" key={metric.label}><span>0{index + 1} / MEASURED</span><strong>{metric.value}</strong><h3>{metric.label}</h3><p>{metric.note}</p></article>)}
      </div>

      <details className="deep-more-details">
        <summary><span><small>FOR CURIOUS READERS</small><strong>Technical decisions &amp; more</strong></span><span className="deep-more-toggle">EXPLORE <b>+</b></span></summary>
        <div className="deep-more-content">
          <div className="deep-context-grid">
            <article><span>THE CHALLENGE</span><p>{project.problem}</p></article>
            <article><span>THE APPROACH</span><p>{project.decision}</p></article>
            <article><span>THE OUTCOME</span><p>{project.star.result}</p><ul>{project.points.map(point => <li key={point}>{point}</li>)}</ul></article>
          </div>
          <section className="deep-capabilities" aria-labelledby="deep-capabilities-title">
            <div className="deep-section-title"><span className="eyebrow">PRODUCT CAPABILITIES</span><h3 id="deep-capabilities-title">What it can do.</h3></div>
            <div className="deep-capability-grid">{config.capabilities.map((item, index) => <article className="deep-capability" key={item.title}><span className="deep-capability-index">0{index + 1}</span><h4>{item.title}</h4><p>{item.text}</p></article>)}</div>
          </section>

          <div className="deep-implementation-grid">
            <section className="deep-decisions" aria-labelledby="deep-decisions-title">
              <span className="eyebrow">WHY THESE CHOICES MATTER</span><h3 id="deep-decisions-title">Decisions that make it work.</h3>
              <ul>{config.decisions.map((decision, index) => <li key={decision}><span>0{index + 1}</span><p>{decision}</p></li>)}</ul>
            </section>
            <section className="deep-repo-map" aria-labelledby="deep-repo-title">
              <span className="eyebrow"><GitBranch size={12}/> SYSTEM MAP</span><h3 id="deep-repo-title">How the parts fit together.</h3>
              <ul>{config.repoMap.map((item, index) => <li key={item}><span>{index === 0 ? <Code2 size={14}/> : index === config.repoMap.length - 1 ? <Database size={14}/> : <FileText size={14}/>}</span><p>{item}</p></li>)}</ul>
            </section>
          </div>

          <div className="deep-notes">
            {config.notes.map((group, index) => <details className="deep-notes-disclosure" key={group.title}>
              <summary><span><b>0{index + 1}</b>{group.title}</span><span className="deep-disclosure-icon">+</span></summary>
              <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
            </details>)}
          </div>

          <p className="deep-caveat"><ShieldCheck size={15}/><span>{config.caveat}</span></p>
          {children}
        </div>
      </details>
      <div className="deep-source-link"><span>ARCHITECTURE + IMPLEMENTATION OVERVIEW</span><a href={project.source} target="_blank" rel="noreferrer">Explore source repository <ArrowUpRight size={15}/></a></div>
    </section>
  );
}
