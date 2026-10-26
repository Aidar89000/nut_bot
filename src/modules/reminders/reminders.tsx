"use client";

import { BellIcon, LeafIcon, XIcon } from "lucide-react";
import { toDateKey } from "@/lib/date";
import { useToday } from "@/lib/use-today";
import { updateState, useAppState } from "@/modules/session/store";
import { Button } from "@/ui/button";
import { Sheet, SheetIcon } from "@/ui/sheet";
import { useToast } from "@/ui/toast";

// Мягкое напоминание на главной: только внутри открытого приложения.

export function setReminders(enabled: boolean) {
  updateState((state) => ({
    ...state,
    prefs: { ...state.prefs, reminders: enabled, dismissedReminder: "" },
  }));
}

function dismissReminder() {
  updateState((state) => ({ ...state, prefs: { ...state.prefs, dismissedReminder: toDateKey() } }));
}

export function useRemindersToggle() {
  const enabled = useAppState((state) => state.prefs.reminders);
  const toast = useToast();
  return {
    enabled,
    toggle() {
      setReminders(!enabled);
      toast(enabled ? "Напоминание выключено" : "Напоминание появится на главной");
    },
  };
}

export function ReminderBanner() {
  const today = useToday();
  const visible = useAppState((state) => state.prefs.reminders && state.prefs.dismissedReminder !== today);
  if (!visible) return null;

  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-[19px] border border-line-strong bg-accent-soft py-1 pr-1 pl-3.5 text-[12px]">
      <LeafIcon className="size-[17px] shrink-0 text-accent" />
      <span className="flex-1">Найди минуту для себя. Как ты сегодня?</span>
      <button
        aria-label="Скрыть напоминание"
        className="grid min-h-11 min-w-9 place-items-center text-muted"
        onClick={dismissReminder}
        type="button"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

export function ReminderSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enabled, toggle } = useRemindersToggle();

  return (
    <Sheet
      actions={
        <Button
          onClick={() => {
            toggle();
            onClose();
          }}
        >
          {enabled ? "Выключить" : "Включить"}
        </Button>
      }
      media={
        <SheetIcon>
          <BellIcon />
        </SheetIcon>
      }
      onClose={onClose}
      open={open}
      title="Напоминание"
    >
      <p>Короткая подсказка на главной — остановиться на минуту и отметить настроение.</p>
      <p>Сейчас {enabled ? "включено" : "выключено"}.</p>
    </Sheet>
  );
}
