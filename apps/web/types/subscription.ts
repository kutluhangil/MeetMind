export type Plan = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type Currency = 'USD' | 'TRY';
export type BillingInterval = 'monthly' | 'yearly';

export interface PlanLimits {
  meetingsPerMonth: number | null;
  emailsPerMonth: number | null;
  historyDays: number | null;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free:  { meetingsPerMonth: 5,    emailsPerMonth: 5,    historyDays: 30 },
  pro:   { meetingsPerMonth: null, emailsPerMonth: null, historyDays: null },
  team:  { meetingsPerMonth: null, emailsPerMonth: null, historyDays: null },
};
