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
    headline: "A clearer path to your next role.",
    description: "Career guidance grounded in real job and skills data. SkillVector compares a target role with O*NET data and builds a tailored learning path. Repeat-query retrieval fell from 9.6 seconds to 0.48 seconds.",
    stack: ["FastAPI", "pgvector", "PostgreSQL", "Next.js", "Groq"],
    proof: "95%", proofLabel: "faster retrieval on repeat queries",
    star: {
      situation: "Career advice was often broad rather than tied to real job requirements. The first version also took 9.6 seconds to retrieve information for a repeat query.",
      task: "Build a learning path from real role and skills data, and return repeat searches faster.",
      action: "Added a cache for repeat searches, combined vector and keyword search across O*NET data, grouped database lookups into one query, and prevented duplicate requests from starting extra work.",
      result: "Repeat-query retrieval fell from 9.6 seconds to 0.48 seconds, about 95% faster. This measures information retrieval, not the full time to generate an answer.",
    },
    url: "https://skill-vector-kyzv.vercel.app",
    source: "https://github.com/PavanBollepalli/SkillVector",
    points: ["Repeat-query retrieval: 9.6s → 0.48s", "Role and skills data from O*NET 29.0", "Grouped database lookups from N queries into one", "Request lock avoids duplicate generation runs"],
    problem: "People looking for career advice often get broad suggestions instead of guidance tied to the skills employers ask for. The first version also took 9.6 seconds to retrieve information for a repeat query.",
    decision: "Check an in-memory cache first. For a new query, search O*NET using both keyword and vector matching in pgvector, then fetch live web data when needed. HNSW and B-tree indexes help narrow results. Batch per-skill lookups into one SQL query, and use a request lock to prevent duplicate generation runs.",
    boundary: "The 95% improvement is for repeat-query retrieval only; it does not measure the full time to generate an answer. A first-time query can still need live retrieval and model generation.",
  },
  {
    slug: "flash-resume", repo: "flash-resume", name: "Flash Resume", type: "EVIDENCE-LED AI TOOLING", color: "pink",
    headline: "AI suggests. Your evidence decides.",
    description: "A résumé tool that tailors a real résumé to a job description without adding unsupported experience. It checks each suggested claim against the source résumé, then produces a page-checked PDF and a report of the changes.",
    stack: ["Python", "FastAPI", "Typst", "Chrome MV3", "PyPI"],
    proof: "1 page", proofLabel: "checked PDF with a change report",
    star: {
      situation: "Tailoring a résumé meant moving between a job post, an AI tool, and a document editor. Full rewrites could add unsupported claims or break the one-page layout. The project README estimates this manual loop at 15–30 minutes per application.",
      task: "Make job-specific edits while keeping every claim supported by the source résumé, then deliver a checked one-page PDF.",
      action: "The model identifies relevant requirements and proposes edits. A deterministic evidence check compares each claim with the source résumé. Typst compiles the document, and pypdf checks the page count before saving.",
      result: "A published CLI and browser extension produce a one-page PDF and a readable change report, with evidence for each supported edit.",
    },
    url: "https://pypi.org/project/flash-resume/",
    source: "https://github.com/PavanBollepalli/flash-resume",
    points: ["Checks AI suggestions against the source résumé", "Plans edits for experience and projects separately", "Compiles with Typst and checks the PDF stays to one page", "Published as a Python CLI and browser extension"],
    problem: "Tailoring a résumé meant moving between a job board, an AI tool, and a document editor. The project README estimates that loop at 15–30 minutes per application. Full rewrites could also add unsupported experience or break the one-page layout.",
    decision: "The model extracts job requirements and proposes a structured set of edits. A deterministic evidence matcher checks them against the master résumé before they can be used. The tool compiles the result with Typst, checks the page count with pypdf, and provides a readable change report.",
    boundary: "The coverage score shows how many extracted job requirements have résumé evidence; it does not predict an ATS score or interview outcome. Imported résumés need human review. The configured AI provider processes the submitted job description, so local-first does not mean offline.",
  },
  {
    slug: "codeatlas", repo: "CodeAtlas", name: "CodeAtlas", type: "REPOSITORY INTELLIGENCE", color: "violet",
    headline: "Find your way around unfamiliar code.",
    description: "A tool for getting oriented in a public codebase. Ask questions, follow answers back to relevant source files, and view a generated map of the architecture.",
    stack: ["FastAPI", "ChromaDB", "Groq", "Next.js", "Mermaid"],
    proof: "Citations", proofLabel: "answers grounded in indexed source code",
    star: {
      situation: "Understanding a new codebase means tracing files, following dependencies, and piecing together how the system is organized.",
      task: "Help engineers find relevant code, ask questions about it, and see how the main parts fit together.",
      action: "The prototype indexes a public repository, finds relevant code for a question, and streams an answer with links back to the source. A separate step creates a Mermaid architecture diagram.",
      result: "A working prototype returns source-linked answers and architecture diagrams. No adoption or performance claims are made.",
    },
    url: "https://code-atlas-xi.vercel.app",
    source: "https://github.com/PavanBollepalli/CodeAtlas",
    points: ["Parses code from multiple languages", "Searches indexed source files for relevant context", "Answers questions with links to source code", "Creates Mermaid architecture diagrams"],
    problem: "Getting started in an unfamiliar codebase can require hours of following file trees and dependencies before an engineer understands where a feature lives.",
    decision: "Validate and shallow-clone a public repository, split source files into searchable sections, and store their vector representations in ChromaDB. Retrieve relevant sections for a streamed answer with source citations. Generate Mermaid views of the architecture separately.",
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
