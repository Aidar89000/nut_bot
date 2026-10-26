import type { SubscriptionResult } from "./types";

// Проверка подписки по почте. Вызывается только на сервере (route handler).

export class SubscriptionNotConfiguredError extends Error {
  constructor() {
    super("Проверка подписки через GetCourse не настроена");
  }
}

export async function checkSubscription(email: string): Promise<SubscriptionResult> {
  if (process.env.DEMO_MODE === "1") {
    return checkDemo(email);
  }
  return checkInGetCourse(email);
}

// Демо: любая почта считается оплаченной, кроме адресов со словом «nopay».
async function checkDemo(email: string): Promise<SubscriptionResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (email.includes("nopay")) {
    return { status: "payment_not_found" };
  }
  return { status: "active" };
}

async function checkInGetCourse(email: string): Promise<SubscriptionResult> {
  const account = process.env.GETCOURSE_ACCOUNT;
  const apiKey = process.env.GETCOURSE_API_KEY;
  if (!account || !apiKey) {
    throw new SubscriptionNotConfiguredError();
  }
  // TODO: подключить реальную проверку — вебхук GetCourse в нашу базу
  // или API экспорта (users/deals). Какой продукт означает «подписка активна»,
  // решает владелец школы.
  void email;
  throw new SubscriptionNotConfiguredError();
}
