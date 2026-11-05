"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useReducedMotionPreference } from "./motion";

/**
 * Lenis smooth scrolling, forked from native only when the visitor allows it:
 * no reduced-motion, no touch device. Anchor jumps stay native underneath,
 * Lenis just eases them via its own scrollTo when links are clicked.
 */
export function SmoothScroll() {
  const soft = useReducedMotionPreference();

  useEffect(() => {
    if (soft) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const lenis = new Lenis({
      lerp: 0.095,
      wheelMultiplier: 1,
      syncTouch: false,
      anchors: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [soft]);

  return null;
}
