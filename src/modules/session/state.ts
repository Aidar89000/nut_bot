import { isDateKey } from "@/lib/date";

// Всё, что приложение помнит о пользователе. Данные из хранилища проверяются
// полем за полем: испорченное поле откатывается к значению по умолчанию.
// Без zod — этот код едет в клиентский бандл.

export type Answer = "yes" | "no";
export type MoodId = 1 | 2 | 3 | 4 | 5;

export type AppState = {
  access: { email: string; confirmed: boolean };
  profile: { name: string; birth: string; city: string };
  survey: { answers: Record<string, Answer>; index: number; completed: boolean; introSeen: boolean };
  journal: { moods: Record<string, MoodId>; notes: Record<string, string> };
  prefs: { reminders: boolean; dismissedReminder: string };
};

type Input = Record<string, unknown>;

const record = (value: unknown): Input =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Input) : {};

const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

const flag = (value: unknown) => value === true;

function entries<T>(value: unknown, pick: (item: unknown) => T | undefined, isKey: (key: string) => boolean) {
  const result: Record<string, T> = {};
  for (const [key, item] of Object.entries(record(value))) {
    const picked = pick(item);
    if (picked !== undefined && isKey(key)) result[key] = picked;
  }
  return result;
}

const anyKey = () => true;

const answer = (value: unknown) => (value === "yes" || value === "no" ? value : undefined);

const mood = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5 ? (value as MoodId) : undefined;

const note = (value: unknown) => (typeof value === "string" ? value.slice(0, 2000) : undefined);

export function parseState(input: unknown): AppState {
  const root = record(input);
  const access = record(root.access);
  const profile = record(root.profile);
  const survey = record(root.survey);
  const journal = record(root.journal);
  const prefs = record(root.prefs);
  const index = survey.index;

  return {
    access: { email: text(access.email, 254), confirmed: flag(access.confirmed) },
    profile: { name: text(profile.name, 50), birth: text(profile.birth, 10), city: text(profile.city, 70) },
    survey: {
      answers: entries(survey.answers, answer, anyKey),
      index: typeof index === "number" && Number.isInteger(index) && index >= 0 ? index : 0,
      completed: flag(survey.completed),
      introSeen: flag(survey.introSeen),
    },
    journal: {
      moods: entries(journal.moods, mood, isDateKey),
      notes: entries(journal.notes, note, isDateKey),
    },
    prefs: { reminders: flag(prefs.reminders), dismissedReminder: text(prefs.dismissedReminder, 10) },
  };
}

export function createInitialState(): AppState {
  return parseState({});
}
