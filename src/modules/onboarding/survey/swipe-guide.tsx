import { cn } from "cn";
import { ArrowLeftIcon, ArrowRightIcon, LeafIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/ui/button";
import { Eyebrow } from "@/ui/text";

// Короткое обучение: карточка сама «свайпается» туда-обратно, рука показывает жест.
export function SwipeGuide({
  header,
  resume,
  onStart,
}: {
  header: ReactNode;
  resume: boolean;
  onStart: () => void;
}) {
  return (
    <section aria-labelledby="swipe-guide-title" className="mx-auto max-w-[420px]">
      {header}
      <Eyebrow className="mt-2">Как отвечать</Eyebrow>
      <h1
        className="mt-3 mb-3.5 font-medium text-[43px] leading-[1.06] tracking-[-0.055em] max-[360px]:text-[38px]"
        id="swipe-guide-title"
      >
        Один жест.
        <br />
        Один ответ.
      </h1>
      <p className="text-[15px] text-muted leading-relaxed">Потяните карточку в сторону ответа.</p>

      <div aria-hidden className="relative isolate -mx-1 my-3.5 grid h-[246px] place-items-center overflow-hidden">
        <div className="absolute h-[194px] w-[177px] translate-y-1 -rotate-6 rounded-3xl border border-line bg-surface-strong" />
        <div className="guide-card tone-meadow relative h-[194px] w-[177px] overflow-hidden rounded-3xl p-[18px] shadow-[0_20px_40px_rgb(13_35_25/0.2)]">
          <span className="font-semibold text-xs tracking-[-0.04em]">greeful</span>
          <span className="absolute top-[49px] right-6 grid size-[49px] place-items-center rounded-full bg-white/50">
            <LeafIcon className="size-[23px]" />
          </span>
          <span className="absolute bottom-[21px] left-[18px] font-medium text-[26px] leading-[1.06] tracking-[-0.04em]">
            Чуть ближе
            <br />к себе.
          </span>
          <span className="guide-stamp guide-stamp-no">НЕТ</span>
          <span className="guide-stamp guide-stamp-yes">ДА</span>
        </div>
        <svg className="guide-hand" fill="none" viewBox="0 0 40 46">
          <path
            d="M12 25V9a3 3 0 0 1 6 0v13-5a3 3 0 0 1 6 0v6-3a3 3 0 0 1 6 0v5-2a3 3 0 0 1 6 0v8c0 8-5 12-12 12h-3c-5 0-8-3-11-7L4 28a3 3 0 0 1 5-4l3 3"
            fill="currentColor"
            fillOpacity=".1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
          />
        </svg>
      </div>

      <div className="mb-6 grid grid-cols-[1fr_1px_1fr] items-center">
        <Direction className="guide-direction-no text-danger" hint="Влево" icon={<ArrowLeftIcon />} label="Нет" />
        <span aria-hidden className="h-8 bg-line" />
        <Direction className="guide-direction-yes text-accent" hint="Вправо" icon={<ArrowRightIcon />} label="Да" />
      </div>

      <Button full onClick={onStart}>
        {resume ? "Продолжить анкету" : "Начать анкету"}
      </Button>
      <p className="mt-4 text-center text-[13px] text-muted">Можно отвечать и кнопками.</p>
    </section>
  );
}

function Direction({ className, icon, label, hint }: { className: string; icon: ReactNode; label: string; hint: string }) {
  return (
    <div className={cn("grid grid-cols-[23px_auto] items-center justify-center gap-x-2.5 rounded-[18px] px-1.5 py-3", className)}>
      <span aria-hidden className="row-span-2 [&_svg]:size-[22px]">
        {icon}
      </span>
      <strong className="font-medium text-lg leading-tight">{label}</strong>
      <small className="text-muted text-xs">{hint}</small>
    </div>
  );
}
