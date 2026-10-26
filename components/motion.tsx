"use client";

import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ motion prefs */

function subscribeMotionPreference(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

const getMotionPreference = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// The server has no opinion; assuming "reduce" here would strand every animation in its hidden state.
const getServerMotionPreference = () => false;

/**
 * True when the visitor's OS asks for reduced motion.
 *
 * This softens travel distances — it never switches the site's motion off. Reducing
 * opacity, scale and short slides is the intent of the setting; deleting the interface's
 * entire sense of life is not.
 */
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribeMotionPreference, getMotionPreference, getServerMotionPreference);
}

export function MotionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      root.dataset.motion = query.matches ? "soft" : "full";
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return <>{children}</>;
}

/** Expo-out. The house curve — fast commit, long glide. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ reveal */

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
  blur = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
}) {
  const soft = useReducedMotionPreference();
  const travel = soft ? y * 0.35 : y;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: travel, filter: blur ? "blur(9px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word masked reveal for headline type. Each word climbs out of its own
 * clipping box, so the line assembles rather than fading in as a block.
 */
export function Words({
  text,
  className = "",
  delay = 0,
  stagger = 0.06,
  duration = 0.95,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
}) {
  const soft = useReducedMotionPreference();
  const words = text.split(" ");
  return (
    <span className={`words ${className}`}>
      {words.map((word, index) => (
        <span className="word" key={`${word}-${index}`}>
          <motion.span
            className="word-inner"
            initial={{ y: "115%", rotate: soft ? 0 : 4, opacity: 0 }}
            whileInView={{ y: "0%", rotate: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: soft ? 0.5 : duration, delay: delay + index * (soft ? stagger * 0.5 : stagger), ease: EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** One animated word inside hand-written headline markup. */
export function Word({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const soft = useReducedMotionPreference();
  return (
    <span className={`word ${className}`}>
      <motion.span
        className="word-inner"
        initial={{ y: "115%", rotate: soft ? 0 : 4, opacity: 0 }}
        whileInView={{ y: "0%", rotate: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: soft ? 0.5 : 0.95, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ pointer toys */

/** Wraps children in a field that pulls them gently toward the cursor. */
export function Magnetic({
  children,
  className = "",
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const soft = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.5 });
  const pull = soft ? strength * 0.4 : strength;

  function track(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    x.set((event.clientX - bounds.left - bounds.width / 2) * pull);
    y.set((event.clientY - bounds.top - bounds.height / 2) * pull);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, display: "inline-flex" }}
      onPointerMove={track}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** A soft light that follows the pointer across its section. Purely decorative. */
export function Spotlight({ className = "", size = 620 }: { className?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const [live, setLive] = useState(false);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, var(--glow), transparent 68%)`;

  return (
    <motion.div
      ref={ref}
      className={`spotlight ${className}`}
      aria-hidden="true"
      style={{ backgroundImage: background, opacity: live ? 1 : 0 }}
      onPointerMove={event => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        x.set(event.clientX - bounds.left);
        y.set(event.clientY - bounds.top);
        if (!live) setLive(true);
      }}
      onPointerLeave={() => setLive(false)}
    />
  );
}

/** Scroll-linked vertical drift. Positive distance moves against the scroll. */
export function Parallax({ children, distance = 60, className = "" }: { children: ReactNode; distance?: number; className?: string }) {
  const soft = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const travel = soft ? distance * 0.3 : distance;
  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel]);
  const smooth = useSpring(y, { stiffness: 110, damping: 26, mass: 0.4 });
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: smooth }}>{children}</motion.div>
    </div>
  );
}

/** Counts a number up the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = "", className = "" }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const duration = 1100;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Same expo-out as the rest of the site, so the numbers land together with the copy.
      setShown(value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} className={className}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ surfaces */

export function Tilt({ children, className = "", glare = false }: { children: ReactNode; className?: string; glare?: boolean }) {
  const soft = useReducedMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const tilt = soft ? 3 : 7;

  return (
    <div
      className={`tilt ${className}`}
      ref={ref}
      onPointerMove={event => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        const px = (event.clientX - bounds.left) / bounds.width;
        const py = (event.clientY - bounds.top) / bounds.height;
        ref.current.style.setProperty("--rx", `${-(py - 0.5) * tilt}deg`);
        ref.current.style.setProperty("--ry", `${(px - 0.5) * tilt}deg`);
        ref.current.style.setProperty("--gx", `${px * 100}%`);
        ref.current.style.setProperty("--gy", `${py * 100}%`);
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
      }}
    >
      {children}
      {glare && <span className="tilt-glare" aria-hidden="true" />}
    </div>
  );
}

/** Thin bar across the top of the viewport that tracks reading progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

/** Decorative layer of drifting light, used behind the hero and the contact block. */
export function Aurora({ className = "" }: { className?: string }) {
  const soft = useReducedMotionPreference();
  return (
    <div className={`aurora ${className}`} aria-hidden="true" data-soft={soft ? "true" : "false"}>
      <span className="aurora-blob blob-one" />
      <span className="aurora-blob blob-two" />
      <span className="aurora-blob blob-three" />
      <span className="aurora-grid" />
    </div>
  );
}

export type { MotionValue, CSSProperties };
