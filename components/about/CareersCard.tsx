import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export function CareersCard() {
  const t = useTranslations("about.careers");
  return (
    <section className="relative bg-stone py-12 lg:py-20">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10">
        <Reveal>
          <div className="rounded-3xl bg-butter/40 ring-1 ring-butter/60 p-8 lg:p-14 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/65">
                {t("eyebrow")}
              </p>
              <h2 className="mt-4 text-h2-mobile lg:text-h2 leading-tight tracking-tight-heading font-medium text-balance">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-navy/80 text-pretty">
                {t("body")}
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:flex lg:justify-end">
              <Button asChild variant="primary" size="lg">
                <Link href="/contact" className="inline-flex items-center gap-2">
                  {t("cta")}
                  <ArrowUpRight className="h-4 w-4 rtl:scale-x-[-1]" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
