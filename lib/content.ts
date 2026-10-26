export const profile = {
  name: "Pavan Bollepalli",
  email: "pavanvenkatanagamanoj@gmail.com",
  github: "https://github.com/PavanBollepalli",
  linkedin: "https://linkedin.com/in/PavanBollepalli",
  resume: "/assets/Pavan-Bollepalli-Resume.pdf",
  location: "Guntur, India",
};

export const projects = [
  {
    slug: "skillvector", repo: "SkillVector", name: "SkillVector", type: "AI CAREER INTELLIGENCE", color: "blue",
    headline: "Less waiting. More direction.",
    description: "Career intelligence grounded in real labour-market data. A three-layer RAG pipeline that turns a target role into an evidence-backed learning roadmap.",
    stack: ["FastAPI", "pgvector", "PostgreSQL", "Next.js", "Groq"],
    proof: "95%", proofLabel: "lower warm-query retrieval latency",
    star: {
      situation: "Career advice was generic. Retrieval took 9.6 seconds.",
      task: "Ground role-specific roadmaps in real skills data, without the wait.",
      action: "Built cache-first hybrid retrieval, batched queries and request locks.",
      result: "Warm retrieval: 9.6s → 0.48s. Same grounded context, 95% less waiting.",
    },
    url: "https://skill-vector-kyzv.vercel.app",
    source: "https://github.com/PavanBollepalli/SkillVector",
    points: ["9.6s → 0.48s warm-query retrieval", "Hybrid search over O*NET 29.0", "Batched queries: N round-trips → 1", "Request locks prevent duplicate generations"],
    problem: "Generic career advice isn't grounded in the actual skills a job requires. The original warm-query retrieval path also took 9.6 seconds.",
    decision: "A cache-first retrieval path: in-memory cache, then pgvector hybrid search using HNSW and B-tree filters, then live retrieval on a cold miss. Per-skill lookups become one batched query. A request lock prevents duplicate generation runs.",
    boundary: "The 95% improvement measures warm-query retrieval latency, not end-to-end LLM generation time. Cold requests still perform external retrieval and generation.",
  },
  {
    slug: "flash-resume", repo: "flash-resume", name: "Flash Resume", type: "EVIDENCE-LED AI TOOLING", color: "pink",
    headline: "AI proposes. Evidence decides.",
    description: "A local-first résumé engine that turns a job description into a truthful, verified one-page PDF. Language models suggest relevance. Deterministic checks own the truth.",
    stack: ["Python", "FastAPI", "Typst", "Chrome MV3", "PyPI"],
    proof: "1 page", proofLabel: "compiled, checked, ready to review",
    star: {
      situation: "AI résumé rewrites could invent experience and break the layout.",
      task: "Tailor a truthful, one-page résumé with a reviewable trail.",
      action: "Separated AI planning from evidence checks and local PDF verification.",
      result: "A verified one-page PDF and readable diff, shipped as a published CLI.",
    },
    url: "https://pypi.org/project/flash-resume/",
    source: "https://github.com/PavanBollepalli/flash-resume",
    points: ["Deterministic evidence checks on AI proposals", "Parallel core and project planning", "Typst compilation + pypdf verification", "Published CLI and Chrome extension"],
    problem: "Tailoring a résumé meant jumping between a job board, AI chat and a document editor. Full rewrites could introduce unsupported experience and break the one-page layout.",
    decision: "Keep a hard boundary between AI planning and deterministic evidence matching. Merge structured specialist plans, validate claims against the master résumé, compile locally with Typst, then verify the page count with pypdf. Ship the PDF alongside a readable diff report.",
    boundary: "The coverage score measures supported requirements, not a guarantee from an external ATS. Imported résumés need human review. Local-first doesn't mean offline: the configured model provider processes the job description.",
  },
  {
    slug: "codeatlas", repo: "CodeAtlas", name: "CodeAtlas", type: "REPOSITORY INTELLIGENCE", color: "violet",
    headline: "Unfamiliar code. Familiar territory.",
    description: "Turn a public repository into an explorable knowledge base. Ask code-aware questions with source citations, inspect the file tree and uncover the architecture.",
    stack: ["FastAPI", "ChromaDB", "Groq", "Next.js", "Mermaid"],
    proof: "Citations", proofLabel: "answers grounded in indexed source code",
    star: {
      situation: "Understanding an unfamiliar repository meant tracing files by hand.",
      task: "Make code and architecture explorable through grounded questions.",
      action: "Indexed semantic code chunks for retrieval and streamed cited answers.",
      result: "Source-linked answers and architecture diagrams in a working prototype.",
    },
    url: "https://code-atlas-xi.vercel.app",
    source: "https://github.com/PavanBollepalli/CodeAtlas",
    points: ["Multi-language parsing and semantic chunking", "Persistent ChromaDB vector retrieval", "Streamed AI chat with source citations", "Generated Mermaid architecture diagrams"],
    problem: "Onboarding onto an unfamiliar codebase means tracing file trees, dependencies and architecture by hand before you can ask a useful question.",
    decision: "Validate and shallow-clone a public repository, parse source into meaningful chunks, persist embeddings in ChromaDB, and retrieve code context for streamed answers with citations. A separate pipeline generates Mermaid views of the architecture.",
    boundary: "This is a development-stage project. The repository documents production hardening still needed: sandboxed workers, authentication, durable job state and resource limits. No adoption or performance metrics are claimed.",
  },
] as const;

