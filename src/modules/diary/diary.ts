import { toDateKey } from "@/lib/date";
import type { MoodId } from "@/modules/session/state";
import { updateState } from "@/modules/session/store";

export const MOODS: { id: MoodId; label: string }[] = [
  { id: 1, label: "Грусть" },
  { id: 2, label: "Усталость" },
  { id: 3, label: "Нейтрально" },
  { id: 4, label: "Спокойствие" },
  { id: 5, label: "Радость" },
];

export const NOTE_LIMIT = 2000;

export function findMood(id: number | undefined) {
  return MOODS.find((mood) => mood.id === id);
}

export function setMood(id: MoodId) {
  updateState((state) => ({
    ...state,
    journal: { ...state.journal, moods: { ...state.journal.moods, [toDateKey()]: id } },
  }));
}

export function saveNote(text: string) {
  updateState((state) => ({
    ...state,
    journal: { ...state.journal, notes: { ...state.journal.notes, [toDateKey()]: text.slice(0, NOTE_LIMIT) } },
  }));
}
