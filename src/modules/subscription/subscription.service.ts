/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { TSubscription } from './subscription.interface';
import { SubscriptionModel } from './subscription.model';
import idConverter from '../../util/idConvirter';
import { UserModel } from '../user/user.model';

type TSubscriptionHistoryQuery = {
  startDate?: string;
  endDate?: string;
  price?: string;
  status?: string;
  buyStatus?: string;
  plan?: string;
  userId?: string;
  page?: string;
  limit?: string;
  sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'price';
  sortOrder?: 'asc' | 'desc';
};

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

const toDateOrNull = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const matchesRunningSubscription = (
  subscription: Record<string, any>,
  now: Date
) => {
  const statusOk =
    subscription.status === 'trial' || subscription.status === 'active';
  const buyStatusOk = subscription.buyStatus === 'success';
  const endDate =
    subscription.endDate instanceof Date
      ? subscription.endDate
      : subscription.endDate
        ? new Date(subscription.endDate)
        : null;
  const endDateOk =
    !!endDate && !Number.isNaN(endDate.getTime()) && endDate >= now;
  const notCancelled = !subscription.cancelledAt;

  return statusOk && buyStatusOk && endDateOk && notCancelled;
};

const getRunningSubscription = async (userId: string) => {
  const now = new Date();
  const convertedUserId = idConverter(userId);

  if (!convertedUserId) {
    throw new Error('Invalid user id.');
  }

  const subscriptions = await SubscriptionModel.find({
    userId: convertedUserId,
    buyStatus: 'success',
  }).sort({ createdAt: -1 });

  return (
    subscriptions.find((subscription) =>
      matchesRunningSubscription(
        subscription as unknown as Record<string, any>,
        now
      )
    ) || null
  );
};

const getStripeAmountByPrice = (price: number) => {
  if (price === 25) {
    return 2500;
  }

  if (price === 125) {
    return 12500;
  }

  throw new Error('Stripe checkout supports only paid plans (25, 125).');
};

