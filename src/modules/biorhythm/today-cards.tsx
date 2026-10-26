"use client";

import { cn } from "cn";
import { ArrowRightIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTodayDate } from "@/lib/use-today";
import { NAV_TAB } from "@/modules/shell/transitions";
import { ButtonLink } from "@/ui/button";
import { CountUp } from "@/ui/count-up";
import { Orb } from "@/ui/orb";
import { Eyebrow } from "@/ui/text";
import { CYCLE_STYLE } from "./cycle-style";
import { cycleValues, daysSince, formatPercent, phaseLabel } from "./math";
import { useBirthDate } from "./use-birth-date";

function useTodayValues() {
  const birth = useBirthDate();
  const today = useTodayDate();
  return useMemo(() => {
    const values = cycleValues(birth, today);
    const average = values.reduce((sum, cycle) => sum + cycle.value, 0) / values.length;
    return { birth, today, values, average };
  }, [birth, today]);
}

export function RhythmHero() {
  const { average } = useTodayValues();

  return (
    <section className="tone-forest group relative isolate min-h-[262px] overflow-hidden rounded-[30px] p-6 max-[360px]:p-[22px]">
      <Orb core="animate-float" />
      <Eyebrow className="flex items-center gap-2 font-bold text-(--tone-muted) text-[13px] tracking-[0.045em]">
        <SparkleIcon className="size-[19px]" />
        Твой ритм дня
      </Eyebrow>
      <div className="mt-7 mb-2 font-semibold text-[68px] tabular-nums leading-none tracking-[-0.065em] max-[360px]:text-[63px]">
        <CountUp format={formatPercent} id="hero" value={average} />
      </div>
      <p className="mb-5 text-(--tone-muted) text-[15px]">{phaseLabel(average)}</p>
      <ButtonLink className="text-sm" href="/rhythm" replace size="sm" transitionTypes={NAV_TAB} variant="glass">
        Посмотреть график <ArrowRightIcon className="size-[18px] transition-transform group-hover:translate-x-0.5" />
      </ButtonLink>
    </section>
  );
}

function MiniWave({ days, period }: { days: number; period: number }) {
  const path = useMemo(() => {
    const points: string[] = [];
    for (let x = 0; x <= 68; x += 2) {
      const value = Math.sin((x / 68) * Math.PI * 1.6 + (days * 2 * Math.PI) / period);
      points.push(`${x === 0 ? "M" : "L"}${x},${(18 - value * 12).toFixed(1)}`);
    }
    return points.join("");
  }, [days, period]);

  return (
    <svg aria-hidden className="mt-1 block h-[25px] w-full opacity-65" viewBox="0 0 68 36">
      <line stroke="currentColor" strokeOpacity={0.15} x1="0" x2="68" y1="18" y2="18" />
      <path className="animate-reveal [stroke-dasharray:1] [stroke-dashoffset:1]" d={path} fill="none" pathLength={1} stroke="currentColor" strokeWidth={1.7} />
    </svg>
  );
}

export function CycleCards() {
  const { birth, today, values } = useTodayValues();
  const days = birth ? daysSince(birth, today) : 0;

  return (
    <div className="my-4 grid grid-cols-3 gap-2.5 max-[360px]:gap-2">
      {values.map((cycle) => {
        const { icon: Icon, text } = CYCLE_STYLE[cycle.id];
        return (
          <Link
            aria-label={`${cycle.name} цикл: ${formatPercent(cycle.value)}. Открыть график`}
            className={cn(
              "min-h-32 min-w-0 rounded-[22px] border border-line bg-surface px-3 py-[15px] transition-[translate,scale,background-color] duration-200 ease-soft hover:-translate-y-0.5 hover:bg-surface-strong active:scale-[.975] max-[360px]:px-2.5",
              text
            )}
            href="/rhythm"
            key={cycle.id}
            replace
            transitionTypes={NAV_TAB}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap text-muted text-xs max-[360px]:text-[11px]">
              <Icon className={cn("size-[15px]", text)} />
              {cycle.short}
            </span>
            <strong className="mt-[15px] block font-medium text-[31px] tabular-nums leading-none tracking-[-0.055em] max-[360px]:text-[28px]">
              <CountUp format={formatPercent} id={`cycle-${cycle.id}`} value={cycle.value} />
            </strong>
            <MiniWave days={days} period={cycle.period} />
          </Link>
        );
      })}
    </div>
  );
}
