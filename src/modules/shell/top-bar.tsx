"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDate, parseDateKey } from "@/lib/date";
import { useToday } from "@/lib/use-today";
import { ReminderSheet } from "@/modules/reminders/reminders";
import { useAppState } from "@/modules/session/store";
import { useSessionUser } from "@/modules/telegram/provider";
import { Avatar } from "@/ui/avatar";
import { IconButton } from "@/ui/icon-button";
import { NAV_TAB } from "./transitions";

// Шапка вкладок: аватарка Telegram, приветствие, дата и напоминания.
export function TopBar() {
  const user = useSessionUser();
  const profileName = useAppState((state) => state.profile.name);
  const today = parseDateKey(useToday());
  const [remindersOpen, setRemindersOpen] = useState(false);
  const name = (profileName.trim() || user.firstName).split(/\s+/)[0];

  return (
    <header className="flex min-h-11 items-center justify-between gap-3">
      <Link
        aria-label="Открыть профиль"
        className="flex min-w-0 flex-1 items-center gap-3"
        href="/profile"
        replace
        transitionTypes={NAV_TAB}
      >
        <Avatar name={name} src={user.avatarUrl} />
        <div className="min-w-0">
          <div className="truncate font-medium text-base tracking-[-0.02em] max-[360px]:text-sm">Привет, {name}</div>
          {today && <div className="mt-0.5 text-[13px] text-muted max-[360px]:text-xs">{formatDate.weekday.format(today)}</div>}
        </div>
      </Link>
      <IconButton className="size-[46px]" label="Напоминания" onClick={() => setRemindersOpen(true)}>
        <BellIcon />
      </IconButton>
      <ReminderSheet onClose={() => setRemindersOpen(false)} open={remindersOpen} />
    </header>
  );
}
