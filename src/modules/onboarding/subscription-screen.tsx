"use client";

import { MailIcon } from "lucide-react";
import { Screen } from "@/modules/shell/screen";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { useAppState } from "@/modules/session/store";
import { ButtonLink } from "@/ui/button";
import { Logo } from "@/ui/logo";
import { Eyebrow } from "@/ui/text";
import { STEP_ROUTES } from "./progress";

export function SubscriptionScreen() {
  const email = useAppState((state) => state.access.email);

  return (
    <Screen className="flex min-h-(--app-height) flex-col">
      <Logo className="text-[21px] [&_svg]:size-[27px]" />

      <div className="my-auto py-9 text-center">
        <div
          aria-hidden
          className="relative isolate mx-auto mt-2.5 mb-11 grid size-45 place-items-center before:absolute before:-inset-3.5 before:rounded-full before:border before:border-accent/15 before:content-[''] after:absolute after:-inset-7.5 after:rounded-full after:border after:border-accent/8 after:content-['']"
        >
          <div className="tone-meadow grid size-[154px] animate-pop-in place-items-center rounded-full shadow-[0_15px_35px_rgb(31_79_58/0.18)]">
            <svg
              className="size-16 fill-none stroke-current"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.4}
              viewBox="0 0 64 64"
            >
              <path className="animate-draw [stroke-dasharray:65] [stroke-dashoffset:65]" d="m15 33 11 11 24-26" />
            </svg>
          </div>
        </div>
        <Eyebrow className="mb-3 text-accent">Добро пожаловать</Eyebrow>
        <h1 className="font-medium text-[36px] leading-[1.13] tracking-[-0.055em]">
          Подписка
          <br />
          действительна.
        </h1>
        <div className="mt-7 flex items-center gap-3 rounded-[20px] border border-line bg-surface px-5 py-4 text-left">
          <MailIcon className="size-[22px] text-accent" />
          <strong className="min-w-0 font-medium text-[13px] [overflow-wrap:anywhere]">{email}</strong>
        </div>
      </div>

      <ButtonLink full href={STEP_ROUTES.about} transitionTypes={NAV_FORWARD}>
        Продолжить
      </ButtonLink>
    </Screen>
  );
}
