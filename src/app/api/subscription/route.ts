import { z } from "zod";
import { checkSubscription, SubscriptionNotConfiguredError } from "@/modules/subscription/server";

const bodySchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Проверьте почту: похоже, в ней опечатка." }, { status: 400 });
  }

  try {
    return Response.json(await checkSubscription(parsed.data.email));
  } catch (error) {
    if (error instanceof SubscriptionNotConfiguredError) {
      return Response.json({ error: error.message }, { status: 503 });
    }
    console.error("subscription check failed", error);
    return Response.json({ error: "Не удалось проверить подписку. Попробуйте через минуту." }, { status: 502 });
  }
}
