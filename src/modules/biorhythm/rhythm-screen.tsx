"use client";

import { cn } from "cn";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { daysInMonth, formatDate, MONTHS } from "@/lib/date";
import { useTodayDate } from "@/lib/use-today";
import { Screen } from "@/modules/shell/screen";
import { TopBar } from "@/modules/shell/top-bar";
import { haptic } from "@/modules/telegram/sdk";
import { Button, TextButton } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { Surface } from "@/ui/surface";
import { PageTitle, SectionHead } from "@/ui/text";
import { CYCLE_STYLE } from "./cycle-style";
import { CYCLES, cycleValues, formatPercent, phaseLabel } from "./math";
import { RhythmChart } from "./rhythm-chart";
import { RhythmInfoSheet } from "./sheets";
import { useBirthDate } from "./use-birth-date";

const MIN_YEAR = 1901;
const MAX_YEAR = 2200;

type View = { year: number; month: number; day: number };

function viewOf(date: Date): View {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

export function RhythmScreen() {
  const birth = useBirthDate();
  const today = useTodayDate();
  const [view, setView] = useState<View>(() => viewOf(today));
  const [infoOpen, setInfoOpen] = useState(false);

  const days = daysInMonth(view.year, view.month);
  const day = Math.min(view.day, days);
  const selected = new Date(view.year, view.month, day, 12);

  function moveMonth(delta: number) {
    const next = new Date(view.year, view.month + delta, 1, 12);
    if (next.getFullYear() < MIN_YEAR || next.getFullYear() > MAX_YEAR) return;
    setView({ year: next.getFullYear(), month: next.getMonth(), day });
  }

  function selectDay(next: number) {
    if (next !== day) haptic.selection();
    setView((current) => ({ ...current, day: next }));
  }

  return (
    <Screen className="stagger" withNav>
      <TopBar />
      <PageTitle kicker="Персональный календарь">Твои биоритмы.</PageTitle>

      <Surface className="px-4 py-[21px]">
        <div className="flex flex-col gap-5">
          <h2 className="font-medium text-lg tracking-[-0.025em]">Динамика циклов</h2>
          <div className="flex items-center justify-between gap-3">
            <IconButton
              disabled={view.year === MIN_YEAR && view.month === 0}
              label="Предыдущий месяц"
              onClick={() => moveMonth(-1)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <strong className="font-medium text-[15px]">
              {MONTHS[view.month]} {view.year}
            </strong>
            <IconButton
              disabled={view.year === MAX_YEAR && view.month === 11}
              label="Следующий месяц"
              onClick={() => moveMonth(1)}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>

        <RhythmChart birth={birth} month={view.month} onSelectDay={selectDay} selectedDay={day} year={view.year} />

        <div className="flex flex-wrap gap-4 text-[13px] text-muted">
          {CYCLES.map((cycle) => (
            <span className="inline-flex items-center gap-1.5" key={cycle.id}>
              <i className="size-[7px] rounded-full" style={{ background: CYCLE_STYLE[cycle.id].color }} />
              {cycle.short}
            </span>
          ))}
        </div>

        <div className="mt-[18px] flex min-h-[49px] items-center gap-2.5 border-line border-t pt-3">
          <label className="whitespace-nowrap text-[13px]" htmlFor="chart-day">
            День
          </label>
          <input
            aria-valuetext={formatDate.full.format(selected)}
            className="min-h-11 min-w-8 flex-1 accent-accent"
            id="chart-day"
            max={days}
            min={1}
            onChange={(event) => selectDay(Number(event.target.value))}
            type="range"
            value={day}
          />
          <output className="min-w-12 whitespace-nowrap text-right text-[13px] text-accent" htmlFor="chart-day">
            {formatDate.dayMonthShort.format(selected)}
          </output>
        </div>
      </Surface>

      <section className="mt-6">
        <SectionHead title={formatDate.dayMonth.format(selected)}>
          <TextButton onClick={() => setView(viewOf(today))}>
            Сегодня <ArrowRightIcon className="size-4" />
          </TextButton>
        </SectionHead>
        <div aria-live="polite" className="grid gap-2.5">
          {cycleValues(birth, selected).map((cycle) => {
            const { icon: Icon, text } = CYCLE_STYLE[cycle.id];
            return (
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1.5 rounded-[22px] border border-line bg-surface p-[19px]"
                key={cycle.id}
              >
                <div className="flex items-center gap-2.5 text-sm">
                  <Icon className={cn("size-[19px]", text)} />
                  {cycle.name}
                </div>
                <strong className={cn("row-span-2 font-medium text-[30px] tracking-[-0.06em]", text)}>
                  {formatPercent(cycle.value)}
                </strong>
                <small className="text-muted text-xs">
                  {phaseLabel(cycle.value)} · {cycle.period} дней
                </small>
              </div>
            );
          })}
        </div>
      </section>

      <Button className="mt-6" full onClick={() => setInfoOpen(true)} variant="secondary">
        Как считается ритм <ArrowRightIcon className="size-4" />
      </Button>
      <RhythmInfoSheet onClose={() => setInfoOpen(false)} open={infoOpen} />
    </Screen>
  );
}
