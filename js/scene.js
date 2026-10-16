import * as THREE from "three";

const canvas = document.getElementById("webgl");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = () => innerWidth < 760;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

if (!canvas || !supportsWebGL()) {
  document.documentElement.classList.add("no-webgl");
  window.dispatchEvent(new Event("scene:ready"));
} else {
  init();
}

function init() {
  const lowPower = small() || (navigator.hardwareConcurrency || 8) <= 4;
  const N = small() ? 5200 : lowPower ? 8000 : 12000;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x030409, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030409, 0.045);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  /* ---------- Formation generators ---------- */
  const rand = mulberry32(7);
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = rand();
    while (!v) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const unit = () => {
    const z = rand() * 2 - 1, t = rand() * Math.PI * 2, r = Math.sqrt(1 - z * z);
    return [r * Math.cos(t), r * Math.sin(t), z];
  };

  function embeddingSphere() {
    const a = new Float32Array(N * 3);
    const centers = Array.from({ length: 11 }, unit);
    for (let i = 0; i < N; i++) {
      const r = rand();
      let x, y, z;
      if (r < 0.6) {
        const c = centers[(rand() * centers.length) | 0];
        x = c[0] + gauss() * 0.22; y = c[1] + gauss() * 0.22; z = c[2] + gauss() * 0.22;
        const l = Math.hypot(x, y, z) || 1, R = 2.2 + gauss() * 0.07;
        x = (x / l) * R; y = (y / l) * R; z = (z / l) * R;
      } else if (r < 0.9) {
        const u = unit(), R = 2.2 + gauss() * 0.04;
        x = u[0] * R; y = u[1] * R; z = u[2] * R;
      } else {
        const u = unit(), R = Math.cbrt(rand()) * 0.75;
        x = u[0] * R; y = u[1] * R; z = u[2] * R;
      }
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  function helix() {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const t = rand() * 2 - 1, ang = t * Math.PI * 4;
      let x, y = t * 3.4, z;
      if (rand() < 0.82) {
        const s = rand() < 0.5 ? 0 : Math.PI;
        x = Math.cos(ang + s) * 1.15; z = Math.sin(ang + s) * 1.15;
        x += gauss() * 0.07; y += gauss() * 0.07; z += gauss() * 0.07;
      } else {
        const rung = Math.round(t * 22) / 22, ra = rung * Math.PI * 4, k = rand() * 2 - 1;
        y = rung * 3.4; x = Math.cos(ra) * 1.15 * k; z = Math.sin(ra) * 1.15 * k;
      }
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  function torusKnot() {
    const a = new Float32Array(N * 3), p = 2, q = 3;
    for (let i = 0; i < N; i++) {
      const u = rand() * Math.PI * 2, r = Math.cos(q * u) + 2.1;
      const u3 = unit(), th = Math.cbrt(rand()) * 0.28;
      a.set([
        r * Math.cos(p * u) * 0.78 + u3[0] * th,
        r * Math.sin(p * u) * 0.78 + u3[1] * th,
        -Math.sin(q * u) * 0.78 + u3[2] * th,
      ], i * 3);
    }
    return a;
  }

  function hnswLayers() {
    const a = new Float32Array(N * 3);
    const layers = [ { y: -1.5, s: 3.2, w: 0.58 }, { y: 0, s: 2.4, w: 0.26 }, { y: 1.5, s: 1.5, w: 0.1 } ];
    const tilt = 0.42, ct = Math.cos(tilt), st = Math.sin(tilt);
    for (let i = 0; i < N; i++) {
      let x, y, z;
      const r = rand();
      if (r < 0.94) {
        let acc = 0, L = layers[0];
        for (const l of layers) { acc += l.w; if (r < acc) { L = l; break; } }
        const grid = L.s / 9;
        x = (rand() * 2 - 1) * L.s; z = (rand() * 2 - 1) * L.s;
        if (rand() < 0.35) { x = Math.round(x / grid) * grid; z = Math.round(z / grid) * grid; }
        y = L.y + gauss() * 0.03;
      } else {
        const g = 1.5 / 3;
        x = Math.round(((rand() * 2 - 1) * 1.5) / g) * g; z = Math.round(((rand() * 2 - 1) * 1.5) / g) * g;
        y = -1.5 + rand() * 3;
      }
      a.set([x, y * ct - z * st, y * st + z * ct], i * 3);
    }
    return a;
  }

  function wave() {
    const a = new Float32Array(N * 3), side = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < N; i++) {
      const gx = (i % side) / side, gz = Math.floor(i / side) / side;
      const x = (gx * 2 - 1) * 7, z = (gz * 2 - 1) * 4.5;
      const y = Math.sin(x * 0.7) * 0.55 + Math.cos(z * 1.1 + x * 0.35) * 0.4;
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  function orbits() {
    const a = new Float32Array(N * 3);
    const rings = [ [1.0, 0.3, 0.2], [1.5, -0.6, 0.9], [2.0, 1.1, -0.4], [2.5, 0.2, 1.6], [2.9, -1.2, -1.1] ];
    for (let i = 0; i < N; i++) {
      let p;
      if (rand() < 0.12) {
        const u = unit(), R = Math.cbrt(rand()) * 0.55;
        p = new THREE.Vector3(u[0] * R, u[1] * R, u[2] * R);
      } else {
        const [R, rx, rz] = rings[(rand() * rings.length) | 0], t = rand() * Math.PI * 2;
        p = new THREE.Vector3(Math.cos(t) * R + gauss() * 0.04, gauss() * 0.04, Math.sin(t) * R + gauss() * 0.04);
        p.applyEuler(new THREE.Euler(rx, 0, rz));
      }
      a.set([p.x, p.y, p.z], i * 3);
    }
    return a;
  }

  function geodesic() {
    const a = new Float32Array(N * 3);
    const edges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.1, 1)).attributes.position.array;
    const nE = edges.length / 6;
    for (let i = 0; i < N; i++) {
      let x, y, z;
      if (rand() < 0.8) {
        const e = ((rand() * nE) | 0) * 6, t = rand();
        x = edges[e] + (edges[e + 3] - edges[e]) * t + gauss() * 0.015;
        y = edges[e + 1] + (edges[e + 4] - edges[e + 1]) * t + gauss() * 0.015;
        z = edges[e + 2] + (edges[e + 5] - edges[e + 2]) * t + gauss() * 0.015;
      } else {
        const u = unit(), R = 3.1 + gauss() * 0.12;
        x = u[0] * R; y = u[1] * R; z = u[2] * R;
      }
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  function galaxy() {
    const a = new Float32Array(N * 3), arms = 4;
    for (let i = 0; i < N; i++) {
      const r = Math.pow(rand(), 1.6) * 5.2;
      const arm = ((i % arms) / arms) * Math.PI * 2;
      const spin = r * 1.05;
      const spread = 0.35 / (r * 0.45 + 0.35);
      const x = Math.cos(arm + spin) * r + gauss() * spread;
      const z = Math.sin(arm + spin) * r + gauss() * spread;
      const y = gauss() * 0.22 * Math.max(0.15, 1 - r / 5.2);
      a.set([x, y, z], i * 3);
    }
    return a;
  }

  const shapes = [embeddingSphere(), helix(), torusKnot(), hnswLayers(), wave(), orbits(), geodesic(), galaxy()];

  /* x is a fraction of the visible half-width at z=0, so placements adapt to aspect ratio */
  const layout = [
    { x: 0.5, y: 0.1, z: 0, s: 1, op: 1, rx: 0.15 },
    { x: 0.62, y: 0, z: -1.5, s: 1, op: 0.6, rx: 0.25 },
    { x: -0.55, y: 0, z: -2, s: 1.05, op: 0.55, rx: 0.4 },
    { x: 0, y: -0.2, z: -3, s: 1.5, op: 0.42, rx: 0 },
    { x: 0, y: -1.6, z: -1.5, s: 1.2, op: 0.65, rx: 0.15 },
    { x: 0.6, y: 0, z: -2.5, s: 1, op: 0.5, rx: 0.5 },
    { x: 0.5, y: 0, z: -1, s: 0.95, op: 0.55, rx: 0.2 },
    { x: 0, y: 0.2, z: -1.5, s: 1.25, op: 1, rx: 0.55 },
  ];

  let baked = [];
  let centers = [];
  function bake() {
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    const mobile = small();
    centers = [];
    baked = shapes.map((src, idx) => {
      const L = layout[idx];
      const s = mobile ? L.s * 0.62 : L.s;
      const ox = mobile ? 0 : L.x * halfW;
      const oy = mobile ? (idx === 0 ? 1.7 : L.y) : L.y;
      centers.push(new THREE.Vector3(ox, oy, L.z));
      const cx = Math.cos(L.rx), sx = Math.sin(L.rx);
      const out = new Float32Array(N * 3);
      for (let i = 0; i < N * 3; i += 3) {
        const x = src[i] * s, y = src[i + 1] * s, z = src[i + 2] * s;
        out[i] = x + ox;
        out[i + 1] = y * cx - z * sx + oy;
        out[i + 2] = y * sx + z * cx + L.z;
      }
      return out;
    });
  }
  bake();

  /* ---------- Particles ---------- */
  const palette = [
    [new THREE.Color("#4de8ff"), 0.4],
    [new THREE.Color("#a78bfa"), 0.34],
    [new THREE.Color("#caff4a"), 0.2],
    [new THREE.Color("#ffffff"), 0.06],
  ];
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const seed = new Float32Array(N);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const u = unit(), R = 6 + rand() * 6;
    pos.set([u[0] * R, u[1] * R, u[2] * R - 4], i * 3);
    let r = rand(), c = palette[0][0];
    for (const [pc, w] of palette) { if ((r -= w) <= 0) { c = pc; break; } }
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = rand() < 0.03 ? 2.4 + rand() * 1.2 : 0.55 + rand() * 0.9;
    seed[i] = rand();
    speed[i] = 0.55 + rand() * 0.9;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: small() ? 34 : 26 },
    uPR: { value: renderer.getPixelRatio() },
    uOpacity: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uCenter: { value: centers[0].clone() },
    uRot: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 color;
      attribute float aSize;
      attribute float aSeed;
      uniform float uTime, uSize, uPR, uRot;
      uniform vec3 uMouse, uCenter;
      varying vec3 vColor;
      varying float vTw;
      void main() {
        vec3 q = position - uCenter;
        float cr = cos(uRot), sr = sin(uRot);
        vec3 p = vec3(q.x * cr + q.z * sr, q.y, -q.x * sr + q.z * cr) + uCenter;
        float t = uTime * 0.6 + aSeed * 6.2831;
        p += 0.045 * vec3(sin(t), cos(t * 0.83 + aSeed * 9.0), sin(t * 1.21));
        vec4 world = modelMatrix * vec4(p, 1.0);
        vec3 d = world.xyz - uMouse;
        float m = smoothstep(1.4, 0.0, length(d.xy));
        world.xyz += normalize(d + 0.0001) * m * 0.45;
        vec4 mv = viewMatrix * world;
        gl_Position = projectionMatrix * mv;
        vTw = 0.65 + 0.35 * sin(uTime * 1.7 + aSeed * 50.0);
        gl_PointSize = uSize * aSize * uPR * (1.0 + m * 1.2) / -mv.z;
        vColor = mix(color, vec3(1.0), m * 0.5);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = pow(smoothstep(0.5, 0.0, d), 1.7);
        gl_FragColor = vec4(vColor, a * vTw * uOpacity);
      }`,
    fog: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ---------- Distant star dust ---------- */
  const SN = small() ? 600 : 1400;
  const sp = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const u = unit(), R = 18 + rand() * 20;
    sp.set([u[0] * R, u[1] * R, u[2] * R], i * 3);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ size: 0.06, color: 0x8f97ab, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
  scene.add(stars);

  /* ---------- Hero core: wireframe icosahedron + rings ---------- */
  const core = new THREE.Group();
  const coreLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.05, 1)),
    new THREE.LineBasicMaterial({ color: 0xcaff4a, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  const coreInner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.5, 0)),
    new THREE.LineBasicMaterial({ color: 0x4de8ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.006, 8, 200), ringMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.004, 8, 200), ringMat.clone());
  ring1.rotation.x = Math.PI / 2.4;
  ring2.rotation.set(Math.PI / 1.8, 0.4, 0);
  core.add(coreLines, coreInner, ring1, ring2);
  scene.add(core);

  /* ---------- Scroll → scene index ---------- */
  const sections = [...document.querySelectorAll("[data-scene]")];
  let current = -1;
  let opacityTarget = 1;
  function pickScene() {
    const mid = innerHeight * 0.5;
    let idx = 0;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { idx = +s.dataset.scene; break; }
      if (r.top <= mid) idx = +s.dataset.scene;
    }
    if (idx !== current) {
      current = idx;
      const L = layout[idx];
      opacityTarget = small() ? L.op * (idx === 0 || idx === 7 ? 0.75 : 0.6) : L.op;
      if (reduced) renderStatic();
    }
  }
  addEventListener("scroll", pickScene, { passive: true });

  /* ---------- Pointer ---------- */
  const mouse = new THREE.Vector2(0, 0);
  const mouseNDC = new THREE.Vector2(9, 9);
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  if (!reduced) {
    addEventListener("pointermove", (e) => {
      mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
      mouseNDC.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    }, { passive: true });
    document.addEventListener("pointerleave", () => mouseNDC.set(9, 9));
  }

  /* ---------- Resize ---------- */
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      bake();
      const keep = current;
      current = -1;
      pickScene();
      if (current === -1) current = keep;
    }, 120);
  });

  /* ---------- Loop ---------- */
  const clock = new THREE.Clock();
  let running = !document.hidden;
  let rafId = null;
  let first = true;

  function renderScene() {
    renderer.render(scene, camera);
    if (first) { first = false; window.dispatchEvent(new Event("scene:ready")); }
  }

  function renderStatic() {
    pos.set(baked[current]);
    geo.attributes.position.needsUpdate = true;
    uniforms.uOpacity.value = opacityTarget;
    uniforms.uCenter.value.copy(centers[current]);
    uniforms.uTime.value = 0;
    uniforms.uRot.value = 0;
    uniforms.uMouse.value.set(99, 99, 0);

    core.position.copy(centers[0]);
    core.scale.setScalar(small() ? 0.62 : 1);
    core.visible = current === 0;
    const co = core.visible ? 0.5 : 0;
    coreLines.material.opacity = co;
    coreInner.material.opacity = co * 1.6;
    ring1.material.opacity = co * 0.7;
    ring2.material.opacity = co * 0.5;

    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);
    renderScene();
  }

  function scheduleTick() {
    if (!reduced && running && rafId === null) rafId = requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    if (reduced) return;
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      scheduleTick();
    } else if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  function tick() {
    rafId = null;
    if (!running || reduced) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;

    const target = baked[Math.max(current, 0)];
    const k = 1 - Math.pow(1 - 0.045, dt * 60);
    for (let i = 0, j = 0; i < N; i++, j += 3) {
      const kk = Math.min(1, k * speed[i]);
      pos[j] += (target[j] - pos[j]) * kk;
      pos[j + 1] += (target[j + 1] - pos[j + 1]) * kk;
      pos[j + 2] += (target[j + 2] - pos[j + 2]) * kk;
    }
    geo.attributes.position.needsUpdate = true;

    uniforms.uOpacity.value += (opacityTarget - uniforms.uOpacity.value) * Math.min(1, dt * 2.5);

    const scrollRot = scrollY * 0.00035;
    uniforms.uCenter.value.lerp(centers[Math.max(current, 0)], Math.min(1, dt * 2.2));
    uniforms.uRot.value = t * 0.07 + scrollRot;
    stars.rotation.y = t * 0.006 + scrollRot * 0.5;
    stars.rotation.x = t * 0.003;

    core.position.copy(centers[0]);
    core.scale.setScalar(small() ? 0.62 : 1);
    core.rotation.y = t * 0.25;
    core.rotation.x = Math.sin(t * 0.3) * 0.3;
    coreInner.rotation.y = -t * 0.9;
    coreInner.rotation.z = t * 0.5;
    ring1.rotation.z = t * 0.12;
    ring2.rotation.z = -t * 0.08;
    const coreOn = current === 0 ? 1 : 0;
    const co = coreLines.material.opacity + ((coreOn * 0.5) - coreLines.material.opacity) * Math.min(1, dt * 3);
    coreLines.material.opacity = co;
    coreInner.material.opacity = co * 1.6;
    ring1.material.opacity = co * 0.7;
    ring2.material.opacity = co * 0.5;
    core.visible = co > 0.01;

    camera.position.x += (mouse.x * 0.9 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (-mouse.y * 0.6 - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);

    if (mouseNDC.x < 5) {
      ray.setFromCamera(mouseNDC, camera);
      if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit);
    } else {
      uniforms.uMouse.value.set(99, 99, 0);
    }

    renderScene();
    scheduleTick();
  }
  pickScene();
  scheduleTick();
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
