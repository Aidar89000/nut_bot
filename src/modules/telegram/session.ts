// Пользователь Telegram после проверки initData на сервере.
export type SessionUser = {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  avatarUrl: string | null;
};

export type SessionResponse = { user: SessionUser } | { error: "invalid" | "not_configured" };

// Вне Telegram при `next dev` — чтобы интерфейс можно было открыть в браузере.
export const DEV_USER: SessionUser = {
  id: 0,
  firstName: "Гость",
  lastName: null,
  username: null,
  avatarUrl: null,
};
