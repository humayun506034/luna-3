import mongoose, { Schema } from 'mongoose';
import { TSubscription } from './subscription.interface';

type TPriceConfig = {
  plan: 'trial' | 'monthly' | 'yearly';
  validityDays: 12 | 30 | 365;
  isTrial: boolean;
};

const PRICE_CONFIG: Record<number, TPriceConfig> = {
  0: { plan: 'trial', validityDays: 12, isTrial: true },
  25: { plan: 'monthly', validityDays: 30, isTrial: false },
  125: { plan: 'yearly', validityDays: 365, isTrial: false },
};

const SubscriptionSchema = new Schema<TSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserCollection',
      index: true,
    },
    price: {
      type: Number,
      enum: [0, 25, 125],
      required: true,
    },
    plan: {
      type: String,
      enum: ['trial', 'monthly', 'yearly'],
      required: false,
    },
    validityDays: {
      type: Number,
      enum: [12, 30, 365],
      required: false,
    },
    trialDays: {
      type: Number,
      enum: [0, 12],
      default: 0,
      required: false,
    },
    trialUsed: {
      type: Boolean,
      default: false,
      required: false,
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'cancelled','pending'],
      default: 'active',
      required: false,
    },
    canCancel: {
      type: Boolean,
      default: true,
      required: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: false,
    },
    trialStartDate: {
      type: Date,
      required: false,
    },
    trialEndDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    cancelledAt: {
      type: Date,
      required: false,
    },
    buyStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      required: false,
    },
  },
  { timestamps: true }
);

// Only one trial record is allowed per user.
SubscriptionSchema.index(
  { userId: 1, trialUsed: 1 },
  { unique: true, partialFilterExpression: { trialUsed: true } }
);

SubscriptionSchema.pre('validate', function (next) {
  const config = PRICE_CONFIG[this.price];

  if (!config) {
    return next(
      new Error('Invalid subscription price. Allowed prices are 0, 25 and 125.')
    );
  }

  this.plan = config.plan;
  this.validityDays = config.validityDays;

  const startDate = this.startDate ? new Date(this.startDate) : new Date();
  this.startDate = startDate;

  if (config.isTrial) {
    this.trialUsed = true;
    this.trialDays = 12;
    this.status = this.status === 'cancelled' ? 'cancelled' : 'trial';

    const trialStartDate = new Date(startDate);
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 12);

    this.trialStartDate = trialStartDate;
    this.trialEndDate = trialEndDate;
    this.endDate = trialEndDate;

    return next();
  }

  this.trialUsed = false;
  this.trialDays = 0;
  this.trialStartDate = undefined;
  this.trialEndDate = undefined;
  if (this.status === 'cancelled') {
    this.status = 'cancelled';
  } else if (this.buyStatus === 'pending') {
    this.status = 'pending';
  } else {
    this.status = 'active';
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + config.validityDays);
  this.endDate = endDate;

  next();
});

export const SubscriptionModel = mongoose.model(
  'SubscriptionCollection',
  SubscriptionSchema
);
