// Даты храним ключами YYYY-MM-DD в локальном времени пользователя.

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export function toDateKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isDateKey(value: string): boolean {
  return DATE_KEY.test(value);
}

// Полдень — чтобы переход на летнее время не сдвигал день.
export function parseDateKey(value: string): Date | null {
  if (!isDateKey(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

export function isValidBirthDate(value: string): boolean {
  const date = parseDateKey(value);
  return date !== null && date.getFullYear() >= 1901 && value <= toDateKey();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function lastDays(count: number, until = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(until);
    date.setDate(until.getDate() - (count - 1) + i);
    return date;
  });
}

export function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const formatDate = {
  weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }),
  dayMonth: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }),
  long: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
  dayMonthShort: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }),
  weekdayShort: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }),
  full: new Intl.DateTimeFormat("ru-RU"),
};
