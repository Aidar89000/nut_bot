"use client";

import { useRouter } from "next/navigation";
import { ProfileForm } from "@/modules/profile/profile-form";
import { Screen } from "@/modules/shell/screen";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { Eyebrow } from "@/ui/text";
import { JourneyHeader } from "./journey-header";
import { REQUIRE_SUBSCRIPTION, STEP_ROUTES } from "./progress";

export function AboutScreen() {
  const router = useRouter();

  return (
    <Screen>
      <JourneyHeader back={REQUIRE_SUBSCRIPTION ? STEP_ROUTES.subscription : STEP_ROUTES.welcome} step={2} />
      <Eyebrow>Начнём с простого</Eyebrow>
      <h1 className="mt-3 mb-4 font-medium text-[38px] leading-[1.09] tracking-[-0.055em] max-[360px]:text-[34px]">
        Давайте
        <br />
        познакомимся.
      </h1>
      <p className="mb-7 text-base text-muted leading-relaxed">Дата рождения нужна для вашего календаря.</p>
      <ProfileForm
        onSaved={() => router.push(STEP_ROUTES.survey, { transitionTypes: NAV_FORWARD })}
        submitLabel="Перейти к анкете"
      />
    </Screen>
  );
}
