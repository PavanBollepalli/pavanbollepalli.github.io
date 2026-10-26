"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { profile } from "@/lib/content";
import { Aurora, EASE, Magnetic, Parallax, Reveal, Spotlight, Tilt, Word } from "./motion";
import { MiniTerminal, SystemSculpture } from "./diagrams";

function HeroLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.span
      className="hero-line hero-line-animated"
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

const STRIP = [
  { href: "/about#experience", dot: "dot-blue", label: "THE EXPERIENCE", title: "Built in the open.", note: "Wikimedia · Open-source contributor" },
  { href: "/work/flash-resume", dot: "dot-pink", label: "THE LATEST", title: "Flash Resume", note: "AI proposes. Evidence decides." },
  { href: "/notes", dot: "dot-violet", label: "THE THINKING", title: "Notes from the backend", note: "Decisions, trade-offs & the details" },
] as const;

/** The cards that close the hero, staged as an accelerating staircase. */
function HeroStrip() {
  return (
    <div className="hero-strip">
      {STRIP.map((item, index) => (
        <motion.div
          key={item.href}
          className="strip-cell"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.1 + index * 0.09, ease: EASE }}
        >
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
        </motion.div>
      ))}
      <motion.a
        href={`mailto:${profile.email}`}
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, delay: 0.37, ease: EASE }}
      >
        <span className="strip-sweep" aria-hidden="true" />
        <span className="strip-label">
          <i className="dot-mint" />
          THE NEXT CHAPTER
        </span>
        <span className="strip-contact">
          Let’s build something
          <span>
            <ArrowRight size={20} />
          </span>
        </span>
      </motion.a>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  // Scroll-linked exit: the hero settles back as the page moves on, so the first
  // scroll already feels like it is doing something.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const systemY = useTransform(scrollYProgress, [0, 1], [0, -54]);
  const identityY = useTransform(scrollYProgress, [0, 1], [0, -22]);
  const systemOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);

  return (
    <section className="hero" id="top" ref={ref}>
      <Aurora />
      <Spotlight />
      <div className="hero-top">
        <div className="hero-copy">
          <Reveal className="hero-eyebrow-wrap" y={12}>
            <span className="eyebrow hero-eyebrow">
              <span className="signal" />
              BACKEND &amp; AI ENGINEER
            </span>
          </Reveal>
          <h1 className="hero-title">
            <HeroLine delay={0.08}>Intelligent systems.</HeroLine>
            <HeroLine delay={0.2}>Engineered to <em className="gradient-blue">last.</em></HeroLine>
          </h1>
          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            I build the part you don’t see: the APIs, retrieval pipelines, and foundations that make AI actually work.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.58, ease: EASE }}
          >
            <Magnetic strength={0.22}>
              <Link href="/work" className="button button-primary">
                Explore my work <ArrowUpRight size={18} />
              </Link>
            </Magnetic>
            <a href={profile.resume} className="text-link" target="_blank" rel="noreferrer">
              Résumé <Download size={15} />
            </a>
          </motion.div>
        </div>

        <motion.div className="hero-system" style={{ y: systemY, opacity: systemOpacity }}>
          <span className="system-coordinate">FIG. 001 / THE INVISIBLE LAYER</span>
          <Reveal y={16} delay={0.14}>
            <SystemSculpture />
          </Reveal>
        </motion.div>
      </div>

      <div className="hero-bottom">
        <div className="hero-artifacts">
          <Reveal className="artifact-slot slot-portrait" y={30} delay={0.2}>
            <Parallax distance={26}>
              <Tilt className="portrait-artifact">
                <div className="portrait-photo">
                  <Image src="/assets/avatar.jpg" alt="Pavan Bollepalli" width={640} height={640} priority sizes="(max-width: 640px) 175px, 260px" />
                </div>
                <div className="portrait-caption">
                  <span>PAVAN / IN REAL LIFE</span>
                  <ArrowUpRight size={14} />
                </div>
              </Tilt>
            </Parallax>
          </Reveal>
          <Reveal className="artifact-slot slot-terminal" y={30} delay={0.3}>
            <Parallax distance={-22}>
              <Tilt className="code-artifact">
                <MiniTerminal />
              </Tilt>
            </Parallax>
          </Reveal>
          <motion.div
            className="artifact-note"
            initial={{ opacity: 0, rotate: -18, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: -10, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
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
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.9, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div className="hero-identity" style={{ y: identityY }}>
          <span>Backend foundations. AI possibilities.</span>
          <div className="hero-name">
            <Word delay={0.24}>Pavan</Word>
            <br />
            <Word delay={0.3}>
              Bollepalli<span className="name-period">.</span>
            </Word>
          </div>
          <div className="identity-meta">
            GUNTUR, INDIA <span>↗</span> OPEN TO THE WORLD
          </div>
        </motion.div>
      </div>

      <HeroStrip />
    </section>
  );
}
