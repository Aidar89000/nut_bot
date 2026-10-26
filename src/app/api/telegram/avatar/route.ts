import type { NextRequest } from "next/server";
import { fetchAvatar, isAvatarSignatureValid } from "@/modules/telegram/server/avatar";

export async function GET(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const userId = Number(request.nextUrl.searchParams.get("u"));
  const signature = request.nextUrl.searchParams.get("s") ?? "";

  if (!botToken || !Number.isSafeInteger(userId)) {
    return new Response(null, { status: 404 });
  }
  if (!isAvatarSignatureValid(userId, signature, botToken)) {
    return new Response(null, { status: 403 });
  }

  const image = await fetchAvatar(userId, botToken).catch(() => null);
  if (!image) {
    return new Response(null, { status: 404 });
  }
  return new Response(image.body, {
    headers: {
      "Content-Type": image.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
