(function () {
  "use strict";

  document.documentElement.classList.add("js");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const EMAIL = "pavanvenkatanagamanoj@gmail.com";
  const RESUME = "assets/Pavan-Bollepalli-Resume.pdf";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Boot sequence ---------- */
  const boot = $("#boot");
  (async function runBoot() {
    if (!boot) return;
    const seen = sessionStorage.getItem("booted");
    const sceneReady = new Promise((r) => {
      addEventListener("scene:ready", r, { once: true });
      setTimeout(r, 3000);
    });
    if (seen || reduced) {
      await Promise.race([sceneReady, sleep(600)]);
      boot.classList.add("done");
      startHero();
      return;
    }
    const log = $("#bootLog"), bar = $("#bootBar");
    const lines = [
      ["pavan.bollepalli / portfolio visual intro", ""],
      ["Flash Resume · evidence-led AI tooling", ""],
      ["SkillVector · RAG + hybrid retrieval", ""],
      ["Wikimedia · open-source contributions", ""],
      ["loading 3D presentation …", ""],
      ["Backend engineering. AI with boundaries.", ""],
    ];
    for (let i = 0; i < lines.length; i++) {
      const d = document.createElement("div");
      d.innerHTML = esc(lines[i][0]) + (lines[i][1] ? `<span class="ok">${lines[i][1]}</span>` : "");
      log.appendChild(d);
      bar.style.width = ((i + 1) / lines.length) * 100 + "%";
      await sleep(170);
    }
    await sceneReady;
    await sleep(150);
    sessionStorage.setItem("booted", "1");
    boot.classList.add("done");
    startHero();
  })();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  const parents = new Map();
  revealEls.forEach((el) => {
    const p = el.parentElement;
    const i = parents.get(p) || 0;
    parents.set(p, i + 1);
    el.style.setProperty("--d", Math.min(i * 0.08, 0.4) + "s");
  });
  function observeReveals() {
    if (!("IntersectionObserver" in window)) return revealEls.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => { if (!el.closest(".hero")) io.observe(el); });
  }
  observeReveals();

  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    $$(".hero .reveal").forEach((el) => el.classList.add("in"));
    startTyper();
  }
  setTimeout(startHero, 4200);

  /* ---------- Nav, progress, scrollspy ---------- */
  const nav = $("#nav"), progress = $("#scrollProgress");
  const navLinks = $$(".nav-links a");
  const spyTargets = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("scrolled", y > 30);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    const mid = innerHeight * 0.4;
    let active = null;
    spyTargets.forEach((s) => { if (s.getBoundingClientRect().top <= mid) active = s.id; });
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + active));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu");
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      menu.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus();
    }
  });

  /* ---------- Typewriter ---------- */
  function startTyper() {
    const el = $("#typer");
    if (!el || reduced) return;
    const words = ["RAG pipelines", "FastAPI services", "vector search", "LLM guardrails", "backend systems"];
    let w = 0, c = words[0].length, del = true;
    function step() {
      const word = words[w];
      if (del) {
        c--;
        el.textContent = word.slice(0, c);
        if (c <= 0) { del = false; w = (w + 1) % words.length; }
        setTimeout(step, c <= 0 ? 300 : 40);
      } else {
        const next = words[w];
        c++;
        el.textContent = next.slice(0, c);
        if (c >= next.length) { del = true; setTimeout(step, 2200); return; }
        setTimeout(step, 75);
      }
    }
    setTimeout(step, 2400);
  }

  /* ---------- Counters ---------- */
  const counters = $$("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
      if (reduced || (to < 10 && !dec)) return;
      const from = el.closest(".hud-metric") ? 9.6 : 0;
      const t0 = performance.now(), dur = 1800;
      (function f(now) {
        const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 4);
        el.textContent = (from + (to - from) * ease).toFixed(dec);
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => cio.observe(c));

  /* ---------- 3D tilt, magnetic buttons, cursor glow ---------- */
  if (finePointer && !reduced) {
    $$(".tilt").forEach((el) => {
      const max = el.classList.contains("about-photo") ? 8 : 5;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
        el.style.setProperty("--mx", x * 100 + "%");
        el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

    const glow = $("#cursorGlow");
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- RAG pipeline simulator ---------- */
  const rag = $("[data-rag]");
  if (rag) {
    const nodes = Object.fromEntries($$(".rag-node", rag).map((n) => [n.dataset.node, n]));
    const wires = $$(".rag-wire", rag);
    const logEl = $("[data-rag-log]", rag), timeEl = $("[data-rag-time]", rag), noteEl = $("[data-rag-note]", rag);
    let runId = 0, timerRaf = 0;

    const reset = () => {
      Object.values(nodes).forEach((n) => n.classList.remove("hit", "pass", "skip", "block"));
      wires.forEach((w) => w.classList.remove("flow"));
      logEl.innerHTML = "";
    };
    const log = (simT, msg, cls = "") => {
      const d = document.createElement("div");
      d.innerHTML = `<span class="t">[${simT.toFixed(2).padStart(5, "0")}s]</span> <span class="${cls}">${msg}</span>`;
      logEl.appendChild(d);
      logEl.scrollTop = logEl.scrollHeight;
    };
    const runTimer = (scale, endSim, id) => {
      cancelAnimationFrame(timerRaf);
      const t0 = performance.now();
      (function f(now) {
        if (id !== runId) return;
        const sim = Math.min(((now - t0) / 1000) * scale, endSim);
        timeEl.textContent = sim.toFixed(2) + "s";
        if (sim < endSim) timerRaf = requestAnimationFrame(f);
      })(t0);
    };

    const scripts = {
      warm: {
        scale: 1, end: 0.48, note: "simulated warm retrieval · not full generation",
        steps: [
          [0, "req", "hit", null, 'POST /roadmap {target_role: "ML Engineer"}', "info"],
          [0.03, "lock", "pass", 0, "lock acquired → key=hash(user, role)"],
          [0.07, "l1", "pass", 1, "L1 in-memory: miss"],
          [0.2, "l2", "hit", 2, "L2 pgvector: HNSW cosine top-k, filter target_role (B-tree) → hit", "ok"],
          [0.22, "l3", "skip", null, "L3 web fetch: skipped (context already warm)"],
          [0.32, null, null, null, "batched UNION ALL: N skill lookups → 1 round-trip"],
          [0.48, "llm", "hit", 4, "context ready in 0.48s → Llama 3.3 70B (Groq)", "ok"],
        ],
      },
      cold: {
        scale: 6, end: 18, note: "cold path · simulated at 6× speed",
        steps: [
          [0, "req", "hit", null, 'POST /roadmap {target_role: "AI Platform Engineer"}', "info"],
          [0.1, "lock", "pass", 0, "lock acquired"],
          [0.3, "l1", "pass", 1, "L1 in-memory: miss"],
          [0.9, null, null, null, "O*NET 29.0: fuzzy SOC match… role not in O*NET → LLM fallback", "warn"],
          [1.6, "l2", "pass", 2, "L2 pgvector: below similarity threshold → miss"],
          [2.2, "l3", "hit", 3, "L3 Tavily: dispatching 13 concurrent web fetches", "info"],
          [9.4, null, null, null, "13/13 fetched → embedding with Mistral Embed (1024-d)"],
          [12.6, null, null, null, "upsert into pgvector, so the next request takes the warm path"],
          [13.2, "llm", "hit", 4, "generating learning path with Llama 3.3 70B"],
          [18, null, null, null, "done ≈ 18s end-to-end. The next identical query is warm (0.48s).", "ok"],
        ],
      },
      dupe: {
        scale: 1, end: 0.6, note: "3 requests · 1 generation run",
        steps: [
          [0, "req", "hit", null, "3 identical requests in 120ms (double-click + retry + 2nd tab)", "info"],
          [0.04, "lock", "hit", 0, "req#1 → lock acquired, running pipeline", "ok"],
          [0.08, "lock", "block", null, "req#2 → lock held, awaiting the in-flight result", "warn"],
          [0.12, null, null, null, "req#3 → lock held, awaiting the in-flight result", "warn"],
          [0.2, "l1", "pass", 1, "L1 in-memory: miss"],
          [0.36, "l2", "hit", 2, "L2 pgvector hybrid → hit", "ok"],
          [0.38, "l3", "skip", null, "L3 skipped"],
          [0.6, "llm", "hit", 4, "1 run, 3 responses. Prevented 2 duplicate 18s generations.", "ok"],
        ],
      },
    };

    async function run(mode) {
      const id = ++runId;
      const s = scripts[mode];
      reset();
      noteEl.textContent = s.note;
      runTimer(s.scale, s.end, id);
      let prev = 0;
      for (const [at, node, cls, wire, msg, mcls] of s.steps) {
        await sleep(((at - prev) / s.scale) * 1000);
        if (id !== runId) return;
        prev = at;
        if (wire !== null && wire !== undefined) wires[wire].classList.add("flow");
        if (node) {
          if (cls === "block") nodes[node].classList.add("block");
          else { nodes[node].classList.remove("hit", "pass", "skip"); nodes[node].classList.add(cls); }
        }
        log(at, esc(msg), mcls);
      }
      timeEl.textContent = s.end.toFixed(2) + "s";
    }

    $$(".seg-btn", rag).forEach((b) => b.addEventListener("click", () => {
      $$(".seg-btn", rag).forEach((x) => {
        x.classList.toggle("is-active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      run(b.dataset.mode);
    }));

    const rio = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { rio.disconnect(); run("warm"); }
    }, { threshold: 0.5 });
    rio.observe(rag);
  }

  const flashDemo = $("[data-flash-demo]");
  if (flashDemo) {
    const scenario = $("[data-flash-scenario]", flashDemo);
    const modeButtons = $$("[data-flash-mode]", flashDemo);
    const evidence = $("[data-flash-evidence]", flashDemo);
    const decisions = $("[data-flash-decisions]", flashDemo);
    const note = $("[data-flash-note]", flashDemo);
    let mode = "truthful";
    const samples = {
      backend: {
        evidence: ["Built Python services with FastAPI", "Queried PostgreSQL through REST APIs", "No Kubernetes experience documented"],
        requirements: [
          ["FastAPI", "covered", "Explicit framework evidence → eligible for tailoring."],
          ["PostgreSQL", "covered", "Documented database use → eligible for tailoring."],
          ["Kubernetes", "unsupported", "No source evidence → excluded from normal claims."],
        ],
        note: "Supported wording may change. Unsupported experience does not become a qualification.",
      },
      compound: {
        evidence: ["Built supervised classification models", "Used unsupervised clustering in Python", "No reinforcement learning work documented"],
        requirements: [
          ["Python", "covered", "Explicit language evidence → eligible for tailoring."],
          ["Supervised, unsupervised AND reinforcement learning", "partial", "Two of three components have evidence. The whole requirement is not fully covered."],
          ["Reinforcement learning", "unsupported", "The missing component cannot be inserted into experience."],
        ],
        note: "Partial credit is not full coverage. A compound requirement must retain its unsupported component.",
      },
      adjacent: {
        evidence: ["Built command-line utilities in Python", "No FastAPI project documented", "No production web framework experience documented"],
        requirements: [
          ["Python", "covered", "Existing language evidence → eligible for tailoring."],
          ["FastAPI", "unsupported", "Python alone is not evidence of having built FastAPI services."],
          ["Production FastAPI experience", "unsupported", "An adjacent foundation cannot establish production experience."],
        ],
        note: "Truthful mode keeps FastAPI out of normal claims when only Python is documented.",
      },
    };
    function renderFlashDemo() {
      const sample = samples[scenario.value];
      evidence.replaceChildren(...sample.evidence.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }));
      decisions.replaceChildren(...sample.requirements.map(([requirement, status, reason]) => {
        if (scenario.value === "adjacent" && mode === "interview" && requirement === "FastAPI") {
          status = "familiarity";
          reason = "Candidate for a separate Familiarity section only; review honestly before using it.";
        }
        const row = document.createElement("div"), name = document.createElement("strong"), badge = document.createElement("span"), detail = document.createElement("small");
        row.className = "flash-decision";
        name.textContent = requirement;
        badge.className = "evidence-status " + status;
        badge.textContent = { covered: "Covered", partial: "Partial", unsupported: "Unsupported", familiarity: "Familiarity only" }[status];
        detail.textContent = reason;
        row.append(name, badge, detail);
        return row;
      }));
      modeButtons.forEach((button) => {
        const active = button.dataset.flashMode === mode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      $("[data-flash-mode-label]", flashDemo).textContent = mode === "truthful" ? "Truthful mode" : "Interview prep mode";
      note.textContent = scenario.value === "adjacent" && mode === "interview"
        ? "Familiarity is separately labeled, never merged into experience. Only include skills you can discuss honestly."
        : sample.note;
    }
    scenario.addEventListener("change", renderFlashDemo);
    modeButtons.forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.flashMode;
      renderFlashDemo();
    }));
    renderFlashDemo();
  }

  /* ---------- API playground ---------- */
  const api = $("[data-api]");
  if (api) {
    const data = {
      profile: {
        name: "Pavan Venkata Naga Manoj Bollepalli",
        role: ["Backend Engineer", "AI Engineer"],
        location: "Guntur, India (IST) · open to remote / relocation",
        education: { degree: "B.Tech CSE (AI & ML)", school: "VVIT", graduated: 2026, cgpa: 8.28 },
        status: "available_now",
        open_to: ["Backend Engineer", "AI / LLM Engineer", "ML Engineer"],
        summary: "Production RAG pipelines (Llama 3.3 70B, pgvector, O*NET), strong DSA, open-source at Wikimedia.",
      },
      experience: [{
        org: "Wikimedia Foundation", title: "Open Source Developer", remote: true,
        period: "2024-07 → 2025-09",
        impact: ["~25% faster SQL via composite indexes + query restructuring", "Python + Streamlit + MySQL community insights dashboard", "Reusable, unit-tested Python query modules", "Merged into main repo after international code review"],
      }],
      projects: [
        {
          name: "Flash Resume", type: "evidence-led local-first CLI + browser extension", status: "published_on_pypi",
          architecture: ["Parallel core + project plans", "Deterministic evidence matching", "Sanitized edits", "Typst compilation + pypdf verification"],
          outputs: ["Company_Role.pdf", "Company_Role.diff.md"],
          modes: { truthful: "supported evidence only", interview_prep: "separate, clearly labeled familiarity; not production experience" },
          tests: { count: 44, source: "supplied README; not rerun by this portfolio" },
          limitations: ["Coverage score is not an external ATS guarantee", "Local-first, not offline", "Windows background autostart", "Imported resumes need review"],
          stack: ["Python", "FastAPI", "Typst", "pypdf", "Chrome MV3", "Gemini / Groq"],
          pypi: "https://pypi.org/project/flash-resume/", repo: "https://github.com/PavanBollepalli/flash-resume",
        },
        { name: "SkillVector", type: "AI career intelligence", impact: "Warm-query RAG latency 9.6s → 0.48s (−95%); not total LLM generation time", stack: ["FastAPI", "pgvector", "Llama 3.3 70B", "Next.js 16"], live: "https://skill-vector-kyzv.vercel.app" },
      ],
      roadmap: {
        disclaimer: "Planned concepts, not shipped claims. Scope may change after user discovery.",
        next: { name: "Retrieval Eval Lab", focus: "RAG evaluation infrastructure", targets: ["Recall@K + MRR", "faithfulness", "latency traces", "CI experiment reports"] },
        queue: [
          { name: "Guardrail Runtime", focus: "reliable tool-using agents", stage: "proposed_concept" },
          { name: "Context Mesh", focus: "multimodal retrieval with citations", stage: "proposed_concept" },
        ],
      },
      skills: {
        languages: ["Python", "Java", "JavaScript", "SQL"],
        backend: ["FastAPI", "Node.js", "Express.js", "REST API design"],
        ai_ml: ["RAG", "Generative AI", "Prompt engineering", "Vector embeddings"],
        databases: ["PostgreSQL", "pgvector", "MySQL", "ChromaDB"],
        cloud_devops: ["AWS", "Google Cloud", "Docker", "Linux", "Git", "GitHub Actions"],
        frontend: ["Next.js", "React", "Tailwind CSS"],
      },
      certs: [
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
        { name: "Associate Cloud Engineer", issuer: "Google Cloud" },
        { name: "ACM Programming Contest", result: "1st place", participants: "200+" },
      ],
      hire: {
        simulation: true, message_sent: false,
        message: "This explorer does not submit interview requests. Email me to start a conversation.",
        next_step: `mailto:${EMAIL}`,
        linkedin: "https://linkedin.com/in/PavanBollepalli",
        github: "https://github.com/PavanBollepalli",
        resume: "/" + RESUME,
      },
    };
    const paths = {
      profile: "GET /v1/profile", experience: "GET /v1/experience", projects: "GET /v1/projects",
      roadmap: "GET /v1/roadmap", skills: "GET /v1/skills", certs: "GET /v1/certifications", hire: "POST /v1/hire",
    };
    const reqEl = $("[data-api-req]", api), stEl = $("[data-api-status]", api), msEl = $("[data-api-ms]", api), resEl = $("[data-api-res]", api);
    const composer = $("[data-api-composer]", api), methodEl = $("[data-api-method]", api), pathEl = $("[data-api-path]", api), bodyEl = $("[data-api-body]", api);
    const tabs = $$("[data-api-view]", api), copyEl = $("[data-api-copy]", api), bytesEl = $("[data-api-bytes]", api);
    const requestHistory = [];
    const views = { body: "Choose an endpoint or run a query to inspect its response.", headers: "No response yet.", request: "No request yet." };
    let requestCount = 0, view = "body", bodyIsJSON = false;

    const highlight = (json) => json.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g, (m, str, colon, bool) => {
      if (str) return colon ? `<span class="k">${esc(str)}</span>${colon}` : `<span class="s">${esc(str)}</span>`;
      return `<span class="${bool ? "b" : "n"}">${m}</span>`;
    });

    function renderView() {
      const active = tabs.find((tab) => tab.dataset.apiView === view);
      tabs.forEach((tab) => {
        tab.setAttribute("aria-selected", String(tab === active));
        tab.tabIndex = tab === active ? 0 : -1;
      });
      tabs[0].textContent = bodyIsJSON ? "JSON" : "Output";
      resEl.setAttribute("aria-labelledby", active.id);
      resEl.innerHTML = view === "body" && bodyIsJSON ? highlight(views.body) : esc(views[view]);
      resEl.scrollTop = 0;
      if (!copyEl.disabled) copyEl.textContent = "Copy " + (view === "body" ? bodyIsJSON ? "JSON" : "output" : view === "headers" ? "headers" : "request");
    }

    function resolveRequest(method, path, body) {
      let endpoint;
      const fail = (status, reason, code, message) => ({ status, reason, endpoint, payload: { error: { code, message } } });
      if (path.length > 2048 || /[\s#]/.test(path) || !/^\/v1\/[a-z]+(?:\?.*)?$/.test(path)) {
        return fail(400, "Bad Request", "invalid_path", "Use a /v1/endpoint path with URL-encoded query values. External URLs are not accepted.");
      }
      const [route, query = ""] = path.split(/\?(.*)/s);
      endpoint = Object.keys(paths).find((key) => paths[key].split(" ")[1] === route);
      if (!endpoint) return fail(404, "Not Found", "route_not_found", "Choose a route from the endpoint collection.");
      const expected = paths[endpoint].split(" ")[0];
      if (method !== expected) return { ...fail(405, "Method Not Allowed", "method_not_allowed", `Use ${expected} for ${route}.`), allow: expected };
      const params = new URLSearchParams(query);
      const allowed = method === "POST" ? [] : Array.isArray(data[endpoint]) ? ["q", "fields", "limit"] : ["fields"];
      for (const key of params.keys()) {
        if (!allowed.includes(key) || params.getAll(key).length !== 1) {
          return fail(400, "Bad Request", "invalid_query", `Unsupported or repeated parameter: ${key}. Allowed: ${allowed.join(", ") || "none"}.`);
        }
      }
      if (method === "POST") {
        let preview;
        try { preview = JSON.parse(body); } catch { return fail(400, "Bad Request", "invalid_json", "The request body must be valid JSON."); }
        if (!preview || typeof preview !== "object" || Array.isArray(preview) || body.length > 4096 || Object.keys(preview).some((key) => !["role", "message"].includes(key))) {
          return fail(400, "Bad Request", "invalid_body", "Use a JSON object with optional role and message strings. This is a preview, not a submission.");
        }
        if (Object.entries(preview).some(([key, value]) => typeof value !== "string" || value.length > (key === "role" ? 120 : 2000))) {
          return fail(400, "Bad Request", "invalid_body", "role must be a string up to 120 characters; message must be a string up to 2,000 characters.");
        }
        return { status: 200, reason: "OK", endpoint, payload: { ...data.hire, preview } };
      }
      let payload = data[endpoint];
      let fields;
      if (params.has("fields")) {
        fields = params.get("fields").split(",").map((field) => field.trim());
        const records = Array.isArray(payload) ? payload : [payload];
        if (fields.some((field) => !field || !records.some((record) => Object.hasOwn(record, field)))) {
          return fail(400, "Bad Request", "invalid_fields", "fields must be comma-separated top-level keys present in this endpoint. Missing optional keys are omitted.");
        }
      }
      if (params.has("q")) {
        const q = params.get("q");
        if (q.length > 200) return fail(400, "Bad Request", "invalid_query", "q must be 200 characters or fewer.");
        payload = payload.filter((record) => JSON.stringify(record).toLowerCase().includes(q.toLowerCase()));
      }
      if (params.has("limit")) {
        const limit = params.get("limit");
        if (!/^[1-9]\d*$/.test(limit) || Number(limit) > 100) return fail(400, "Bad Request", "invalid_limit", "limit must be a whole number from 1 to 100.");
        payload = payload.slice(0, Number(limit));
      }
      if (fields) {
        const project = (record) => Object.fromEntries(fields.filter((field) => Object.hasOwn(record, field)).map((field) => [field, record[field]]));
        payload = Array.isArray(payload) ? payload.map(project) : project(payload);
      }
      return { status: 200, reason: "OK", endpoint, payload };
    }

    function runRequest(method, path, body = bodyEl.value) {
      path = path.trim();
      methodEl.value = method;
      pathEl.value = path;
      bodyEl.value = body;
      $("[data-api-body-wrap]", api).hidden = method !== "POST";
      const started = performance.now();
      const result = resolveRequest(method, path, body);
      const requestId = "demo-" + String(++requestCount).padStart(4, "0");
      if (result.payload.error) result.payload.error.request_id = requestId;
      views.body = JSON.stringify(result.payload, null, 2);
      const bytes = new TextEncoder().encode(views.body).length;
      const elapsed = performance.now() - started;
      views.headers = [
        `HTTP/1.1 ${result.status} ${result.reason}`,
        "Content-Type: application/json; charset=utf-8",
        `Content-Length: ${bytes}`,
        "X-Portfolio-Mode: local-simulation",
        `X-Request-Id: ${requestId}`,
        ...(Array.isArray(result.payload) ? [`X-Result-Count: ${result.payload.length}`] : []),
        ...(result.allow ? [`Allow: ${result.allow}`] : []),
        ...(result.endpoint === "hire" ? ["X-Message-Sent: false"] : []),
      ].join("\n");
      views.request = [
        "# Illustrative request only; these are not live HTTP endpoints.",
        `${method} ${path}`,
        "Accept: application/json",
        ...(method === "POST" ? ["Content-Type: application/json", "", body] : []),
      ].join("\n");
      bodyIsJSON = true;
      view = "body";
      reqEl.textContent = `${method} ${path}`;
      stEl.className = "api-status" + (result.status >= 400 ? " err" : "");
      stEl.textContent = `${result.status} ${result.reason} (mock)`;
      msEl.textContent = elapsed.toFixed(2) + " ms local";
      bytesEl.textContent = bytes.toLocaleString() + " B";
      $$(".ep", api).forEach((button) => {
        const active = button.dataset.ep === result.endpoint;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      renderView();
      requestHistory.unshift({ method, path, body, status: result.status });
      requestHistory.length = Math.min(requestHistory.length, 5);
      $("[data-api-history]", api).replaceChildren(...requestHistory.map((request) => {
        const item = document.createElement("li"), button = document.createElement("button"), status = document.createElement("b"), label = document.createElement("span");
        button.type = "button";
        button.title = `Replay ${request.method} ${request.path}`;
        status.textContent = request.status;
        if (request.status >= 400) status.className = "err";
        label.textContent = `${request.method} ${request.path}`;
        button.append(status, label);
        button.addEventListener("click", () => runRequest(request.method, request.path, request.body));
        item.appendChild(button);
        return item;
      }));
    }

    function call(endpoint) {
      const [method, path] = paths[endpoint].split(" ");
      runRequest(method, path);
    }
    composer.addEventListener("submit", (e) => { e.preventDefault(); runRequest(methodEl.value, pathEl.value); });
    methodEl.addEventListener("change", () => { $("[data-api-body-wrap]", api).hidden = methodEl.value !== "POST"; });
    composer.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); composer.requestSubmit(); }
    });
    $$(".ep", api).forEach((button) => button.addEventListener("click", () => call(button.dataset.ep)));
    $$("[data-api-example]", api).forEach((button) => button.addEventListener("click", () => runRequest("GET", button.dataset.apiExample)));
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => { view = tab.dataset.apiView; renderView(); });
      tab.addEventListener("keydown", (e) => {
        let next;
        if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== undefined) { e.preventDefault(); tabs[next].focus(); tabs[next].click(); }
      });
    });
    copyEl.addEventListener("click", async () => {
      copyEl.disabled = true;
      try { await navigator.clipboard.writeText(views[view]); copyEl.textContent = "Copied"; }
      catch { copyEl.textContent = "Copy unavailable"; }
      setTimeout(() => {
        copyEl.disabled = false;
        copyEl.textContent = "Copy " + (view === "body" ? bodyIsJSON ? "JSON" : "output" : view === "headers" ? "headers" : "request");
      }, 1600);
    });
    renderView();
    const aio = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { aio.disconnect(); if (!requestCount) call("profile"); }
    }, { threshold: 0.15 });
    aio.observe(api);

    const shell = $("[data-shell]", api), input = $("input", shell);
    const history = [];
    let hIdx = 0;
    const commands = {
      help: () => [
        "PORTFOLIO SHELL / local simulation",
        "",
        "profile | experience | projects | roadmap | skills | certs | hire",
        "GET /v1/projects?q=pgvector&fields=name,impact,stack",
        "GET /v1/skills?fields=backend,databases",
        "GET /v1/certifications?limit=1",
        'POST /v1/hire {"role":"Backend Engineer"}  (preview only)',
        "",
        "q       case-insensitive search across list records",
        "fields  comma-separated top-level keys; omit absent optional keys",
        "limit   list results, 1–100; unknown parameters return 400",
        "",
        "whoami | ls | resume | github | linkedin | email | clear",
        "Arrow up/down recalls commands. Response tabs inspect the last request.",
      ].join("\n"),
      whoami: () => "pavan: backend + AI engineer. CS (AI & ML) 2026 grad. Ships evidence-led AI tooling\nand RAG pipelines, measures them, and makes them fast. Available now.",
      ls: () => "profile.json  experience.json  projects/  roadmap.json  skills.json  certs.json  resume.pdf",
      resume: () => { open(RESUME, "_blank", "noopener"); return "opening resume.pdf …"; },
      "cat resume.pdf": () => commands.resume(),
      github: () => { open("https://github.com/PavanBollepalli", "_blank", "noopener"); return "→ github.com/PavanBollepalli"; },
      linkedin: () => { open("https://linkedin.com/in/PavanBollepalli", "_blank", "noopener"); return "→ linkedin.com/in/PavanBollepalli"; },
      email: () => { location.href = "mailto:" + EMAIL; return "→ " + EMAIL; },
      contact: () => commands.email(),
      "sudo hire pavan": () => { call("hire"); return null; },
      "sudo rm -rf /": () => "nice try. permission denied: this portfolio is idempotent.",
      clear: () => "",
    };
    Object.keys(paths).forEach((key) => (commands[key] = () => { call(key); return null; }));
    commands.certifications = commands.certs;
    shell.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      history.push(raw); hIdx = history.length;
      input.value = "";
      const request = raw.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)(?:\s+([\s\S]+))?$/i);
      if (request) { runRequest(request[1].toUpperCase(), request[2], request[3] || bodyEl.value); return; }
      const cmd = raw.toLowerCase().replace(/\s+/g, " ");
      const fn = Object.hasOwn(commands, cmd) ? commands[cmd] : null;
      const out = fn ? fn() : `command not found: ${raw}\ntype "help" for a list of commands`;
      if (out === null) return;
      reqEl.textContent = "$ " + raw;
      stEl.className = "api-status" + (fn ? "" : " err");
      stEl.textContent = fn ? "exit 0" : "command not found";
      msEl.textContent = ""; bytesEl.textContent = "";
      views.body = out;
      views.headers = "Shell output has no HTTP response headers.";
      views.request = "Shell command: " + raw;
      bodyIsJSON = false; view = "body";
      renderView();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && hIdx > 0) { hIdx--; input.value = history[hIdx]; e.preventDefault(); }
      if (e.key === "ArrowDown") { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; e.preventDefault(); }
    });
  }

  /* ---------- Skills globe (CSS 3D) ---------- */
  const globe = $("#globe");
  if (globe) {
    const hot = new Set(["FastAPI", "pgvector", "RAG", "Python", "PostgreSQL", "LLMs"]);
    const tags = ["FastAPI", "Python", "pgvector", "RAG", "PostgreSQL", "LLMs", "Node.js", "Express", "REST", "Java", "SQL", "JavaScript", "MySQL", "HNSW", "Embeddings", "Llama 3.3", "Mistral", "Groq", "Gemini", "Tavily", "ChromaDB", "pypdf", "Docker", "Linux", "AWS", "GCP", "Git", "CI/CD", "Next.js", "React", "Tailwind", "Typst", "Streamlit", "Prompting"];
    const els = tags.map((t) => {
      const s = document.createElement("span");
      s.textContent = t;
      if (hot.has(t)) s.className = "hot";
      globe.appendChild(s);
      return s;
    });
    const n = tags.length;
    const pts = tags.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });
    let ax = 0.25, ay = 0, vx = 0, vy = reduced ? 0 : 0.004, dragging = false, lx = 0, ly = 0, visible = false, globeRaf = 0;
    globe.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; globe.setPointerCapture(e.pointerId); });
    globe.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      vy = (e.clientX - lx) * 0.0045; vx = (e.clientY - ly) * -0.0045;
      lx = e.clientX; ly = e.clientY;
      if (reduced) frame();
    });
    const end = () => { dragging = false; if (reduced) vx = vy = 0; };
    globe.addEventListener("pointerup", end);
    globe.addEventListener("pointercancel", end);
    new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible && !globeRaf) frame();
      if (!visible) { cancelAnimationFrame(globeRaf); globeRaf = 0; }
    }).observe(globe);
    addEventListener("resize", () => { if (reduced && visible) frame(); });

    function frame() {
      globeRaf = 0;
      if (!visible) return;
      if (!dragging) {
        vy += ((reduced ? 0 : 0.0035) - vy) * 0.02;
        vx += (0 - vx) * 0.03;
      }
      ay += vy; ax += vx;
      ax = Math.max(-1.2, Math.min(1.2, ax));
      const R = globe.clientWidth * 0.4;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      for (let i = 0; i < n; i++) {
        const [x0, y0, z0] = pts[i];
        const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx, z2 = y0 * sx + z1 * cx;
        const sc = 0.62 + (z2 + 1) * 0.28;
        const el = els[i];
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, ${z2 * R}px) scale(${sc})`;
        el.style.opacity = (0.25 + (z2 + 1) * 0.375).toFixed(3);
        el.style.zIndex = String(Math.round((z2 + 1) * 100));
      }
      if (!reduced) globeRaf = requestAnimationFrame(frame);
    }
  }

  /* ---------- Copy + back to top ---------- */
  $$("[data-copy]").forEach((b) => {
    const original = b.textContent;
    b.setAttribute("aria-live", "polite");
    b.addEventListener("click", async () => {
      b.disabled = true;
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        b.textContent = "Copied";
      } catch {
        b.textContent = "Copy unavailable";
      }
      setTimeout(() => { b.textContent = original; b.disabled = false; }, 1600);
    });
  });
  $$("[data-top]").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })));
})();
