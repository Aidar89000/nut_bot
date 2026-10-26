import type { SubscriptionResponse } from "./types";

export const PAY_URL = process.env.NEXT_PUBLIC_PAY_URL ?? "";

export async function requestSubscriptionCheck(email: string): Promise<SubscriptionResponse> {
  try {
    const response = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return (await response.json()) as SubscriptionResponse;
  } catch {
    return { error: "Нет соединения. Проверьте интернет и попробуйте снова." };
  }
}
