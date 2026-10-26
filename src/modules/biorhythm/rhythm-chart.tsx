"use client";

import { type PointerEvent, useMemo, useRef } from "react";
import { daysInMonth } from "@/lib/date";
import { useElementWidth } from "@/lib/use-element-width";
import { CYCLE_STYLE } from "./cycle-style";
import { CYCLES, cycleAt, daysSince } from "./math";

const HEIGHT = 224;
const PAD = { left: 35, right: 18, top: 18, bottom: 30 };
const GRID = [100, 50, 0, -50, -100];
const SAMPLES_PER_DAY = 6;

export function RhythmChart({
  birth,
  year,
  month,
  selectedDay,
  onSelectDay,
}: {
  birth: Date | null;
  year: number;
  month: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const width = useElementWidth(wrapper);
  const days = daysInMonth(year, month);
  const plotWidth = Math.max(0, width - PAD.left - PAD.right);
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const x = (day: number) => PAD.left + ((day - 1) / (days - 1)) * plotWidth;
  const y = (value: number) => PAD.top + ((100 - value) / 200) * plotHeight;
  const start = birth ? daysSince(birth, new Date(year, month, 1, 12)) : 0;
  const valueAt = (day: number, period: number) => (birth ? cycleAt(start + day - 1, period) : 0);

  // Кривые зависят только от месяца и ширины — при перетаскивании дня не пересчитываются.
  const paths = useMemo(() => {
    const steps = days * SAMPLES_PER_DAY;
    return CYCLES.map((cycle) => {
      const points: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const day = 1 + (i / steps) * (days - 1);
        const value = birth ? cycleAt(start + day - 1, cycle.period) : 0;
        const px = PAD.left + ((day - 1) / (days - 1)) * plotWidth;
        const py = PAD.top + ((100 - value) / 200) * plotHeight;
        points.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
      }
      return { id: cycle.id, d: points.join("") };
    });
  }, [birth, start, days, plotWidth, plotHeight]);

  function selectAt(event: PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left - PAD.left) / plotWidth;
    onSelectDay(Math.min(days, Math.max(1, Math.round(ratio * (days - 1)) + 1)));
  }

  const ticks = [1, Math.round(days / 4), Math.round(days / 2), Math.round((days * 3) / 4), days];

  return (
    <div className="my-4 h-56 w-full" ref={wrapper}>
      {width > 0 && (
        <svg
          aria-label="График трёх циклов от −100 до +100%. Значения выбранного дня — ниже."
          className="block cursor-crosshair touch-pan-y select-none"
          height={HEIGHT}
          onPointerDown={selectAt}
          onPointerMove={(event) => event.buttons === 1 && selectAt(event)}
          role="img"
          width={width}
        >
          <g className="fill-muted text-[10px]">
            {GRID.map((value) => (
              <g key={value}>
                <line
                  className={value === 0 ? "stroke-line-strong" : "stroke-line"}
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(value)}
                  y2={y(value)}
                />
                <text dominantBaseline="middle" textAnchor="end" x={PAD.left - 9} y={y(value)}>
                  {value > 0 ? `+${value}` : value}
                </text>
              </g>
            ))}
            {ticks.map((day) => (
              <text key={day} textAnchor="middle" x={x(day)} y={HEIGHT - 7}>
                {day}
              </text>
            ))}
          </g>

          <g fill="none" key={`${year}-${month}`} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4}>
            {paths.map((path) => (
              <path
                className="animate-reveal [stroke-dasharray:1] [stroke-dashoffset:1]"
                d={path.d}
                key={path.id}
                pathLength={1}
                stroke={CYCLE_STYLE[path.id].color}
              />
            ))}
          </g>

          {/* Маркер дня двигается через transform — браузер плавно его анимирует. */}
          <line
            className="stroke-muted/60 transition-transform duration-200 ease-soft"
            strokeDasharray="3 5"
            style={{ transform: `translateX(${x(selectedDay)}px)` }}
            x1={0}
            x2={0}
            y1={PAD.top}
            y2={PAD.top + plotHeight}
          />
          {CYCLES.map((cycle) => (
            <circle
              className="stroke-canvas transition-transform duration-200 ease-soft"
              fill={CYCLE_STYLE[cycle.id].color}
              key={cycle.id}
              r={4.4}
              strokeWidth={2}
              style={{ transform: `translate(${x(selectedDay)}px, ${y(valueAt(selectedDay, cycle.period))}px)` }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
