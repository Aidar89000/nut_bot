"use client";

import { cn } from "cn";
import { CalendarIcon, CheckIcon } from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  birthDigits,
  birthKeyToText,
  caretAfterDigits,
  checkBirth,
  checkCity,
  checkEmail,
  checkName,
  formatBirthDigits,
  normalizeName,
  parseDateText,
} from "@/lib/validation";
import { saveProfile } from "@/modules/onboarding/actions";
import { useAppState } from "@/modules/session/store";
import { useSessionUser } from "@/modules/telegram/provider";
import { haptic } from "@/modules/telegram/sdk";
import { Button } from "@/ui/button";
import { Field, fieldView } from "@/ui/field";

type FieldId = "name" | "birth" | "city" | "email";

// Маска даты: оставляем цифры, расставляем точки, курсор не прыгает в конец.
function applyBirthMask(input: HTMLInputElement) {
  const raw = input.value;
  const digitsBeforeCaret = birthDigits(raw.slice(0, input.selectionStart ?? raw.length)).length;
  const formatted = formatBirthDigits(raw);
  if (formatted === raw) return;
  input.value = formatted;
  const caret = caretAfterDigits(formatted, digitsBeforeCaret);
  input.setSelectionRange(caret, caret);
}

// Backspace/Delete по точке удаляет соседнюю цифру, а не застревает на точке.
function useDotAwareDeletion(ref: RefObject<HTMLInputElement | null>, onChange: (value: string) => void) {
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const handle = (event: InputEvent) => {
      const start = input.selectionStart;
      if (event.isComposing || start === null || start !== input.selectionEnd) return;
      const backward = event.inputType === "deleteContentBackward" && input.value[start - 1] === ".";
      const forward = event.inputType === "deleteContentForward" && input.value[start] === ".";
      if (!backward && !forward) return;
      event.preventDefault();
      const digits = birthDigits(input.value);
      const before = birthDigits(input.value.slice(0, start)).length;
      const index = backward ? before - 1 : before;
      input.value = formatBirthDigits(digits.slice(0, index) + digits.slice(index + 1));
      const caret = caretAfterDigits(input.value, index);
      input.setSelectionRange(caret, caret);
      onChange(input.value);
    };
    input.addEventListener("beforeinput", handle);
    return () => input.removeEventListener("beforeinput", handle);
  }, [ref, onChange]);
}

