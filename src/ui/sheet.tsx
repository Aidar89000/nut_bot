"use client";

import { cn } from "cn";
import { XIcon } from "lucide-react";
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef } from "react";
import { IconButton } from "./icon-button";

// Нижняя шторка на нативном <dialog>: фокус, Esc и inert фона — из коробки.
export function Sheet({
  open,
  onClose,
  title,
  media,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // При переходе Next прячет экран (Activity), а не размонтирует —
  // модальное окно нужно закрыть, иначе страница останется inert.
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);

  // Сам <dialog> только держит фокус внутри — рамка фокуса вокруг всей шторки не нужна.
  return (
    <dialog
      aria-labelledby={titleId}
      className="sheet fixed inset-x-0 top-auto bottom-0 m-0 mx-auto max-h-full w-full max-w-[480px] bg-transparent p-3 pb-[max(12px,var(--safe-bottom))] text-ink outline-none"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={onClose}
      ref={ref}
    >
      {/* Прокрутка остаётся для низких экранов, но без полосы. */}
      <div className="relative max-h-[calc(100dvh-36px-var(--safe-top))] overflow-y-auto overscroll-contain rounded-[30px] border border-line bg-canvas p-[22px] shadow-[0_30px_90px_rgb(13_35_25/0.35)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div aria-hidden className="mx-auto -mt-2 mb-4 h-1 w-8 rounded-full bg-line-strong" />
        <IconButton className="absolute top-5 right-5" label="Закрыть" onClick={onClose}>
          <XIcon />
        </IconButton>
        {media}
        <h2
          className={cn("mb-4 max-w-[370px] font-medium text-[26px] leading-tight tracking-[-0.04em]", !media && "pr-14")}
          id={titleId}
        >
          {title}
        </h2>
        {children && <div className="space-y-3.5 text-muted text-sm leading-[1.75]">{children}</div>}
        {actions && <div className="mt-6 flex gap-2.5 *:min-w-0 *:flex-1">{actions}</div>}
      </div>
    </dialog>
  );
}

export function SheetIcon({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 grid size-[54px] place-items-center rounded-[18px] bg-accent-soft text-accent [&_svg]:size-[22px]">
      {children}
    </div>
  );
}
