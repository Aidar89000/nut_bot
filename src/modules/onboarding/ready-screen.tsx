"use client";

import { cn } from "cn";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Screen } from "@/modules/shell/screen";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { Logo, LogoMark } from "@/ui/logo";
import { HOME_ROUTE } from "./progress";

const STEPS = ["Данные сохранены", "Анкета заполнена", "Добро пожаловать в greeful"];
const STEP_MS = 650;

export function ReadyScreen() {
  const router = useRouter();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) => window.setTimeout(() => setDone(i + 1), STEP_MS * (i + 0.3)));
    timers.push(window.setTimeout(() => router.replace(HOME_ROUTE, { transitionTypes: NAV_FORWARD }), STEP_MS * 3.2));
    return () => timers.forEach(window.clearTimeout);
  }, [router]);

  return (
    <Screen className="flex min-h-(--app-height) flex-col items-center justify-center text-center">
      <Logo className="mb-16" />
      <div
        aria-hidden
        className="tone-meadow mb-11 grid size-40 animate-breathe place-items-center rounded-full shadow-[0_0_0_14px_rgb(46_123_87/0.04),0_0_0_32px_rgb(46_123_87/0.03)]"
      >
        <LogoMark className="size-14 text-brand-700 dark:text-brand-100" />
      </div>
      <h1 className="font-medium text-[34px] leading-[1.15] tracking-[-0.055em]">
        Ваше пространство
        <br />
        почти готово.
      </h1>
      <ul aria-live="polite" className="mt-9 grid w-full max-w-[255px] gap-3.5 text-left">
        {STEPS.map((label, i) => {
          const complete = i < done;
          return (
            <li
              className={cn(
                "flex items-center gap-3 text-xs transition-colors duration-300",
                complete ? "text-ink" : "text-muted/70"
              )}
              key={label}
            >
              <CheckIcon
                className={cn(
                  "size-[18px] transition-[opacity,transform] duration-300",
                  complete ? "scale-100 text-accent opacity-100" : "scale-80 opacity-30"
                )}
              />
              {label}
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
