/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { TFood, TUserConsumedFood } from './food.interface';
import { FoodModel, UserConsumedFoodModel } from './food.model';
import {
  deleteFile,
  uploadImgToCloudinary,
} from '../../util/uploadImgToCludinary';
import config from '../../config';
import fs from 'fs';
import { UserModel } from '../user/user.model';
import { TMicroNutrient } from '../barbellLLM/barbel.interface';
import ApppError from '../../error/AppError';

// Define Multer file type for disk storage
interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

// const addFoodManually = async (
//   file: any,
//   payload: Partial<TFood>,
//   user_id?: Types.ObjectId
// ) => {
//   // Validate inputs
//   if (
//     !payload ||
//     !payload.name ||
//     !payload.servings ||
//     !payload.nutritionPerServing
//   ) {
//     throw new Error('Name, servings, and nutritionPerServing are required.');
//   }

//   if (
//     !payload.nutritionPerServing?.calories ||
//     !payload.nutritionPerServing?.protein ||
//     !payload.nutritionPerServing?.carbs ||
//     !payload.nutritionPerServing?.fats ||
//     !payload.nutritionPerServing?.fiber
//   ) {
//     throw new Error(
//       'All nutritionPerServing fields (calories, protein, carbs, fats, fiber) are required'
//     );
//   }

//   if (!file || !file.path) {
//     throw new Error('Image file is required.');
//   }

//   const session = await FoodModel.startSession();

//   try {
//     await session.startTransaction();
//     console.log('Transaction started for food creation');

//     // Upload image to Cloudinary
//     const imageName = `${payload.name}-${Date.now()}`; // Unique name
//     const uploadResult = await uploadImgToCloudinary(imageName, file.path);
//     const imageUrl = uploadResult.secure_url;
//     console.log('Image uploaded to Cloudinary:', imageUrl);

//     // Create food payload
//     const foodPayload: Partial<TFood> = {
//       ...payload,
//       img: imageUrl,
//       ...(user_id && { user_id }), // Include user_id if provided
//     };

//     // Create and save the food
//     const food = new FoodModel(foodPayload);
//     const savedFood = await food.save({ session });
//     console.log('Food saved:', savedFood._id);

//     // Commit the transaction
//     await session.commitTransaction();
//     console.log('Transaction committed');

//     return {
//       success: true,
//       message: 'Food created successfully.',
//       data: {
//         food: savedFood,
//       },
//     };
//   } catch (error: any) {
//     await session.abortTransaction();
//     console.error('Error creating food:', error);

//     // Clean up local file if upload failed
//     if (file && file.path) {
//       try {
//         await deleteFile(file.path);
//       } catch (deleteError) {
//         console.error('Error deleting file:', deleteError);
//       }
//     }

//     throw new Error(
//       error.message || 'Failed to create food due to an internal error.'
//     );
//   } finally {
//     session.endSession();
//     console.log('Session ended');
//   }
// };

// create (service) - only name required, always draft at create time

const addFoodManually = async (
  payload: Partial<TFood>,
  file?: Express.Multer.File,
  user_id?: Types.ObjectId
) => {
  if (!payload?.name?.trim()) {
    throw new Error('Food name is required.');
  }

  const session = await FoodModel.startSession();
  session.startTransaction();

  try {
    let imageUrl = payload.img || '';

    // Upload image if file exists
    if (file?.path) {
      const imageName = `${payload.name.trim()}-${Date.now()}`;
      const uploadResult = await uploadImgToCloudinary(imageName, file.path);
      imageUrl = uploadResult.secure_url;
    }

    const foodPayload: Partial<TFood> = {
      name: payload.name.trim(),
      img: imageUrl,
      user_id,
      ingredients: payload.ingredients ?? [],
      instructions: payload.instructions,
      servings: payload.servings,
      preparationTime: payload.preparationTime,
      nutritionPerServing: payload.nutritionPerServing,
      microNutrients: payload.microNutrients ?? [],
      status: 'draft',
      publishedAt: undefined,
    };

    const savedFood = await FoodModel.create([foodPayload], { session });

    await session.commitTransaction();

    return savedFood[0];

    // return {
    //   success: true,
    //   message: 'Food draft created successfully.',
    //   data:
    // };
  } catch (error: any) {
    await session.abortTransaction();

    // delete local file if upload fails
    if (file?.path) {
      try {
        await deleteFile(file.path);
      } catch (cleanupError) {
        console.error('File cleanup failed:', cleanupError);
      }
    }

    throw new Error(error?.message || 'Failed to create food');
  } finally {
    session.endSession();
  }
};

