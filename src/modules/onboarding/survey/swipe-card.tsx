"use client";

import { cn } from "cn";
import { type PointerEvent, type Ref, useImperativeHandle, useRef } from "react";
import type { Answer } from "@/modules/session/state";
import { Orb } from "@/ui/orb";
import { SURVEY_QUESTIONS, SURVEY_SECTIONS, type SurveyQuestion } from "./questions";

export type SwipeCardHandle = { fling: (answer: Answer) => void };

type Gesture = {
  id: number;
  startX: number;
  startY: number;
  locked: boolean;
  samples: { x: number; t: number }[];
};

// Порог ответа зависит от ширины карточки: 27% ширины, но 68–112px.
const threshold = (width: number) => Math.max(68, Math.min(112, width * 0.27));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Карточка вопроса. Пока палец тянет карточку, стили меняются напрямую в DOM —
// без перерисовки React на каждый кадр.
export function SwipeCard({
  ref,
  question,
  index,
  disabled,
  onSwipe,
}: {
  ref: Ref<SwipeCardHandle>;
  question: SurveyQuestion;
  index: number;
  disabled: boolean;
  onSwipe: (answer: Answer) => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const section = SURVEY_SECTIONS[question.section];
  const SectionIcon = section.icon;

  function paint(x: number, y: number) {
    const el = card.current;
    if (!el) return;
    const width = el.offsetWidth || 320;
    const progress = Math.min(1, Math.abs(x) / threshold(width));
    const rotate = Math.max(-17, Math.min(17, (x / width) * 18));
    el.style.transform = `translate3d(${x}px, ${Math.max(-28, Math.min(28, y * 0.12))}px, 0) rotate(${rotate}deg)`;
    el.style.setProperty("--swipe-yes", x > 0 ? String(progress) : "0");
    el.style.setProperty("--swipe-no", x < 0 ? String(progress) : "0");
  }

  function reset() {
    const el = card.current;
    if (!el) return;
    el.classList.remove("is-dragging");
    for (const property of ["transform", "--swipe-yes", "--swipe-no"]) el.style.removeProperty(property);
  }

  useImperativeHandle(ref, () => ({
    fling(answer) {
      const el = card.current;
      if (!el) return;
      const direction = answer === "yes" ? 1 : -1;
      el.classList.remove("is-dragging");
      el.classList.add("is-leaving");
      el.style.setProperty("--swipe-yes", answer === "yes" ? "1" : "0");
      el.style.setProperty("--swipe-no", answer === "no" ? "1" : "0");
      el.style.transform = reducedMotion()
        ? "none"
        : `translate3d(${direction * (el.offsetWidth + 90)}px, -12px, 0) rotate(${direction * 18}deg)`;
      el.style.opacity = "0";
    },
  }));

  function cancel(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    reset();
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (!current.locked) return reset();

    const x = event.clientX - current.startX;
    const y = event.clientY - current.startY;
    const first = current.samples[0];
    const elapsed = event.timeStamp - first.t;
    const velocity = elapsed > 0 && elapsed <= 120 ? (event.clientX - first.x) / elapsed : 0;
    const width = event.currentTarget.offsetWidth;
    const farEnough = Math.abs(x) >= threshold(width);
    // Короткий, но быстрый бросок тоже считается ответом.
    const fastEnough = Math.abs(x) >= 42 && Math.abs(velocity) > 0.65 && Math.sign(velocity) === Math.sign(x);

    if (Math.abs(x) > Math.abs(y) * 1.05 && (farEnough || fastEnough)) onSwipe(x > 0 ? "yes" : "no");
    else reset();
  }

  return (
    <div
      aria-describedby="swipe-instructions"
      aria-labelledby="survey-question"
      className={cn(
        section.tone,
        "swipe-card relative isolate z-10 flex min-h-[clamp(265px,38svh,330px)] animate-card-in cursor-grab touch-pan-y select-none flex-col justify-between gap-9 overflow-hidden rounded-[30px] px-[25px] pt-[26px] pb-[29px] shadow-[0_16px_30px_rgb(13_35_25/0.13)] max-[360px]:px-[21px]"
      )}
      onLostPointerCapture={cancel}
      onPointerCancel={cancel}
      onPointerDown={(event) => {
        if (disabled || gesture.current || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
        event.currentTarget.classList.remove("animate-card-in");
        gesture.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          locked: false,
          samples: [{ x: event.clientX, t: event.timeStamp }],
        };
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        const x = event.clientX - current.startX;
        const y = event.clientY - current.startY;
        if (!current.locked) {
          if (Math.max(Math.abs(x), Math.abs(y)) < 9) return;
          // Вертикальный жест — это прокрутка страницы, карточку не трогаем.
          if (Math.abs(y) > Math.abs(x) * 1.12) {
            gesture.current = null;
            return;
          }
          if (Math.abs(x) < Math.abs(y) * 1.05) return;
          current.locked = true;
          event.currentTarget.classList.add("is-dragging");
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
        current.samples = [...current.samples, { x: event.clientX, t: event.timeStamp }].filter(
          (sample) => event.timeStamp - sample.t <= 100
        );
        paint(x, y);
      }}
      onPointerUp={release}
      ref={card}
      role="group"
      tabIndex={0}
    >
      <Orb className="opacity-55" core="size-[90px] top-2.5 right-2.5 opacity-55" rings="-top-40 -right-44" />
      <span aria-hidden className="swipe-wash swipe-wash-no" />
      <span aria-hidden className="swipe-wash swipe-wash-yes" />
      <span aria-hidden className="swipe-stamp stamp-no">
        НЕТ
      </span>
      <span aria-hidden className="swipe-stamp stamp-yes">
        ДА
      </span>

      <div className="relative flex items-center justify-between gap-2.5">
        <span className="font-semibold text-[13px] tracking-[0.1em]">
          {String(index + 1).padStart(2, "0")} / {SURVEY_QUESTIONS.length}
          {question.label && ` · ${question.label}`}
        </span>
        <SectionIcon className="size-5" />
      </div>
      <div className="relative">
        <h2
          className="max-w-[345px] font-medium text-[29px] leading-[1.25] tracking-[-0.035em] max-[360px]:text-[26px]"
          id="survey-question"
        >
          {question.text}
        </h2>
        <p className="mt-3.5 max-w-[290px] text-(--tone-muted) text-[13px] leading-relaxed">{section.hint}</p>
      </div>
      <span aria-hidden className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 opacity-30">
        <i className="size-[3px] rounded-full bg-current" />
        <i className="size-[3px] rounded-full bg-current" />
        <i className="size-[3px] rounded-full bg-current" />
      </span>
    </div>
  );
}
