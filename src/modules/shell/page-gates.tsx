"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, ViewTransition } from "react";
import {
  entryRoute,
  isOnboarded,
  type OnboardingStep,
  stepRedirect,
} from "@/modules/onboarding/progress";
import { SessionGate } from "@/modules/session/session-gate";
import type { AppState } from "@/modules/session/state";
import { useAppState } from "@/modules/session/store";
import { Splash } from "./screen";
import { NAV_FORWARD } from "./transitions";

// Обёртки страниц. Стоят внутри page.tsx, а не в layout: сегмент страницы
// всегда рендерится на сервере (иначе Next не проверит instant-навигацию),
// а <ViewTransition> в layout не получил бы enter/exit при переходах.

const SLIDES = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "nav-tab": "nav-tab",
  default: "none",
};

function Guarded({
  resolve,
  transitionTypes,
  children,
}: {
  resolve: (state: AppState) => string | null;
  transitionTypes?: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  const target = useAppState(resolve);

  useEffect(() => {
    if (target) router.replace(target, { transitionTypes });
  }, [router, target, transitionTypes]);

  if (target) return <Splash />;
  return (
    <ViewTransition default="none" enter={SLIDES} exit={SLIDES}>
      {children}
    </ViewTransition>
  );
}

// Шаг онбординга: пройденный ведёт дальше, ранний — назад к нужному шагу.
export function OnboardingPage({ step, children }: { step: OnboardingStep; children: ReactNode }) {
  return (
    <SessionGate>
      <Guarded resolve={(state) => stepRedirect(state, step)} transitionTypes={NAV_FORWARD}>
        {children}
      </Guarded>
    </SessionGate>
  );
}

const unlessOnboarded = (state: AppState) => (isOnboarded(state) ? null : entryRoute(state));

// Основные экраны — только после онбординга.
export function AppPage({ children }: { children: ReactNode }) {
  return (
    <SessionGate>
      <Guarded resolve={unlessOnboarded}>{children}</Guarded>
    </SessionGate>
  );
}

// Точка входа: отправляет на нужный шаг онбординга или на главную.
export function EntryPage() {
  return (
    <SessionGate>
      <Guarded resolve={entryRoute}>{null}</Guarded>
    </SessionGate>
  );
}
