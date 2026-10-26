import { useSyncExternalStore } from "react";
import { readJson, removeKey, writeJson } from "@/lib/storage";
import { type AppState, createInitialState, parseState } from "./state";

// Хранилище состояния. Сейчас — localStorage, ключ на каждого пользователя
// Telegram. Чтобы перейти на сервер, достаточно заменить чтение и запись.

let state: AppState | null = null;
let storageKey: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openStore(userId: number) {
  const key = `greeful:user:${userId}`;
  if (storageKey === key && state) return;
  storageKey = key;

  // Данные из версии под старым названием переезжают на новый ключ.
  const legacyKey = `bioform:user:${userId}`;
  const stored = readJson(key) ?? readJson(legacyKey);
  state = parseState(stored);
  if (readJson(legacyKey) !== null) {
    writeJson(key, state);
    removeKey(legacyKey);
  }
  emit();
}

export function updateState(recipe: (current: AppState) => AppState) {
  if (!state || !storageKey) return;
  state = recipe(state);
  writeJson(storageKey, state);
  emit();
}

export function resetState() {
  if (!storageKey) return;
  removeKey(storageKey);
  state = createInitialState();
  emit();
}

export function useStoreReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state !== null,
    () => false
  );
}

function select<T>(selector: (current: AppState) => T): T {
  if (!state) throw new Error("useAppState вызван до openStore");
  return selector(state);
}

// selector должен возвращать часть состояния или примитив, а не новый объект.
export function useAppState<T>(selector: (current: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(selector),
    () => select(selector)
  );
}

// Для компонентов вне SessionGate (например, навигации в layout): до загрузки — fallback.
export function useOptionalAppState<T>(selector: (current: AppState) => T, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => (state ? selector(state) : fallback),
    () => fallback
  );
}
