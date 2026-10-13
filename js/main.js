(function () {
  "use strict";

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
      ["$ uvicorn portfolio.main:app --workers 4", ""],
      ["connecting postgres://pgvector … ", "ok"],
      ["loading HNSW index (1024-d) … ", "ok"],
      ["warming in-memory cache … ", "ok"],
      ["compiling GLSL shaders … ", "ok"],
      ["Application startup complete.", ""],
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
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
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
        scale: 1, end: 0.48, note: "warm path · real time",
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
        await sleep(((at - prev) / s.scale) * 1000 * (mode === "warm" || mode === "dupe" ? 2.2 : 1));
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
      $$(".seg-btn", rag).forEach((x) => x.classList.toggle("is-active", x === b));
      run(b.dataset.mode);
    }));

    const rio = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { rio.disconnect(); run("warm"); }
    }, { threshold: 0.5 });
    rio.observe(rag);
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
        { name: "SkillVector", type: "AI career intelligence", impact: "RAG latency 9.6s → 0.48s (−95%)", stack: ["FastAPI", "pgvector", "Llama 3.3 70B", "Next.js 16"], live: "https://skill-vector-kyzv.vercel.app" },
        { name: "Flash Resume", type: "local-first AI CLI + Chrome ext", impact: "3 min → <10s per application, ~80% fewer tokens", stack: ["Python", "FastAPI", "Typst", "GitHub Actions"], pypi: "https://pypi.org/project/flash-resume/" },
        { name: "CodeAtlas", type: "codebase RAG", impact: "AST-aware chunking with tree-sitter + streamed answers", stack: ["FastAPI", "ChromaDB", "Mistral"], repo: "https://github.com/PavanBollepalli/CodeAtlas" },
      ],
      roadmap: {
        disclaimer: "Planned concepts, not shipped claims. Scope may change after user discovery.",
        next: { name: "Retrieval Eval Lab", focus: "RAG evaluation infrastructure", targets: ["Recall@K + MRR", "faithfulness", "latency traces", "CI experiment reports"] },
        queue: [
          { name: "Guardrail Runtime", focus: "reliable tool-using agents", stage: "architecture" },
          { name: "Context Mesh", focus: "multimodal retrieval with citations", stage: "research" },
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
        status: 201, message: "Interview request created. Thanks for reaching out!",
        next_step: `mailto:${EMAIL}`,
        linkedin: "https://linkedin.com/in/PavanBollepalli",
        github: "https://github.com/PavanBollepalli",
        resume: "/" + RESUME,
        response_time: "fast",
      },
    };
    const paths = {
      profile: "GET /v1/profile", experience: "GET /v1/experience", projects: "GET /v1/projects?sort=impact",
      roadmap: "GET /v1/roadmap", skills: "GET /v1/skills", certs: "GET /v1/certifications", hire: "POST /v1/hire",
    };
    const reqEl = $("[data-api-req]", api), stEl = $("[data-api-status]", api), msEl = $("[data-api-ms]", api), resEl = $("[data-api-res]", api);
    let apiRun = 0;

    const highlight = (json) => json.replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g, (m, str, colon, bool) => {
      if (str) return colon ? `<span class="k">${esc(str)}</span>${colon}` : `<span class="s">${esc(str)}</span>`;
      return `<span class="${bool ? "b" : "n"}">${m}</span>`;
    });

    async function renderLines(html, id) {
      const lines = html.split("\n");
      resEl.innerHTML = "";
      const step = Math.max(1, Math.ceil(lines.length / 24));
      for (let i = 0; i < lines.length; i += step) {
        if (id !== apiRun) return;
        resEl.innerHTML += lines.slice(i, i + step).join("\n") + (i + step < lines.length ? "\n" : "");
        if (!reduced) await sleep(16);
      }
    }

    async function call(ep) {
      const id = ++apiRun;
      $$(".ep", api).forEach((b) => b.classList.toggle("is-active", b.dataset.ep === ep));
      reqEl.textContent = paths[ep];
      stEl.className = "api-status";
      stEl.textContent = "…";
      msEl.textContent = "";
      resEl.innerHTML = '<span class="c">// awaiting response…</span>';
      const ms = 8 + Math.round(Math.random() * 24);
      await sleep(reduced ? 0 : 160 + ms * 4);
      if (id !== apiRun) return;
      const created = ep === "hire";
      stEl.textContent = created ? "201 Created" : "200 OK";
      if (created) stEl.classList.add("created");
      msEl.textContent = ms + " ms";
      await renderLines(highlight(JSON.stringify(data[ep], null, 2)), id);
    }

    $$(".ep", api).forEach((b) => b.addEventListener("click", () => call(b.dataset.ep)));

    const aio = new IntersectionObserver((e) => {
      if (e[0].isIntersecting) { aio.disconnect(); call("profile"); }
    }, { threshold: 0.3 });
    aio.observe(api);

    const shell = $("[data-shell]", api), input = $("input", shell);
    const history = [];
    let hIdx = 0;
    const text = (s) => `<span class="c">${esc(s)}</span>`;
    const commands = {
      help: () => text([
        "available commands:",
        "  whoami        short bio",
        "  profile | experience | projects | roadmap | skills | certs   call an endpoint",
        "  hire          POST /v1/hire",
        "  resume        open résumé PDF",
        "  github | linkedin | email",
        "  clear",
      ].join("\n")),
      whoami: () => text("pavan: backend + AI engineer. CS (AI & ML) 2026 grad. Ships RAG pipelines and FastAPI\nservices, measures them, and makes them fast. Available now."),
      ls: () => text("profile.json  experience.json  projects/  skills.json  certs.json  resume.pdf"),
      resume: () => { open(RESUME, "_blank", "noopener"); return text("opening resume.pdf …"); },
      "cat resume.pdf": () => commands.resume(),
      github: () => { open("https://github.com/PavanBollepalli", "_blank", "noopener"); return text("→ github.com/PavanBollepalli"); },
      linkedin: () => { open("https://linkedin.com/in/PavanBollepalli", "_blank", "noopener"); return text("→ linkedin.com/in/PavanBollepalli"); },
      email: () => { location.href = "mailto:" + EMAIL; return text("→ " + EMAIL); },
      contact: () => commands.email(),
      "sudo hire pavan": () => { call("hire"); return null; },
      "sudo rm -rf /": () => text("nice try. permission denied: this portfolio is idempotent."),
      clear: () => "",
    };
    ["profile", "experience", "projects", "roadmap", "skills", "certs", "hire"].forEach((k) => (commands[k] = () => { call(k); return null; }));
    commands.certifications = commands.certs;

    shell.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      history.push(raw); hIdx = history.length;
      input.value = "";
      let cmd = raw.toLowerCase().replace(/\s+/g, " ");
      const m = cmd.match(/^(get|post)\s+\/?(?:v1\/)?([a-z]+)/);
      if (m) cmd = m[2] === "certifications" ? "certs" : m[2];
      const fn = commands[cmd];
      if (fn) {
        const out = fn();
        if (out !== null) {
          apiRun++;
          reqEl.textContent = "$ " + raw;
          stEl.className = "api-status"; stEl.textContent = "exit 0"; msEl.textContent = "";
          resEl.innerHTML = out;
        }
      } else {
        apiRun++;
        reqEl.textContent = "$ " + raw;
        stEl.className = "api-status err"; stEl.textContent = "404";
        msEl.textContent = "";
        resEl.innerHTML = text(`command not found: ${raw}\ntype "help" for a list of commands`);
      }
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
    const tags = ["FastAPI", "Python", "pgvector", "RAG", "PostgreSQL", "LLMs", "Node.js", "Express", "REST", "Java", "SQL", "JavaScript", "MySQL", "HNSW", "Embeddings", "Llama 3.3", "Mistral", "Groq", "Gemini", "Tavily", "ChromaDB", "tree-sitter", "Docker", "Linux", "AWS", "GCP", "Git", "CI/CD", "Next.js", "React", "Tailwind", "Typst", "Streamlit", "Prompting"];
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
    let ax = 0.25, ay = 0, vx = 0, vy = reduced ? 0 : 0.004, dragging = false, lx = 0, ly = 0, visible = false;
    globe.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; globe.setPointerCapture(e.pointerId); });
    globe.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      vy = (e.clientX - lx) * 0.0045; vx = (e.clientY - ly) * -0.0045;
      lx = e.clientX; ly = e.clientY;
    });
    const end = () => { dragging = false; };
    globe.addEventListener("pointerup", end);
    globe.addEventListener("pointercancel", end);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) frame(); }).observe(globe);

    function frame() {
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
      requestAnimationFrame(frame);
    }
  }

  /* ---------- Copy + back to top ---------- */
  $$("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
      const o = b.textContent;
      b.textContent = "Copied ✓";
      setTimeout(() => (b.textContent = o), 1600);
    } catch { location.href = "mailto:" + b.dataset.copy; }
  }));
  $$("[data-top]").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })));
})();
