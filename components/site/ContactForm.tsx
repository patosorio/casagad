"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export type ContactCopy = {
  name: string;
  nameHelp: string;
  email: string;
  emailHelp: string;
  message: string;
  honeypot: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  submit: string;
  note: string;
  privacyHref: string;
};

const labelClass = "font-body text-eyebrow font-medium tracking-[0.14em] text-inchiostro uppercase";
const controlClass =
  "min-h-[52px] w-full rounded-brand border border-field-border bg-bianco px-4 py-3 font-body text-body text-inchiostro";

/** Layout only. Sending the message is a later step. */
export function ContactForm({ copy }: { copy: ContactCopy }) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={onSubmit} aria-describedby="contact-note" noValidate={false}>
      <div className="mb-5 flex flex-col gap-2">
        <label htmlFor="contact-name" className={labelClass}>
          {copy.name}
        </label>
        <input id="contact-name" name="name" autoComplete="name" required maxLength={80} className={controlClass} />
        <span className="text-small text-pietra">{copy.nameHelp}</span>
      </div>
      <div className="mb-5 flex flex-col gap-2">
        <label htmlFor="contact-email" className={labelClass}>
          {copy.email}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={80}
          className={controlClass}
        />
        <span className="text-small text-pietra">{copy.emailHelp}</span>
      </div>
      <div className="mb-5 flex flex-col gap-2">
        <label htmlFor="contact-message" className={labelClass}>
          {copy.message}
        </label>
        <textarea id="contact-message" name="message" required maxLength={2000} className={`${controlClass} min-h-[120px]`} />
      </div>
      <div className="hp" aria-hidden="true">
        <label>
          {copy.honeypot}
          <input name="hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex min-h-tap items-start gap-3 py-2 text-body">
        <input name="consent" type="checkbox" required className="mt-0.5 h-6 w-6 accent-mare" />
        <span>
          {copy.consentBefore}
          <a href={copy.privacyHref}>{copy.consentLink}</a>
          {copy.consentAfter}
        </span>
      </label>
      <Button type="submit" className="mt-2">
        {copy.submit}
      </Button>
      <p id="contact-note" className="mt-2.5 text-small text-pietra">
        {copy.note}
      </p>
    </form>
  );
}
