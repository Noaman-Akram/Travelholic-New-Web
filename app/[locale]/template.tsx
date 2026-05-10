"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Per-page template wrapper. In the Next 15 App Router, a `template.tsx`
 * re-mounts on every route change (unlike `layout.tsx`, which persists),
 * so we get a fresh enter animation on navigation.
 *
 * Combined with `<ViewTransitions>` in the locale layout, cross-page
 * element morphing (e.g. a thumbnail morphing into a hero) is handled
 * by the browser-native View Transitions API, while this template
 * handles the global fade/slide of the rest of the page.
 *
 * Respects prefers-reduced-motion via Tailwind's `motion-reduce:` and
 * framer-motion's automatic reduction.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="motion-reduce:transition-none motion-reduce:transform-none"
    >
      {children}
    </motion.div>
  );
}
