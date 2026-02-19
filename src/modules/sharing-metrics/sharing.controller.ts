import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { uploadImgToCloudinary } from '../../util/uploadImgToCludinary';

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new Error('Image file is required');
  }

  const imageName = `${file.originalname}-${Date.now()}`; // Unique name
  const uploadResult = await uploadImgToCloudinary(imageName, file.path);

  res.status(200).json({
    status: 'success',
    message: 'Image uploaded successfully',
    data: uploadResult.secure_url,
  });
});

export const sharingController = {
  uploadImage,
};
