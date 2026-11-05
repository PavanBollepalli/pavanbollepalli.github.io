"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotionPreference } from "./motion";

export type TimelineEntry = { id: string; meta: ReactNode; body: ReactNode; metric: ReactNode };

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const ref = useRef<HTMLDivElement>(null);
  const soft = useReducedMotionPreference();
  // Focus rises as the row's top travels from the lower edge of the viewport to its middle.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "start 52%"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [soft ? 1 : 0.42, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [soft ? 0 : 14, 0]);
  const lit = useTransform(scrollYProgress, [0.75, 1], [soft ? 1 : 0, 1]);
  const nodeScale = useTransform(lit, [0, 1], [0.4, 1]);

  return (
    <div ref={ref} className="experience-row timeline-row">
      <span className="timeline-node" aria-hidden="true">
        <motion.i style={{ opacity: lit, scale: nodeScale }} />
      </span>
      <motion.div style={{ opacity }}>{entry.meta}</motion.div>
      <motion.div style={{ opacity, y }}>{entry.body}</motion.div>
      <motion.div className="experience-metric" style={{ opacity }}>{entry.metric}</motion.div>
    </div>
  );
}

/** Experience list with a beam that draws down the rail as the reader scrolls. No pinning. */
export function TracingTimeline({ entries }: { entries: TimelineEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const soft = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const beam = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.001 });

  return (
    <div ref={ref} className="experience-list timeline">
      <span className="timeline-rail" aria-hidden="true">
        <motion.span className="timeline-beam" style={{ scaleY: soft ? 1 : beam }} />
      </span>
      {entries.map(entry => <TimelineRow key={entry.id} entry={entry} />)}
    </div>
  );
}
