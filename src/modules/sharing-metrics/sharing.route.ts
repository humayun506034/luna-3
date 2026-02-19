import { Router } from 'express';
import { userRole } from '../../constents';
import auth from '../../middleware/auth';
import { upload } from '../../util/uploadImgToCludinary';
import { sharingController } from './sharing.controller';

const sharingRouter = Router();

sharingRouter.get(
  '/',
  auth([userRole.admin, userRole.user]),
  upload.single('file'),
  sharingController.uploadImage
);

export default sharingRouter;