const createStripeCheckoutSession = async (
  userId: string,
  price: 25 | 125,
  subscriptionId: string,
  customerEmail?: string
) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  const successUrl =
    process.env.STRIPE_SUCCESS_URL ||
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl =
    process.env.STRIPE_CANCEL_URL ||
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`;

  const amount = getStripeAmountByPrice(price);

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('payment_method_types[0]', 'card');
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);
  params.append('client_reference_id', userId);
  if (customerEmail) {
    params.append('customer_email', customerEmail);
  }
  params.append('metadata[subscriptionId]', subscriptionId);
  params.append('metadata[userId]', userId);
  params.append('metadata[price]', String(price));
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', String(amount));
  params.append(
    'line_items[0][price_data][product_data][name]',
    price === 25 ? 'Monthly Subscription' : 'Yearly Subscription'
  );

  try {
    const { data } = await axios.post(
      `${STRIPE_API_BASE}/checkout/sessions`,
      params.toString(),
      {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return data as {
      id: string;
      url: string;
      payment_status: string;
      status: string;
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const stripeMessage =
        (error.response?.data as any)?.error?.message || error.message;
      throw new Error(`Stripe checkout session failed: ${stripeMessage}`);
    }
    throw error;
  }
};

const buySubscription = async (
  userId: string,
  payload: Pick<TSubscription, 'price'>
) => {
  const convertedUserId = idConverter(userId);
  if (!convertedUserId) {
    throw new Error('Invalid user id.');
  }

  const runningSubscription = await getRunningSubscription(userId);

  if (runningSubscription) {
    throw new Error(
      'You already have an active package. Cancel your previous package first.'
    );
  }

  if (payload.price === 0) {
    const trialAlreadyUsed = await SubscriptionModel.exists({
      userId: convertedUserId,
      trialUsed: true,
    });

    if (trialAlreadyUsed) {
      throw new Error('Trial plan can be used only one time.');
    }

    const result = await SubscriptionModel.create({
      userId: convertedUserId,
      price: payload.price,
      buyStatus: 'success',
    });

    return {
      paymentRequired: false,
      subscription: result,
    };
  }

  if (payload.price !== 25 && payload.price !== 125) {
    throw new Error(
      'Invalid paid plan price. Allowed paid prices are 25 and 125.'
    );
  }

  const buyer = await UserModel.findOne({ _id: convertedUserId }).select(
    'email'
  );
  const customerEmail = buyer?.email;
  const pendingBuy = await SubscriptionModel.create({
    userId: convertedUserId,
    status: 'pending',
    price: payload.price,
    buyStatus: 'pending',
  });

  let session;
  try {
    session = await createStripeCheckoutSession(
      userId,
      payload.price,
      String(pendingBuy._id),
      customerEmail
    );
  } catch (error) {
    pendingBuy.buyStatus = 'failed';
    await pendingBuy.save();
    throw error;
  }

  return {
    paymentRequired: true,
    stripe: {
      sessionId: session.id,
      checkoutUrl: session.url,
      paymentStatus: session.payment_status,
      status: session.status,
      subscriptionId: pendingBuy._id,
    },
  };
};

const handleStripeCheckoutCompleted = async (session: Record<string, any>) => {
  const paymentStatus = session.payment_status;
  const metadata = session.metadata || {};
  const rawSubscriptionId = metadata.subscriptionId;
  const rawUserId = metadata.userId || session.client_reference_id;
  const rawPrice = metadata.price;

  if (!rawSubscriptionId) {
    throw new Error('Stripe session metadata is missing subscriptionId.');
  }

  const pendingBuy = await SubscriptionModel.findById(rawSubscriptionId);
  if (!pendingBuy) {
    throw new Error('Pending subscription not found for webhook update.');
  }

  if (pendingBuy.buyStatus === 'success') {
    return {
      received: true,
      processed: false,
      message: 'Subscription already marked as success.',
    };
  }

  if (paymentStatus !== 'paid') {
    return {
      received: true,
      processed: false,
      message: `Payment not completed. Current payment_status: ${paymentStatus}`,
    };
  }

  const validatedUserId = idConverter(String(rawUserId));
  const validatedPrice = Number(rawPrice);
  if (
    !validatedUserId ||
    pendingBuy.userId.toString() !== validatedUserId.toString() ||
    (validatedPrice !== 25 && validatedPrice !== 125) ||
    pendingBuy.price !== validatedPrice
  ) {
    pendingBuy.buyStatus = 'failed';
    await pendingBuy.save();
    throw new Error(
      'Stripe metadata validation failed for pending subscription.'
    );
  }

  pendingBuy.buyStatus = 'success';
  pendingBuy.status = 'active';
  const subscription = await pendingBuy.save();

  return {
    received: true,
    processed: true,
    message: 'Subscription updated to success from Stripe webhook.',
    subscription,
  };
};

const cancelCurrentSubscription = async (userId: string) => {
  const runningSubscription = await getRunningSubscription(userId);

  if (!runningSubscription) {
    throw new Error('No running package found to cancel.');
  }

  runningSubscription.status = 'cancelled';
  runningSubscription.cancelledAt = new Date();
  runningSubscription.canCancel = false;
  runningSubscription.endDate = new Date();

  const result = await runningSubscription.save();
  return result;
};

const getMyCurrentSubscription = async (userId: string) => {
  const convertedUserId = idConverter(userId);
  if (!convertedUserId) {
    throw new Error('Invalid user id.');
  }

  const runningSubscription = await getRunningSubscription(userId);

  if (runningSubscription) {
    return runningSubscription;
  } else {
    return null;
  }
};

const parseCsvList = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildHistoryFilters = (query: TSubscriptionHistoryQuery) => {
  const priceList = parseCsvList(query.price)
    .map((value) => Number(value))
    .filter((value) => [0, 25, 125].includes(value));

  const statusList = parseCsvList(query.status).filter((value) =>
    ['pending', 'trial', 'active', 'cancelled'].includes(value)
  );

  const buyStatusList = parseCsvList(query.buyStatus).filter((value) =>
    ['pending', 'success', 'failed'].includes(value)
  );

  const planList = parseCsvList(query.plan).filter((value) =>
    ['trial', 'monthly', 'yearly'].includes(value)
  );

  return {
    priceList,
    statusList,
    buyStatusList,
    planList,
    startDate: toDateOrNull(query.startDate),
    endDate: toDateOrNull(query.endDate),
  };
};

const matchesHistoryFilters = (
  subscription: Record<string, any>,
  filters: {
    priceList: number[];
    statusList: string[];
    buyStatusList: string[];
    planList: string[];
    startDate: Date | null;
    endDate: Date | null;
  }
) => {
  if (
    filters.priceList.length > 0 &&
    !filters.priceList.includes(subscription.price)
  ) {
    return false;
  }

  if (
    filters.statusList.length > 0 &&
    !filters.statusList.includes(subscription.status)
  ) {
    return false;
  }

  if (
    filters.buyStatusList.length > 0 &&
    !filters.buyStatusList.includes(subscription.buyStatus)
  ) {
    return false;
  }

  if (
    filters.planList.length > 0 &&
    !filters.planList.includes(subscription.plan)
  ) {
    return false;
  }

  const createdAtRaw = subscription.createdAt;
  const createdAt =
    createdAtRaw instanceof Date
      ? createdAtRaw
      : createdAtRaw
        ? new Date(createdAtRaw)
        : null;

  if (!createdAt || Number.isNaN(createdAt.getTime())) {
    return false;
  }

  if (filters.startDate) {
    const startBoundary = new Date(filters.startDate);
    startBoundary.setHours(0, 0, 0, 0);
    if (createdAt < startBoundary) {
      return false;
    }
  }

  if (filters.endDate) {
    const endBoundary = new Date(filters.endDate);
    endBoundary.setHours(23, 59, 59, 999);
    if (createdAt > endBoundary) {
      return false;
    }
  }

  return true;
};

const sortHistory = (
  subscriptions: Record<string, any>[],
  sortBy: 'createdAt' | 'startDate' | 'endDate' | 'price',
  sortOrder: 1 | -1
) => {
  const toComparable = (value: unknown) => {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (typeof value === 'number') {
      return value;
    }

    if (value) {
      const date = new Date(String(value));
      if (!Number.isNaN(date.getTime())) {
        return date.getTime();
      }
    }

    return Number.NEGATIVE_INFINITY;
  };

  return [...subscriptions].sort((a, b) => {
    const first = toComparable(a[sortBy]);
    const second = toComparable(b[sortBy]);

    if (first === second) {
      return 0;
    }

    return first > second ? sortOrder : -sortOrder;
  });
};

const calculateHistoryStats = (subscriptions: Record<string, any>[]) => {
  return subscriptions.reduce(
    (acc, subscription) => {
      acc.totalSubscriptions += 1;

      if (subscription.buyStatus === 'success') {
        acc.totalSuccessfulSubscriptions += 1;

        if (subscription.price > 0) {
          acc.totalPaidSubscriptions += 1;
          acc.totalRevenue += Number(subscription.price) || 0;
        }

        if (subscription.price === 0) {
          acc.totalTrialSubscriptions += 1;
        }

        if (subscription.status === 'active') {
          acc.totalActiveSubscriptions += 1;
        }

        if (subscription.status === 'cancelled') {
          acc.totalCancelledSubscriptions += 1;
        }

        if (subscription.status === 'trial') {
          acc.totalTrialStatusSubscriptions += 1;
        }
      }

      if (subscription.buyStatus === 'pending') {
        acc.totalPendingSubscriptions += 1;
      }

      if (subscription.buyStatus === 'failed') {
        acc.totalFailedSubscriptions += 1;
      }

      return acc;
    },
    {
      totalSubscriptions: 0,
      totalSuccessfulSubscriptions: 0,
      totalPendingSubscriptions: 0,
      totalFailedSubscriptions: 0,
      totalPaidSubscriptions: 0,
      totalTrialSubscriptions: 0,
      totalActiveSubscriptions: 0,
      totalCancelledSubscriptions: 0,
      totalTrialStatusSubscriptions: 0,
      totalRevenue: 0,
    }
  );
};

const getHistoryWithStats = async (
  subscriptions: Record<string, any>[],
  query: TSubscriptionHistoryQuery,
  filters: {
    priceList: number[];
    statusList: string[];
    buyStatusList: string[];
    planList: string[];
    startDate: Date | null;
    endDate: Date | null;
  }
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;

  const filtered = subscriptions.filter((subscription) =>
    matchesHistoryFilters(subscription, filters)
  );

  const sorted = sortHistory(filtered, sortBy, sortOrder);
  const history = sorted.slice(skip, skip + limit);
  const total = filtered.length;
  const stats = calculateHistoryStats(filtered);

  return {
    stats,
    filters: {
      startDate: query.startDate || null,
      endDate: query.endDate || null,
      price: filters.priceList,
      status: filters.statusList,
      buyStatus: filters.buyStatusList,
      plan: filters.planList,
      userId: query.userId || null,
      sortBy,
      sortOrder: sortOrder === 1 ? 'asc' : 'desc',
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    },
    history,
  };
};

const getSubscriptionHistory = async (
  userId: string,
  query: TSubscriptionHistoryQuery
) => {
  const convertedUserId = idConverter(userId);
  if (!convertedUserId) {
    throw new Error('Invalid user id.');
  }

  const filters = buildHistoryFilters(query);
  const subscriptions = await SubscriptionModel.find({
    userId: convertedUserId,
  });

  return getHistoryWithStats(
    subscriptions as unknown as Record<string, any>[],
    query,
    filters
  );
};

const getAllMembersSubscriptionHistory = async (
  query: TSubscriptionHistoryQuery
) => {
  const filters = buildHistoryFilters(query);

  let subscriptions: Record<string, any>[] = [];

  if (query.userId) {
    const convertedUserId = idConverter(query.userId);
    if (!convertedUserId) {
      throw new Error('Invalid user id filter.');
    }

    subscriptions = (await SubscriptionModel.find({
      userId: convertedUserId,
    })) as unknown as Record<string, any>[];
  } else {
    subscriptions = (await SubscriptionModel.find()) as unknown as Record<
      string,
      any
    >[];
  }
  return getHistoryWithStats(subscriptions, query, filters);
};

export const subscriptionServices = {
  buySubscription,
  handleStripeCheckoutCompleted,
  cancelCurrentSubscription,
  getMyCurrentSubscription,
  getSubscriptionHistory,
  getAllMembersSubscriptionHistory,
};
