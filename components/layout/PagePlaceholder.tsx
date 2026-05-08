import { Wordmark } from "@/components/brand/Wordmark";
import { StampDivider } from "@/components/brand/StampDivider";

/**
 * Phase 1 placeholder: every route renders a clean, on-brand stub
 * with the section heading and a small note about which phase delivers full content.
 * Replaced section-by-section in Phase 2 / 3.
 */
export function PagePlaceholder({
  eyebrow,
  heading,
  body,
  locale,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
  locale: "en" | "ar";
}) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-6 lg:px-8 xl:px-10 pt-16 pb-32">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-9">
            {eyebrow ? (
              <p className="text-eyebrow uppercase font-medium tracking-eyebrow text-navy/60 mb-6">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-h1-mobile lg:text-h1 leading-tight tracking-tight-heading text-balance">
              {heading}
            </h1>
            {body ? (
              <p className="mt-8 max-w-2xl text-body-lg leading-relaxed text-navy/75">
                {body}
              </p>
            ) : null}
          </div>
          <div className="col-span-12 lg:col-span-3 lg:flex lg:justify-end items-start">
            <Wordmark locale={locale} size="md" tone="navy" className="opacity-50" />
          </div>
        </div>

        <StampDivider tone="navy" className="mt-20" />
      </div>
    </section>
  );
}
