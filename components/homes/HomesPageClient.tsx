"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { HomesFilters } from "./HomesFilters";
import { HomesTopBar } from "./HomesTopBar";
import { HomesGrid } from "./HomesGrid";
import { useHomesFilters } from "./useHomesFilters";

const HomesMap = dynamic(() => import("./HomesMap").then((m) => m.HomesMap), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-3xl bg-stone-200 animate-pulse" />
  ),
});

export function HomesPageClient() {
  return (
    <Suspense fallback={null}>
      <HomesPageBody />
    </Suspense>
  );
}

function HomesPageBody() {
  const t = useTranslations("homes");
  const { view, results } = useHomesFilters();

  return (
    <>
      <section className="bg-stone pt-12 lg:pt-20 pb-10">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
          <Reveal as="header" className="max-w-3xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-6 text-h1-mobile lg:text-h1 font-medium tracking-tight-heading leading-tight text-balance">
              {t("heroHeadline")}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-navy/75 text-pretty">
              {t("heroSubline")}
            </p>
          </Reveal>
        </div>
      </section>

      <HomesTopBar />

      <section className="bg-stone pb-32">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pt-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Sticky filter rail (desktop) */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
              <div className="sticky top-36">
                <HomesFilters />
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9 xl:col-span-9">
              {view === "map" ? <HomesMap results={results} /> : <HomesGrid />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
