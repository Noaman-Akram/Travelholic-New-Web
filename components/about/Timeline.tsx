"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Reveal } from "@/components/motion/Reveal";

type Item = { year: string; title: string; body: string };

export function Timeline() {
  const t = useTranslations("about.timeline");
  const items = (t.raw("items") as unknown as Item[]) ?? [];
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative bg-stone-100 py-20 lg:py-32">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-16 max-w-3xl">
          <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
            {t("title")}
          </h2>
        </Reveal>

        <div ref={ref} className="relative">
          {/* Spine */}
          <div className="absolute start-3 lg:start-1/2 top-0 bottom-0 w-px bg-navy/15" aria-hidden="true" />
          {/* Animated draw */}
          {prefersReduced ? null : (
            <motion.div
              style={{ height: lineHeight }}
              className="absolute start-3 lg:start-1/2 top-0 w-px bg-navy origin-top"
              aria-hidden="true"
            />
          )}

          <div className="space-y-12 lg:space-y-20">
            {items.map((item, i) => (
              <Reveal key={item.year}>
                <article
                  className={`relative grid grid-cols-12 gap-6 ${
                    i % 2 === 0 ? "lg:text-end" : ""
                  }`}
                >
                  {/* Dot */}
                  <span
                    className="absolute start-3 lg:start-1/2 top-2 -translate-x-1/2 rtl:translate-x-1/2 grid h-3 w-3 place-items-center rounded-full bg-butter ring-4 ring-stone-100"
                    aria-hidden="true"
                  />
                  <div
                    className={`col-span-12 ps-10 lg:ps-0 ${
                      i % 2 === 0 ? "lg:col-span-5 lg:col-start-1" : "lg:col-span-5 lg:col-start-8"
                    }`}
                  >
                    <p className="font-artistic italic text-h3-mobile lg:text-h3 text-butter leading-none">
                      {item.year}
                    </p>
                    <h3 className="mt-3 text-h4-mobile lg:text-h4 font-medium leading-tight tracking-tight-heading text-balance">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-body leading-relaxed text-navy/75 text-pretty">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
