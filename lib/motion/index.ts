"use client";

import type { Variants } from "framer-motion";

export const easeOutExpo = [0.22, 1, 0.36, 1] as const;
export const easeInOutExpo = [0.87, 0, 0.13, 1] as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const staggerParentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const wordRevealVariants: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: easeOutExpo,
      delay: 0.1 + i * 0.06,
    },
  }),
};

export const REVEAL_VIEWPORT = { once: true, margin: "-15%" } as const;
