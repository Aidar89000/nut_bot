// Тонкая обёртка над window.Telegram.WebApp (telegram-web-app.js).
// Только то, что использует приложение; каждый вызов учитывает версию клиента.

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

type HapticImpact = "light" | "medium" | "heavy" | "rigid" | "soft";
type HapticNotice = "error" | "success" | "warning";

export type WebApp = {
  initData: string;
  initDataUnsafe: { user?: TelegramUser };
  colorScheme: "light" | "dark";
  ready(): void;
  expand(): void;
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  disableVerticalSwipes?(): void;
  openLink(url: string): void;
  onEvent(event: "themeChanged", handler: () => void): void;
  offEvent(event: "themeChanged", handler: () => void): void;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(handler: () => void): void;
    offClick(handler: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: HapticImpact): void;
    notificationOccurred(type: HapticNotice): void;
    selectionChanged(): void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

export const TELEGRAM_SCRIPT_URL = "https://telegram.org/js/telegram-web-app.js";

// Скрипт создаёт WebApp и вне Telegram, но тогда initData пустая.
export function getWebApp(): WebApp | null {
  if (typeof window === "undefined") return null;
  const app = window.Telegram?.WebApp;
  return app?.initData ? app : null;
}

function supports(version: string): WebApp | null {
  const app = getWebApp();
  return app?.isVersionAtLeast(version) ? app : null;
}

export const haptic = {
  impact(style: HapticImpact = "light") {
    supports("6.1")?.HapticFeedback.impactOccurred(style);
  },
  selection() {
    supports("6.1")?.HapticFeedback.selectionChanged();
  },
  notify(type: HapticNotice) {
    supports("6.1")?.HapticFeedback.notificationOccurred(type);
  },
};

export function openExternalLink(url: string) {
  const app = getWebApp();
  if (app) app.openLink(url);
  else window.open(url, "_blank", "noopener");
}

// Шапка и фон Telegram в цвет приложения, чтобы не было «полос».
export function paintChrome(app: WebApp) {
  const canvas = getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim();
  if (!canvas || !app.isVersionAtLeast("6.1")) return;
  app.setHeaderColor(canvas);
  app.setBackgroundColor(canvas);
  if (app.isVersionAtLeast("7.10")) app.setBottomBarColor?.(canvas);
}
