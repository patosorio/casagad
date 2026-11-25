import type { ElementType, ReactNode } from "react";

/**
 * Approved `.wrap`: max-width 1120px, centered, gutter 22px (40px from 768px).
 * Header, footer and every public section use this. Do not add a second width.
 */
const wrap = "mx-auto w-full max-w-wrap px-gutter";

export function Container({
  as,
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const Tag = as ?? "div";
  return <Tag className={className ? `${wrap} ${className}` : wrap}>{children}</Tag>;
}
