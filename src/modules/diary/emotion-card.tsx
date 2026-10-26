"use client";

import { cn } from "cn";
import { ArrowRightIcon, CalendarIcon, Flower2Icon } from "lucide-react";
import Link from "next/link";
import {
  memo,
  type PointerEvent,
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { formatDate, parseDateKey } from "@/lib/date";
import { useToday } from "@/lib/use-today";
import type { MoodId } from "@/modules/session/state";
import { useAppState } from "@/modules/session/store";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { haptic } from "@/modules/telegram/sdk";
import { MOODS, setMood } from "./diary";
import { MoodSphere } from "./mood-face";

// Девять копий ленты: по инерции можно пролететь далеко и не упереться в край,
// а после остановки лента незаметно перескакивает на ту же эмоцию в средней копии.
const COPIES = 9;
const MIDDLE = Math.floor(COPIES / 2);
const ITEMS = Array.from({ length: COPIES }, (_, copy) => MOODS.map((mood) => ({ copy, mood }))).flat();
const DEFAULT_MOOD: MoodId = 5;
const canonicalIndex = (id: MoodId) => MIDDLE * MOODS.length + MOODS.findIndex((mood) => mood.id === id);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SUPPORTS_SCROLLEND = typeof window !== "undefined" && "onscrollend" in window;

type Carousel = {
  centers: number[];
  width: number;
  step: number;
  frame: number;
  glide: number;
  settleTimer: number;
  clickTimer: number;
  lastLeft: number;
  touching: number;
  userIntent: boolean;
  didScroll: boolean;
  aligned: boolean;
  suppressClick: boolean;
  programmatic: MoodId | null;
  recorded: MoodId;
  preview: MoodId;
  mouse: { id: number; x: number; left: number; moved: boolean; trail: { t: number; x: number }[] } | null;
};

export function EmotionCard({ variant }: { variant: "home" | "diary" }) {
  const today = useToday();
  const saved = useAppState((state) => state.journal.moods[today]);
  const selected = saved ?? DEFAULT_MOOD;
  const [preview, setPreview] = useState<MoodId>(selected);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const statusId = useId();
  const carousel = useRef<Carousel>({
    centers: [],
    width: 0,
    step: 100,
    frame: 0,
    glide: 0,
    settleTimer: 0,
    clickTimer: 0,
    lastLeft: 0,
    touching: 0,
    userIntent: false,
    didScroll: false,
    aligned: false,
    suppressClick: false,
    programmatic: null,
    recorded: selected,
    preview: selected,
    mouse: null,
  });

  // Всё ниже работает с DOM напрямую: масштаб сфер меняется на каждом кадре
  // прокрутки, а React перерисовывается только при смене эмоции в центре.

  function measure() {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    c.width = el.clientWidth;
    c.centers = buttons.current.map((button) => (button ? button.offsetLeft + button.offsetWidth / 2 : 0));
    c.step = c.centers[1] - c.centers[0] || 100;
  }

  function nearest() {
    const el = scroller.current;
    const c = carousel.current;
    const center = (el?.scrollLeft ?? 0) + c.width / 2;
    let index = 0;
    c.centers.forEach((value, i) => {
      if (Math.abs(value - center) < Math.abs(c.centers[index] - center)) index = i;
    });
    return { index, id: ITEMS[index].mood.id };
  }

  function paint() {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    const center = el.scrollLeft + c.width / 2;
    buttons.current.forEach((button, i) => {
      if (!button) return;
      const distance = Math.min(2.25, Math.abs(c.centers[i] - center) / c.step);
      const look = `${(1 - distance * 0.235).toFixed(3)}:${(1 - distance * 0.34).toFixed(3)}`;
      if (button.dataset.look === look) return;
      button.dataset.look = look;
      const [scale, opacity] = look.split(":");
      button.style.setProperty("--emotion-scale", scale);
      button.style.setProperty("--emotion-opacity", opacity);
      button.classList.toggle("is-far", distance > 1.5);
    });
    const { id } = nearest();
    if (c.preview !== id) {
      c.preview = id;
      setPreview(id);
    }
  }

  // Мгновенный перескок без анимации масштаба: иначе сфера в центре
  // на долю секунды «сдувается» и надувается обратно.
  function jumpBy(delta: number) {
    const el = scroller.current;
    const c = carousel.current;
    if (!el || delta === 0) return paint();
    el.classList.add("is-jumping");
    el.scrollLeft += delta;
    c.lastLeft = el.scrollLeft;
    paint();
    requestAnimationFrame(() => el.classList.remove("is-jumping"));
  }

  function jumpTo(index: number) {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    jumpBy(Math.max(0, c.centers[index] - c.width / 2) - el.scrollLeft);
  }

  function record(id: MoodId) {
    const c = carousel.current;
    if (c.recorded === id) return;
    c.recorded = id;
    haptic.selection();
    setMood(id);
  }

  function settle() {
    const el = scroller.current;
    const c = carousel.current;
    if (!el || c.touching || c.mouse || c.glide) return;
    window.clearTimeout(c.settleTimer);
    let closest = nearest();
    // CSS-снапа нет: он останавливал ленту на соседнем лице. Лента летит по инерции
    // сколько хочет, а к центру ближайшего лица её доводим уже после остановки.
    const offset = c.centers[closest.index] - c.width / 2 - el.scrollLeft;
    if (c.userIntent && !c.aligned && Math.abs(offset) > 1) {
      c.aligned = true;
      el.scrollTo({ left: el.scrollLeft + offset, behavior: reducedMotion() ? "auto" : "smooth" });
      scheduleSettle();
      return;
    }
    if (!c.userIntent && c.programmatic && closest.id !== c.programmatic) {
      jumpTo(canonicalIndex(c.programmatic));
      closest = nearest();
    }
    if (c.userIntent && c.didScroll) record(closest.id);
    c.userIntent = false;
    c.programmatic = null;
    c.didScroll = false;
    c.aligned = false;
    // Перескок на ту же эмоцию в средней копии — со сдвигом на целое число
    // копий, поэтому картинка не меняется ни на пиксель.
    jumpBy(c.centers[canonicalIndex(closest.id)] - c.centers[closest.index]);
    el.classList.remove("is-scrolling", "is-mouse-dragging");
    window.clearTimeout(c.clickTimer);
    c.clickTimer = window.setTimeout(() => {
      c.suppressClick = false;
    }, 250);
  }

  // Где есть событие scrollend, остановку ловит оно, а таймер — лишь страховка:
  // короткий таймер срабатывал посреди жеста на тачпаде и дёргал ленту.
  function scheduleSettle() {
    const c = carousel.current;
    window.clearTimeout(c.settleTimer);
    c.settleTimer = window.setTimeout(settle, SUPPORTS_SCROLLEND ? 400 : 170);
  }

  function stopGlide() {
    const c = carousel.current;
    cancelAnimationFrame(c.glide);
    c.glide = 0;
  }

  // Инерция после броска мышью. Точку остановки считаем сразу — ближайшее лицо
  // к тому месту, куда лента долетела бы сама, — и плавно тормозим ровно на нём.
  function glide(velocity: number) {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    const from = el.scrollLeft;
    const projected = from + velocity * 400 + c.width / 2;
    let index = 0;
    c.centers.forEach((value, i) => {
      if (Math.abs(value - projected) < Math.abs(c.centers[index] - projected)) index = i;
    });
    const distance = c.centers[index] - c.width / 2 - from;
    c.aligned = true;
    if (reducedMotion() || Math.abs(distance) < 1) {
      jumpBy(distance);
      return settle();
    }
    // Длительность подобрана так, чтобы начальная скорость совпала со скоростью броска.
    const speed = Math.abs(velocity);
    const duration = speed < 0.2 ? 300 : Math.min(1200, Math.max(300, (3 * Math.abs(distance)) / speed));
    const start = performance.now();
    el.classList.add("is-scrolling");
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.scrollLeft = from + distance * (1 - (1 - t) ** 3);
      paint();
      if (t < 1) {
        c.glide = requestAnimationFrame(frame);
      } else {
        c.glide = 0;
        settle();
      }
    };
    c.glide = requestAnimationFrame(frame);
  }

  function scrollToMood(id: MoodId, { animate = false } = {}) {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    stopGlide();
    // Ближайшая копия нужной эмоции — чтобы лента не уезжала через всю длину.
    const center = el.scrollLeft + c.width / 2;
    let index = canonicalIndex(id);
    if (animate) {
      ITEMS.forEach((item, i) => {
        if (item.mood.id === id && Math.abs(c.centers[i] - center) < Math.abs(c.centers[index] - center)) index = i;
      });
    }
    c.userIntent = false;
    c.programmatic = id;
    c.didScroll = false;
    if (animate && !reducedMotion()) el.scrollTo({ left: c.centers[index] - c.width / 2, behavior: "smooth" });
    else jumpTo(index);
    scheduleSettle();
  }

  function select(id: MoodId) {
    record(id);
    scrollToMood(id, { animate: true });
  }

  function beginIntent() {
    const el = scroller.current;
    const c = carousel.current;
    stopGlide();
    window.clearTimeout(c.settleTimer);
    window.clearTimeout(c.clickTimer);
    c.userIntent = true;
    c.programmatic = null;
    c.didScroll = false;
    c.aligned = false;
    c.suppressClick = false;
    c.lastLeft = el?.scrollLeft ?? 0;
  }

  function onScroll() {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return;
    if (Math.abs(el.scrollLeft - c.lastLeft) > 0.5) {
      el.classList.add("is-scrolling");
      if (c.userIntent) {
        c.didScroll = true;
        c.suppressClick = true;
      }
    }
    c.lastLeft = el.scrollLeft;
    if (!c.frame) {
      c.frame = requestAnimationFrame(() => {
        c.frame = 0;
        paint();
      });
    }
    scheduleSettle();
  }

  const attach = useEffectEvent(() => {
    const el = scroller.current;
    const c = carousel.current;
    if (!el) return () => {};
    measure();
    c.recorded = selected;
    scrollToMood(selected);
    el.dataset.ready = "true";

    const controller = new AbortController();
    const options = { signal: controller.signal, passive: true };
    el.addEventListener("scroll", onScroll, options);
    el.addEventListener("scrollend", settle, options);
    el.addEventListener("touchstart", (event) => {
      beginIntent();
      c.touching = event.touches.length;
    }, options);
    el.addEventListener("touchend", (event) => {
      c.touching = event.touches.length;
      if (!c.touching) scheduleSettle();
    }, options);
    // Отмена касания (например, жест перехватила система) — просто даём ленте
    // доехать: прыжок назад к прежней эмоции посреди прокрутки выглядел рывком.
    el.addEventListener("touchcancel", () => {
      c.touching = 0;
      scheduleSettle();
    }, options);
    el.addEventListener("wheel", (event) => {
      if ((Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) && !c.userIntent) beginIntent();
    }, options);

    const resize = new ResizeObserver(() => {
      measure();
      jumpTo(canonicalIndex(c.recorded));
    });
    resize.observe(el);

    return () => {
      controller.abort();
      resize.disconnect();
      cancelAnimationFrame(c.frame);
      stopGlide();
      window.clearTimeout(c.settleTimer);
      window.clearTimeout(c.clickTimer);
      c.frame = 0;
    };
  });

  // Повторный запуск — и когда Next снова показывает экран (Activity).
  useEffect(() => attach(), []);

  const syncExternal = useEffectEvent((id: MoodId) => {
    if (id !== carousel.current.recorded) {
      carousel.current.recorded = id;
      scrollToMood(id);
    }
  });

  // Отметка изменилась не здесь (другой экран, новый день) — догоняем.
  useEffect(() => syncExternal(selected), [selected]);

  // Перетаскивание мышью (Telegram Desktop): прокрутка своими руками.
  const mouse = {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      beginIntent();
      carousel.current.mouse = {
        id: event.pointerId,
        x: event.clientX,
        left: event.currentTarget.scrollLeft,
        moved: false,
        trail: [{ t: event.timeStamp, x: event.clientX }],
      };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const drag = carousel.current.mouse;
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        event.currentTarget.classList.add("is-mouse-dragging");
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      event.currentTarget.scrollLeft = drag.left - dx;
      // Скорость броска — по последним 100 мс движения.
      drag.trail.push({ t: event.timeStamp, x: event.clientX });
      while (drag.trail.length > 2 && event.timeStamp - drag.trail[0].t > 100) drag.trail.shift();
      onScroll();
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      const c = carousel.current;
      const drag = c.mouse;
      if (!drag || drag.id !== event.pointerId) return;
      c.mouse = null;
      if (!drag.moved) return;
      c.suppressClick = true;
      const first = drag.trail[0];
      const last = drag.trail[drag.trail.length - 1];
      // Мышь остановили перед отпусканием — броска не было.
      const still = event.timeStamp - last.t > 60 || last.t === first.t;
      glide(still ? 0 : -(last.x - first.x) / (last.t - first.t));
    },
  };

  // Стабильные колбэки для мемоизированного списка сфер.
  const selectRef = useRef(select);
  useLayoutEffect(() => {
    selectRef.current = select;
  });
  const onPick = useCallback((id: MoodId) => {
    if (!carousel.current.suppressClick) selectRef.current(id);
  }, []);
  const setButton = useCallback((index: number, button: HTMLButtonElement | null) => {
    buttons.current[index] = button;
  }, []);

  const previewLabel = MOODS.find((mood) => mood.id === preview)?.label;
  const todayDate = parseDateKey(today);

  return (
    <section className="emotion-card" data-tone={preview}>
      <div className="flex items-center justify-between gap-2.5 opacity-80">
        <span className="font-medium text-[11px] uppercase tracking-[0.12em]">Эмоция дня</span>
        <Flower2Icon className="size-[18px]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-2 text-center text-base text-white/75">Как ты сегодня?</h2>
      <div aria-hidden className="mt-2.5 min-h-10 text-center font-medium text-[32px] leading-tight tracking-[-0.04em] max-[360px]:text-[29px]">
        {previewLabel}
      </div>

      <div
        aria-describedby={statusId}
        aria-label="Эмоция на сегодня"
        className="emotion-scroller"
        onKeyDown={(event) => {
          const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
          if (!direction) return;
          event.preventDefault();
          const position = MOODS.findIndex((mood) => mood.id === carousel.current.recorded);
          const next = MOODS[(position + direction + MOODS.length) % MOODS.length];
          select(next.id);
          buttons.current[canonicalIndex(next.id)]?.focus({ preventScroll: true });
        }}
        ref={scroller}
        role="radiogroup"
        {...mouse}
        onPointerCancel={mouse.onPointerUp}
      >
        <span aria-hidden className="emotion-spacer" />
        <EmotionOptions onPick={onPick} saved={saved} selected={selected} setButton={setButton} />
        <span aria-hidden className="emotion-spacer" />
      </div>

      <div aria-hidden className="mb-3.5 flex h-2.5 items-center justify-center gap-1.5">
        {MOODS.map((mood) => (
          <span
            className={cn(
              "h-1 rounded-full transition-[width,background-color] duration-300",
              mood.id === preview ? "w-4 bg-white/80" : "w-1 bg-white/30"
            )}
            key={mood.id}
          />
        ))}
      </div>
      <p className="mx-auto mb-3.5 min-h-[21px] max-w-[285px] text-center text-[13px] text-white/85" id={statusId} role="status">
        {saved ? "Отметка сохранена. Можно изменить." : "Листай или нажми на свою эмоцию."}
      </p>

      <div className="border-white/20 border-t">
        {variant === "home" ? (
          <Link
            className="group flex min-h-[60px] w-full items-center justify-between gap-3 py-4 text-[15px]"
            href="/diary"
            transitionTypes={NAV_FORWARD}
          >
            Запись за сегодня
            <ArrowRightIcon className="size-[18px] transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <span className="flex items-center justify-center gap-2 py-4 text-sm text-white/85">
            <CalendarIcon className="size-[15px]" />
            Сегодня, {todayDate ? formatDate.dayMonth.format(todayDate) : ""}
          </span>
        )}
      </div>
    </section>
  );
}

// Сферы всех копий ленты. Не зависят от эмоции в центре —
// при прокрутке не перерисовываются, масштаб им пишет paint() напрямую.
const EmotionOptions = memo(function EmotionOptions({
  saved,
  selected,
  onPick,
  setButton,
}: {
  saved: MoodId | undefined;
  selected: MoodId;
  onPick: (id: MoodId) => void;
  setButton: (index: number, button: HTMLButtonElement | null) => void;
}) {
  return ITEMS.map(({ copy, mood }, i) => {
    const canonical = copy === MIDDLE;
    return (
      <button
        aria-checked={canonical && saved === mood.id}
        aria-hidden={canonical ? undefined : true}
        aria-label={mood.label}
        className="emotion-option"
        key={`${copy}-${mood.id}`}
        onClick={() => onPick(mood.id)}
        ref={(button) => setButton(i, button)}
        role="radio"
        tabIndex={canonical && mood.id === selected ? 0 : -1}
        type="button"
      >
        <MoodSphere className="emotion-sphere" id={mood.id} />
      </button>
    );
  });
});
