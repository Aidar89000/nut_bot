"use client";

import { createContext, type ReactNode, use, useCallback, useRef, useState } from "react";

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef(0);

  const show = useCallback<ShowToast>((message) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div aria-atomic aria-live="polite">
        {toast && (
          <div
            className="pointer-events-none fixed bottom-[calc(101px+var(--safe-bottom))] left-1/2 z-50 w-max max-w-[min(425px,calc(100%-32px))] -translate-x-1/2 animate-toast-in rounded-[18px] bg-brand-900 px-4 py-3 text-sm text-white leading-relaxed shadow-[0_8px_30px_rgb(13_35_25/0.3)] dark:bg-brand-100 dark:text-brand-950"
            key={toast.id}
            role="status"
          >
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast(): ShowToast {
  return use(ToastContext);
}
