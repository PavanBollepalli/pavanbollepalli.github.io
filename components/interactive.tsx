"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Monogram } from "./shell";
import { useReducedMotionPreference } from "./motion";

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

const touchOnly = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export function DiscoverLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const motionAllowed = !useReducedMotionPreference();
  const pathId = `discover-path-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [tracking, setTracking] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 420, damping: 34, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 420, damping: 34, mass: 0.6 });
  const cssX = useTransform(springX, value => `${value}px`);
  const cssY = useTransform(springY, value => `${value}px`);

  function followPointer(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse" || event.currentTarget.matches(":focus-visible")) {
      setTracking(false);
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = Math.max(55, Math.min(bounds.width - 55, event.clientX - bounds.left));
    const nextY = Math.max(55, Math.min(bounds.height - 55, event.clientY - bounds.top));
    x.set(nextX);
    y.set(nextY);
    if (!tracking) {
      springX.jump(nextX);
      springY.jump(nextY);
      setTracking(true);
    }
  }

  const cursorStyle = {
    "--discover-x": cssX,
    "--discover-y": cssY,
    pointerEvents: "none",
  } as MotionStyle;

  return (
    <Link
      href={href}
      aria-label={label}
      className="project-art-link discover-link"
      data-discover-active={tracking ? "true" : "false"}
      onPointerEnter={followPointer}
      onPointerMove={followPointer}
      onPointerLeave={() => setTracking(false)}
      onPointerCancel={() => setTracking(false)}
      onPointerDown={event => { if (event.pointerType !== "mouse") setTracking(false); }}
      onFocus={() => setTracking(false)}
      onBlur={() => setTracking(false)}
    >
      {children}
      <motion.span className="discover-cursor" aria-hidden="true" style={cursorStyle}>
        <motion.svg
          className="discover-ring"
          viewBox="0 0 120 120"
          fill="none"
          focusable="false"
          initial={false}
          animate={{ rotate: motionAllowed && tracking ? [0, 30, 0] : 0 }}
          transition={{ duration: motionAllowed ? 1.4 : 0, ease: "easeInOut" }}
        >
          <defs>
            <path id={pathId} d="M17 60a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
          </defs>
          <text fill="currentColor" fontSize="10" letterSpacing="2">
            <textPath href={`#${pathId}`} textLength="268" lengthAdjust="spacing">
              DISCOVER · VIEW THE BUILD ·
            </textPath>
          </text>
        </motion.svg>
        <Eye className="discover-eye" size={23} strokeWidth={1.5} aria-hidden="true" />
      </motion.span>
    </Link>
  );
}

const staffRings = [
  { y: 124, width: 15 }, { y: 164, width: 13 }, { y: 208, width: 10 },
  { y: 252, width: 9 }, { y: 296, width: 11 }, { y: 340, width: 13 },
  { y: 384, width: 11 }, { y: 428, width: 8 }, { y: 472, width: 7 },
  { y: 516, width: 5 }, { y: 554, width: 3 },
];

const STAFF_WIDTH = 60;

/**
 * The engineering staff that sweeps across the ID card.
 *
 * The card has three states and one gesture: sweep the staff over it and it opens.
 * Sweep again and it turns over. Pull the staff away and the gesture re-arms, so the
 * card keeps answering as long as someone keeps running the staff across it.
 */