// update (service) - auto publish when required fields become complete


const addPersonalizeFoodManually = async (
  file: any,
  payload: Partial<TFood>,
  user_id?: Types.ObjectId
) => {
  // const result = await addFoodManually(file, payload, user_id);
  // return result;
};

const isPublishReady = (food: {
  name?: string;
  servings?: number;
  preparationTime?: number;
  nutritionPerServing?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
  };
}) => {
  const n = food.nutritionPerServing;
  return (
    !!food.name &&
    typeof food.servings === 'number' &&
    typeof food.preparationTime === 'number' &&
    !!n &&
    [n.calories, n.protein, n.carbs, n.fats, n.fiber].every(
      (v) => typeof v === 'number'
    )
  );
};

const updateFood = async (
  foodId: Types.ObjectId,
  userId: Types.ObjectId,
  foodData: FoodData,
  file?: Express.Multer.File
): Promise<any> => {
  try {
    const food = await FoodModel.findById(foodId);
    if (!food) throw new Error('Food not found');

    if (food.user_id) {
      if (!food.user_id.equals(userId)) {
        throw new Error('Unauthorized: User ID does not match');
      }
    } else {
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update public food');
      }
    }

    let imgUrl = food.img;
    if (file?.path) {
      const imageName = `food_${foodId}_${Date.now()}`;
      const uploadResult = await uploadImgToCloudinary(imageName, file.path);
      imgUrl = uploadResult.secure_url;
      await deleteFile(file.path);
    } else if (foodData.img) {
      imgUrl = foodData.img;
    }

    const normalizeMicroNutrients = (
      input: any
    ): { name: string; amount: string }[] => {
      if (!input) return [];
      if (Array.isArray(input)) {
        return input.map((item) => ({
          name: item.name,
          amount: item.amount.toString(),
        }));
      }
      return Object.entries(input).map(([name, amount]) => ({
        name,
        amount: String(amount ?? ''),
      }));
    };

    const updateData: any = {
      name: foodData.name ?? food.name,
      ingredients: foodData.ingredients ?? food.ingredients,
      instructions: foodData.instructions ?? food.instructions,
      servings:
        typeof foodData.servings === 'string'
          ? parseInt(foodData.servings, 10)
          : (foodData.servings ?? food.servings),
      preparationTime:
        typeof foodData.preparationTime === 'string'
          ? parseInt(foodData.preparationTime, 10)
          : (foodData.preparationTime ?? food.preparationTime),
      nutritionPerServing: {
        calories:
          typeof foodData.nutritionPerServing?.calories === 'string'
            ? parseFloat(foodData.nutritionPerServing.calories)
            : (foodData.nutritionPerServing?.calories ?? food.nutritionPerServing?.calories),
        protein:
          typeof foodData.nutritionPerServing?.protein === 'string'
            ? parseFloat(foodData.nutritionPerServing.protein)
            : (foodData.nutritionPerServing?.protein ?? food.nutritionPerServing?.protein),
        carbs:
          typeof foodData.nutritionPerServing?.carbs === 'string'
            ? parseFloat(foodData.nutritionPerServing.carbs)
            : (foodData.nutritionPerServing?.carbs ?? food.nutritionPerServing?.carbs),
        fats:
          typeof foodData.nutritionPerServing?.fats === 'string'
            ? parseFloat(foodData.nutritionPerServing.fats)
            : (foodData.nutritionPerServing?.fats ?? food.nutritionPerServing?.fats),
        fiber:
          typeof foodData.nutritionPerServing?.fiber === 'string'
            ? parseFloat(foodData.nutritionPerServing.fiber)
            : (foodData.nutritionPerServing?.fiber ?? food.nutritionPerServing?.fiber),
      },
      microNutrients: foodData.microNutrients
        ? normalizeMicroNutrients(foodData.microNutrients)
        : food.microNutrients,
      img: imgUrl,
      updatedAt: new Date(),
    };

    const nextState = { ...food.toObject(), ...updateData };
    const ready = isPublishReady(nextState);

    updateData.status = ready ? 'published' : 'draft';
    updateData.publishedAt = ready ? (food.publishedAt || new Date()) : null;

    const updatedFood = await FoodModel.findOneAndUpdate(
      { _id: foodId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedFood) throw new Error('Failed to update food');
    return updatedFood;
  } catch (error: any) {
    if (file?.path) {
      try {
        await deleteFile(file.path);
      } catch {}
    }
    throw new Error(error.message || 'Failed to update food');
  }
};

