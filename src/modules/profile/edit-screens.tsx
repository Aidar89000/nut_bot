"use client";

import { useRouter } from "next/navigation";
import { SurveyFlow } from "@/modules/onboarding/survey/survey-flow";
import { BackBar } from "@/modules/shell/back-bar";
import { Screen } from "@/modules/shell/screen";
import { NAV_BACK } from "@/modules/shell/transitions";
import { PageTitle } from "@/ui/text";
import { useToast } from "@/ui/toast";
import { ProfileForm } from "./profile-form";

const PROFILE_ROUTE = "/profile";

function useReturnToProfile(message: string) {
  const router = useRouter();
  const toast = useToast();
  return () => {
    toast(message);
    router.replace(PROFILE_ROUTE, { transitionTypes: NAV_BACK });
  };
}

export function EditProfileScreen() {
  const done = useReturnToProfile("Данные обновлены");
  return (
    <Screen>
      <BackBar href={PROFILE_ROUTE} title="Профиль" />
      <PageTitle kicker="Личное пространство">Ваши данные.</PageTitle>
      <ProfileForm onSaved={done} submitLabel="Сохранить" withEmail />
    </Screen>
  );
}

export function EditSurveyScreen() {
  const done = useReturnToProfile("Анкета обновлена");
  return <SurveyFlow back={PROFILE_ROUTE} mode="edit" onFinish={done} />;
}
