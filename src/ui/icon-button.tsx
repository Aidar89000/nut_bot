import { cn } from "cn";
import Link from "next/link";
import type { ComponentProps } from "react";

const BASE =
  "grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink transition-[translate,scale,rotate,background-color] duration-200 ease-soft hover:bg-surface-strong active:scale-95 disabled:opacity-45 [&_svg]:size-[19px]";

type Labelled = { label: string };

export function IconButton({ label, className, ...props }: ComponentProps<"button"> & Labelled) {
  return <button aria-label={label} className={cn(BASE, className)} type="button" {...props} />;
}

export function IconLink({ label, className, ...props }: ComponentProps<typeof Link> & Labelled) {
  return <Link aria-label={label} className={cn(BASE, className)} {...props} />;
}
