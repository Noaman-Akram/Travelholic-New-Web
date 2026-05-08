import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";
import type { AppLocale } from "@/i18n/routing";
import { getStoryBySlug, stories } from "@/lib/data";

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
  return (
    <PagePlaceholder
      eyebrow={`Story · ${story.category}`}
      heading={story.title[locale]}
      body={`${story.excerpt[locale]} — ${t("phasePlaceholder")}`}
      locale={locale}
    />
  );
}
