import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { TelegramUser } from "../sdk";

// Проверка initData по документации Telegram:
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

const MAX_AGE_SECONDS = 24 * 60 * 60;

const userSchema = z.object({
  id: z.number().int(),
  first_name: z.string().max(256),
  last_name: z.string().max(256).optional(),
  username: z.string().max(64).optional(),
  language_code: z.string().max(16).optional(),
  photo_url: z.url().optional(),
});

export function parseInitDataUser(initData: string): TelegramUser | null {
  const raw = new URLSearchParams(initData).get("user");
  if (!raw) return null;
  try {
    const parsed = userSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function verifyInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest();
  const actual = Buffer.from(hash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) return null;

  return parseInitDataUser(initData);
}
