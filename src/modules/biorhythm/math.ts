// Три синусоидальных цикла от даты рождения: sin(2π · дни / период) · 100%.

export const CYCLES = [
  { id: "body", name: "Физический", short: "Тело", period: 23 },
  { id: "emotion", name: "Эмоциональный", short: "Эмоции", period: 28 },
  { id: "mind", name: "Интеллектуальный", short: "Разум", period: 33 },
] as const;

export type Cycle = (typeof CYCLES)[number];
export type CycleId = Cycle["id"];

const DAY_MS = 86_400_000;

export function daysSince(birth: Date, date: Date): number {
  const from = Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const to = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return (to - from) / DAY_MS;
}

export function cycleAt(days: number, period: number): number {
  return Math.sin((2 * Math.PI * days) / period) * 100;
}

export function cycleValues(birth: Date | null, date: Date) {
  return CYCLES.map((cycle) => ({
    ...cycle,
    value: birth ? cycleAt(daysSince(birth, date), cycle.period) : 0,
  }));
}

export function averageValue(birth: Date | null, date: Date): number {
  const values = cycleValues(birth, date);
  return values.reduce((sum, cycle) => sum + cycle.value, 0) / values.length;
}

export function formatPercent(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function phaseLabel(value: number): string {
  if (value >= 30) return "Высокая фаза";
  if (value <= -30) return "Низкая фаза";
  return "Переходная фаза";
}
