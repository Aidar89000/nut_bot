"use client";

import { cn } from "cn";
import { BookOpenIcon, CalendarIcon, CheckIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { formatDate, lastDays, toDateKey } from "@/lib/date";
import { plural } from "@/lib/plural";
import { useToday, useTodayDate } from "@/lib/use-today";
import { useAppState } from "@/modules/session/store";
import { BackBar } from "@/modules/shell/back-bar";
import { Screen } from "@/modules/shell/screen";
import { haptic } from "@/modules/telegram/sdk";
import { Button } from "@/ui/button";
import { inputClass } from "@/ui/field";
import { Surface } from "@/ui/surface";
import { PageTitle, SectionHead } from "@/ui/text";
import { useToast } from "@/ui/toast";
import { findMood, NOTE_LIMIT, saveNote } from "./diary";
import { EmotionCard } from "./emotion-card";
import { MoodSphere } from "./mood-face";

export function DiaryScreen() {
  const today = useToday();
  const week = lastDays(7, useTodayDate());
  const moods = useAppState((state) => state.journal.moods);
  const notes = useAppState((state) => state.journal.notes);
  const moodDays = week.filter((day) => moods[toDateKey(day)]).length;
  const noteDays = week.filter((day) => notes[toDateKey(day)]?.trim()).length;

  return (
    <Screen withNav>
      <BackBar title="Дневник" />
      <PageTitle kicker="Дневник настроения">
        Мой внутренний
        <br />
        прогноз.
      </PageTitle>

      <div className="stagger grid gap-[18px]">
        <EmotionCard variant="diary" />

        <Surface>
          <SectionHead title="Настроение за неделю">
            <CalendarIcon className="size-5 text-accent" />
          </SectionHead>
          <div className="grid grid-cols-7 gap-1.5 max-[360px]:gap-1">
            {week.map((day) => {
              const key = toDateKey(day);
              const mood = findMood(moods[key]);
              return (
                <div
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-2 rounded-xl bg-surface-strong px-0.5 py-3",
                    key === today && "ring-1 ring-accent/50 ring-inset"
                  )}
                  key={key}
                >
                  <span className="text-muted text-xs">{formatDate.weekdayShort.format(day)}</span>
                  <span aria-label={mood?.label ?? "Нет записи"} className="grid size-[29px] place-items-center" role="img">
                    {mood ? (
                      <MoodSphere className="size-[29px] text-brand-900" id={mood.id} />
                    ) : (
                      <span className="text-muted text-xl leading-none">·</span>
                    )}
                  </span>
                  <span className="text-muted text-xs">{String(day.getDate()).padStart(2, "0")}</span>
                </div>
              );
            })}
          </div>
        </Surface>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="дней с настроением">
            {moodDays}
            <span className="text-lg text-muted"> / 7</span>
          </Stat>
          <Stat label={`${plural(noteDays, ["день", "дня", "дней"])} с заметками`}>{noteDays}</Stat>
        </div>

        <NoteForm key={today} />
      </div>
    </Screen>
  );
}

function NoteForm() {
  const today = useToday();
  const saved = useAppState((state) => state.journal.notes[today] ?? "");
  const [length, setLength] = useState(saved.length);
  const toast = useToast();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = String(new FormData(event.currentTarget).get("note") ?? "");
    saveNote(text);
    haptic.notify("success");
    toast(text.trim() ? "Мысли сохранены" : "Заметка очищена");
  }

  return (
    <Surface>
      <SectionHead title="Мысли на сегодня">
        <BookOpenIcon className="size-5 text-accent" />
      </SectionHead>
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="note">
          Заметка за сегодня
        </label>
        <textarea
          aria-describedby="note-counter"
          className={cn(inputClass, "min-h-[140px] resize-y text-base leading-[1.7]")}
          defaultValue={saved}
          id="note"
          maxLength={NOTE_LIMIT}
          name="note"
          onInput={(event) => {
            setLength(event.currentTarget.value.length);
            saveNote(event.currentTarget.value);
          }}
          placeholder="Что порадовало? Что было непросто?"
          rows={7}
        />
        <div className="mt-2 mb-4 flex items-center justify-between gap-3 px-0.5 text-muted text-xs">
          <span>Черновик сохраняется сам</span>
          <span
            className={cn("tabular-nums transition-colors", length >= NOTE_LIMIT * 0.9 && "text-danger")}
            id="note-counter"
          >
            {length} / {NOTE_LIMIT}
          </span>
        </div>
        <Button full type="submit">
          Сохранить заметку <CheckIcon className="size-4" />
        </Button>
      </form>
    </Surface>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[23px] border border-line bg-surface p-5">
      <strong className="block font-normal text-[33px] text-accent tracking-[-0.04em]">{children}</strong>
      <small className="mt-1 block text-[13px] text-muted">{label}</small>
    </div>
  );
}
