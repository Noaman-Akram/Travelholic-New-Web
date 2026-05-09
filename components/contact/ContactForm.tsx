"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Check, AlertCircle } from "lucide-react";
import { submitContact } from "@/app/actions/contact";
import { cn } from "@/lib/utils/cn";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    const result = await submitContact(formData);
    if (result.ok) {
      setStatus("success");
      e.currentTarget.reset();
    } else {
      setStatus("error");
      if (result.fieldErrors) setFieldErrors(result.fieldErrors as Record<string, string>);
    }
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b border-navy/15 px-0 py-3 text-base text-navy placeholder:text-navy/40 focus:outline-none focus:border-navy transition-colors";
  const labelClass = "block text-eyebrow uppercase font-medium tracking-eyebrow text-navy/55 mb-2";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
      <div className="lg:col-span-2">
        <label htmlFor="contact-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
        {fieldErrors.name ? (
          <p className="mt-2 text-xs text-maroon">{t(`errors.name`)}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
        {fieldErrors.email ? (
          <p className="mt-2 text-xs text-maroon">{t(`errors.email`)}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          {t("phone")}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div className="lg:col-span-2">
        <label htmlFor="contact-intent" className={labelClass}>
          {t("intent")}
        </label>
        <select
          id="contact-intent"
          name="intent"
          required
          defaultValue=""
          className={cn(inputClass, "appearance-none cursor-pointer")}
        >
          <option value="" disabled>
            …
          </option>
          <option value="stay">{t("intentOptions.stay")}</option>
          <option value="long">{t("intentOptions.long")}</option>
          <option value="corporate">{t("intentOptions.corporate")}</option>
          <option value="press">{t("intentOptions.press")}</option>
          <option value="other">{t("intentOptions.other")}</option>
        </select>
        {fieldErrors.intent ? (
          <p className="mt-2 text-xs text-maroon">{t(`errors.intent`)}</p>
        ) : null}
      </div>

      <div className="lg:col-span-2">
        <label htmlFor="contact-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          minLength={10}
          className={cn(inputClass, "resize-none")}
        />
        {fieldErrors.message ? (
          <p className="mt-2 text-xs text-maroon">{t(`errors.message`)}</p>
        ) : null}
      </div>

      <div className="lg:col-span-2 flex items-center justify-between gap-4">
        <div role="status" aria-live="polite" className="min-h-[1.25rem]">
          {status === "success" ? (
            <p className="inline-flex items-center gap-2 text-sm text-olive">
              <Check className="h-4 w-4" />
              {t("success")}
            </p>
          ) : status === "error" ? (
            <p className="inline-flex items-center gap-2 text-sm text-maroon">
              <AlertCircle className="h-4 w-4" />
              {t("error")}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full bg-navy text-stone px-7 py-3 text-sm font-medium hover:bg-navy-700 transition-colors duration-200 disabled:opacity-60"
        >
          {status === "submitting" ? t("sending") : t("submit")}
          <Send className="h-4 w-4 rtl:scale-x-[-1]" />
        </button>
      </div>
    </form>
  );
}
