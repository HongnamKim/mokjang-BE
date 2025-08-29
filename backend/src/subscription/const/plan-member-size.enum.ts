import { SubscriptionPlan } from './subscription-plan.enum';

export const PlanMemberSize = {
  [SubscriptionPlan.FREE_TRIAL]: 50,
  [SubscriptionPlan.BASIC]: 300,
  [SubscriptionPlan.STANDARD]: 500,
  [SubscriptionPlan.PLUS]: 1000,
  [SubscriptionPlan.PREMIUM]: 3000,
};
