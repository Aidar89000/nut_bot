"use client";

import { cn } from "cn";
import {
  ArrowRightIcon,
  BellIcon,
  BookOpenIcon,
  ChevronRightIcon,
  InfoIcon,
  ListChecksIcon,
  type LucideIcon,
  RotateCcwIcon,
} from "lucide-react";
import Link from "next/link";
import { type ComponentProps, type ReactNode, useState } from "react";
import { formatDate, isValidBirthDate, parseDateKey } from "@/lib/date";
import { RhythmInfoSheet } from "@/modules/biorhythm/sheets";
import { countAnswered } from "@/modules/onboarding/progress";
import { SURVEY_QUESTIONS } from "@/modules/onboarding/survey/questions";
import { useRemindersToggle } from "@/modules/reminders/reminders";
import { resetState, useAppState } from "@/modules/session/store";
import { Screen } from "@/modules/shell/screen";
import { TopBar } from "@/modules/shell/top-bar";
import { NAV_FORWARD } from "@/modules/shell/transitions";
import { useSessionUser } from "@/modules/telegram/provider";
import { Avatar } from "@/ui/avatar";
import { Button, ButtonLink } from "@/ui/button";
import { Sheet, SheetIcon } from "@/ui/sheet";
import { Surface } from "@/ui/surface";
import { PageTitle, Pill } from "@/ui/text";
import { useToast } from "@/ui/toast";
import { ToggleIndicator } from "@/ui/toggle";

export function ProfileScreen() {
  const user = useSessionUser();
  const profile = useAppState((state) => state.profile);
  const email = useAppState((state) => state.access.email);
  const answered = useAppState(countAnswered);
  const reminders = useRemindersToggle();
  const toast = useToast();
  const [sheet, setSheet] = useState<"info" | "reset" | null>(null);
  const name = profile.name || user.firstName;
  const birth = isValidBirthDate(profile.birth) ? parseDateKey(profile.birth) : null;

  return (
    <Screen className="stagger" withNav>
      <TopBar />
      <PageTitle kicker="Личное пространство">Мой профиль.</PageTitle>

      <div className="grid gap-[18px]">
        <Surface className="relative isolate overflow-hidden p-[27px] max-[360px]:p-6">
          <Avatar className="mb-5 size-[65px] text-2xl" name={name} src={user.avatarUrl} />
          <h2 className="font-medium text-[25px] tracking-[-0.04em] [overflow-wrap:anywhere]">{name}</h2>
          <p className="mt-2 text-muted text-sm [overflow-wrap:anywhere]">
            {[user.username && `@${user.username}`, email].filter(Boolean).join(" · ")}
          </p>
          <Pill className="mt-4">Подписка активна</Pill>
          <dl className="my-6 border-line border-t text-sm">
            <Detail label="Дата рождения">{birth ? formatDate.full.format(birth) : "Не указана"}</Detail>
            <Detail label="Город">{profile.city || "Не указан"}</Detail>
          </dl>
          <ButtonLink full href="/settings/profile" transitionTypes={NAV_FORWARD} variant="secondary">
            Изменить данные <ArrowRightIcon className="size-4" />
          </ButtonLink>
        </Surface>

        <Surface className="px-5 py-0">
          <SettingButton
            aria-checked={reminders.enabled}
            hint="На главной, пока приложение открыто"
            icon={BellIcon}
            onClick={reminders.toggle}
            role="switch"
            title="Мягкое напоминание"
          >
            <ToggleIndicator on={reminders.enabled} />
          </SettingButton>
          <SettingLink hint="Настроение и заметки" href="/diary" icon={BookOpenIcon} title="Мой дневник" />
          <SettingLink
            hint={`${answered} из ${SURVEY_QUESTIONS.length} ответов`}
            href="/settings/survey"
            icon={ListChecksIcon}
            title="Моя анкета"
          />
          <SettingButton icon={InfoIcon} onClick={() => setSheet("info")} title="Как считается ритм">
            <ChevronRightIcon className="size-4 text-muted" />
          </SettingButton>
        </Surface>

        <Surface className="px-5 py-0">
          <SettingButton
            hint="Анкета, настроение и заметки"
            icon={RotateCcwIcon}
            onClick={() => setSheet("reset")}
            title="Сбросить мои данные"
          >
            <ChevronRightIcon className="size-4 text-muted" />
          </SettingButton>
        </Surface>
      </div>

      <RhythmInfoSheet onClose={() => setSheet(null)} open={sheet === "info"} />
      <Sheet
        actions={
          <>
            <Button onClick={() => setSheet(null)} variant="secondary">
              Оставить
            </Button>
            <Button
              onClick={() => {
                setSheet(null);
                resetState();
                toast("Данные сброшены");
              }}
              variant="danger"
            >
              Удалить
            </Button>
          </>
        }
        media={
          <SheetIcon>
            <RotateCcwIcon />
          </SheetIcon>
        }
        onClose={() => setSheet(null)}
        open={sheet === "reset"}
        title="Начать с чистого листа?"
      >
        <p>Анкета, дневник, заметки и прогресс будут удалены.</p>
      </Sheet>
    </Screen>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-line border-b py-[15px]">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[65%] text-right [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

type SettingContent = { icon: LucideIcon; title: string; hint?: string };

const SETTING_ROW =
  "flex w-full items-center gap-3 border-line border-b py-[19px] text-left transition-colors last:border-0 hover:text-accent";

function SettingCopy({ icon: Icon, title, hint }: SettingContent) {
  return (
    <>
      <Icon className="size-5 shrink-0 text-accent" />
      <span className="min-w-0 flex-1">
        <strong className="block font-normal text-sm">{title}</strong>
        {hint && <small className="mt-1 block text-muted text-xs">{hint}</small>}
      </span>
    </>
  );
}

function SettingButton({
  icon,
  title,
  hint,
  children,
  className,
  ...props
}: SettingContent & ComponentProps<"button">) {
  return (
    <button className={cn(SETTING_ROW, className)} type="button" {...props}>
      <SettingCopy hint={hint} icon={icon} title={title} />
      {children}
    </button>
  );
}

function SettingLink({ icon, title, hint, href }: SettingContent & { href: string }) {
  return (
    <Link className={SETTING_ROW} href={href} transitionTypes={NAV_FORWARD}>
      <SettingCopy hint={hint} icon={icon} title={title} />
      <ChevronRightIcon className="size-4 text-muted" />
    </Link>
  );
}
