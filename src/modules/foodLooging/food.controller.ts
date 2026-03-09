/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import foodLoadingServices, {
  assertFoodPublishReadyById,
} from './food.service';

// const addFoodManually = catchAsync(async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     throw new Error('Image file is required');
//   }

//   const data = req.body.data;
//   if (!data) {
//     throw new Error('Data must be provided');
//   }

//   const parsedData = JSON.parse(data);

//   const result = await foodLoadingServices.addFoodManually(file, parsedData);

//   res.status(200).json({
//     status: 'success',
//     message: 'Food created successfully',
//     data: result.data.food,
//   });
// });

const addFoodManually = catchAsync(async (req, res) => {
  const file = req.file || null;

  let parsedData;

  // যদি form-data থেকে আসে
  if (req.body.data) {
    parsedData = JSON.parse(req.body.data);
  }
  // যদি raw JSON আসে
  else {
    parsedData = req.body;
  }

  const result = await foodLoadingServices.addFoodManually(
    parsedData,
    file as any,
    req.user?.id
  );

  // console.log(parsedData, file, req.user?.id);

  res.status(200).json({
    status: 'success',
    message: `Food ${result?.status} successfully`,
    data: result,
  });
});

const addPersonalizeFoodManually = catchAsync(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new Error('Image file is required');
  }

  const data = req.body.data;
  if (!data) {
    throw new Error('Data must be provided');
  }

  const parsedData = JSON.parse(data);
  const user_id = req.user?.id; // Assuming user_id is available from auth middleware

  const result = await foodLoadingServices.addPersonalizeFoodManually(
    file,
    parsedData,
    user_id
  );

  // res.status(200).json({
  //   status: 'success',
  //   message: 'personalize Food created successfully',
  //   data: result.data.food,
  // });
});

const addConsumedFoodFromImgOrQRCodeOrFoodId = catchAsync(async (req, res) => {
  const file = req.file;
  const data = req.body.data;
  const consumedAs = req.query.consumedAs as
    | 'breakfast'
    | 'lunch'
    | 'dinner'
    | 'snack';
  if (!consumedAs) {
    throw new Error('consumed as must be there');
  }
  let parsedData;
  let convertedFood_id;
  if (data) {
    parsedData = JSON.parse(data);
  }
  const food_id = req.query.food_id as string;
  if (food_id) {
    convertedFood_id = idConverter(food_id) as Types.ObjectId;
  }

  const user_id = req.user?.id;
  const convertedUserId = idConverter(user_id) as Types.ObjectId;

  if (!convertedUserId && (!file || !parsedData || !convertedFood_id)) {
    throw new Error('any of the required field went missing ');
  }

  const isFoodReady = await assertFoodPublishReadyById(food_id); // throw করবে বা true দিবে

  if (isFoodReady === true) {
    const result =
      await foodLoadingServices.addConsumedFoodFromImgOrQRCodeOrFoodId(
        convertedUserId,
        consumedAs,
        file,
        parsedData,
        convertedFood_id
      );

    res.status(200).json({
      status: 'success',
      message: 'Food consumed successfully',
      data: result,
    });
  }
});

const deleteConsumedFood = catchAsync(async (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) throw new Error('Unauthorized');

  const foodId = req.params.id;
  if (!foodId) throw new Error('Consumed food ID is required');

  const result = await foodLoadingServices.deleteConsumedFood(
    foodId as string,
    user_id
  );

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

const getAllFood = catchAsync(async (req, res) => {
  const user_id = req.user.id as string;
  const convertedId = idConverter(user_id) as Types.ObjectId;

  const result = await foodLoadingServices.getAllFood(convertedId);

  res.status(200).json({
    status: 'success',
    message: 'personalize and common both Food found successfully',
    data: result,
  });
});

const updateFood = catchAsync(async (req, res) => {
  const foodId = req.query.foodId as string;
  const userId = req.user?.id as string;
  const file = req.file; // optional (photo-only support)

  if (!userId) {
    throw new Error('User ID is required');
  }
  if (!foodId || !Types.ObjectId.isValid(foodId)) {
    throw new Error('Invalid food ID');
  }

  // Supports both:
  // 1) multipart/form-data -> req.body.data (JSON string) OR normal form fields
  // 2) application/json    -> req.body مستقیم object
  let foodData: Record<string, any> = {};

  const contentType = (req.headers['content-type'] || '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    if (req.body?.data) {
      try {
        foodData = JSON.parse(req.body.data);
      } catch {
        throw new Error('Invalid JSON in form-data "data" field');
      }
    } else {
      // if client sends plain form fields without data JSON
      foodData = { ...req.body };
    }
  } else {
    // application/json
    foodData = req.body && typeof req.body === 'object' ? req.body : {};
  }

  // must have at least one update source: file or data
  if (!file && Object.keys(foodData).length === 0) {
    throw new Error('Provide at least one of: photo file or update data');
  }

  let convertedUserId: Types.ObjectId;
  let convertedFoodId: Types.ObjectId;
  try {
    convertedUserId = idConverter(userId) as Types.ObjectId;
    convertedFoodId = idConverter(foodId) as Types.ObjectId;
  } catch {
    throw new Error('Invalid ID format');
  }

  const updatedFood = await foodLoadingServices.updateFood(
    convertedFoodId,
    convertedUserId,
    foodData,
    file
  );

  res.status(200).json({
    status: 'success',
    message: `Food updated successfully. Status currently is ${updatedFood.status}`,
    data: updatedFood,
  });
});

const deleteFood = catchAsync(async (req, res) => {
  const foodId = req.query.foodId as string;
  const userId = req.user?.id as string;

  if (!userId) {
    throw new Error('User ID is required');
  }

  let convertedUserId: Types.ObjectId;
  let convertedFoodId: Types.ObjectId;
  try {
    convertedUserId = idConverter(userId) as Types.ObjectId;
    convertedFoodId = idConverter(foodId) as Types.ObjectId;
  } catch (error) {
    throw new Error('Invalid user ID format');
  }

  await foodLoadingServices.deleteFood(convertedFoodId, convertedUserId);

  res.status(200).json({ success: true, message: 'Food deleted successfully' });
});

const analyzeFoodIngredient = catchAsync(async (req, res) => {
  const result = await foodLoadingServices.analyzeFoodIngredient(req.file);
  res.status(200).json({
    status: 'success',
    message: 'Food analyzed successfully',
    data: result,
  });
});

const foodLoaderController = {
  addFoodManually,
  addPersonalizeFoodManually,
  addConsumedFoodFromImgOrQRCodeOrFoodId,
  getAllFood,
  updateFood,
  deleteFood,
  deleteConsumedFood,
  analyzeFoodIngredient,
};

export default foodLoaderController;
