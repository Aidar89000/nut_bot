import { daysInMonth, formatDate, parseDateKey, toDateKey } from "./date";

// Проверки полей форм. message — подсказка под полем: что не так или что всё верно.
export type Check = { valid: boolean; message: string; empty?: boolean };

export const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ");

export function checkName(value: string): Check {
  const name = normalizeName(value);
  if (!name) return { valid: false, message: "Введите имя, которым к вам обращаться." };
  if (name.length < 2) return { valid: false, message: "Добавьте хотя бы ещё один символ." };
  if (name.length > 50) return { valid: false, message: "Имя должно быть не длиннее 50 символов." };
  return { valid: true, message: "Так и будем к вам обращаться." };
}

export function checkEmail(value: string): Check {
  const email = value.trim();
  if (!email) return { valid: false, message: "Введите электронную почту." };
  if (/\s/.test(email)) return { valid: false, message: "Уберите пробелы внутри адреса." };
  if (!email.includes("@")) return { valid: false, message: "Добавьте @ и домен, например name@example.com." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { valid: false, message: "Проверьте адрес. Например: name@example.com." };
  }
  return { valid: true, message: "Формат почты верный." };
}

export function checkCity(value: string): Check {
  const city = value.trim();
  if (city.length > 70) return { valid: false, message: "Название должно быть не длиннее 70 символов." };
  return city ? { valid: true, message: "Город указан." } : { valid: true, message: "", empty: true };
}

// Дата рождения вводится 8 цифрами подряд, точки ставятся сами: 22082006 → 22.08.2006.

export const birthDigits = (value: string) => value.replace(/\D/g, "").slice(0, 8);

export function formatBirthDigits(value: string): string {
  const digits = birthDigits(value);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join(".");
}

// Позиция курсора после count-й цифры — чтобы маска не уводила курсор в конец.
export function caretAfterDigits(value: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (/\d/.test(value[i]) && ++seen === count) return i + 1;
  }
  return value.length;
}

// Вставка даты в привычных форматах: 2006-08-22, 22.08.2006, 22/8/2006, 22082006.
export function parseDateText(text: string): string | null {
  const value = text.trim();
  const iso = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  const parts = iso
    ? [iso[3], iso[2], iso[1]]
    : (value.match(/^(\d{1,2})[.\s/-]+(\d{1,2})[.\s/-]+(\d{4})$/) ?? value.match(/^(\d{2})(\d{2})(\d{4})$/))?.slice(1);
  if (!parts) return null;
  return [parts[0].padStart(2, "0"), parts[1].padStart(2, "0"), parts[2]].join(".");
}

export function birthKeyToText(key: string): string {
  return parseDateKey(key) ? key.split("-").reverse().join(".") : "";
}

export function checkBirth(text: string, today = toDateKey()): Check & { value: string; complete: boolean } {
  const digits = birthDigits(text);
  const fail = (message: string) => ({ valid: false, message, value: "", complete: digits.length === 8 });
  if (digits.length < 8) return fail("Введите дату целиком — 8 цифр: день, месяц и год.");

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (day < 1 || day > 31) return fail("День — число от 1 до 31.");
  if (month < 1 || month > 12) return fail("Месяц — число от 1 до 12.");
  if (year < 1901) return fail("Введите год от 1901.");

  const limit = daysInMonth(year, month - 1);
  if (day > limit) return fail(`В этом месяце ${limit} ${limit === 31 ? "день" : "дней"}. Проверьте день.`);

  const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  if (value > today) return fail("Дата рождения не может быть в будущем.");

  const date = parseDateKey(value);
  return { valid: true, message: `${date ? formatDate.long.format(date) : value} — всё верно.`, value, complete: true };
}