export const assertFoodPublishReadyById = async (
  foodId: string | Types.ObjectId
): Promise<true> => {
  const id = String(foodId);

  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid food id');
  }

  const food = await FoodModel.findById(id).lean();
  if (!food) {
    throw new Error('Food not found');
  }

  const missing: string[] = [];

  if (!food.name || !String(food.name).trim()) missing.push('name');

  if (typeof food.servings !== 'number' || Number.isNaN(food.servings)) {
    missing.push('servings');
  }

  if (
    typeof food.preparationTime !== 'number' ||
    Number.isNaN(food.preparationTime)
  ) {
    missing.push('preparationTime');
  }

  const n = food.nutritionPerServing as
    | {
        calories?: number;
        protein?: number;
        carbs?: number;
        fats?: number;
        fiber?: number;
      }
    | undefined;

  if (!n) {
    missing.push('nutritionPerServing');
  } else {
    if (typeof n.calories !== 'number' || Number.isNaN(n.calories))
      missing.push('nutritionPerServing.calories');
    if (typeof n.protein !== 'number' || Number.isNaN(n.protein))
      missing.push('nutritionPerServing.protein');
    if (typeof n.carbs !== 'number' || Number.isNaN(n.carbs))
      missing.push('nutritionPerServing.carbs');
    if (typeof n.fats !== 'number' || Number.isNaN(n.fats))
      missing.push('nutritionPerServing.fats');
    if (typeof n.fiber !== 'number' || Number.isNaN(n.fiber))
      missing.push('nutritionPerServing.fiber');
  }

  if (missing.length) {
    throw new Error(
      `Food is not publish yet, this is not consumed ready. Missing/invalid fields: ${missing.join(', ')}`
    );
  }

  return true;
};






