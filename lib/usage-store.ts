export type UsageEvent = {
  id: string;
  clerkUserId: string;
  courseId?: string;
  eventType: 'ai_generation';
  units: number;
  unitCostCents: number;
  createdAt: string;
};

const usageStore: UsageEvent[] = [];

export const trackUsage = (event: UsageEvent) => {
  usageStore.push(event);
  return event;
};

export const listUsage = () => usageStore;

export const listUsageByUser = (clerkUserId: string) => usageStore.filter((event) => event.clerkUserId === clerkUserId);
