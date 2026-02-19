import { Request, Response } from 'express';
import Stripe from 'stripe';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import { subscriptionServices } from './subscription.service';

const buySubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await subscriptionServices.buySubscription(user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.paymentRequired
      ? 'Stripe checkout session created'
      : 'Subscription purchased successfully',
    data: result,
  });
});

const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Webhook signature verification failed';
    console.error('[Stripe Webhook] Signature verification failed:', errorMessage);
    res.status(400).send(`Webhook Error: ${errorMessage}`);
    return;
  }

  console.log('[Stripe Webhook] Event received:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const result = await subscriptionServices.handleStripeCheckoutCompleted(
        session as unknown as Record<string, any>
      );
      console.log(
        '[Stripe Webhook] checkout.session.completed processed:',
        JSON.stringify({
          processed: result.processed,
          message: result.message,
        })
      );
    } catch (error) {
      console.error(
        '[Stripe Webhook] DB update error:',
        error instanceof Error ? error.message : error
      );
    }
  }

  res.status(200).json({ received: true });
};

const cancelCurrentSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await subscriptionServices.cancelCurrentSubscription(user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Subscription cancelled successfully',
      data: result,
    });
  }
);

const getMyCurrentSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await subscriptionServices.getMyCurrentSubscription(user.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Subscription fetched successfully',
      data: result,
    });
  }
);

const getSubscriptionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await subscriptionServices.getSubscriptionHistory(user.id, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      price: req.query.price as string,
      status: req.query.status as string,
      buyStatus: req.query.buyStatus as string,
      plan: req.query.plan as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
      sortBy: req.query.sortBy as 'createdAt' | 'startDate' | 'endDate' | 'price',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Subscription history fetched successfully',
      data: result,
    });
  }
);

const getAllMembersSubscriptionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await subscriptionServices.getAllMembersSubscriptionHistory({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      price: req.query.price as string,
      status: req.query.status as string,
      buyStatus: req.query.buyStatus as string,
      plan: req.query.plan as string,
      userId: req.query.userId as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
      sortBy: req.query.sortBy as 'createdAt' | 'startDate' | 'endDate' | 'price',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All members subscription history fetched successfully',
      data: result,
    });
  }
);

export const subscriptionController = {
  buySubscription,
  handleStripeWebhook,
  cancelCurrentSubscription,
  getMyCurrentSubscription,
  getSubscriptionHistory,
  getAllMembersSubscriptionHistory,
};
