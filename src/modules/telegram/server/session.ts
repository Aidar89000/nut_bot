import type { TelegramUser } from "../sdk";
import type { SessionResponse, SessionUser } from "../session";
import { signedAvatarPath } from "./avatar";
import { parseInitDataUser, verifyInitData } from "./init-data";

function toSessionUser(user: TelegramUser, botToken: string | null): SessionUser {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name ?? null,
    username: user.username ?? null,
    avatarUrl: user.photo_url ?? (botToken ? signedAvatarPath(user.id, botToken) : null),
  };
}

export function resolveSession(initData: string): SessionResponse {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    if (process.env.NODE_ENV === "production") return { error: "not_configured" };
    // Локальная разработка без токена: подпись не проверить, верим данным.
    const user = parseInitDataUser(initData);
    return user ? { user: toSessionUser(user, null) } : { error: "invalid" };
  }

  const user = verifyInitData(initData, botToken);
  return user ? { user: toSessionUser(user, botToken) } : { error: "invalid" };
}
