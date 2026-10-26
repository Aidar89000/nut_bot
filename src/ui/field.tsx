import { cn } from "cn";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { Check } from "@/lib/validation";

export type FieldStatus = "neutral" | "valid" | "invalid";

export const inputClass =
  "min-h-14 w-full min-w-0 rounded-2xl border border-line-strong bg-canvas px-4 py-3.5 text-lg text-ink transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-base placeholder:text-muted/70 hover:border-muted/50 focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_14%,transparent)] focus:outline-none read-only:text-muted";

const STATUS_INPUT: Record<FieldStatus, string> = {
  neutral: "",
  valid: "border-accent/60",
  invalid: "border-danger bg-danger-soft focus:border-danger",
};

const STATUS_TEXT: Record<FieldStatus, string> = {
  neutral: "text-muted",
  valid: "text-accent",
  invalid: "text-danger",
};

// Ошибку показываем только после того, как пользователь ушёл с поля или отправил форму.
export function fieldView(check: Check, touched: boolean, hint = ""): { status: FieldStatus; message: string } {
  if (check.valid) return { status: check.empty ? "neutral" : "valid", message: check.message || hint };
  return touched ? { status: "invalid", message: check.message } : { status: "neutral", message: hint };
}

// Поле с живой проверкой: значок состояния справа и подсказка под полем.
export function Field({
  id,
  label,
  status = "neutral",
  message = "",
  aside,
  icon,
  className,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label: ReactNode;
  status?: FieldStatus;
  message?: string;
  aside?: ReactNode;
  icon?: ReactNode;
}) {
  const feedbackId = `${id}-feedback`;

  return (
    <div className="group mb-2">
      <label
        className="mb-2 flex items-center justify-between gap-3 text-ink/80 text-sm transition-[color,translate] duration-200 group-focus-within:translate-x-0.5 group-focus-within:text-accent"
        htmlFor={id}
      >
        {label}
        {aside}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted [&_svg]:size-5">
            {icon}
          </span>
        )}
        <input
          aria-describedby={feedbackId}
          aria-invalid={status === "invalid" ? true : undefined}
          className={cn(inputClass, "pr-12", icon && "pl-12", STATUS_INPUT[status], className)}
          id={id}
          {...props}
        />
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2">
          <CheckIcon
            className={cn(
              "absolute inset-0 size-5 text-accent transition-[opacity,scale] duration-200",
              status === "valid" ? "scale-100 opacity-100" : "scale-70 opacity-0"
            )}
            strokeWidth={2.4}
          />
          <CircleAlertIcon
            className={cn(
              "absolute inset-0 size-5 text-danger transition-[opacity,scale] duration-200",
              status === "invalid" ? "scale-100 opacity-100" : "scale-70 opacity-0"
            )}
          />
        </span>
      </div>
      <p
        aria-atomic
        aria-live="polite"
        className={cn("mt-2 min-h-[42px] px-0.5 text-[13px] leading-snug transition-colors", STATUS_TEXT[status])}
        id={feedbackId}
      >
        {message && (
          <span className="block animate-fade-up" key={message}>
            {message}
          </span>
        )}
      </p>
    </div>
  );
}
