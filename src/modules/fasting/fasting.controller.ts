import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import { fastingServices } from './fasting.service';

const createFastingSchedule = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await fastingServices.createFastingSchedule(
      user.id,
      req.body,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'fasting schedule created',
      data: result,
    });
  },
);

const getSchedules = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await fastingServices.getSchedules(user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'fasting schedule created',
    data: result,
  });
});

export const fastingController = {
  createFastingSchedule,
  getSchedules,
};
