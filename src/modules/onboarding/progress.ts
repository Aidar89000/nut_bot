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

// Тестовая версия: шаги «Почта» и «Подписка» пропускаются, вход без проверки.
// Вернуть проверку подписки по почте — true.
export const REQUIRE_SUBSCRIPTION = false;

// Куда ведёт «Начать» на приветствии.
export const AFTER_WELCOME_ROUTE = REQUIRE_SUBSCRIPTION ? STEP_ROUTES.access : STEP_ROUTES.about;

const hasAccess = (state: AppState) => !REQUIRE_SUBSCRIPTION || state.access.confirmed;

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
  return hasAccess(state) && isProfileComplete(state) && isSurveyComplete(state);
}

// Куда отправить пользователя, открывшего приложение.
export function entryRoute(state: AppState): string {
  if (!hasAccess(state)) return STEP_ROUTES.welcome;
  // Без проверки подписки приветствие — последний экран перед анкетой данных.
  if (!isProfileComplete(state)) return REQUIRE_SUBSCRIPTION ? STEP_ROUTES.about : STEP_ROUTES.welcome;
  if (!isSurveyComplete(state)) return STEP_ROUTES.survey;
  return HOME_ROUTE;
}

// Куда перенаправить с шага, на который ещё рано (или уже поздно); null — шаг доступен.
// Пройденный шаг ведёт к следующему экрану, а не в конец, — иначе экраны
// «Подписка действительна» и «Почти готово» проскакивали бы.
export function stepRedirect(state: AppState, step: OnboardingStep): string | null {
  const onboarded = isOnboarded(state);
  // Экраны «Почта» и «Подписка» без проверки подписки недоступны.
  if (!REQUIRE_SUBSCRIPTION && (step === "access" || step === "subscription")) {
    return onboarded ? HOME_ROUTE : STEP_ROUTES.about;
  }
  switch (step) {
    case "welcome":
    case "access":
      if (onboarded) return HOME_ROUTE;
      return REQUIRE_SUBSCRIPTION && state.access.confirmed ? STEP_ROUTES.subscription : null;
    case "subscription":
    case "about":
      if (onboarded) return HOME_ROUTE;
      return hasAccess(state) ? null : STEP_ROUTES.welcome;
    case "survey":
      if (onboarded) return STEP_ROUTES.ready;
      return isProfileComplete(state) ? null : entryRoute(state);
    case "ready":
      return onboarded ? null : entryRoute(state);
  }
}
