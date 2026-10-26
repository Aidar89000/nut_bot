"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Уже показанные счётчики: при возврате на вкладку число не крутится заново.
const played = new Set<string>();

// Число «набегает» от нуля при первом показе. Текст меняется напрямую в DOM,
// без перерисовок React на каждом кадре.
export function CountUp({
  id,
  value,
  format,
  duration = 900,
}: {
  id: string;
  value: number;
  format: (value: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatRef = useRef(format);

  useEffect(() => {
    formatRef.current = format;
  });

  // До отрисовки: иначе мелькнёт итоговое число, а потом ноль.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || played.has(id) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.add(id);
    el.textContent = formatRef.current(0);
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      el.textContent = formatRef.current(value * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(frame);
      el.textContent = formatRef.current(value);
    };
  }, [id, value, duration]);

  return <span ref={ref}>{format(value)}</span>;
}
