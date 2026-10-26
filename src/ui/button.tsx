import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

const VARIANTS = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-strong",
  danger: "bg-danger-soft text-danger hover:brightness-95",
  // Поверх декоративных карточек (tone-*).
  glass: "bg-white/85 text-brand-900 hover:bg-white",
} as const;

type ButtonStyle = {
  variant?: keyof typeof VARIANTS;
  size?: "md" | "sm";
  full?: boolean;
};

export function buttonClass({ variant = "primary", size = "md", full = false }: ButtonStyle = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold",
    "transition-[translate,scale,rotate,background-color,color] duration-200 ease-soft",
    "hover:-translate-y-px active:translate-y-0 active:scale-[.975] disabled:pointer-events-none disabled:opacity-45",
    size === "md" ? "min-h-[54px] px-5 py-3 text-[15px]" : "min-h-11 px-4 py-2.5 text-sm",
    full && "w-full",
    VARIANTS[variant]
  );
}

export function Button({
  variant,
  size,
  full,
  className,
  ...props
}: ComponentProps<"button"> & ButtonStyle) {
  return <button className={cn(buttonClass({ variant, size, full }), className)} type="button" {...props} />;
}

export function ButtonLink({
  variant,
  size,
  full,
  className,
  ...props
}: ComponentProps<typeof Link> & ButtonStyle) {
  return <Link className={cn(buttonClass({ variant, size, full }), className)} {...props} />;
}

export function TextButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 font-medium text-accent text-sm transition-colors hover:text-accent-hover [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5",
        className
      )}
      type="button"
      {...props}
    />
  );
}

export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 font-medium text-accent text-sm transition-colors hover:text-accent-hover [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5",
        className
      )}
      {...props}
    />
  );
}
