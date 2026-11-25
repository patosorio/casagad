import type { ElementType, ReactNode } from "react";

/**
 * Approved `.wrap` from 03-design/assets/casagad.css:
 * max-width 1120px, centered, horizontal gutter 22px (40px from 768px).
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
