"use client";

import { type ReactNode, useEffect } from "react";
import { NoticeScreen, Splash } from "@/modules/shell/screen";
import { useTelegram } from "@/modules/telegram/provider";
import { openStore, useStoreReady } from "./store";

// Пускает дальше, когда известен пользователь Telegram и загружены его данные.
export function SessionGate({ children }: { children: ReactNode }) {
  const telegram = useTelegram();
  const storeReady = useStoreReady();
  const userId = telegram.status === "ready" ? telegram.user.id : null;

  useEffect(() => {
    if (userId !== null) openStore(userId);
  }, [userId]);

  if (telegram.status === "outside") {
    return <NoticeScreen title="Откройте в Telegram">greeful работает как мини-приложение Telegram.</NoticeScreen>;
  }
  if (telegram.status === "error") {
    return <NoticeScreen title="Не удалось войти">Закройте приложение и откройте его снова.</NoticeScreen>;
  }
  if (telegram.status !== "ready" || !storeReady) {
    return <Splash />;
  }
  return children;
}
