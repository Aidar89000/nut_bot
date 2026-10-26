import {
  CalendarIcon,
  DropletIcon,
  LeafIcon,
  type LucideIcon,
  PillIcon,
  SparkleIcon,
  SunIcon,
  UtensilsIcon,
} from "lucide-react";

export type Material = {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  // Экран приложения или null — материал ещё не опубликован.
  href: string | null;
};

export const MATERIALS: Material[] = [
  { id: "month", name: "Календарь биоритмов", subtitle: "Интерактивный график", icon: CalendarIcon, href: "/rhythm" },
  { id: "herbs", name: "Фитотерапия", subtitle: "Скоро", icon: LeafIcon, href: null },
  { id: "food", name: "Питание", subtitle: "Скоро", icon: UtensilsIcon, href: null },
  { id: "vitamins", name: "Витамины", subtitle: "Скоро", icon: SunIcon, href: null },
  { id: "minerals", name: "Минералы", subtitle: "Скоро", icon: SparkleIcon, href: null },
  { id: "oils", name: "Эфирные масла", subtitle: "Скоро", icon: DropletIcon, href: null },
  { id: "supplements", name: "БАДы", subtitle: "Скоро", icon: PillIcon, href: null },
];
