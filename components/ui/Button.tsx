import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex min-h-[52px] items-center justify-center rounded-brand border px-7 text-center text-[15px] font-medium tracking-[0.06em] no-underline";

const variants = {
  primary: "border-inchiostro bg-inchiostro text-bianco hover:border-mare hover:bg-mare",
  secondary: "border-inchiostro bg-transparent text-inchiostro hover:bg-calce",
} as const;

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type={type}
      {...props}
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:border-linea disabled:bg-linea disabled:text-pietra ${className}`}
    />
  );
}
