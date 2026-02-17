export type SubscriptionRecord = {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  plan: 'free' | 'pro';
  updatedAt: string;
  meteredSubscriptionItemId?: string | null;
};

const subscriptionStore = new Map<string, SubscriptionRecord>();

export const upsertSubscription = (subscription: SubscriptionRecord) => {
  subscriptionStore.set(subscription.userId, subscription);
  return subscription;
};

export const getSubscriptionByUserId = (userId: string) => subscriptionStore.get(userId);
