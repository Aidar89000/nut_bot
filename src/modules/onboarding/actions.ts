import type { Answer, AppState } from "@/modules/session/state";
import { updateState } from "@/modules/session/store";

export function confirmAccess(email: string) {
  updateState((state) => ({ ...state, access: { email, confirmed: true } }));
}

export function saveProfile(profile: AppState["profile"], email?: string) {
  updateState((state) => ({
    ...state,
    profile,
    access: email ? { ...state.access, email } : state.access,
  }));
}

export function answerQuestion(id: string, answer: Answer) {
  updateState((state) => ({
    ...state,
    survey: { ...state.survey, answers: { ...state.survey.answers, [id]: answer } },
  }));
}

export function rememberSurveyIndex(index: number) {
  updateState((state) => ({ ...state, survey: { ...state.survey, index } }));
}

export function markSurveyIntroSeen() {
  updateState((state) => ({ ...state, survey: { ...state.survey, introSeen: true } }));
}

export function completeSurvey() {
  updateState((state) => ({ ...state, survey: { ...state.survey, completed: true, index: 0 } }));
}
