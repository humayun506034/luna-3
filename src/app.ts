// import express from 'express';
// const app = express();
// import cors from 'cors';
// import globalErrorHandler from './middleware/globalErrorHandler';
// import routeNotFound from './middleware/routeNotFound';
// import Routes from './routes';

// // middleWares
// app.use(express.json());
// // app.use(cors());
// app.use(
//   cors({
//     origin: ['*'],
//     methods: 'GET,POST,PUT,PATCH,DELETE',
//     allowedHeaders: 'Content-Type, Authorization',
//     credentials: true,
//   }),
// );

// app.get('/', (req, res) => {
//   res.send('Welcome to Barbell App..!');
// });

// // Stripe Webhook
// app.use(
//   '/api/v1/subscriptions/webhook/stripe',
//   express.raw({ type: 'application/json' })
// );

// // Routes
// app.use('/api/v1', Routes);

// // route not found
// app.use(routeNotFound);

// // global error handeller
// app.use(globalErrorHandler);

// export default app;


import express from 'express';
const app = express();
import cors from 'cors';
import globalErrorHandler from './middleware/globalErrorHandler';
import routeNotFound from './middleware/routeNotFound';
import Routes from './routes';
import { handleStripeWebhook } from './modules/subscription/subscription.controller';

// Stripe webhook must be raw and must come before express.json()
// app.post(
//   '/api/v1/subscriptions/webhook/stripe',
//   express.raw({ type: 'application/json' })
// );

app.post(
  '/api/v1/subscriptions/webhook/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook   // ✅ MUST add this
);

// normal middlewares
app.use(express.json());

app.use(
  cors({
    origin: ['*'],
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  }),
);

app.get('/', (req, res) => {
  res.send('Welcome to Barbell App..!');
});

app.use('/api/v1', Routes);

app.use(routeNotFound);
app.use(globalErrorHandler);

export default app;
