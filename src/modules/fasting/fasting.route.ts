import { Router } from 'express';
import { userRole } from '../../constents';
import auth from '../../middleware/auth';
import { fastingController } from './fasting.controller';

const fastingRouter = Router();

fastingRouter.post(
  '/create-fasting-schedule',
  auth([userRole.user]),
  fastingController.createFastingSchedule,
);

fastingRouter.get(
  '/get-schedules',
  auth([userRole.user]),
  fastingController.getSchedules,
);

export default fastingRouter;
