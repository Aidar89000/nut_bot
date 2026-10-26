import { createHmac, timingSafeEqual } from "node:crypto";

// Запасной путь к аватарке через Bot API, если Telegram не передал photo_url.
// Ссылка подписана токеном бота, поэтому через неё нельзя получить чужое фото.

type TelegramResponse<T> = { ok: boolean; result?: T };
type PhotoSize = { file_id: string; width: number };

function sign(userId: number, botToken: string): string {
  return createHmac("sha256", botToken).update(`avatar:${userId}`).digest("base64url");
}

export function signedAvatarPath(userId: number, botToken: string): string {
  return `/api/telegram/avatar?u=${userId}&s=${sign(userId, botToken)}`;
}

export function isAvatarSignatureValid(userId: number, signature: string, botToken: string) {
  const expected = Buffer.from(sign(userId, botToken));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function callBotApi<T>(botToken: string, method: string, params: Record<string, string>) {
  const query = new URLSearchParams(params);
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}?${query}`);
  const data = (await response.json()) as TelegramResponse<T>;
  return data.ok ? (data.result ?? null) : null;
}

export async function fetchAvatar(userId: number, botToken: string): Promise<Response | null> {
  const photos = await callBotApi<{ photos: PhotoSize[][] }>(botToken, "getUserProfilePhotos", {
    user_id: String(userId),
    limit: "1",
  });
  const sizes = photos?.photos[0];
  if (!sizes?.length) return null;

  // Размера от 160px хватает для аватарки на ретина-экране.
  const size = sizes.find((photo) => photo.width >= 160) ?? sizes[sizes.length - 1];
  const file = await callBotApi<{ file_path?: string }>(botToken, "getFile", {
    file_id: size.file_id,
  });
  if (!file?.file_path) return null;

  const image = await fetch(`https://api.telegram.org/file/bot${botToken}/${file.file_path}`);
  return image.ok ? image : null;
}