export type Project = (typeof projects)[number];

export const notes = [
  {
    slug: "retrieval-before-generation", number: "01", category: "RETRIEVAL ENGINEERING", title: "Fix retrieval before you change the model.", subtitle: "What made SkillVector's warm-query path 95% faster.", theme: "blue",
    paragraphs: [
      "A slow AI feature isn't automatically a slow language model. In SkillVector, the warm-query retrieval path took 9.6 seconds before the model even had the right context. Changing the prompt wouldn't fix the database round-trips.",
      "I split retrieval into three layers: an in-memory hot-path cache, pgvector hybrid search, and live web retrieval on a cold miss. HNSW cosine search handles semantic similarity; a B-tree filter narrows the target role. Per-skill queries were batched into a single UNION ALL query.",
      "The resulting warm-query retrieval measurement was 0.48 seconds, down from 9.6 seconds. That is a 95% reduction in retrieval latency, not a claim that every complete answer arrives in half a second. Generation and cold retrieval have their own costs.",
      "One more reliability fix mattered: a request lock. Duplicate clicks shouldn't start duplicate expensive generation runs. Optimising the path and controlling who enters it are different parts of the same engineering problem.",
    ],
  },
  {
    slug: "evidence-not-confidence", number: "02", category: "AI RELIABILITY", title: "Confidence is not a source of truth.", subtitle: "The hard boundary at the heart of Flash Resume.", theme: "pink",
    paragraphs: [
      "A résumé-tailoring model is good at spotting relevance. That doesn't make it qualified to decide which experience someone actually has. Flash Resume gives those two jobs to different layers.",
      "The language model extracts job requirements and proposes a structured plan. A deterministic evidence matcher checks those requirements against the master résumé. Covered, partial and unsupported are explicit decisions, not adjectives chosen by the model.",
      "Requirement matching isn't just keyword search. Java/TypeScript/Python can be alternatives. Supervised, unsupervised and reinforcement learning can be a compound requirement. Meeting one part of a compound requirement isn't the same as meeting all of it.",
      "After validation, Typst compiles the document and pypdf checks the page count. A readable diff report shows the evidence behind the changes. The result still needs human review, but the system makes that review possible instead of hiding it behind fluent text.",
    ],
  },
  {
    slug: "indexes-and-open-source", number: "03", category: "BACKEND FUNDAMENTALS", title: "Sometimes the answer is an index.", subtitle: "Lessons from working with Wikimedia's production data.", theme: "violet",
    paragraphs: [
      "At Wikimedia, contributor-trend questions were answered using replicated production datasets and one-off analysis scripts. The useful work wasn't a new AI layer. It was making the underlying questions faster and the answers easier to reproduce.",
      "I built a community insights dashboard in Python, Streamlit and MySQL. Composite indexes and query restructuring reduced SQL execution time by approximately 25%. Reusable Python query modules replaced scripts that kept being rewritten.",
      "The work went through international code review and was merged into the main repository. Tests, readable queries and reviewable changes mattered as much as the benchmark.",
      "That experience shapes how I build AI backends now. Start with the data path. Make the invariants explicit. Measure the specific thing you changed. A fast demonstration is useful; a system another engineer can maintain is better.",
    ],
  },
] as const;
