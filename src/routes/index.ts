import express from 'express';
import analysisRoutes from '../modules/analysis/analysis.route';
import authRouter from '../modules/auth/auth.routes';
import barbellRoutes from '../modules/barbellLLM/barbel.routes';
import fastingRouter from '../modules/fasting/fasting.route';
import foodAnalysisRoutes from '../modules/foodAnalysis/foodanalysis.route';
import foodRoutes from '../modules/foodLooging/food.route';
import habitRoutes from '../modules/habits/habiits.routes';
import notificationRouter from '../modules/notifications/notification.route';
import privacyPolicyRoutes from '../modules/privacyPolicy/privacyPolicy.route';
import receiptRouter from '../modules/receipt/receipt.route';
import sharingRouter from '../modules/sharing-metrics/sharing.route';
import articleRoute from '../modules/tips/articleTips/article.route';
import tipsRoute from '../modules/tips/tips.route';
import userRoutes from '../modules/user/user.routes';
import exerciseRoutes from '../modules/workout/exercise.routes';
import router from './habirRoutes';
import subscriptionRouter from '../modules/subscription/subscription.route';
import newWorkoutRouter from '../modules/newWorkout/newWorkout.route';

const Routes = express.Router();
// Array of module routes
const moduleRouts = [
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/users',
    router: userRoutes,
  },
  {
    path: '/habits',
    router: habitRoutes,
  },
  {
    path: '/exercise',
    router: exerciseRoutes,
  },
  {
    path: '/foods',
    router: foodRoutes,
  },
  {
    path: '/barbelLLM',
    router: barbellRoutes,
  },
  {
    path: '/tips',
    router: tipsRoute,
  },
  {
    path: '/articles',
    router: articleRoute,
  },
  {
    path: '/analysis',
    router: analysisRoutes,
  },
  {
    path: '/foodAnalysis',
    router: foodAnalysisRoutes,
  },
  {
    path: '/notifications',
    router: notificationRouter,
  },
  {
    path: '/privacy-policy',
    router: privacyPolicyRoutes,
  },
  {
    path: '/fasting',
    router: fastingRouter,
  },
  {
    path: '/receipt',
    router: receiptRouter,
  },
  {
    path: '/upload-image',
    router: sharingRouter,
  },
  {
    path:"/subscriptions",
    router:subscriptionRouter
  }
  ,
  {
    path:"/new-workout",
    router:newWorkoutRouter
  }
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
