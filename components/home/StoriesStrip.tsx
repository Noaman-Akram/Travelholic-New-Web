import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { StoryCard } from "@/components/home-card/StoryCard";
import { Link } from "@/i18n/navigation";
import { getRecentStories } from "@/lib/data";

export function StoriesStrip() {
  const t = useTranslations("home.stories");
  const stories = getRecentStories(4);

  return (
    <section className="relative bg-stone py-20 lg:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal as="header" className="mb-12 lg:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-xl text-body-lg leading-relaxed text-navy/70 text-pretty">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-medium text-navy hover:opacity-70 transition-opacity"
          >
            <span>{t("viewAll")}</span>
            <ArrowUpRight className="h-4 w-4 rtl:scale-x-[-1]" />
          </Link>
        </Reveal>

        <Reveal variant="stagger">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {stories.map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.05}>
                <StoryCard story={s} size="md" />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
