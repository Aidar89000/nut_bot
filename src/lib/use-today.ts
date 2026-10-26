"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseDateKey, toDateKey } from "./date";

// Текущий день как ключ YYYY-MM-DD. Обновляется, когда приложение снова
// становится видимым или наступает полночь, — экраны не застревают во «вчера».

function subscribe(onChange: () => void) {
  let timer = 0;
  const scheduleMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = window.setTimeout(() => {
      onChange();
      scheduleMidnight();
    }, midnight.getTime() - now.getTime() + 1000);
  };
  scheduleMidnight();
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function useToday(): string {
  return useSyncExternalStore(subscribe, () => toDateKey(), () => "");
}

// Полдень сегодняшнего дня. На сервере (ключ пустой) — эпоха, экраны там не рендерятся.
export function useTodayDate(): Date {
  const today = useToday();
  return useMemo(() => parseDateKey(today) ?? new Date(0), [today]);
}
