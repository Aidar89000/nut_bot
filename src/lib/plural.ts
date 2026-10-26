// Русское склонение по числу: plural(1, ["день", "дня", "дней"]) → "день".
export function plural(count: number, [one, few, many]: [string, string, string]): string {
  const tens = Math.abs(count) % 100;
  const units = tens % 10;
  if (tens > 10 && tens < 20) return many;
  if (units === 1) return one;
  if (units >= 2 && units <= 4) return few;
  return many;
}
