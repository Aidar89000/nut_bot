import type { SubscriptionResponse } from "./types";

export const PAY_URL = process.env.NEXT_PUBLIC_PAY_URL ?? "";

// Тестовая версия: любая почта считается оплаченной, сервер не спрашиваем.
// Включить настоящую проверку (/api/subscription) — true.
const VERIFY_SUBSCRIPTION = false;

export async function requestSubscriptionCheck(email: string): Promise<SubscriptionResponse> {
  if (!VERIFY_SUBSCRIPTION) return { status: "active" };
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
