import { cn } from "cn";

export function Progress({
  value,
  max,
  label,
  className,
  indicatorClassName,
}: {
  value: number;
  max: number;
  label: string;
  className?: string;
  indicatorClassName?: string;
}) {
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn("h-[5px] overflow-hidden rounded-full bg-surface-strong", className)}
      role="progressbar"
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-[width] duration-500 ease-soft", indicatorClassName)}
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  );
}
