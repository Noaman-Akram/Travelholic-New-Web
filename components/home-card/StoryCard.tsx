import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { Story } from "@/lib/data/types";
import type { AppLocale } from "@/i18n/routing";

export function StoryCard({
  story,
  size = "md",
  className,
}: {
  story: Story;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tStories = useTranslations("stories");
  const tFilters = useTranslations("stories.filters");
  const locale = useLocale() as AppLocale;

  const aspectClass = {
    sm: "aspect-[4/3]",
    md: "aspect-[3/2]",
    lg: "aspect-[16/10]",
  }[size];

  const titleSizeClass = {
    sm: "text-base lg:text-lg",
    md: "text-h4-mobile lg:text-h4",
    lg: "text-h3-mobile lg:text-h3",
  }[size];

  return (
    <article className={cn("group flex flex-col gap-4", className)}>
      <Link
        href={`/stories/${story.slug}`}
        className={cn(
          "relative block overflow-hidden rounded-3xl bg-navy/5",
          aspectClass,
        )}
      >
        <Image
          src={story.cover}
          alt={story.title[locale]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-col gap-2">
        <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
          {tFilters(story.category)} · {tStories("readMinutes", { minutes: story.readMinutes })}
        </p>
        <Link
          href={`/stories/${story.slug}`}
          className={cn(
            "leading-tight tracking-tight-heading font-medium text-balance hover:opacity-80",
            titleSizeClass,
          )}
        >
          {story.title[locale]}
        </Link>
        <p className="text-sm text-navy/70 leading-relaxed text-pretty">
          {story.excerpt[locale]}
        </p>
      </div>
    </article>
  );
}
