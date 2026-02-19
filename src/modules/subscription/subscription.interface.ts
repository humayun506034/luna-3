import { Types } from 'mongoose';

export type TSubscriptionPrice = 0 | 25 | 125;
export type TSubscriptionPlan = 'trial' | 'monthly' | 'yearly';
export type TSubscriptionValidityDays = 12 | 30 | 365;
export type TSubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'pending';
export type TTrialDays = 0 | 12;
export type TBuyStatus = 'pending' | 'success' | 'failed';
export type TSubscription = {
  userId: Types.ObjectId;
  price: TSubscriptionPrice;
  plan?: TSubscriptionPlan;
  validityDays?: TSubscriptionValidityDays;
  trialDays?: TTrialDays;
  trialUsed?: boolean;
  status?: TSubscriptionStatus;
  canCancel?: boolean;
  startDate?: Date;
  trialStartDate?: Date;
  trialEndDate?: Date;
  endDate?: Date;
  cancelledAt?: Date;
  buyStatus?: TBuyStatus;
};
