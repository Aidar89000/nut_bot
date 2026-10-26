"use client";

import { SparkleIcon } from "lucide-react";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { useSessionUser } from "@/modules/telegram/provider";
import { Avatar } from "@/ui/avatar";
import { ButtonLink } from "@/ui/button";
import { Logo } from "@/ui/logo";
import { Orb } from "@/ui/orb";
import { Eyebrow } from "@/ui/text";
import { AFTER_WELCOME_ROUTE } from "./progress";

export function WelcomeScreen() {
  const user = useSessionUser();

  return (
    <main className="stagger flex min-h-(--app-height) flex-col px-[23px] pt-[calc(24px+var(--safe-top))] pb-[calc(26px+var(--safe-bottom))] max-[360px]:px-5">
      <Logo />

      <section className="tone-forest group relative isolate my-7 flex min-h-[225px] flex-1 flex-col justify-between gap-14 overflow-hidden rounded-[32px] p-[22px] min-[481px]:min-h-[250px] min-[481px]:flex-none">
        <Orb core="size-45 top-9 right-2 animate-float" rings="size-75 -top-23 -right-30" />
        <Eyebrow className="flex items-center gap-2 text-(--tone-muted)">
          <SparkleIcon className="size-[18px]" />
          Пространство для себя
        </Eyebrow>
        <div className="flex items-center gap-3.5">
          <Avatar className="size-14 border-white/30 text-xl" name={user.firstName} src={user.avatarUrl} />
          <p className="font-medium text-[26px] leading-[1.1] tracking-[-0.04em]">Привет, {user.firstName}</p>
        </div>
      </section>

      <h1 className="mb-5 font-medium text-[46px] leading-[1.02] tracking-[-0.065em] max-[360px]:text-[42px] min-[481px]:text-[51px]">
        Твой день.
        <br />
        Твой ритм.
        <br />
        <em className="font-normal font-serif text-accent">Твой баланс.</em>
      </h1>
      <p className="max-w-[320px] text-[15px] text-muted leading-relaxed">
        Личный дневник, материалы и календарь — в одном спокойном пространстве.
      </p>
      <ButtonLink className="mt-6" full href={AFTER_WELCOME_ROUTE} transitionTypes={NAV_FORWARD}>
        Начать
      </ButtonLink>
    </main>
  );
}
