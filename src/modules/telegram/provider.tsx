"use client";

import Script from "next/script";
import { createContext, type ReactNode, use, useCallback, useEffect, useRef, useState } from "react";
import { getWebApp, paintChrome, TELEGRAM_SCRIPT_URL, type TelegramUser } from "./sdk";
import { DEV_USER, type SessionResponse, type SessionUser } from "./session";
import { applyTheme } from "./theme";

type TelegramState =
  | { status: "loading" }
  | { status: "ready"; user: SessionUser; inTelegram: boolean }
  // Открыто в обычном браузере на проде.
  | { status: "outside" }
  | { status: "error" };

const TelegramContext = createContext<TelegramState>({ status: "loading" });

// null — сервер отклонил подпись; сетевая ошибка пробрасывается.
async function verifySession(initData: string): Promise<SessionUser | null> {
  const response = await fetch("/api/telegram/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  const data = (await response.json()) as SessionResponse;
  return "user" in data ? data.user : null;
}

function fromInitData(user: TelegramUser): SessionUser {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name ?? null,
    username: user.username ?? null,
    avatarUrl: user.photo_url ?? null,
  };
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TelegramState>({ status: "loading" });
  const started = useRef(false);

  const start = useCallback(async () => {
    if (started.current) return;
    started.current = true;

    const app = getWebApp();
    if (!app) {
      setState(
        process.env.NODE_ENV === "development"
          ? { status: "ready", user: DEV_USER, inTelegram: false }
          : { status: "outside" }
      );
      return;
    }

    app.ready();
    app.expand();
    if (app.isVersionAtLeast("7.7")) app.disableVerticalSwipes?.();
    applyTheme(app.colorScheme);
    paintChrome(app);

    // Интерфейс открываем сразу по данным Telegram, не дожидаясь сервера.
    // Данные пользователя живут на его устройстве, а подпись нужна серверу
    // для всего, что он делает от имени пользователя, — её проверяем в фоне.
    const unsafeUser = app.initDataUnsafe.user;
    if (unsafeUser) setState({ status: "ready", user: fromInitData(unsafeUser), inTelegram: true });

    const verified = await verifySession(app.initData).catch(() => "offline" as const);
    // Нет сети — остаёмся на данных Telegram; сервер отклонил подпись — не пускаем.
    if (verified === "offline") {
      if (!unsafeUser) setState({ status: "error" });
      return;
    }
    setState(verified ? { status: "ready", user: verified, inTelegram: true } : { status: "error" });
  }, []);

  const inTelegram = state.status === "ready" && state.inTelegram;

  useEffect(() => {
    const app = getWebApp();
    if (app) {
      const sync = () => {
        applyTheme(app.colorScheme);
        paintChrome(app);
      };
      app.onEvent("themeChanged", sync);
      return () => app.offEvent("themeChanged", sync);
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [inTelegram]);

  return (
    <TelegramContext value={state}>
      {/* Без скрипта (заблокирован, нет сети) приложение откроется как вне Telegram. */}
      <Script
        onError={() => void start()}
        onReady={() => void start()}
        src={TELEGRAM_SCRIPT_URL}
        strategy="afterInteractive"
      />
      {children}
    </TelegramContext>
  );
}

export function useTelegram(): TelegramState {
  return use(TelegramContext);
}

// Только внутри SessionGate: там пользователь уже получен.
export function useSessionUser(): SessionUser & { inTelegram: boolean } {
  const state = use(TelegramContext);
  if (state.status !== "ready") {
    throw new Error("useSessionUser вызван вне SessionGate");
  }
  return { ...state.user, inTelegram: state.inTelegram };
}
