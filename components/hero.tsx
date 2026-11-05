"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { profile } from "@/lib/content";
import { Aurora, EASE, Magnetic, Parallax, Word, useReducedMotionPreference } from "./motion";
import { MiniTerminal, SystemSculpture } from "./diagrams";

// One entrance sequence: eyebrow, headline, description, actions, then the artwork.
const BEAT = { eyebrow: 0, line1: 0.06, line2: 0.14, description: 0.24, actions: 0.32, art: 0.4, portrait: 0.46, terminal: 0.52, note: 0.62, strip: 0.5 } as const;

type EnterProps = { children: ReactNode; delay: number; className?: string; as?: "div" | "span" | "p"; y?: number };

function Enter({ children, delay, className, as = "div", y = 14 }: EnterProps) {
  const soft = useReducedMotionPreference();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: soft ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: soft ? 0.3 : 0.6, delay: soft ? 0 : delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

function useDepth(pointer: { x: MotionValue<number>; y: MotionValue<number> }, depth: number) {
  const x = useTransform(pointer.x, value => value * depth);
  const y = useTransform(pointer.y, value => value * depth * 0.6);
  return { x, y };
}

const STRIP = [
  { href: "/about#experience", dot: "dot-blue", label: "OPEN SOURCE", title: "Wikimedia Foundation", note: "Engineering contributions, reviewed and merged" },
  { href: "/work/flash-resume", dot: "dot-pink", label: "FEATURED PROJECT", title: "Flash Resume", note: "AI suggestions checked against résumé evidence" },
  { href: "/notes", dot: "dot-violet", label: "ENGINEERING NOTES", title: "How the systems work", note: "Clear explanations, with the technical details" },
] as const;

function HeroStrip() {
  return (
    <div className="hero-strip">
      {STRIP.map((item, index) => (
        <Enter key={item.href} className="strip-cell" delay={BEAT.strip + index * 0.05} y={18}>
          <Link href={item.href}>
            <span className="strip-sweep" aria-hidden="true" />
            <span className="strip-label">
              <i className={item.dot} />
              {item.label}
              <ArrowUpRight size={15} />
            </span>
            <strong>{item.title}</strong>
            <small>{item.note}</small>
          </Link>
        </Enter>
      ))}
      <Enter delay={BEAT.strip + 0.15} y={18}>
        <a href={`mailto:${profile.email}`}>
          <span className="strip-sweep" aria-hidden="true" />
          <span className="strip-label">
            <i className="dot-mint" />
            THE NEXT CHAPTER
          </span>
          <span className="strip-contact">
            Available now
            <span>
              <ArrowRight size={20} />
            </span>
          </span>
        </a>
      </Enter>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const soft = useReducedMotionPreference();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const systemScrollY = useTransform(scrollYProgress, [0, 1], [0, soft ? 0 : -54]);
  const identityY = useTransform(scrollYProgress, [0, 1], [0, soft ? 0 : -22]);
  const systemOpacity = useTransform(scrollYProgress, [0, 0.75], [1, soft ? 1 : 0.15]);
  // The copy dims as the hero leaves, so the eye is handed to the first section.
  // NOTE: `.hero-artifacts` and `.hero-copy` are transformed by the stylesheet at
  // short viewport heights, so this row does not add a Motion transform of its own.
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, soft ? 1 : 0.25]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Pointer depth: layers drift by different amounts, driven by motion values only.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointer = {
    x: useSpring(rawX, { stiffness: 90, damping: 20, mass: 0.6 }),
    y: useSpring(rawY, { stiffness: 90, damping: 20, mass: 0.6 }),
  };
  const art = useDepth(pointer, -22);
  const portrait = useDepth(pointer, 12);
  const terminal = useDepth(pointer, 20);
  const systemY = useTransform([systemScrollY, art.y], ([scroll, depth]: number[]) => scroll + depth);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (soft || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    rawY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };
  useEffect(() => {
    if (!soft) return;
    rawX.jump(0);
    rawY.jump(0);
    pointer.x.jump(0);
    pointer.y.jump(0);
  }, [soft, rawX, rawY, pointer.x, pointer.y]);

  return (
    <section className="hero" id="top" ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <Aurora />
      <div className="hero-top">
        <motion.div className="hero-copy" style={{ opacity: copyOpacity }}>
          <Enter className="hero-eyebrow-wrap" delay={BEAT.eyebrow} y={10}>
            <span className="eyebrow hero-eyebrow">
              <span className="signal" />
              BACKEND &amp; AI ENGINEER
            </span>
          </Enter>
          <h1 className="hero-title">
            <Enter as="span" className="hero-line" delay={BEAT.line1} y={18}>Better backends.</Enter>
            <Enter as="span" className="hero-line" delay={BEAT.line2} y={18}><em className="gradient-blue">More dependable AI.</em></Enter>
          </h1>
          <Enter as="p" className="hero-description" delay={BEAT.description}>
            I build the services and data systems behind AI products: helping them find useful information, give more reliable answers, and work from the first click to the final result.
          </Enter>
          <Enter className="hero-actions" delay={BEAT.actions}>
            <Magnetic strength={0.22}>
              <Link href="/work" className="button button-primary">
                See selected work <ArrowUpRight size={18} />
              </Link>
            </Magnetic>
            <a href={profile.resume} className="text-link" target="_blank" rel="noreferrer">
              Résumé <Download size={15} />
            </a>
          </Enter>
        </motion.div>

        <motion.div className="hero-system" style={{ x: art.x, y: systemY, opacity: systemOpacity }}>
          <span className="system-coordinate">FIG. 001 / THE INVISIBLE LAYER</span>
          <motion.div
            initial={soft ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: soft ? 0.3 : 0.8, delay: soft ? 0 : BEAT.art, ease: EASE }}
          >
            <SystemSculpture />
          </motion.div>
        </motion.div>
      </div>

      <div className="hero-bottom">
        <div className="hero-artifacts">
          <Enter className="artifact-slot slot-portrait" delay={BEAT.portrait} y={24}>
            <Parallax distance={26}>
              <motion.div className="portrait-artifact" style={portrait}>
                <div className="portrait-photo">
                  <Image src="/assets/avatar.jpg" alt="Pavan Bollepalli" width={640} height={640} priority sizes="(max-width: 640px) 175px, 260px" />
                </div>
                <div className="portrait-caption">
                  <span>PAVAN / IN REAL LIFE</span>
                  <ArrowUpRight size={14} />
                </div>
              </motion.div>
            </Parallax>
          </Enter>
          <Enter className="artifact-slot slot-terminal" delay={BEAT.terminal} y={24}>
            <Parallax distance={-22}>
              <motion.div className="code-artifact" style={terminal}>
                <MiniTerminal />
              </motion.div>
            </Parallax>
          </Enter>
          <motion.div
            className="artifact-note"
            initial={soft ? { opacity: 0, rotate: -10 } : { opacity: 0, rotate: -18, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -10, scale: 1 }}
            transition={{ duration: soft ? 0.3 : 0.7, delay: soft ? 0 : BEAT.note, ease: EASE }}
          >
            a human behind
            <br />
            the systems
            <svg viewBox="0 0 75 25" aria-hidden="true">
              <motion.path
                d="M70 5Q30 2 7 18m0 0 7-12m-7 12 14 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                initial={{ pathLength: soft ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: BEAT.note + 0.18, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div className="hero-identity" style={{ y: identityY }}>
          <span>Backend foundations. AI possibilities.</span>
          <div className="hero-name">
            <Word delay={0.3}>Pavan</Word>
            <br />
            <Word delay={0.36}>
              Bollepalli<span className="name-period">.</span>
            </Word>
          </div>
          <div className="identity-meta">
            GUNTUR, INDIA <span>↗</span> OPEN TO THE WORLD
          </div>
        </motion.div>
      </div>

      <HeroStrip />
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">SCROLL</span>
        <motion.span
          className="scroll-cue-track"
          aria-hidden="true"
          animate={soft ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="scroll-cue-dot"
            aria-hidden="true"
            animate={soft ? undefined : { y: [0, 14, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.span>
      </motion.div>
    </section>
  );
}
