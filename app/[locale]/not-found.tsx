import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { KeyholeMark } from "@/components/brand/KeyholeMark";
import { StampDivider } from "@/components/brand/StampDivider";

export default function NotFoundPage() {
  const t = useTranslations("errors.notFound");

  return (
    <section className="min-h-[60vh] flex items-center">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-6 py-24 text-center">
        <div className="flex justify-center mb-8">
          <KeyholeMark tone="navy" size={64} />
        </div>
        <h1 className="text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading text-balance">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-prose mx-auto text-body-lg text-navy/75">
          {t("body")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/homes">{t("primaryCta")}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">{t("secondaryCta")}</Link>
          </Button>
        </div>
        <StampDivider tone="navy" className="mt-16" />
      </div>
    </section>
  );
}