export function LanyardScene() {
  const reducedMotion = useReducedMotionPreference();
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [back, setBack] = useState(false);
  const [scanning, setScanning] = useState(false);
  const cardId = `pavan-card-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const noteId = `${cardId}-note`;

  const staffLeft = useMotionValue(-STAFF_WIDTH);
  const staffSpring = useSpring(staffLeft, { stiffness: 320, damping: 30, mass: 0.5 });
  const rotation = useMotionValue(-4);
  const rotateSpring = useSpring(rotation, { stiffness: 130, damping: 20 });
  const charge = useMotionValue(0);
  const chargeSpring = useSpring(charge, { stiffness: 220, damping: 26 });
  const glow = useTransform(chargeSpring, value => `drop-shadow(0 0 ${(value * 12).toFixed(1)}px var(--blue))`);
  const beamOpacity = useTransform(chargeSpring, [0, 1], [0.12, 0.75]);

  const armed = useRef(true);
  const lastAdvance = useRef(0);
  const scanTimer = useRef<number | null>(null);
  const intro = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      rotation.set(0);
      return;
    }
    intro.current = animate(rotation, [-4, -9, 2, -4], { duration: 1.9, ease: "easeInOut" });
    return () => {
      intro.current?.stop();
      intro.current = null;
    };
  }, [reducedMotion, rotation]);

  useEffect(() => () => { if (scanTimer.current) window.clearTimeout(scanTimer.current); }, []);

  /** One gesture, one step: sealed → opened → turned over → turned back. */
  function advance() {
    const now = performance.now();
    if (now - lastAdvance.current < 850) return;
    lastAdvance.current = now;

    intro.current?.stop();
    intro.current = null;
    setScanning(true);
    if (scanTimer.current) window.clearTimeout(scanTimer.current);
    scanTimer.current = window.setTimeout(() => setScanning(false), 780);

    if (!revealed) setRevealed(true);
    else setBack(value => !value);
  }

  function track(event: PointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene) return;
    intro.current?.stop();
    intro.current = null;
    const bounds = scene.getBoundingClientRect();
    const pointerX = event.clientX - bounds.left;
    const next = Math.max(-STAFF_WIDTH * 0.4, Math.min(bounds.width - STAFF_WIDTH * 0.6, pointerX - STAFF_WIDTH / 2));
    staffLeft.set(next);

    const card = cardRef.current;
    if (!card) return;
    const cardBox = card.getBoundingClientRect();
    const centre = next + STAFF_WIDTH / 2;
    const nearX = centre > cardBox.left - bounds.left - 26 && centre < cardBox.right - bounds.left + 26;
    const nearY = event.clientY > cardBox.top - 90 && event.clientY < cardBox.bottom + 90;
    const over = nearX && nearY;
    const awayEnough = centre < cardBox.left - bounds.left - 110 || centre > cardBox.right - bounds.left + 110;

    charge.set(over ? 1 : 0);

    if (over && armed.current) {
      armed.current = false;
      advance();
    } else if (awayEnough || !nearY) {
      armed.current = true;
    }

    rotation.set(-4 + clamp((pointerX - bounds.width / 2) / Math.max(bounds.width, 1) * 12, 5));
  }

  function rest() {
    rotation.set(reducedMotion ? 0 : -4);
    charge.set(0);
    armed.current = true;
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (!revealed) setRevealed(true);
    else setBack(value => !value);
  }

  return (
    <div className="lanyard-scene" ref={sceneRef} onPointerMove={track} onPointerLeave={rest} data-scanning={scanning ? "true" : "false"} data-reduced-motion={reducedMotion ? "true" : "false"}>
      <motion.svg
        className="engineering-staff"
        viewBox="0 0 80 600"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        aria-hidden="true"
        focusable="false"
        style={{ x: staffSpring, filter: glow, pointerEvents: "none" }}
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.g
          animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M40 12C20 15 8 31 12 53C14 73 31 80 28 102C24 127 23 155 29 190C36 227 26 264 27 302C28 338 22 365 29 405C35 444 32 499 37 554L40 586L43 554C48 499 45 444 51 405C58 365 52 338 53 302C54 264 44 227 51 190C57 155 56 127 52 102C49 80 66 73 68 53C72 31 60 15 40 12Z" />
          <path d="M40 12L20 33L12 53L28 69L40 79L52 69L68 53L60 33Z M20 33L60 33L28 69L52 69L20 33 M12 53H68 M40 12V79" />
          <ellipse cx="40" cy="47" rx="21" ry="30" />
          <path d="M28 102Q40 112 52 102 M40 79V586 M34 104C42 174 32 238 36 302S32 423 39 566 M46 104C38 174 48 238 44 302S48 423 41 566 M25 137L51 190L31 252L53 302L29 384L48 428L35 516L43 554 M55 137L29 190L49 252L27 302L51 384L32 428L45 516L37 554" />
          {staffRings.map(ring => <ellipse key={ring.y} cx="40" cy={ring.y} rx={ring.width} ry="4" />)}
          {[33, 79, 124, 208, 296, 384, 472, 554].map(node => <circle key={node} cx="40" cy={node} r="2.5" />)}
        </motion.g>
        {/* The business end: the field that reads the card as it passes. */}
        <motion.g className="staff-eye" style={{ opacity: beamOpacity }}>
          <ellipse cx="40" cy="150" rx="17" ry="24" stroke="var(--blue)" />
          <circle cx="40" cy="150" r="6" fill="var(--blue)" stroke="none" />
          <path d="M40 118V96 M40 182V204" stroke="var(--blue)" strokeDasharray="3 5" />
        </motion.g>
      </motion.svg>

      <motion.div className="lanyard-rig" style={{ rotate: reducedMotion ? 0 : rotateSpring }}>
        <div className="lanyard-strap">PB / ENGINEER / BUILDER</div>
        <button
          id={cardId}
          type="button"
          ref={cardRef}
          className="id-card"
          aria-label={revealed ? "Turn Pavan’s ID card over" : "Open Pavan’s ID card"}
          aria-pressed={back}
          aria-describedby={noteId}
          data-side={back ? "back" : "front"}
          data-revealed={revealed ? "true" : "false"}
          onPointerEnter={event => { if (event.pointerType === "mouse") advance(); }}
          onKeyDown={onKey}
          onClick={event => {
            // detail === 0 means the click came from the keyboard, which onKeyDown
            // already handled. Mouse pointers advanced on enter. Touch is the only
            // input left that needs the tap to do the work.
            if (event.detail === 0) return;
            if (touchOnly()) advance();
          }}
        >
          <motion.span
            className="id-flipper"
            initial={false}
            animate={{ rotateY: back ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", display: "block", transformStyle: "preserve-3d" }}
          >
            <span className="id-face id-front" aria-hidden={back} style={{ display: "block", backfaceVisibility: "hidden" }}>
              <span className="id-card-top"><Monogram /><span>BUILDER ACCESS</span></span>
              <span className="id-photo">
                <Image src="/assets/avatar.jpg" width={640} height={640} alt="Portrait of Pavan" loading="lazy" sizes="260px" draggable={false} />
                <span className="id-photo-veil" aria-hidden="true" />
                <motion.span
                  className="id-scanline"
                  aria-hidden="true"
                  initial={false}
                  animate={{ y: scanning ? ["-10%", "110%"] : "-10%", opacity: scanning ? [0, 1, 0] : 0 }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                />
              </span>
              <strong className="id-name">Pavan Bollepalli</strong>
              <span className="id-role">BACKEND &amp; AI ENGINEER</span>
              <span className="id-redact" aria-hidden="true">
                <i style={{ width: "62%" }} />
                <i style={{ width: "88%" }} />
                <i style={{ width: "44%" }} />
              </span>
              <span className="id-barcode" aria-hidden="true" />
              <small>GUNTUR, IN · OPEN TO WHAT’S NEXT</small>
              <span className="id-seal" aria-hidden="true">
                <Eye size={15} />
                <span>RUN THE STAFF ACROSS TO OPEN</span>
              </span>
            </span>
            <span
              className="id-face id-back"
              aria-hidden={!back}
              style={{ position: "absolute", inset: 0, display: "block", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="id-card-top"><Monogram /><span>ENGINEER / BUILDER</span></span>
              <span className="id-back-brand"><Monogram /></span>
              <strong>Built with intention.</strong>
              <span className="id-back-principles"><span>RETRIEVAL</span><span>RELIABILITY</span><span>EVIDENCE</span></span>
              <span className="id-barcode" aria-hidden="true" />
              <small>PAVAN BOLLEPALLI · GUNTUR, INDIA</small>
            </span>
          </motion.span>
          <motion.span
            className="id-flash"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: scanning ? 0.5 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </button>
      </motion.div>

      <span className="lanyard-note" id={noteId}>
        Run the staff across the card.
      </span>
    </div>
  );
}

const contactParticles = Array.from({ length: 120 }, (_, index) => {
  const row = index % 20;
  const column = Math.floor(index / 20) % 3;
  const curve = 6 + Math.sin(row / 4) * 4 + column * 1.3;
  return { left: index < 60 ? curve : 100 - curve, top: 30 + row * 2.5, size: 3 + index % 3, color: ["var(--blue)", "var(--violet)", "var(--mint)", "var(--pink)"][index % 4], drift: index % 2 ? 5 : -5 };
});

export function ContactScene() {
  return (
    <div className="contact-scene" aria-hidden="true" style={{ pointerEvents: "none" }}>
      <div className="contact-particles">
        {contactParticles.map((particle, index) => (
          <motion.span
            key={`${particle.left}-${particle.top}`}
            className="contact-particle contact-dot"
            style={{ left: `${particle.left}%`, top: `${particle.top}%`, width: particle.size, height: particle.size, backgroundColor: particle.color }}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: [0.35, 0.8, 0.35], scale: 1, x: [0, particle.drift, 0], y: [0, -8, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 2.6, delay: (index % 12) * 0.05, ease: "easeInOut" }}
          />
        ))}
      </div>
      <motion.div
        className="contact-emblem"
        initial={{ opacity: 0, scale: 0.86 }}
        whileInView={{ opacity: 1, scale: 1, y: [0, -6, 0], rotate: [0, 2, 0] }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 2.8, ease: "easeInOut" }}
      >
        <svg className="contact-wings" viewBox="0 0 400 200" fill="none" stroke="currentColor" strokeWidth="1" focusable="false">
          <ellipse cx="200" cy="100" rx="132" ry="53" transform="rotate(-18 200 100)" />
          <ellipse cx="200" cy="100" rx="132" ry="53" transform="rotate(18 200 100)" />
          <circle cx="200" cy="100" r="43" />
          <circle cx="200" cy="100" r="53" strokeDasharray="2 9" />
          <path d="M155 94C126 57 89 48 26 58C60 75 89 86 137 104 M150 113C111 93 73 93 39 101C68 119 97 128 139 124 M154 132C120 124 91 128 68 141C99 148 125 148 158 142 M245 94C274 57 311 48 374 58C340 75 311 86 263 104 M250 113C289 93 327 93 361 101C332 119 303 128 261 124 M246 132C280 124 309 128 332 141C301 148 275 148 242 142" />
          <circle cx="72" cy="62" r="3" />
          <circle cx="328" cy="138" r="3" />
          <path d="M200 26V37 M194.5 31.5H205.5 M200 163V174 M194.5 168.5H205.5" />
        </svg>
        <span className="contact-monogram"><Monogram /></span>
      </motion.div>
    </div>
  );
}
