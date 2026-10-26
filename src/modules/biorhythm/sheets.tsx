"use client";

import { cn } from "cn";
import { ActivityIcon, ArrowRightIcon, SparkleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { MONTHS } from "@/lib/date";
import { useToday } from "@/lib/use-today";
import { NAV_TAB } from "@/modules/shell/transitions";
import { Button } from "@/ui/button";
import { Sheet, SheetIcon } from "@/ui/sheet";
import { averageValue, formatPercent } from "./math";
import { useBirthDate } from "./use-birth-date";

type SheetProps = { open: boolean; onClose: () => void };

export function RhythmInfoSheet({ open, onClose }: SheetProps) {
  return (
    <Sheet
      actions={<Button onClick={onClose}>Понятно</Button>}
      media={
        <SheetIcon>
          <ActivityIcon />
        </SheetIcon>
      }
      onClose={onClose}
      open={open}
      title="Как считается ритм"
    >
      <p>
        Три цикла: <strong className="font-medium text-ink">физический — 23 дня, эмоциональный — 28, интеллектуальный — 33.</strong>
      </p>
      <p>
        Для каждого — <strong className="font-medium text-ink">sin(2π × дни от рождения / период) × 100%</strong>.
      </p>
      <p>Ритм дня на главной — среднее трёх значений.</p>
    </Sheet>
  );
}

export function YearSheet({ open, onClose }: SheetProps) {
  const router = useRouter();
  const birth = useBirthDate();
  const today = useToday();
  const year = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7)) - 1;

  const months = useMemo(() => {
    const values = MONTHS.map((name, i) => ({ name, value: Math.round(averageValue(birth, new Date(year, i, 15, 12))) }));
    const peak = values.reduce((best, month, i) => (month.value > values[best].value ? i : best), 0);
    return values.map((month, i) => ({ ...month, peak: i === peak }));
  }, [birth, year]);

  // При открытии лента сразу стоит на текущем месяце.
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = list.current;
    const item = el?.children[currentMonth] as HTMLElement | undefined;
    if (!open || !el || !item) return;
    el.scrollTop = item.offsetTop - (el.clientHeight - item.offsetHeight) / 2;
  }, [open, currentMonth]);

  return (
    <Sheet
      actions={
        <Button
          onClick={() => {
            onClose();
            router.replace("/rhythm", { transitionTypes: NAV_TAB });
          }}
        >
          Открыть календарь <ArrowRightIcon className="size-4" />
        </Button>
      }
      onClose={onClose}
      open={open}
      title={`Мой ритм · ${year}`}
    >
      <p>Среднее трёх циклов на 15-е число месяца.</p>
      {/* Своя прокрутка: карточки крупные, листаются сверху вниз, а кнопка остаётся на месте. */}
      <ol
        className="stagger relative -mx-1 flex max-h-[min(440px,52dvh)] snap-y snap-proximity flex-col gap-2 overflow-y-auto overscroll-contain px-1 py-4 [mask-image:linear-gradient(to_bottom,transparent,#000_16px,#000_calc(100%-16px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={list}
      >
        {months.map((month, i) => (
          <MonthCard current={i === currentMonth} key={month.name} {...month} />
        ))}
      </ol>
    </Sheet>
  );
}

// Карточка месяца: чем сильнее значение, тем гуще заливка; шкала идёт от нуля
// в центре — вправо зелёным, влево розовым.
function MonthCard({ name, value, peak, current }: { name: string; value: number; peak: boolean; current: boolean }) {
  const positive = value >= 0;
  const tone = positive ? "var(--accent)" : "var(--cycle-emotion)";
  const strength = Math.round(4 + (Math.abs(value) / 100) * 22);

  return (
    <li
      aria-current={current ? "date" : undefined}
      className={cn(
        "relative flex shrink-0 snap-center flex-col gap-3 rounded-[22px] border px-5 pt-4 pb-5",
        current ? "border-accent" : "border-transparent"
      )}
      style={{ background: `color-mix(in oklab, ${tone} ${strength}%, var(--surface))` }}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className={cn("flex items-center gap-1.5 truncate text-[15.6px] leading-tight", current ? "text-ink" : "text-muted")}>
          {name}
          {peak && <SparkleIcon aria-label="пик года" className="size-3.5 shrink-0 text-accent" />}
        </span>
        <strong className="font-medium text-[40px] tabular-nums leading-none tracking-[-0.04em]" style={{ color: tone }}>
          {formatPercent(value)}
        </strong>
      </span>
      <span aria-hidden className="relative h-1.5 rounded-full bg-line">
        <span className="absolute inset-y-[-2px] left-1/2 w-px bg-line-strong" />
        <span
          className={cn(
            "absolute inset-y-0 animate-bar-grow rounded-full",
            positive ? "left-1/2 origin-left" : "right-1/2 origin-right"
          )}
          style={{ width: `${Math.abs(value) / 2}%`, background: tone }}
        />
      </span>
    </li>
  );
}
