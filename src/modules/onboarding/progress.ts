import { isValidBirthDate } from "@/lib/date";
import type { AppState } from "@/modules/session/state";
import { SURVEY_QUESTIONS } from "./survey/questions";

export type OnboardingStep = "welcome" | "access" | "subscription" | "about" | "survey" | "ready";

export const STEP_ROUTES: Record<OnboardingStep, string> = {
  welcome: "/onboarding",
  access: "/onboarding/access",
  subscription: "/onboarding/subscription",
  about: "/onboarding/about",
  survey: "/onboarding/survey",
  ready: "/onboarding/ready",
};

export const HOME_ROUTE = "/home";

export function isProfileComplete({ profile }: AppState): boolean {
  return profile.name.trim().length >= 2 && isValidBirthDate(profile.birth);
}

export function countAnswered({ survey }: AppState): number {
  return SURVEY_QUESTIONS.filter((question) => survey.answers[question.id]).length;
}

export function isSurveyComplete(state: AppState): boolean {
  return state.survey.completed && countAnswered(state) === SURVEY_QUESTIONS.length;
}

export function isOnboarded(state: AppState): boolean {
  return state.access.confirmed && isProfileComplete(state) && isSurveyComplete(state);
}

// Куда отправить пользователя, открывшего приложение.
export function entryRoute(state: AppState): string {
  if (!state.access.confirmed) return STEP_ROUTES.welcome;
  if (!isProfileComplete(state)) return STEP_ROUTES.about;
  if (!isSurveyComplete(state)) return STEP_ROUTES.survey;
  return HOME_ROUTE;
}

// Куда перенаправить с шага, на который ещё рано (или уже поздно); null — шаг доступен.
// Пройденный шаг ведёт к следующему экрану, а не в конец, — иначе экраны
// «Подписка действительна» и «Почти готово» проскакивали бы.
export function stepRedirect(state: AppState, step: OnboardingStep): string | null {
  const onboarded = isOnboarded(state);
  switch (step) {
    case "welcome":
    case "access":
      if (onboarded) return HOME_ROUTE;
      return state.access.confirmed ? STEP_ROUTES.subscription : null;
    case "subscription":
    case "about":
      if (onboarded) return HOME_ROUTE;
      return state.access.confirmed ? null : STEP_ROUTES.welcome;
    case "survey":
      if (onboarded) return STEP_ROUTES.ready;
      return isProfileComplete(state) ? null : entryRoute(state);
    case "ready":
      return onboarded ? null : entryRoute(state);
  }
}
