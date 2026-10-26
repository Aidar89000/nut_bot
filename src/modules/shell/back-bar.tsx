"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/ui/icon-button";
import { getLastTab } from "./last-tab";
import { useBack } from "./use-back";

// Шапка вложенных экранов. В Telegram «назад» — нативная кнопка в его шапке.
// Без href возвращает на вкладку, с которой пришёл пользователь.
export function BackBar({ href, title }: { href?: string; title: string }) {
  const [fallback] = useState(getLastTab);
  const { goBack, showInlineBack } = useBack(href ?? fallback);

  return (
    <header className="flex min-h-11 items-center gap-3">
      {showInlineBack && (
        <IconButton label="Назад" onClick={goBack}>
          <ChevronLeftIcon />
        </IconButton>
      )}
      <span className="font-medium text-sm tracking-[-0.02em]">{title}</span>
    </header>
  );
}