// AI API function to get nutrition data from raw image using fetch
const getNutritionFromAI = async (file: MulterFile) => {
  const aiCaloryCountEndPoint = 'analyze-meal-nutrition';
  const fullAiApi = `${config.AI_BASE_URL}${aiCaloryCountEndPoint}`;

  try {
    // Log file details for debugging
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path || 'No path',
    });

    // Read file from disk into a Buffer
    const fileBuffer = fs.readFileSync(file.path);
    // Create Blob from Buffer
    const blob = new Blob([fileBuffer], { type: file.mimetype });

    // Prepare form-data for AI API
    const formData = new FormData();
    formData.append('image', blob, file.originalname);

    // Make POST request to AI API using fetch
    const response = await fetch(fullAiApi, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    console.log('AI response status:', response.status, response.statusText);

    if (!response.ok) {
      // Log response body for errors
      const errorData = await response.json();
      console.error('AI API error response:', errorData);
      throw new Error(
        `AI API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    // Parse AI response (values are strings)
    const data = await response.json();
    console.log('AI response:', data);
    const {
      total_protein_g,
      total_carbs_g,
      total_fats_g,
      total_fiber_g,
      total_calories,
      micro_nutrients,
    } = data;

    // Convert string values to numbers
    return {
      calories: parseFloat(total_calories) || 0,
      protein: parseFloat(total_protein_g) || 0,
      carbs: parseFloat(total_carbs_g) || 0,
      fats: parseFloat(total_fats_g) || 0,
      fiber: parseFloat(total_fiber_g) || 0,
      micro_nutrients,
    };
  } catch (error: any) {
    console.error('AI API error:', error.message);
    throw new Error('Failed to fetch nutrition data from AI API');
  }
};

const analyzeFoodIngredient = async (file?: MulterFile) => {
  if (!file) {
    throw new ApppError(400, 'File is required');
  }

  const endpoint = 'ingredient-scanner';
  const fullAiApi = `${config.AI_BASE_URL}${endpoint}`;

  const fileBuffer = await fs.promises.readFile(file.path);

  const blob = new Blob([fileBuffer], { type: file.mimetype });

  const formData = new FormData();
  formData.append('image', blob, file.originalname);

  try {
    const response = await fetch(fullAiApi, {
      method: 'POST',
      headers: {
        accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('analyzeFoodIngredient error:', error);
    throw new ApppError(500, 'Failed to analyze food');
  }
};

const addConsumedFoodFromImgOrQRCodeOrFoodId = async (
  user_id: Types.ObjectId,
  consumedAs: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  file?: MulterFile,
  parsedData?: Partial<TUserConsumedFood>,
  food_id?: Types.ObjectId
): Promise<TUserConsumedFood> => {
  if (!user_id) throw new Error('User ID is required');
  if (!file && !parsedData && !food_id)
    throw new Error('At least one of file, data, or food_id must be provided');
  if (!consumedAs) throw new Error('consumedAs is required');

  let nutritionPerServing: TUserConsumedFood['nutritionPerServing'];
  let servings: number = parsedData?.servings || 1;

  // ----------------------------
  // Helper: Convert AI micro nutrients array [{name, amount}] => {name: number}
  // ----------------------------
  const convertAIMicroNutrientsToNumbers = (
    arr: { name: string; amount: string }[],
    servings: number
  ): TMicroNutrient => {
    const obj: TMicroNutrient = {};
    arr.forEach((item) => {
      const num = parseFloat(item.amount.replace(/[^\d.]/g, '')) || 0;
      // @ts-ignore
      obj[item.name] = num * servings;
    });
    return obj;
  };

  // ----------------------------
  // Helper: Ensure all values in an object are numbers and multiplied by servings
  // ----------------------------
  const calculateMicroNutrients = (
    data: TMicroNutrient,
    servings: number
  ): TMicroNutrient => {
    const result: TMicroNutrient = {};
    Object.entries(data).forEach(([key, value]) => {
      const numericValue = typeof value === 'number' ? value : 0;
      // @ts-ignore
      result[key as keyof TMicroNutrient] = numericValue * servings;
    });
    return result;
  };

  try {
    let micro_nutrients: TMicroNutrient = {};

    // ----------------------------
    // CASE 1: AI file
    // ----------------------------
    if (file) {
      const aiData = await getNutritionFromAI(file);
      micro_nutrients = convertAIMicroNutrientsToNumbers(
        aiData.micro_nutrients || [],
        servings
      );

      nutritionPerServing = {
        calories: aiData.calories * servings,
        protein: aiData.protein * servings,
        carbs: aiData.carbs * servings,
        fats: aiData.fats * servings,
        fiber: aiData.fiber * servings,
      };
    }
    // ----------------------------
    // CASE 2: parsedData
    // ----------------------------
    else if (parsedData?.nutritionPerServing) {
      nutritionPerServing = {
        calories: (parsedData.nutritionPerServing.calories || 0) * servings,
        protein: (parsedData.nutritionPerServing.protein || 0) * servings,
        carbs: (parsedData.nutritionPerServing.carbs || 0) * servings,
        fats: (parsedData.nutritionPerServing.fats || 0) * servings,
        fiber: (parsedData.nutritionPerServing.fiber || 0) * servings,
      };

      if (parsedData.microNutrients) {
        if (Array.isArray(parsedData.microNutrients)) {
          // Convert array [{name, amount}] => object
          micro_nutrients = parsedData.microNutrients.reduce((acc, curr) => {
            // @ts-ignore
            acc[curr.name] = parseFloat(curr?.amount.toString()) * servings;
            return acc;
          }, {} as TMicroNutrient);
        } else {
          // Already an object
          micro_nutrients = calculateMicroNutrients(
            parsedData.microNutrients,
            servings
          );
        }
      }
    }
    // ----------------------------
    // CASE 3: food_id
    // ----------------------------
    else if (food_id) {
      const food = await FoodModel.findById(food_id);
      if (!food) throw new Error('Food not found with food_id');

      nutritionPerServing = {
        calories: (food.nutritionPerServing as any).calories * servings,
        protein: (food.nutritionPerServing as any).protein * servings,
        carbs: (food.nutritionPerServing as any).carbs * servings,
        fats: (food.nutritionPerServing as any).fats * servings,
        fiber: (food.nutritionPerServing as any).fiber * servings,
      };

      if (parsedData?.microNutrients) {
        if (Array.isArray(parsedData.microNutrients)) {
          micro_nutrients = parsedData.microNutrients.reduce((acc, curr) => {
            // @ts-ignore
            acc[curr.name] = parseFloat(curr?.amount.toString()) * servings;
            return acc;
          }, {} as TMicroNutrient);
        } else {
          micro_nutrients = calculateMicroNutrients(
            parsedData.microNutrients,
            servings
          );
        }
      }
      servings = parsedData?.servings || (food.servings as any);
    } else {
      throw new Error(
        'Invalid input: Provide a valid file, nutrition data, or food_id'
      );
    }

    // ----------------------------
    // Validate main nutrition
    // ----------------------------
    if (
      nutritionPerServing.calories === undefined ||
      nutritionPerServing.protein === undefined ||
      nutritionPerServing.carbs === undefined ||
      nutritionPerServing.fats === undefined ||
      nutritionPerServing.fiber === undefined
    ) {
      throw new Error('All nutritionPerServing fields are required');
    }

    // ----------------------------
    // Convert micro_nutrients object to array for schema
    // ----------------------------
    const microNutrientsArray = Object.entries(micro_nutrients).map(
      ([name, amount]) => ({
        name,
        amount: amount.toString(),
      })
    );

    const consumedFoodPayload: TUserConsumedFood = {
      user_id,
      consumedAs,
      nutritionPerServing,
      microNutrients: microNutrientsArray,
      servings,
    };

    const consumedFood = new UserConsumedFoodModel(consumedFoodPayload);
    const savedConsumedFood = await consumedFood.save();

    return savedConsumedFood;
  } catch (error: any) {
    console.error('Error creating consumed food:', error);
    throw new Error(error.message || 'Failed to create consumed food');
  }
};

const deleteConsumedFood = async (foodId: string, user_id?: string) => {
  if (!user_id) throw new Error('Unauthorized');

  // Validate ObjectId format (optional but recommended)
  if (!Types.ObjectId.isValid(foodId)) {
    throw new Error('Invalid food ID');
  }

  const consumedFood = await UserConsumedFoodModel.findOne({
    _id: foodId,
    user_id,
  });
  if (!consumedFood) throw new Error('Consumed food not found or unauthorized');

  await UserConsumedFoodModel.deleteOne({ _id: foodId });

  return { message: 'Consumed food deleted successfully' };
};

const getAllFood = async (user_id: Types.ObjectId): Promise<TFood[]> => {
  try {
    // Validate user_id
    if (!user_id || !Types.ObjectId.isValid(user_id)) {
      throw new Error('Invalid user ID');
    }

    // Query food: include personalized (user_id matches) and common (user_id is null)
    const foods = await FoodModel.find({
      $or: [
        { user_id: user_id }, // Personalized food
        { user_id: null }, // Common food
      ],
    })
      .lean() // Convert to plain JavaScript objects for performance
      .sort({ user_id: -1 }); // Sort: personalized (user_id exists) first, common (null) last

    return foods;
  } catch (error: any) {
    console.error('Error fetching food:', error);
    throw new Error(error.message || 'Failed to fetch food');
  }
};

interface FoodData {
  name?: string;
  ingredients?: string[];
  instructions?: string;
  servings?: number | string; // Allow string from form-data
  preparationTime?: number | string; // Allow string from form-data
  nutritionPerServing?: {
    calories?: number | string; // Allow string from form-data
    protein?: number | string;
    carbs?: number | string;
    fats?: number | string;
    fiber?: number | string;
  };
  microNutrients?: TMicroNutrient[];
  img?: string; // Optional URL if no file uploaded
}

// const updateFood = async (
//   foodId: Types.ObjectId,
//   userId: Types.ObjectId,
//   foodData: FoodData,
//   file?: Express.Multer.File
// ): Promise<any> => {
//   try {
//     // Find food item
//     const food = await FoodModel.findById(foodId);
//     if (!food) {
//       throw new Error('Food not found');
//     }

//     // Check authorization
//     if (food.user_id) {
//       if (!food.user_id.equals(userId)) {
//         throw new Error('Unauthorized: User ID does not match');
//       }
//     } else {
//       // Public food (user_id: null), check if user is admin
//       const user = await UserModel.findById(userId);
//       if (!user || user.role !== 'admin') {
//         throw new Error('Unauthorized: Only admins can update public food');
//       }
//     }

//     // Handle image upload
//     let imgUrl = food.img;
//     if (file) {
//       try {
//         const imageName = `food_${foodId}_${Date.now()}`; // Unique name
//         const uploadResult = await uploadImgToCloudinary(imageName, file.path);
//         imgUrl = uploadResult.secure_url;
//         await deleteFile(file.path); // Delete temp file
//       } catch (error) {
//         console.error('Error uploading to Cloudinary:', error);
//         throw new Error('Failed to upload image');
//       }
//     } else if (foodData.img) {
//       imgUrl = foodData.img; // Use provided URL if no file
//     }

//     console.log('incoming food data is here =====>>>>>>>', foodData.name);

//     const normalizeMicroNutrients = (
//       input: any
//     ): { name: string; amount: string }[] => {
//       if (!input) return [];

//       // Case A: already array
//       if (Array.isArray(input)) {
//         return input.map((item) => ({
//           name: item.name,
//           amount: item.amount.toString(),
//         }));
//       }

//       // Case B: object style { sodium: 30, potassium: 200 }
//       // @ts-ignore
//       return Object.entries(input).map(([name, amount]) => ({
//         name,
//         amount: amount?.toString(),
//       }));
//     };

//     // Prepare update data with type conversion
//     const updateData = {
//       name: foodData.name || food.name,
//       ingredients: foodData.ingredients || food.ingredients,
//       instructions: foodData.instructions || food.instructions,
//       servings:
//         typeof foodData.servings === 'string'
//           ? parseInt(foodData.servings, 10)
//           : foodData.servings || food.servings,
//       preparationTime:
//         typeof foodData.preparationTime === 'string'
//           ? parseInt(foodData.preparationTime, 10)
//           : foodData.preparationTime || food.preparationTime,
//       nutritionPerServing: {
//         calories:
//           typeof foodData.nutritionPerServing?.calories === 'string'
//             ? parseFloat(foodData.nutritionPerServing.calories)
//             : foodData.nutritionPerServing?.calories ||
//               (food.nutritionPerServing as any).calories,
//         protein:
//           typeof foodData.nutritionPerServing?.protein === 'string'
//             ? parseFloat(foodData.nutritionPerServing.protein)
//             : foodData.nutritionPerServing?.protein ||
//               (food.nutritionPerServing as any).protein,
//         carbs:
//           typeof foodData.nutritionPerServing?.carbs === 'string'
//             ? parseFloat(foodData.nutritionPerServing.carbs)
//             : foodData.nutritionPerServing?.carbs ||
//               (food.nutritionPerServing as any).carbs,
//         fats:
//           typeof foodData.nutritionPerServing?.fats === 'string'
//             ? parseFloat(foodData.nutritionPerServing.fats)
//             : foodData.nutritionPerServing?.fats ||
//               (food.nutritionPerServing as any).fats,
//         fiber:
//           typeof foodData.nutritionPerServing?.fiber === 'string'
//             ? parseFloat(foodData.nutritionPerServing.fiber)
//             : foodData.nutritionPerServing?.fiber ||
//               (food.nutritionPerServing as any).fiber,
//       },
//       microNutrients: foodData.microNutrients
//         ? normalizeMicroNutrients(foodData.microNutrients)
//         : food.microNutrients,
//       img: imgUrl,
//       updatedAt: new Date(), // Explicitly set for debugging
//     };

//     console.log('data to be updated is here =====>>>>', updateData);

//     // Update food item with $set
//     const updatedFood = await FoodModel.findOneAndUpdate(
//       { _id: foodId },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedFood) {
//       throw new Error('Failed to update food: Document not found');
//     }

//     return updatedFood;
//   } catch (error: any) {
//     // Clean up local file if upload failed
//     if (file && file.path) {
//       try {
//         await deleteFile(file.path);
//       } catch (deleteError) {
//         console.error('Error deleting file:', deleteError);
//       }
//     }
//     console.error(`Error updating food ${foodId}:`, error);
//     throw new Error(error.message || 'Failed to update food');
//   }
// };

const deleteFood = async (
  foodId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<void> => {
  try {
    // Find food item
    const food = await FoodModel.findOne({ _id: foodId });

    console.log('here we go ===>>', food);
    if (!food) {
      throw new Error('Food not found');
    }

    // Check authorization
    if (food.user_id) {
      if (!food.user_id.equals(userId)) {
        throw new Error('Unauthorized: User ID does not match');
      }
    } else {
      // Public food (user_id: null), check if user is admin
      const user = await UserModel.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can delete public food');
      }
    }

    // Delete food item
    const result = await FoodModel.deleteOne({ _id: foodId });
    if (result.deletedCount === 0) {
      throw new Error('Failed to delete food: Document not found');
    }

    console.log(`Food ${foodId} deleted successfully`);
  } catch (error: any) {
    console.error(`Error deleting food ${foodId}:`, error);
    throw new Error(error.message || 'Failed to delete food');
  }
};

const foodLoadingServices = {
  addFoodManually,
  addPersonalizeFoodManually,
  addConsumedFoodFromImgOrQRCodeOrFoodId,
  getAllFood,
  updateFood,
  deleteFood,
  deleteConsumedFood,
  analyzeFoodIngredient,
};

export default foodLoadingServices;
