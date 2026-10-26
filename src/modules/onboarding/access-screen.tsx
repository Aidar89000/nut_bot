"use client";

import { cn } from "cn";
import { MailIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { checkEmail } from "@/lib/validation";
import { useAppState } from "@/modules/session/store";
import { Screen } from "@/modules/shell/screen";
import { PAY_URL, requestSubscriptionCheck } from "@/modules/subscription/client";
import { useSessionUser } from "@/modules/telegram/provider";
import { haptic, openExternalLink } from "@/modules/telegram/sdk";
import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Field, fieldView } from "@/ui/field";
import { Orb } from "@/ui/orb";
import { Spinner } from "@/ui/spinner";
import { Eyebrow } from "@/ui/text";
import { confirmAccess } from "./actions";
import { JourneyHeader } from "./journey-header";
import { STEP_ROUTES } from "./progress";

type ServerError = { message: string; canPay: boolean } | null;

export function AccessScreen() {
  const user = useSessionUser();
  const savedEmail = useAppState((state) => state.access.email);
  const [email, setEmail] = useState(savedEmail);
  const [touched, setTouched] = useState(false);
  const [checking, setChecking] = useState(false);
  const [serverError, setServerError] = useState<ServerError>(null);

  const field = serverError
    ? { status: "invalid" as const, message: serverError.message }
    : fieldView(checkEmail(email), touched);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking) return;
    const value = email.trim();
    setEmail(value);
    setTouched(true);
    if (!checkEmail(value).valid) {
      haptic.notify("error");
      document.getElementById("email")?.focus();
      return;
    }

    setChecking(true);
    const result = await requestSubscriptionCheck(value);
    setChecking(false);

    if ("error" in result) {
      haptic.notify("error");
      setServerError({ message: result.error, canPay: false });
    } else if (result.status === "payment_not_found") {
      haptic.notify("warning");
      setServerError({ message: "Оплата с этой почтой не найдена.", canPay: Boolean(PAY_URL) });
    } else {
      haptic.notify("success");
      // Переход на «Подписка действительна» сделает обёртка шага.
      confirmAccess(value);
    }
  }

  return (
    <Screen>
      <JourneyHeader back={STEP_ROUTES.welcome} step={1} />

      <div className="tone-meadow relative isolate mb-7 grid min-h-[150px] place-items-center overflow-hidden rounded-[30px]">
        <Orb core="size-33 top-3.5 right-3.5" rings="-top-38 -right-15" />
        <span
          className={cn(
            "relative mr-24 grid h-[72px] w-[86px] -rotate-8 place-items-center rounded-[23px] border border-white/60 bg-white/85 text-brand-700 shadow-[0_12px_22px_rgb(31_79_58/0.12)]",
            checking && "animate-wiggle"
          )}
        >
          <MailIcon className="size-10" strokeWidth={1.2} />
        </span>
      </div>

      <Eyebrow>Вход</Eyebrow>
      <h1 className="mt-3 mb-6 font-medium text-[38px] leading-[1.09] tracking-[-0.055em] max-[360px]:text-[34px]">
        Проверим подписку.
      </h1>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3">
        <Avatar className="size-10 text-base" name={user.firstName} src={user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <strong className="block truncate font-medium text-sm">
            {[user.firstName, user.lastName].filter(Boolean).join(" ")}
          </strong>
          <small className="block truncate text-muted text-xs">
            {user.username ? `@${user.username}` : "Telegram"}
          </small>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <Field
          autoCapitalize="off"
          autoComplete="email"
          enterKeyHint="go"
          id="email"
          inputMode="email"
          label="Почта, с которой оформлена подписка"
          maxLength={254}
          message={field.message}
          name="email"
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            setEmail(event.target.value);
            setServerError(null);
          }}
          placeholder="name@example.com"
          readOnly={checking}
          spellCheck={false}
          status={field.status}
          type="email"
          value={email}
        />
        <div className="grid gap-2.5">
          <Button aria-busy={checking} disabled={checking} full type="submit">
            {checking ? (
              <>
                <Spinner />
                Проверяем…
              </>
            ) : (
              "Проверить подписку"
            )}
          </Button>
          {serverError?.canPay && (
            <Button full onClick={() => openExternalLink(PAY_URL)} variant="secondary">
              Оформить подписку
            </Button>
          )}
        </div>
      </form>
    </Screen>
  );
}
