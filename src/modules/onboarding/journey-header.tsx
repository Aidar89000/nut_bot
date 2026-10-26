"use client";

import { cn } from "cn";
import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useBack } from "@/modules/shell/use-back";
import { IconButton } from "@/ui/icon-button";
import { Logo } from "@/ui/logo";
import { REQUIRE_SUBSCRIPTION } from "./progress";

const STEPS = REQUIRE_SUBSCRIPTION ? ["Почта", "Данные", "Анкета"] : ["Данные", "Анкета"];
// Номера шагов у экранов считаются с «Почты»; без неё сдвигаем.
const STEP_OFFSET = REQUIRE_SUBSCRIPTION ? 0 : 1;

export function JourneyHeader({
  back,
  step,
  aside,
}: {
  back: string | null;
  // Номер шага 1–3; без него — режим редактирования из профиля.
  step?: number;
  aside?: ReactNode;
}) {
  const { goBack, showInlineBack } = useBack(back);
  const position = step ? step - STEP_OFFSET : 0;

  return (
    <>
      <div className="mb-7 flex min-h-11 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showInlineBack && (
            <IconButton label="Назад" onClick={goBack}>
              <ChevronLeftIcon />
            </IconButton>
          )}
          <Logo className="text-[21px] [&_svg]:size-[27px]" />
        </div>
        {aside}
      </div>
      {position > 0 && (
        <ol aria-label={`Шаг ${position} из ${STEPS.length}`} className="mb-7 flex gap-2">
          {STEPS.map((label, i) => {
            const state = i + 1 === position ? "current" : i + 1 < position ? "done" : "todo";
            return (
              <li
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-2 text-[10px] before:h-[3px] before:w-full before:rounded-full before:content-['']",
                  state === "current" && "text-accent before:bg-accent",
                  state === "done" && "text-muted before:bg-accent/45",
                  state === "todo" && "text-muted/70 before:bg-line-strong"
                )}
                key={label}
              >
                {String(i + 1).padStart(2, "0")} · {label}
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
