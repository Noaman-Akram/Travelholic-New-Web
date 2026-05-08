"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type GalleryImage = { src: string; alt: string };

export function HomeGalleryHero({ images }: { images: GalleryImage[] }) {
  const t = useTranslations("homeDetail");
  const tLb = useTranslations("homeDetail.lightbox");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReduced = useReducedMotion();

  const openAt = useCallback((i: number) => {
    setActiveIndex(i);
    setOpen(true);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, next, prev]);

  const hero = images[0];
  const thumbs = images.slice(1, 5);
  if (!hero) return null;

  return (
    <>
      {/* Desktop: 1 large + 4 thumb grid */}
      <div className="relative hidden lg:grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/8] overflow-hidden rounded-3xl">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative col-span-2 row-span-2 overflow-hidden bg-navy/10 group"
          aria-label={t("viewAllPhotos", { count: images.length })}
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
          />
        </button>
        {thumbs.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => openAt(i + 1)}
            className="relative overflow-hidden bg-navy/10 group"
            aria-label={t("viewAllPhotos", { count: images.length })}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute end-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-stone/90 backdrop-blur px-4 py-2 text-xs font-medium text-navy shadow-editorial hover:bg-stone transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          {t("viewAllPhotos", { count: images.length })}
        </button>
      </div>

      {/* Mobile: full-bleed swipeable */}
      <div className="lg:hidden">
        <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto -mx-5 sm:-mx-6">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => openAt(i)}
              className="relative shrink-0 w-full snap-center aspect-[4/3] bg-navy/10"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-navy/95" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col">
            <Dialog.Title className="sr-only">{t("viewAllPhotos", { count: images.length })}</Dialog.Title>
            <div className="flex items-center justify-between text-stone p-5 sm:p-6">
              <p className="text-sm tabular-nums">
                {tLb("of", { current: activeIndex + 1, total: images.length })}
              </p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label={tLb("close")}
                  className="grid h-10 w-10 place-items-center rounded-full bg-stone/10 hover:bg-stone/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="relative flex-1 flex items-center justify-center px-2 sm:px-8 pb-20 select-none">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="hidden sm:grid absolute start-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-stone/10 hover:bg-stone/20 text-stone transition-colors z-10"
              >
                <ChevronLeft className="h-5 w-5 rtl:scale-x-[-1]" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="hidden sm:grid absolute end-4 top-1/2 -translate-y-1/2 h-12 w-12 place-items-center rounded-full bg-stone/10 hover:bg-stone/20 text-stone transition-colors z-10"
              >
                <ChevronRight className="h-5 w-5 rtl:scale-x-[-1]" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={prefersReduced ? false : { opacity: 0 }}
                  animate={prefersReduced ? undefined : { opacity: 1 }}
                  exit={prefersReduced ? undefined : { opacity: 0 }}
                  transition={prefersReduced ? undefined : { duration: 0.25 }}
                  className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9]"
                >
                  <Image
                    src={images[activeIndex]!.src}
                    alt={images[activeIndex]!.alt}
                    fill
                    sizes="100vw"
                    priority
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Thumbnail rail */}
            <div className="hidden sm:flex justify-center gap-2 pb-6 px-4">
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative h-14 w-20 overflow-hidden rounded-lg ring-1 transition-all",
                    activeIndex === i
                      ? "ring-butter opacity-100"
                      : "ring-stone/20 opacity-60 hover:opacity-100",
                  )}
                  aria-label={`Photo ${i + 1}`}
                >
                  <Image src={img.src} alt={img.alt} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
