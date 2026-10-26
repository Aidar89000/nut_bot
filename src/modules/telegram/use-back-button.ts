"use client";

import { useEffect } from "react";
import { getWebApp } from "./sdk";

// Нативная кнопка «Назад» в шапке Telegram (и системная «назад» на Android).
// handler должен быть стабильным — иначе кнопка будет мигать.
export function useTelegramBackButton(handler: (() => void) | null) {
  useEffect(() => {
    const app = getWebApp();
    if (!app || !handler || !app.isVersionAtLeast("6.1")) return;
    app.BackButton.onClick(handler);
    app.BackButton.show();
    return () => {
      app.BackButton.offClick(handler);
      app.BackButton.hide();
    };
  }, [handler]);
}
