import express, { Router } from 'express';
import { userRole } from '../../constents';
import auth from '../../middleware/auth';
import { subscriptionController } from './subscription.controller';

const subscriptionRouter = Router();

subscriptionRouter.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleStripeWebhook
);

subscriptionRouter.post(
  '/buy-package',
  auth([userRole.user]),
  subscriptionController.buySubscription
);

subscriptionRouter.patch(
  '/cancel-package',
  auth([userRole.user]),
  subscriptionController.cancelCurrentSubscription
);

subscriptionRouter.get(
  '/my-subscription',
  auth([userRole.user]),
  subscriptionController.getMyCurrentSubscription
);

subscriptionRouter.get(
  '/history',
  auth([userRole.user]),
  subscriptionController.getSubscriptionHistory
);

subscriptionRouter.get(
  '/admin/history',
  auth([userRole.admin]),
  subscriptionController.getAllMembersSubscriptionHistory
);

export default subscriptionRouter;
