import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { stories, getStoryBySlug } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { StoryCard } from "@/components/home-card/StoryCard";
import { StampDivider } from "@/components/brand/StampDivider";
import { FooterNewsletter } from "@/components/layout/FooterNewsletter";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPosting, breadcrumbList } from "@/lib/seo/jsonLd";

type Props = { params: Promise<{ locale: AppLocale; slug: string }> };

export function generateStaticParams() {
  return stories.flatMap((s) =>
    (["en", "ar"] as const).map((locale) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return {};
  const t = await getTranslations({ locale, namespace: "storyDetail" });
  return {
    title: t("metaTitle", { title: story.title[locale] }),
    description: t("metaDescription", { excerpt: story.excerpt[locale] }),
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  const t = await getTranslations("storyDetail");
  const tFilters = await getTranslations("stories.filters");
  const related = stories
    .filter((s) => s.slug !== story.slug && s.category === story.category)
    .slice(0, 3);
  const fallbackRelated =
    related.length < 3
      ? [...related, ...stories.filter((s) => s.slug !== story.slug && !related.includes(s))].slice(0, 3)
      : related;

  const dateLabel = format(parseISO(story.publishedAt), "MMMM d, yyyy");

  return (
    <>
      <JsonLd
        data={[
          blogPosting(story, locale),
          breadcrumbList(
            [
              { name: "Travelholic", href: "/" },
              { name: "Stories", href: "/stories" },
              { name: story.title[locale], href: `/stories/${story.slug}` },
            ],
            locale,
          ),
        ]}
      />
      <article className="bg-stone">
        {/* Header */}
        <header className="mx-auto max-w-3xl px-5 sm:px-6 pt-12 lg:pt-20 pb-10">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4 rtl:scale-x-[-1]" />
            <span>Stories</span>
          </Link>

          <Reveal>
            <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55">
              {tFilters(story.category)} · {t("readTime", { minutes: story.readMinutes })}
            </p>
            <h1 className="mt-5 text-h1-mobile lg:text-h1 font-medium tracking-tight-heading leading-tight text-balance">
              {story.title[locale]}
            </h1>
            <p className="mt-6 text-body-lg lg:text-h4-mobile leading-relaxed text-navy/75 text-pretty">
              {story.excerpt[locale]}
            </p>
            <p className="mt-6 text-xs text-navy/50">
              {t("publishedOn", { date: dateLabel })}
            </p>
          </Reveal>
        </header>

        {/* Cover */}
        <Reveal className="mx-auto max-w-5xl px-5 sm:px-6 mb-16">
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-navy/10">
            <Image
              src={story.cover}
              alt={story.title[locale]}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Body */}
        <div className="mx-auto max-w-2xl px-5 sm:px-6 pb-20">
          <Reveal>
            <div className="prose prose-lg max-w-none">
              {story.body[locale].split("\n\n").map((paragraph, i) => (
                <p key={i} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-16">
            <div className="rounded-3xl bg-stone-100 ring-1 ring-navy/10 p-8 lg:p-10">
              <FooterNewsletter />
            </div>
          </Reveal>
        </div>

        <StampDivider tone="navy" className="mx-auto max-w-md px-6" />

        {/* Related */}
        {fallbackRelated.length > 0 ? (
          <section className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 py-20 lg:py-28">
            <Reveal as="header" className="mb-10">
              <h2 className="text-h3-mobile lg:text-h3 leading-tight tracking-tight-heading font-medium">
                {t("relatedTitle")}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {fallbackRelated.map((s) => (
                <StoryCard key={s.slug} story={s} size="md" />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
