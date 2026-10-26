import { z } from "zod";
import { resolveSession } from "@/modules/telegram/server/session";

const bodySchema = z.object({ initData: z.string().min(1).max(4096) });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const result = resolveSession(parsed.data.initData);
  if ("error" in result) {
    return Response.json(result, { status: result.error === "invalid" ? 401 : 503 });
  }
  return Response.json(result);
}
