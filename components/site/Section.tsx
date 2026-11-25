import type { ReactNode } from "react";
import { Container } from "@/components/site/Container";

export function Section({
  titleId,
  tone = "plain",
  compact = false,
  children,
}: {
  titleId?: string;
  tone?: "plain" | "soft";
  compact?: boolean;
  children: ReactNode;
}) {
  const toneClass = tone === "soft" ? "border-t-0 bg-calce" : "border-t border-linea";
  const space = compact ? "pt-6 pb-14 lg:pb-24" : "py-14 lg:py-24";
  return (
    <section aria-labelledby={titleId} className={`${toneClass} ${space}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <Container className="pt-10">
      {eyebrow ? (
        <p className="mb-3.5 font-body text-eyebrow font-medium tracking-eyebrow text-pietra uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1>{title}</h1>
      {lead ? <p className="narrow mb-4 font-body text-lead font-light">{lead}</p> : null}
      {children}
    </Container>
  );
}
