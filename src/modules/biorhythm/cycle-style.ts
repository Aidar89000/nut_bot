import { BrainIcon, HeartIcon, type LucideIcon, SunIcon } from "lucide-react";
import type { CycleId } from "./math";

// Оформление циклов: цвет — токен темы, поэтому график сам меняется в тёмной теме.
export const CYCLE_STYLE: Record<CycleId, { icon: LucideIcon; color: string; text: string }> = {
  body: { icon: SunIcon, color: "var(--cycle-body)", text: "text-cycle-body" },
  emotion: { icon: HeartIcon, color: "var(--cycle-emotion)", text: "text-cycle-emotion" },
  mind: { icon: BrainIcon, color: "var(--cycle-mind)", text: "text-cycle-mind" },
};
