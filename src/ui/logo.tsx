import { cn } from "cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn("size-[31px] text-accent", className)} viewBox="0 0 50 50">
      <path
        d="M25 41C9 38 5 27 10 16c8 4 12 11 15 25Zm0 0c16-3 20-14 15-25-8 4-12 11-15 25Zm0-3C13 23 17 13 25 7c8 6 12 16 0 31Z"
        fill="currentColor"
        opacity=".82"
      />
      <path
        d="M6 31c7 0 14 5 19 10-10 2-19-2-19-10Zm38 0c-7 0-14 5-19 10 10 2 19-2 19-10Z"
        fill="currentColor"
        opacity=".58"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold text-[25px] tracking-[-1.2px]", className)}>
      <LogoMark />
      greeful
    </span>
  );
}
