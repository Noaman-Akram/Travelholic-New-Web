"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  REVEAL_VIEWPORT,
  fadeUpVariants,
  staggerParentVariants,
  fadeInVariants,
} from "@/lib/motion";
import type { ReactNode, HTMLAttributes } from "react";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "header" | "article" | "aside" | "li";
  variant?: "fade-up" | "fade" | "stagger";
  delay?: number;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">;

const variantMap: Record<string, Variants> = {
  "fade-up": fadeUpVariants,
  fade: fadeInVariants,
  stagger: staggerParentVariants,
};

/**
 * Reveal-on-scroll wrapper that no-ops when prefers-reduced-motion is set.
 * Default: fade-up. Use variant="stagger" on a parent whose children are
 * other Reveal wrappers — they'll inherit the staggered timing.
 */
export function Reveal({
  children,
  as = "div",
  variant = "fade-up",
  delay = 0,
  className,
  ...rest
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  const variants = variantMap[variant];

  if (prefersReduced) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={variants}
      transition={delay ? { delay } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
