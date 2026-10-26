import type { LucideIcon } from "lucide-react";
import { HeartIcon, SparkleIcon, SunIcon } from "lucide-react";

export type SurveySection = {
  title: string;
  hint: string;
  icon: LucideIcon;
  tone: "tone-meadow" | "tone-sage";
};

export type SurveyQuestion = {
  id: string;
  section: number;
  text: string;
  // Название поля во внешней системе (GetCourse) — для будущей выгрузки.
  field: string;
  label?: string;
};

export const SURVEY_SECTIONS: SurveySection[] = [
  {
    title: "Наследственность",
    hint: "«Да» — если заболевание было хотя бы у одного из родителей.",
    icon: HeartIcon,
    tone: "tone-meadow",
  },
  {
    title: "Самочувствие",
    hint: "Ориентируйтесь на собственные наблюдения.",
    icon: SunIcon,
    tone: "tone-sage",
  },
  {
    title: "Детство",
    hint: "Переносили ли вы эту инфекцию в детстве.",
    icon: SparkleIcon,
    tone: "tone-meadow",
  },
];

const parents = (id: string, field: string, illness: string): SurveyQuestion => ({
  id: `parents.${id}`,
  section: 0,
  field: `Родители ${field}`,
  text: `Переносили ли ваши родители ${illness}?`,
});

const season = (id: string, label: string, when: string): SurveyQuestion => ({
  id: `season.${id}`,
  section: 1,
  field: `Ухудшение ${label.toLowerCase()}`,
  text: `Замечаете ухудшение самочувствия ${when}?`,
  label,
});

const infection = (id: string, field: string, illness: string): SurveyQuestion => ({
  id: `childhood.${id}`,
  section: 2,
  field: `Инфекции ${field}`,
  text: `Болели ли вы ${illness} в детстве?`,
});

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  parents("digestion", "болезни пищеварения", "болезни пищеварения"),
  parents("reproductive", "болезни половых органов", "болезни половых органов"),
  parents("kidneys", "болезни почек и мочевого пузыря", "болезни почек и мочевого пузыря"),
  parents("skin", "болезни кожи", "болезни кожи"),
  parents("lungs", "болезни легких и горла", "болезни лёгких и горла"),
  parents("eyes", "болезни глаз", "болезни глаз"),
  parents("nervous", "заболевания центральной нервной системы", "заболевания центральной нервной системы"),
  parents("spine", "болезни позвоночника и суставов", "болезни позвоночника и суставов"),
  season("autumn", "Осень", "осенью"),
  season("winter", "Зима", "зимой"),
  season("spring", "Весна", "весной"),
  season("summer", "Лето", "летом"),
  infection("measles", "корь", "корью"),
  infection("rubella", "краснуха", "краснухой"),
  infection("chickenpox", "ветрянка", "ветрянкой"),
  infection("mumps", "свинка", "свинкой"),
  infection("scarlet", "скарлатина", "скарлатиной"),
];
