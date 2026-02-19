import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import globalResponseHandler from '../../util/globalResponseHandeler';
import { receiptServices } from './receipt.service';

const scanReceipt = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { file } = req;
  const result = await receiptServices.scanReceipt(user.id, file!);

  return globalResponseHandler(res, {
    statusCode: 200,
    success: true,
    message: 'Receipt scanned successfully',
    data: result,
  });
});

const getAnalysis = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await receiptServices.getAnalysis(user.id);
  return globalResponseHandler(res, {
    statusCode: 200,
    success: true,
    message: 'Receipt scanned successfully',
    data: result,
  });
});

export const receiptController = {
  scanReceipt,
  getAnalysis,
};
