import { cn } from "cn";

type Option<T extends string | number> = { value: T; label: string };

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  inverse = false,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  // Светлые кнопки для тёмных карточек (tone-forest).
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div aria-label={label} className={cn("flex flex-wrap gap-2", className)} role="group">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            aria-pressed={active}
            className={cn(
              "min-h-11 rounded-full px-4 py-2.5 text-xs transition-colors",
              inverse
                ? active
                  ? "bg-white text-brand-900"
                  : "bg-white/10 text-white/80 hover:text-white"
                : active
                  ? "bg-accent text-accent-ink"
                  : "bg-surface-strong text-ink/80 hover:text-ink"
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
