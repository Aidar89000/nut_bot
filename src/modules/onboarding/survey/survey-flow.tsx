"use client";

import { cn } from "cn";
import { CheckIcon, InfoIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { Answer } from "@/modules/session/state";
import { useAppState } from "@/modules/session/store";
import { Screen } from "@/modules/shell/screen";
import { haptic } from "@/modules/telegram/sdk";
import { Progress } from "@/ui/progress";
import { Eyebrow } from "@/ui/text";
import { answerQuestion, completeSurvey, markSurveyIntroSeen, rememberSurveyIndex } from "../actions";
import { JourneyHeader } from "../journey-header";
import { countAnswered, STEP_ROUTES } from "../progress";
import { SURVEY_QUESTIONS, SURVEY_SECTIONS } from "./questions";
import { SwipeCard, type SwipeCardHandle } from "./swipe-card";
import { SwipeGuide } from "./swipe-guide";

const LAST = SURVEY_QUESTIONS.length - 1;
// Карточка успевает улететь, прежде чем появится следующая.
const FLING_MS = 280;

const CHOICES: { value: Answer; label: string; hint: string }[] = [
  { value: "no", label: "Нет", hint: "Влево" },
  { value: "yes", label: "Да", hint: "Вправо" },
];

export function OnboardingSurvey() {
  return <SurveyFlow back={STEP_ROUTES.about} mode="onboarding" />;
}

// Анкета-колода: свайп вправо — «Да», влево — «Нет», следующий вопрос
// появляется сам. В онбординге продолжается с места остановки (дальше
// переведёт обёртка шага), из профиля открывается с начала.
export function SurveyFlow({
  mode,
  back,
  onFinish,
}: {
  mode: "onboarding" | "edit";
  back: string;
  onFinish?: () => void;
}) {
  const resumable = mode === "onboarding";
  const answers = useAppState((state) => state.survey.answers);
  const answered = useAppState(countAnswered);
  const savedIndex = useAppState((state) => state.survey.index);
  const introSeen = useAppState((state) => state.survey.introSeen);
  const [index, setIndex] = useState(() => (resumable ? Math.min(savedIndex, LAST) : 0));
  const [guideOpen, setGuideOpen] = useState(!introSeen);
  const [leaving, setLeaving] = useState(false);
  const card = useRef<SwipeCardHandle>(null);
  const timer = useRef(0);

  const question = SURVEY_QUESTIONS[index];
  const section = SURVEY_SECTIONS[question.section];
  const SectionIcon = section.icon;
  const current = answers[question.id];
  const header = <JourneyHeader back={back} step={resumable ? 3 : undefined} />;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function goTo(next: number) {
    setIndex(next);
    if (resumable) rememberSurveyIndex(next);
  }

  function answer(value: Answer) {
    if (leaving || guideOpen) return;
    setLeaving(true);
    haptic.impact("light");
    answerQuestion(question.id, value);
    card.current?.fling(value);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => {
      setLeaving(false);
      if (index < LAST) return goTo(index + 1);
      // Последний вопрос, но какие-то пропущены — возвращаемся к первому пропущенному.
      const missing = SURVEY_QUESTIONS.findIndex((item) => item.id !== question.id && !answers[item.id]);
      if (missing >= 0) return goTo(missing);
      haptic.notify("success");
      completeSurvey();
      onFinish?.();
    }, reduced ? 90 : FLING_MS);
  }

  const onArrow = useEffectEvent((event: KeyboardEvent) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest("input, textarea, select, dialog")) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    answer(event.key === "ArrowRight" ? "yes" : "no");
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onArrow(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  if (guideOpen) {
    return (
      <Screen>
        <SwipeGuide
          header={header}
          onStart={() => {
            setGuideOpen(false);
            if (!introSeen) markSurveyIntroSeen();
          }}
          resume={answered > 0}
        />
      </Screen>
    );
  }

  return (
    <Screen className="overflow-x-clip">
      {header}

      <div className="mb-3.5 flex items-center justify-between gap-3">
        <Eyebrow>Анкета</Eyebrow>
        <span className="text-accent text-xs tabular-nums">
          {answered} из {SURVEY_QUESTIONS.length}
        </span>
      </div>
      <Progress className="mb-5 h-1" label="Прогресс анкеты" max={SURVEY_QUESTIONS.length} value={answered} />

      <div className="mb-4 flex min-h-[50px] items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-accent-soft text-accent">
          <SectionIcon className="size-5" />
        </span>
        <div>
          <h1 className="font-medium text-2xl leading-[1.12] tracking-[-0.04em] max-[360px]:text-[22px]">
            {section.title}
          </h1>
          <p className="mt-1 text-muted text-xs">
            Раздел {question.section + 1} из {SURVEY_SECTIONS.length}
          </p>
        </div>
      </div>

      <p className="sr-only" id="swipe-instructions">
        Свайп вправо — «Да», влево — «Нет». Можно нажать кнопку ответа или стрелку на клавиатуре.
      </p>
      <div className="relative isolate mx-0.5 pb-[17px]">
        <div aria-hidden className="deck-sheet deck-sheet-back" />
        <div aria-hidden className="deck-sheet deck-sheet-front" />
        <SwipeCard disabled={leaving} index={index} key={question.id} onSwipe={answer} question={question} ref={card} />
      </div>

      <div aria-labelledby="survey-question" className="mt-5 mb-3 flex justify-center gap-11 max-[360px]:gap-8" role="group">
        {CHOICES.map(({ value, label, hint }) => {
          const Icon = value === "yes" ? CheckIcon : XIcon;
          return (
            <button
              aria-label={`Ответить «${label}»`}
              aria-pressed={current === value}
              className={cn(
                "group/choice flex min-h-16 items-center gap-3 rounded-full text-left transition-opacity disabled:opacity-45",
                value === "yes" ? "text-accent" : "text-danger"
              )}
              disabled={leaving}
              key={value}
              onClick={() => answer(value)}
              type="button"
            >
              <span
                className={cn(
                  "grid size-[60px] place-items-center rounded-full border border-current/40 transition-[translate,scale,rotate,background-color,box-shadow] duration-200 group-active/choice:scale-90 max-[360px]:size-[54px]",
                  current === value ? "bg-current/15 shadow-[0_0_0_4px_color-mix(in_oklab,currentColor_10%,transparent)]" : "bg-current/5"
                )}
              >
                <Icon className="size-[26px]" strokeWidth={1.8} />
              </span>
              <span className="font-medium text-lg text-ink leading-tight">
                {label}
                <small className="mt-0.5 block font-normal text-muted text-xs">{hint}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 border-line border-t pt-2">
        <button
          className="inline-flex min-h-11 items-center gap-2 text-muted text-sm transition-opacity disabled:opacity-30"
          disabled={index === 0 || leaving}
          onClick={() => goTo(index - 1)}
          type="button"
        >
          <RotateCcwIcon className="size-4" />
          Предыдущий вопрос
        </button>
        <button
          className="inline-flex min-h-11 items-center gap-2 text-muted text-sm"
          onClick={() => setGuideOpen(true)}
          type="button"
        >
          <InfoIcon className="size-4" />
          Как отвечать
        </button>
      </div>
    </Screen>
  );
}
