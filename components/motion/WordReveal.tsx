"use client";

import { motion, useReducedMotion } from "framer-motion";
import { wordRevealVariants, REVEAL_VIEWPORT } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/**
 * Word-by-word mask reveal for the hero headline.
 * Splits on spaces and animates each word from below the baseline.
 * No-ops when prefers-reduced-motion is set.
 */
export function WordReveal({
  text,
  className,
  as = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const prefersReduced = useReducedMotion();
  const Tag = as;
  const words = text.split(/\s+/);

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={cn(className, "leading-[1.05]")}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="relative inline-block overflow-hidden align-baseline pe-[0.25em] leading-[inherit]"
        >
          <motion.span
            className="inline-block leading-[inherit]"
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            variants={wordRevealVariants}
            custom={i}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
