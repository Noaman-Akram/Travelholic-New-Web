"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneMockup } from "./PhoneMockup";
import { cn } from "@/lib/utils/cn";

type Capability = { title: string; body: string };

const PHONE_SCREENS = [
  "https://picsum.photos/seed/th-app-checkin/440/880",
  "https://picsum.photos/seed/th-app-support/440/880",
  "https://picsum.photos/seed/th-app-guidebook/440/880",
];

export function TechEnabledSection() {
  const t = useTranslations("home.tech");
  const capabilities = (t.raw("capabilities") as unknown as Capability[]) ?? [];
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Light parallax on the phone column
  const phoneTranslate = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={containerRef}
      className="relative bg-navy text-stone py-24 lg:py-36 overflow-hidden"
    >
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-7">
            <Reveal as="header" className="mb-12 lg:mb-16 max-w-2xl">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-butter">
                {t("eyebrow")}
              </p>
              <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-stone/80 text-pretty">
                {t("subtitle")}
              </p>
            </Reveal>

            <div className="space-y-2 lg:space-y-4">
              {capabilities.map((cap, i) => (
                <Reveal key={cap.title} delay={i * 0.06}>
                  <article className="grid grid-cols-[auto_1fr] gap-5 lg:gap-7 py-7 border-t border-stone/15">
                    <span className="font-artistic italic text-2xl lg:text-3xl text-butter leading-none tabular-nums pt-2">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="text-h4-mobile lg:text-h4 leading-tight font-medium tracking-tight-heading">
                        {cap.title}
                      </h3>
                      <p className="mt-2 text-body leading-relaxed text-stone/75">
                        {cap.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5">
            <motion.div
              style={prefersReduced ? undefined : { y: phoneTranslate }}
              className={cn("relative h-full min-h-[600px]")}
            >
              <div className="absolute start-[12%] top-[6%] w-[55%] z-0 rotate-[-7deg]">
                <PhoneMockup screen={PHONE_SCREENS[0]!} alt="Smart check-in" />
              </div>
              <div className="absolute start-[42%] top-[26%] w-[55%] z-10 rotate-[3deg]">
                <PhoneMockup
                  screen={PHONE_SCREENS[1]!}
                  alt="In-stay support"
                />
              </div>
              <div className="absolute start-[10%] top-[58%] w-[55%] z-0 rotate-[5deg]">
                <PhoneMockup
                  screen={PHONE_SCREENS[2]!}
                  alt="Digital guidebook"
                />
              </div>
            </motion.div>
          </div>

          {/* Mobile phone strip */}
          <div className="lg:hidden col-span-12 mt-8">
            <ScrollPhones screens={PHONE_SCREENS} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollPhones({ screens }: { screens: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6"
    >
      {screens.map((src, i) => (
        <div key={src} className="snap-center shrink-0 w-[60vw] max-w-[260px]">
          <PhoneMockup screen={src} alt={`Phone ${i + 1}`} />
        </div>
      ))}
      <div className="shrink-0 w-1" aria-hidden="true" />
    </div>
  );
}
