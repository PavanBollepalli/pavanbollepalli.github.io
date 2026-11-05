"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, useReducedMotionPreference } from "./motion";

/**
 * A short settle on arrival for each route. Keyed by pathname so the new page
 * re-enters rather than the shell re-mounting.
 *
 * Deliberately opacity-only: any transform on this wrapper would move every
 * section's bounding box for the length of the animation, which the hero's
 * viewport-fit test (and scroll anchors) would read as a layout shift.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const soft = useReducedMotionPreference();

  return (
    <motion.div
      key={pathname}
      className="page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: soft ? 0.25 : 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
