export type SubscriptionResult = { status: "active" } | { status: "payment_not_found" };

export type SubscriptionResponse = SubscriptionResult | { error: string };
