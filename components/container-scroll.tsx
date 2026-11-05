"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotionPreference } from "./motion";

/** A device frame that tips back and settles flat as it scrolls into the reading position. */
export function ContainerScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const soft = useReducedMotionPreference();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 58%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.001 });
  const rotateX = useTransform(progress, [0, 1], [soft ? 0 : 24, 0]);
  const scale = useTransform(progress, [0, 1], [soft ? 1 : 0.9, 1]);
  const y = useTransform(progress, [0, 1], [soft ? 0 : 36, 0]);
  const shade = useTransform(progress, [0, 1], [soft ? 0 : 0.55, 0]);

  return (
    <div ref={ref} className="container-scroll">
      <motion.div className="container-scroll-frame" style={{ rotateX, scale, y, transformPerspective: 1300 }}>
        {children}
        <motion.span className="container-scroll-shade" style={{ opacity: shade }} aria-hidden="true" />
      </motion.div>
    </div>
  );
}
