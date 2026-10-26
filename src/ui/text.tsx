import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

export function Eyebrow({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("font-semibold text-[10px] text-muted uppercase tracking-[0.12em]", className)}
      {...props}
    />
  );
}

export function PageTitle({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="mt-7 mb-6">
      <Eyebrow className="mb-2.5">{kicker}</Eyebrow>
      <h1 className="font-medium text-[38px] leading-[1.09] tracking-[-0.055em] outline-none max-[360px]:text-[34px]">
        {children}
      </h1>
    </div>
  );
}

export function SectionHead({
  title,
  children,
  as: Heading = "h2",
}: {
  title: ReactNode;
  children?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <Heading className="font-medium text-lg tracking-[-0.03em]">{title}</Heading>
      {children}
    </div>
  );
}

export function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-[10px]",
        className
      )}
    >
      <i aria-hidden className="size-[5px] rounded-full bg-accent" />
      {children}
    </span>
  );
}
