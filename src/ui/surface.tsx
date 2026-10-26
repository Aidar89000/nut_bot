import { cn } from "cn";
import type { ComponentProps } from "react";

export function Surface({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("rounded-[28px] border border-line bg-surface p-[22px]", className)} {...props} />;
}
