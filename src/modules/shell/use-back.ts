"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSessionUser } from "@/modules/telegram/provider";
import { useTelegramBackButton } from "@/modules/telegram/use-back-button";
import { NAV_BACK } from "./transitions";

// «Назад» ведёт на явный родительский экран: история внутри мини-аппа
// остаётся плоской, а системная кнопка Android работает через Telegram.
// В Telegram своя кнопка в шапке, поэтому кнопку в интерфейсе показываем только в браузере.
export function useBack(href: string | null) {
  const router = useRouter();
  const { inTelegram } = useSessionUser();
  const goBack = useCallback(() => {
    if (href) router.replace(href, { transitionTypes: NAV_BACK });
  }, [router, href]);

  useTelegramBackButton(href ? goBack : null);

  return { goBack, showInlineBack: Boolean(href) && !inTelegram };
}
