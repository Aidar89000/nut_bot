import { cn } from "cn";

// Визуальный переключатель; роль switch — у кнопки-строки, где он стоит.
export function ToggleIndicator({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-[25px] w-[43px] shrink-0 rounded-full p-[3px] transition-colors",
        on ? "bg-accent" : "bg-line-strong"
      )}
    >
      <span
        className={cn(
          "block size-[19px] rounded-full bg-canvas shadow-sm transition-transform duration-200",
          on && "translate-x-[18px]"
        )}
      />
    </span>
  );
}
