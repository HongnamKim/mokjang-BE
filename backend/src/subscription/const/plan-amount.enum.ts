import { SubscriptionPlan } from './subscription-plan.enum';

export const PlanAmount = {
  [SubscriptionPlan.FREE_TRIAL]: 0,
  [SubscriptionPlan.BASIC]: 49_000,
  [SubscriptionPlan.STANDARD]: 79_000,
  [SubscriptionPlan.PLUS]: 129_000,
  [SubscriptionPlan.PREMIUM]: 199_000,
};
