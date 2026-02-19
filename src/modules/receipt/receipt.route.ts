import { Router } from 'express';
import { userRole } from '../../constents';
import auth from '../../middleware/auth';
import { upload } from '../../util/uploadImgToCludinary';
import { receiptController } from './receipt.controller';

const receiptRouter = Router();

receiptRouter.post(
  '/scan-receipt',
  auth([userRole.user]),
  upload.single('file'),
  receiptController.scanReceipt
);

receiptRouter.get(
  '/get-analysis',
  auth([userRole.user]),
  receiptController.getAnalysis
);

export default receiptRouter;