export function ProfileForm({
  submitLabel,
  withEmail = false,
  onSaved,
}: {
  submitLabel: string;
  withEmail?: boolean;
  onSaved: () => void;
}) {
  const user = useSessionUser();
  const profile = useAppState((state) => state.profile);
  const savedEmail = useAppState((state) => state.access.email);
  const [values, setValues] = useState({
    name: profile.name || user.firstName,
    birth: birthKeyToText(profile.birth),
    city: profile.city,
    email: savedEmail,
  });
  const [touched, setTouched] = useState<Set<FieldId>>(new Set());
  const birthRef = useRef<HTMLInputElement>(null);
  const setBirth = useCallback((birth: string) => setValues((current) => ({ ...current, birth })), []);
  useDotAwareDeletion(birthRef, setBirth);

  const order: FieldId[] = withEmail ? ["name", "birth", "city", "email"] : ["name", "birth", "city"];
  const checks = {
    name: checkName(values.name),
    birth: checkBirth(values.birth),
    city: checkCity(values.city),
    email: checkEmail(values.email),
  };
  const birthCheck = checks.birth;
  // Ошибку даты показываем и без ухода с поля, как только введены все 8 цифр.
  const view = (id: FieldId, hint = "") => fieldView(checks[id], touched.has(id) || (id === "birth" && birthCheck.complete), hint);

  const touch = (id: FieldId) => setTouched((current) => new Set(current).add(id));
  const set = (id: FieldId, value: string) => setValues((current) => ({ ...current, [id]: value }));

  function focusNext(event: KeyboardEvent<HTMLInputElement>, id: FieldId) {
    const next = order[order.indexOf(id) + 1];
    if (event.key !== "Enter" || event.nativeEvent.isComposing || !next) return;
    event.preventDefault();
    document.getElementById(next)?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(new Set(order));
    const invalid = order.find((id) => !checks[id].valid);
    if (invalid) {
      haptic.notify("error");
      document.getElementById(invalid)?.focus();
      return;
    }
    saveProfile(
      { name: normalizeName(values.name), birth: birthCheck.value, city: values.city.trim() },
      withEmail ? values.email.trim() : undefined
    );
    haptic.notify("success");
    onSaved();
  }

  const nameView = view("name");
  const birthView = view("birth", "8 цифр подряд — точки появятся сами.");
  const cityView = view("city");
  const emailView = view("email");

  return (
    <form className="stagger" noValidate onSubmit={handleSubmit}>
      <Field
        autoCapitalize="words"
        autoComplete="given-name"
        enterKeyHint="next"
        id="name"
        label="Имя"
        maxLength={50}
        message={nameView.message}
        onBlur={() => {
          set("name", normalizeName(values.name));
          touch("name");
        }}
        onChange={(event) => set("name", event.target.value)}
        onKeyDown={(event) => focusNext(event, "name")}
        placeholder="Как вас зовут?"
        status={nameView.status}
        value={values.name}
      />
      <Field
        aside={
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center gap-1 text-accent text-xs transition-[opacity,scale] duration-250",
              birthCheck.valid ? "scale-100 opacity-100" : "scale-90 opacity-0"
            )}
          >
            <CheckIcon className="size-3.5" strokeWidth={2.5} /> Готово
          </span>
        }
        autoComplete="bday"
        className="py-4 text-[23px] tracking-[0.045em] tabular-nums"
        defaultValue={values.birth}
        enterKeyHint="next"
        icon={<CalendarIcon />}
        id="birth"
        inputMode="numeric"
        label="Дата рождения"
        maxLength={10}
        message={birthView.message}
        onBlur={() => touch("birth")}
        onInput={(event) => {
          const input = event.currentTarget;
          // Автозаполнение может подставить дату как 2006-08-22.
          if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(input.value)) input.value = parseDateText(input.value) ?? input.value;
          applyBirthMask(input);
          set("birth", input.value);
        }}
        onKeyDown={(event) => focusNext(event, "birth")}
        onPaste={(event) => {
          const pasted = parseDateText(event.clipboardData.getData("text"));
          if (!pasted) return;
          event.preventDefault();
          event.currentTarget.value = pasted;
          set("birth", pasted);
          touch("birth");
        }}
        placeholder="ДД.ММ.ГГГГ"
        ref={birthRef}
        status={birthView.status}
      />
      <Field
        autoCapitalize="words"
        autoComplete="address-level2"
        enterKeyHint={withEmail ? "next" : "done"}
        id="city"
        label={
          <span>
            Город <span className="text-muted">· необязательно</span>
          </span>
        }
        maxLength={70}
        message={cityView.message}
        onBlur={() => touch("city")}
        onChange={(event) => set("city", event.target.value)}
        onKeyDown={(event) => focusNext(event, "city")}
        placeholder="Например, Пермь"
        status={cityView.status}
        value={values.city}
      />
      {withEmail && (
        <Field
          autoCapitalize="off"
          autoComplete="email"
          enterKeyHint="done"
          id="email"
          inputMode="email"
          label="Почта"
          maxLength={254}
          message={emailView.message}
          onBlur={() => touch("email")}
          onChange={(event) => set("email", event.target.value)}
          spellCheck={false}
          status={emailView.status}
          type="email"
          value={values.email}
        />
      )}
      <Button className="mt-3" full type="submit">
        {submitLabel}
      </Button>
    </form>
  );
}
