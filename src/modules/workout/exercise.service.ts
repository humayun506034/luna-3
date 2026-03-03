// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from 'axios';
// import mongoose, { Types } from 'mongoose';
// import { EXERCISE_TYPES } from '../../constents';
// import ApppError from '../../error/AppError';
// import {
//   deleteFile,
//   uploadImgToCloudinary,
// } from '../../util/uploadImgToCludinary';
// import { WorkoutASetupModel } from '../user/user.model';
// import { TExercise } from './exercise.interface';
// import { ExerciseModel, UserExercisePerformModel } from './exercise.model';

// const createCommonExercise = async (
//   file: any,
//   payload: Partial<TExercise>,
//   user_id?: Types.ObjectId
// ) => {
//   // Validate inputs
//   if (
//     !payload ||
//     !payload.name ||
//     !payload.description ||
//     !payload.primaryMuscleGroup ||
//     !payload.exerciseType
//   ) {
//     throw new Error('Exercise name and description are required.');
//   }

//   if (!file || !file.path) {
//     throw new Error('Image file is required.');
//   }

//   // Check MongoDB connection state
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB connection is not ready.');
//   }

//   try {
//     console.log('Starting exercise creation');

//     // Upload image to Cloudinary
//     const imageName = `${payload.name}-${Date.now()}`; // Unique name
//     const uploadResult = await uploadImgToCloudinary(imageName, file.path);
//     const imageUrl = uploadResult.secure_url;
//     console.log('Image uploaded to Cloudinary:', imageUrl);

//     // Create exercise payload
//     const exercisePayload = {
//       name: payload.name,
//       user_id: user_id ? user_id : null,
//       description: payload.description,
//       img: imageUrl,
//       primaryMuscleGroup: payload.primaryMuscleGroup,
//       exerciseType: payload.exerciseType,
//     };

//     // Create the exercise
//     const createdExercise = await ExerciseModel.create(exercisePayload);
//     console.log('Exercise created:', createdExercise._id);

//     return {
//       success: true,
//       message: 'Exercise created successfully.',
//       data: {
//         exercise: createdExercise,
//       },
//     };
//   } catch (error: any) {
//     console.error('Error creating exercise:', error);

//     // Clean up local file if upload failed
//     if (file && file.path) {
//       try {
//         await deleteFile(file.path);
//       } catch (deleteError) {
//         console.error('Error deleting file:', deleteError);
//       }
//     }

//     throw new Error(
//       error.message || 'Failed to create exercise due to an internal error.'
//     );
//   }
// };

// const createPersonalizeExercise = async (
//   file: any,
//   payLoad: Partial<TExercise>,
//   User_id: Types.ObjectId
// ) => {
//   const result = await createCommonExercise(file, payLoad, User_id);
//   return result;
// };

// const getExerciseBothCommonAndPersonalize = async (
//   user_id: Types.ObjectId
// ): Promise<TExercise[]> => {
//   // Validate user_id
//   if (!Types.ObjectId.isValid(user_id)) {
//     throw new Error('Invalid user ID.');
//   }

//   // Check MongoDB connection state
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB connection is not ready.');
//   }

//   try {
//     // Fetch exercises, sorting personalized (user_id matches) first, then common (user_id: null)
//     const exercises = await ExerciseModel.find({
//       $or: [{ user_id: user_id }, { user_id: null }],
//     })
//       .sort({ user_id: -1 }) // Sort user_id desc: non-null (personalized) first, null last
//       .lean(); // Return plain objects for performance

//     return exercises;
//   } catch (error: any) {
//     console.error('Error fetching exercises:', error);
//     throw new Error('Failed to retrieve exercises.');
//   }
// };

// const getExerciseById = async (exercise_id: Types.ObjectId) => {
//   // Validate exercise_id
//   if (!Types.ObjectId.isValid(exercise_id)) {
//     throw new Error('Invalid exercise ID.');
//   }

//   // Check MongoDB connection
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB connection is not ready.');
//   }

//   try {
//     // Find exercise
//     const findExercise = await ExerciseModel.findOne({
//       _id: exercise_id,
//     }).lean();
//     if (!findExercise) {
//       throw new Error('Exercise not found.');
//     }

//     // Define common metadata
//     const meta = {
//       set: 'required',
//       reps: 'required',
//       resetTime: 'required',
//     };

//     // Determine modifyFoundData based on exerciseType
//     let modifyFoundData = {};
//     if (findExercise.exerciseType === EXERCISE_TYPES.weight_training) {
//       modifyFoundData = { weightLifted: 'required', ...meta };
//     } else if (
//       findExercise.exerciseType === EXERCISE_TYPES.bodyweight_exercises ||
//       findExercise.exerciseType === EXERCISE_TYPES.high_Intensity ||
//       findExercise.exerciseType === EXERCISE_TYPES.strength_Training
//     ) {
//       modifyFoundData = { weightLifted: 'optional', ...meta };
//     } else {
//       modifyFoundData = { weightLifted: 'false', ...meta };
//     }

//     // Return merged data
//     return { ...findExercise, ...modifyFoundData };
//   } catch (error: any) {
//     console.error('Error fetching exercise:', error);
//     throw new Error(error.message || 'Failed to retrieve exercise.');
//   }
// };

// //user exercise perform

// const performExercise = async (
//   user_id: Types.ObjectId,
//   payLoad: Partial<{
//     exercise_id: Types.ObjectId;
//     set: number;
//     weightLifted?: number;
//     reps: number;
//     timeToPerform?: number;
//     resetTime: number;
//     isCompleted: boolean;
//     totalCaloryBurn?: number;
//     distance?: number;
//   }>
// ) => {
//   // Find user
//   const user = await WorkoutASetupModel.findOne({ user_id }).lean();
//   if (!user) {
//     throw new Error('User not found');
//   }

//   // Validate user_id
//   if (!Types.ObjectId.isValid(user_id)) {
//     throw new Error('Invalid user ID');
//   }

//   // Validate required payload fields
//   if (
//     !payLoad.exercise_id ||
//     payLoad.set == null ||
//     payLoad.reps == null ||
//     payLoad.resetTime == null
//   ) {
//     throw new Error('exercise_id, set, reps, and resetTime are required');
//   }

//   // Validate exercise_id
//   if (!Types.ObjectId.isValid(payLoad.exercise_id as Types.ObjectId)) {
//     throw new Error('Invalid exercise ID');
//   }

//   // Check MongoDB connection
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB connection is not ready');
//   }

//   try {
//     // Find exercise
//     const findExercise = await ExerciseModel.findOne({
//       _id: payLoad.exercise_id,
//     }).lean();
//     if (!findExercise) {
//       throw new Error('Exercise not found');
//     }

//     // Validate weightLifted based on exerciseType
//     let validatedWeightLifted: number = payLoad.weightLifted ?? 0;
//     let distance: number | undefined = undefined;

//     if (findExercise.exerciseType === 'weight_training') {
//       if (validatedWeightLifted <= 0) {
//         throw new Error(
//           'weightLifted is required and must be a positive number for weight_training'
//         );
//       }
//     } else if (findExercise.exerciseType === 'cardio') {
//       validatedWeightLifted = 0;
//       if (!payLoad.distance) {
//         throw new ApppError(400, 'distance is required for cardio exercise');
//       }
//       distance = payLoad.distance;
//     } else if (
//       findExercise.exerciseType === 'bodyweight_exercises' ||
//       findExercise.exerciseType === 'high_Intensity' ||
//       findExercise.exerciseType === 'strength_Training'
//     ) {
//       // weightLifted is optional; keep as is
//     } else {
//       // For cardio, stretching, balance_Training, set weightLifted to 0
//       validatedWeightLifted = 0;
//     }

//     // Prepare data to save
//     const exercisePerformData = {
//       exercise_id: payLoad.exercise_id,
//       user_id,
//       set: payLoad.set,
//       weightLifted: validatedWeightLifted,
//       reps: payLoad.reps,
//       ...(distance !== undefined && { distance }),
//       // timeToPerform: payLoad.timeToPerform,
//       resetTime: payLoad.resetTime,
//       isCompleted: false,
//       ...(payLoad.timeToPerform !== undefined && {
//         timeToPerform: payLoad.timeToPerform,
//       }),
//       ...(payLoad.distance !== undefined && { distance }),
//     };

//     // Save to UserExercisePerformModel
//     const savedExercisePerform =
//       await UserExercisePerformModel.create(exercisePerformData);

//     return savedExercisePerform;
//   } catch (error: any) {
//     console.error('Error creating user exercise perform:', error);
//     throw new Error(error.message || 'Failed to create user exercise perform');
//   }
// };

// const markExerciseAsCompleated = async (
//   user_id: Types.ObjectId,
//   Performed_exercise_id: Types.ObjectId
// ) => {
//   try {
//     // Validate inputs
//     if (!Types.ObjectId.isValid(user_id)) {
//       throw new Error('Invalid user ID');
//     }
//     if (!Types.ObjectId.isValid(Performed_exercise_id)) {
//       throw new Error('Invalid performed exercise ID');
//     }

//     // Find user
//     const user = await WorkoutASetupModel.findOne({ user_id }).lean();
//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Find performed exercise
//     const performedExercise = await UserExercisePerformModel.findOne({
//       _id: Performed_exercise_id,
//       user_id,
//     }).lean();
//     if (!performedExercise) {
//       throw new Error('Performed exercise not found');
//     }

//     // Find exercise details
//     const exercise = await ExerciseModel.findOne({
//       _id: performedExercise.exercise_id,
//     }).lean();
//     if (!exercise) {
//       throw new Error('Exercise not found');
//     }

//     // Prepare data for calorie calculation AI route
//     const dataForCaloryCount = {
//       height: user.height,
//       body_weight: user.weight,
//       exerciseName: exercise.name,
//       exerciseType: exercise.exerciseType,
//       exerciseDescription: exercise.description,
//       weightLifted: performedExercise.weightLifted,
//       reps: performedExercise.reps,
//       sets: performedExercise.set,
//       resetTime: performedExercise.resetTime,
//       restTime: performedExercise.resetTime,
//       distance: performedExercise.distance ?? 0,
//     };

//     console.log('Data for calorie count:', dataForCaloryCount);

//     // Call AI API
//     let totalCaloryBurn = 0;
//     try {
//       const response = await axios.post(
//         `${process.env.AI_BASE_URL}workout-calorie/calculate-calories`,
//         dataForCaloryCount,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           // timeout: 10000
//         }
//       );

//       console.log('AI API response:', response.data);

//       if (
//         !response.data ||
//         typeof response.data.total_calories_burned !== 'number'
//       ) {
//         throw new Error('Invalid response from calorie AI API');
//       }

//       totalCaloryBurn = response.data.total_calories_burned;
//     } catch (apiError: any) {
//       console.error(
//         'AI API error detail:',
//         apiError.response?.data || apiError.message
//       );
//       throw new Error(
//         'Failed to calculate calories from AI API: ' +
//           (apiError.response?.data?.message || apiError.message)
//       );
//     }

//     // Update exercise as completed with calorie burn
//     const markAsDone = await UserExercisePerformModel.findOneAndUpdate(
//       { _id: Performed_exercise_id, user_id },
//       { isCompleted: true, totalCaloryBurn },
//       { new: true }
//     );

//     if (!markAsDone) {
//       throw new Error('Failed to mark exercise as completed');
//     }

//     return markAsDone;
//   } catch (error: any) {
//     console.error(
//       `Error marking exercise as completed for user ${user_id}:`,
//       error
//     );
//     throw new Error(error.message || 'Failed to mark exercise as completed');
//   }
// };

// const getPerformedExerciseById = async (
//   id: Types.ObjectId,
//   userId: Types.ObjectId
// ) => {
//   const exercise = await UserExercisePerformModel.findOne({
//     user_id: userId,
//     _id: id,
//   }).lean();

//   return exercise;
// };

// const getAllPerformedExercise = async (userId: Types.ObjectId) => {
//   const exercises = await UserExercisePerformModel.find({
//     user_id: userId,
//   }).lean();

//   return exercises;
// };

// const deleteExercise = async (
//   exerciseId: Types.ObjectId,
//   userId: Types.ObjectId
// ) => {
//   // Validate exercise ID
//   if (!Types.ObjectId.isValid(exerciseId)) {
//     throw new Error('Invalid exercise ID');
//   }

//   // Find the exercise
//   const exercise = await ExerciseModel.findOne({ _id: exerciseId });
//   if (!exercise) {
//     throw new Error('Exercise not found');
//   }

//   // Only the owner or admin can delete
//   if (exercise.user_id && !exercise.user_id.equals(userId)) {
//     throw new Error('Not authorized to delete this exercise');
//   }

//   // Delete the exercise
//   await ExerciseModel.findByIdAndDelete(exerciseId);

//   return { success: true, message: 'Exercise deleted successfully' };
// };

// const exerciseServicves = {
//   createCommonExercise,
//   createPersonalizeExercise,
//   getExerciseBothCommonAndPersonalize,
//   getExerciseById,
//   performExercise,
//   markExerciseAsCompleated,
//   deleteExercise,
//   getPerformedExerciseById,
//   getAllPerformedExercise,
// };
// export default exerciseServicves;

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import mongoose, { Types } from 'mongoose';
import { EXERCISE_TYPES } from '../../constents';
import ApppError from '../../error/AppError';
import {
  deleteFile,
  uploadImgToCloudinary,
} from '../../util/uploadImgToCludinary';
import { UserModel, WorkoutASetupModel } from '../user/user.model';
import { TExercise } from './exercise.interface';
import { ExerciseModel, UserExercisePerformModel } from './exercise.model';

const liftListSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemType: {
      type: String,
      enum: ['workout', 'running'],
      default: 'workout',
    },
    itemIds: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    history: {
      type: [
        {
          action: {
            type: String,
            enum: ['create', 'update', 'delete'],
            required: true,
          },
          before: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
          },
          after: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
          },
          undone: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const WorkoutLiftListModel =
  (mongoose.models.WorkoutLiftListModel as mongoose.Model<any>) ||
  mongoose.model('WorkoutLiftListModel', liftListSchema);

const parseLiftListId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApppError(400, 'Invalid lift list ID');
  }
  return id;
};

const createCommonExercise = async (
  file: any,
  payload: Partial<TExercise>,
  user_id?: Types.ObjectId
) => {
  if (
    !payload ||
    !payload.name ||
    !payload.description ||
    !payload.primaryMuscleGroup ||
    !payload.exerciseType
  ) {
    throw new Error('Exercise name and description are required.');
  }

  if (!file || !file.path) {
    throw new Error('Image file is required.');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  try {
    const imageName = `${payload.name}-${Date.now()}`;
    const uploadResult = await uploadImgToCloudinary(imageName, file.path);
    const imageUrl = uploadResult.secure_url;

    const exercisePayload = {
      name: payload.name,
      user_id: user_id,
      description: payload.description,
      img: imageUrl,
      primaryMuscleGroup: payload.primaryMuscleGroup,
      exerciseType: payload.exerciseType,
    };

    const createdExercise = await ExerciseModel.create(exercisePayload);

    return createdExercise;
  } catch (error: any) {
    if (file && file.path) {
      try {
        await deleteFile(file.path);
      } catch {}
    }

    throw new Error(
      error.message || 'Failed to create exercise due to an internal error.'
    );
  }
};

const createPersonalizeExercise = async (
  file: any,
  payLoad: Partial<TExercise>,
  User_id: Types.ObjectId
) => {
  const result = await createCommonExercise(file, payLoad, User_id);
  return result;
};

const getExerciseBothCommonAndPersonalize = async (
  user_id: Types.ObjectId,
  role?: string
) => {
  if (!Types.ObjectId.isValid(user_id)) {
    throw new Error('Invalid user ID.');
  }

  console.log(role);

  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  if (role === 'admin') {
    try {
      const exercises = await ExerciseModel.find({})
        .populate({
          path: 'user_id',
          select: 'name email img role', // only needed fields
        })
        .lean();

      return exercises;
    } catch {
      throw new Error('Failed to retrieve exercises.');
    }
  } else if (role === 'user') {
    try {
      const exercises = await ExerciseModel.find({ user_id: user_id })
        .populate({
          path: 'user_id',
          select: 'name email img role', // only needed fields
        })
        .lean();

      return exercises;
    } catch {
      throw new Error('Failed to retrieve exercises.');
    }
  }
};

const getExerciseById = async (exercise_id: Types.ObjectId) => {
  if (!Types.ObjectId.isValid(exercise_id)) {
    throw new Error('Invalid exercise ID.');
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB connection is not ready.');
  }

  const findExercise = await ExerciseModel.findById(exercise_id)
    .populate({
      path: 'user_id',
      select: 'name email img role', // only needed fields
    })
    .lean();

  if (!findExercise) {
    throw new ApppError(404, 'Exercise not found');
  }

  if (!findExercise) {
    throw new ApppError(404, 'Exercise not found.');
  }

  return findExercise;
  //   const findExercise = await ExerciseModel.findOne({
  //     _id: exercise_id,
  //   }).lean();

  //   if (!findExercise) {
  //     throw new Error('Exercise not found.');
  //   }

  //   const meta = {
  //     set: 'required',
  //     reps: 'required',
  //     resetTime: 'required',
  //   };

  //   let modifyFoundData = {};
  //   if (findExercise.exerciseType === EXERCISE_TYPES.weight_training) {
  //     modifyFoundData = { weightLifted: 'required', ...meta };
  //   } else if (
  //     findExercise.exerciseType === EXERCISE_TYPES.bodyweight_exercises ||
  //     findExercise.exerciseType === EXERCISE_TYPES.high_Intensity ||
  //     findExercise.exerciseType === EXERCISE_TYPES.strength_Training
  //   ) {
  //     modifyFoundData = { weightLifted: 'optional', ...meta };
  //   } else {
  //     modifyFoundData = { weightLifted: 'false', ...meta };
  //   }

  //   return { ...findExercise, ...modifyFoundData };
};

// const performExercise = async (
//   user_id: Types.ObjectId,
//   payLoad: Partial<{
//     exercise_id: Types.ObjectId;
//     set: number;
//     weightLifted?: number;
//     reps: number;
//     timeToPerform?: number;
//     resetTime: number;
//     isCompleted: boolean;
//     totalCaloryBurn?: number;
//     distance?: number;
//   }>
// ) => {
//   const user = await UserModel.findById(user_id).lean();
//   if (!user) {
//     throw new Error('User not found');
//   }

//   console.log({user})

//   console.log({payLoad})
// const exerciseId = payLoad.exercise_id as any;

// // Convert string to ObjectId
// if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
//   console.log("Invalid exercise_id");
// } else {
//   const isTheExerciseExist = await ExerciseModel.findOne({ _id:new Types.ObjectId(exerciseId) })
//   console.log({isTheExerciseExist})

//   if (!isTheExerciseExist) {
//     console.log("Exercise not found");
//   }
// }

//   if (
//     !payLoad.exercise_id ||
//     payLoad.set == null ||
//     payLoad.reps == null ||
//     payLoad.resetTime == null
//   ) {
//     throw new Error('exercise_id, set, reps, and resetTime are required');
//   }

//   if (!Types.ObjectId.isValid(payLoad.exercise_id as Types.ObjectId)) {
//     throw new Error('Invalid exercise ID');
//   }

//   if (mongoose.connection.readyState !== 1) {
//     throw new Error('MongoDB connection is not ready');
//   }

//   try {
//     const findExercise = await ExerciseModel.findOne({
//       _id: payLoad.exercise_id,
//     }).lean();
//     if (!findExercise) {
//       throw new Error('Exercise not found');
//     }

//     let validatedWeightLifted: number = payLoad.weightLifted ?? 0;
//     let distance: number | undefined = undefined;

//     if (findExercise.exerciseType === 'weight_training') {
//       if (validatedWeightLifted <= 0) {
//         throw new Error(
//           'weightLifted is required and must be a positive number for weight_training'
//         );
//       }
//     } else if (findExercise.exerciseType === 'cardio') {
//       validatedWeightLifted = 0;
//       if (!payLoad.distance) {
//         throw new ApppError(400, 'distance is required for cardio exercise');
//       }
//       distance = payLoad.distance;
//     }

//     const exercisePerformData = {
//       exercise_id: payLoad.exercise_id,
//       user_id,
//       set: payLoad.set,
//       weightLifted: validatedWeightLifted,
//       reps: payLoad.reps,
//       ...(distance !== undefined && { distance }),
//       resetTime: payLoad.resetTime,
//       isCompleted: false,
//       ...(payLoad.timeToPerform !== undefined && {
//         timeToPerform: payLoad.timeToPerform,
//       }),
//       ...(payLoad.distance !== undefined && { distance: payLoad.distance }),
//       totalCaloryBurn: payLoad.totalCaloryBurn ?? 0,
//     };

//     const savedExercisePerform =
//       await UserExercisePerformModel.create(exercisePerformData);

//     return savedExercisePerform;
//   } catch (error: any) {
//     throw new Error(error.message || 'Failed to create user exercise perform');
//   }
// };

const performExercise = async (
  user_id: Types.ObjectId,
  payLoad: Partial<{
    exercise_id: Types.ObjectId;
    set: number;
    weightLifted?: number;
    reps: number;
    timeToPerform?: number;
    resetTime: number;
    isCompleted: boolean;
    totalCaloryBurn?: number;
    distance?: number;
    note?: string;
    image?: string;
  }>
) => {
  // Validate MongoDB connection
  if (mongoose.connection.readyState !== 1) {
    throw new ApppError(500, 'MongoDB connection is not ready');
  }

  // Minimal required field for quick-track flow
  if (!payLoad.exercise_id) {
    throw new ApppError(400, 'exercise_id is required');
  }

  // Validate exercise_id format
  if (!Types.ObjectId.isValid(payLoad.exercise_id)) {
    throw new ApppError(400, 'Invalid exercise ID');
  }

  // Find user in database
  const user = await UserModel.findById(user_id).lean();
  if (!user) {
    throw new ApppError(404, 'User not found');
  }

  // Find exercise in database
  const exerciseId = payLoad.exercise_id;
  const exercise = await ExerciseModel.findOne({ _id: exerciseId }).lean();
  if (!exercise) {
    throw new ApppError(404, 'Exercise not found');
  }

  // Validate weightLifted or distance based on exercise type
  let validatedWeightLifted: number = payLoad.weightLifted ?? 0;
  let distance: number | undefined = undefined;
  const safeSet = payLoad.set ?? 1;
  const safeReps = payLoad.reps ?? 1;
  const safeResetTime = payLoad.resetTime ?? 0;

  if (exercise.exerciseType === 'weight_training') {
    if (validatedWeightLifted <= 0) {
      throw new ApppError(
        400,
        'weightLifted must be a positive number for weight_training'
      );
    }
  } else if (exercise.exerciseType === 'cardio') {
    validatedWeightLifted = 0;
    if (!payLoad.distance || payLoad.distance <= 0) {
      throw new ApppError(400, 'distance is required for cardio exercise');
    }
    distance = payLoad.distance;
  }

  // Prepare exercise data for save
  // const exercisePerformData = {
  //   exercise_id: payLoad.exercise_id,
  //   user_id,
  //   set: payLoad.set,
  //   weightLifted: validatedWeightLifted,
  //   reps: payLoad.reps,
  //   resetTime: payLoad.resetTime,
  //   isCompleted: false, // Assuming the exercise isn't completed at the moment of creation
  //   totalCaloryBurn: payLoad.totalCaloryBurn ?? 0,
  //   ...(distance !== undefined && { distance }),
  //   ...(payLoad.timeToPerform !== undefined && { timeToPerform: payLoad.timeToPerform }),
  // };

  const exercisePerformData = {
    exercise_id: payLoad.exercise_id,
    user_id,
    set: safeSet,
    weightLifted: validatedWeightLifted,
    reps: safeReps,
    resetTime: safeResetTime,
    isCompleted: false,
    note: payLoad.note ?? '',
    image: payLoad.image ?? exercise.img,
    totalCaloryBurn: payLoad.totalCaloryBurn ?? 0,
    ...(distance !== undefined && { distance }),
    ...(payLoad.timeToPerform !== undefined && {
      timeToPerform: payLoad.timeToPerform,
    }),

    // add this
    isDeleted: false,
    history: [
      {
        action: 'create',
        before: null,
        after: {
          exercise_id: payLoad.exercise_id,
          user_id,
          set: safeSet,
          weightLifted: validatedWeightLifted,
          reps: safeReps,
          resetTime: safeResetTime,
          totalCaloryBurn: payLoad.totalCaloryBurn ?? 0,
          ...(distance !== undefined && { distance }),
          ...(payLoad.timeToPerform !== undefined && {
            timeToPerform: payLoad.timeToPerform,
          }),
        },
        undone: false,
        createdAt: new Date(),
      },
    ],
  };

  // Save exercise perform data
  try {
    const savedExercisePerform =
      await UserExercisePerformModel.create(exercisePerformData);
    return savedExercisePerform;
  } catch (error: any) {
    throw new ApppError(
      500,
      error.message || 'Failed to create user exercise perform'
    );
  }
};

const markExerciseAsCompleated = async (
  user_id: Types.ObjectId,
  Performed_exercise_id: Types.ObjectId
) => {
  try {
    if (!Types.ObjectId.isValid(user_id)) {
      throw new Error('Invalid user ID');
    }
    if (!Types.ObjectId.isValid(Performed_exercise_id)) {
      throw new Error('Invalid performed exercise ID');
    }

    const user = await WorkoutASetupModel.findOne({ user_id }).lean();
    if (!user) {
      throw new Error('User not found');
    }

    const performedExercise = await UserExercisePerformModel.findOne({
      _id: Performed_exercise_id,
      user_id,
    }).lean();
    if (!performedExercise) {
      throw new Error('Performed exercise not found');
    }

    const exercise = await ExerciseModel.findOne({
      _id: performedExercise.exercise_id,
    }).lean();
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const dataForCaloryCount = {
      height: user.height,
      body_weight: user.weight,
      exerciseName: exercise.name,
      exerciseType: exercise.exerciseType,
      exerciseDescription: exercise.description,
      weightLifted: performedExercise.weightLifted,
      reps: performedExercise.reps,
      sets: performedExercise.set,
      resetTime: performedExercise.resetTime,
      restTime: performedExercise.resetTime,
      distance: performedExercise.distance ?? 0,
    };

    let totalCaloryBurn = 0;
    try {
      const response = await axios.post(
        `${process.env.AI_BASE_URL}workout-calorie/calculate-calories`,
        dataForCaloryCount,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (
        !response.data ||
        typeof response.data.total_calories_burned !== 'number'
      ) {
        throw new Error('Invalid response from calorie AI API');
      }

      totalCaloryBurn = response.data.total_calories_burned;
    } catch (apiError: any) {
      throw new Error(
        'Failed to calculate calories from AI API: ' +
          (apiError.response?.data?.message || apiError.message)
      );
    }

    const performedExerciseDoc = await UserExercisePerformModel.findOne({
      _id: Performed_exercise_id,
      user_id,
    } as any);

    if (!performedExerciseDoc) {
      throw new Error('Failed to mark exercise as completed');
    }

    const before = performedExerciseDoc.toObject();
    (performedExerciseDoc as any).isCompleted = true;
    (performedExerciseDoc as any).totalCaloryBurn = totalCaloryBurn;
    (performedExerciseDoc as any).history = [
      ...(((performedExerciseDoc as any).history ?? []) as any[]),
      {
        action: 'update',
        before,
        after: {
          ...before,
          isCompleted: true,
          totalCaloryBurn,
        },
        undone: false,
        createdAt: new Date(),
      },
    ];
    await performedExerciseDoc.save();

    const markAsDone = performedExerciseDoc;

    if (!markAsDone) {
      throw new Error('Failed to mark exercise as completed');
    }

    return markAsDone;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark exercise as completed');
  }
};

const getPerformedExerciseById = async (
  id: Types.ObjectId,
  userId: Types.ObjectId
) => {
  const exercise = await UserExercisePerformModel.findOne({
    user_id: userId,
    _id: id,
  }).lean();

  return exercise;
};

const getAllPerformedExercise = async (
  userId: Types.ObjectId,
  role?: string
) => {
  const exercises = await UserExercisePerformModel.find({
    user_id: userId,
    history: { $exists: true, $not: { $size: 0 } },
  }).lean();

  return exercises;
};

const deleteExercise = async (
  exerciseId: Types.ObjectId,
  userId: Types.ObjectId
) => {
  if (!Types.ObjectId.isValid(exerciseId)) {
    throw new Error('Invalid exercise ID');
  }

  const exercise = await ExerciseModel.findOne({ _id: exerciseId });
  if (!exercise) {
    throw new Error('Exercise not found');
  }

  if (exercise.user_id && !exercise.user_id.equals(userId)) {
    throw new Error('Not authorized to delete this exercise');
  }

  await ExerciseModel.findByIdAndDelete(exerciseId);

  return { success: true, message: 'Exercise deleted successfully' };
};

// workout logs (newWorkout style) on existing model
const workoutLogs = {
  // create: async (
  //   user_id: Types.ObjectId,
  //   payload: any,
  //   file?: Express.Multer.File
  // ) => {
  //   let image = payload.image ?? '';

  //   if (file?.path) {
  //     try {
  //       const imageName = `${payload.exerciseName ?? 'workout'}-${Date.now()}`;
  //       const uploadResult = await uploadImgToCloudinary(imageName, file.path);
  //       image = uploadResult.secure_url;
  //     } catch (error) {
  //       await deleteFile(file.path);
  //       throw error;
  //     }
  //   }

  //   const doc = await UserExercisePerformModel.create({
  //     exercise_id: payload.exercise_id,
  //     user_id,
  //     set: payload.set ?? 1,
  //     weightLifted: payload.weightLifted ?? 0,
  //     reps: payload.reps ?? 1,
  //     distance: payload.distance ?? 0,
  //     timeToPerform: payload.timeToPerform,
  //     resetTime: payload.resetTime ?? 0,
  //     isCompleted: payload.isCompleted ?? false,
  //     totalCaloryBurn: payload.totalCaloryBurn ?? 0,
  //     image,
  //     note: payload.note ?? '',
  //     isDeleted: false,
  //     history: [
  //       {
  //         action: 'create',
  //         before: null,
  //         after: payload,
  //         undone: false,
  //         createdAt: new Date(),
  //       },
  //     ],
  //   } as any);

  //   return doc;
  // },

  // লাগবে:
  // import axios from 'axios';
  // import { WorkoutASetupModel } from '../user/user.model';

  // লাগবে:
  // import axios from 'axios';
  // import { WorkoutASetupModel } from '../user/user.model';

  create: async (
    user_id: Types.ObjectId,
    payload: {
      exercise_id?: string | Types.ObjectId;
      set?: number;
      reps?: number;
      resetTime?: number;
      weightLifted?: number;
      distance?: number;
      timeToPerform?: number;
      note?: string;
      image?: string;
      isCompleted?: boolean;
      totalCaloryBurn?: number; // optional manual override
      skipCalorieCalculation?: boolean; // optional
    },
    file?: Express.Multer.File
  ) => {
    if (mongoose.connection.readyState !== 1) {
      throw new ApppError(500, 'MongoDB connection is not ready');
    }

    if (!payload?.exercise_id)
      throw new ApppError(400, 'exercise_id is required');
    if (!Types.ObjectId.isValid(payload.exercise_id)) {
      throw new ApppError(400, 'Invalid exercise ID');
    }

    if (payload.set === undefined || payload.set <= 0) {
      throw new ApppError(400, 'set must be a positive number');
    }
    if (payload.reps === undefined || payload.reps <= 0) {
      throw new ApppError(400, 'reps must be a positive number');
    }
    if (payload.resetTime === undefined || payload.resetTime < 0) {
      throw new ApppError(400, 'resetTime must be a non-negative number');
    }

    const user = await WorkoutASetupModel.findOne({ user_id }).lean();
    if (!user) throw new ApppError(404, 'User setup not found');

    const exercise = await ExerciseModel.findById(payload.exercise_id).lean();
    if (!exercise) throw new ApppError(404, 'Exercise not found');

    let validatedWeightLifted = payload.weightLifted;
    const validatedDistance = payload.distance;

    if (exercise.exerciseType === 'weight_training') {
      if (!validatedWeightLifted || validatedWeightLifted <= 0) {
        throw new ApppError(
          400,
          'weightLifted must be a positive number for weight_training'
        );
      }
    } else if (exercise.exerciseType === 'cardio') {
      if (!validatedDistance || validatedDistance <= 0) {
        throw new ApppError(400, 'distance is required for cardio exercise');
      }
      validatedWeightLifted = 0;
    }

    let image = payload.image;
    if (file?.path) {
      try {
        const imageName = `${exercise.name ?? 'workout'}-${Date.now()}`;
        const uploadResult = await uploadImgToCloudinary(imageName, file.path);
        image = uploadResult.secure_url;
        console.log('🚀 ~ image:', image);
      } catch (error) {
        await deleteFile(file.path);
        throw error;
      }
    }

    // calorie calculation এখানে
    let totalCaloryBurn: number;
    if (typeof payload.totalCaloryBurn === 'number') {
      totalCaloryBurn = payload.totalCaloryBurn;
    } else if (payload.skipCalorieCalculation) {
      totalCaloryBurn = 0;
    } else {
      const dataForCaloryCount = {
        height: user.height,
        body_weight: user.weight,
        exerciseName: exercise.name,
        exerciseType: exercise.exerciseType,
        exerciseDescription: exercise.description,
        weightLifted: validatedWeightLifted ?? 0,
        reps: payload.reps,
        sets: payload.set,
        resetTime: payload.resetTime,
        restTime: payload.resetTime,
        distance: validatedDistance ?? 0,
      };

      try {
        const response = await axios.post(
          `${process.env.AI_BASE_URL}workout-calorie/calculate-calories`,
          dataForCaloryCount,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (
          !response.data ||
          typeof response.data.total_calories_burned !== 'number'
        ) {
          throw new ApppError(502, 'Invalid response from calorie AI API');
        }

        totalCaloryBurn = response.data.total_calories_burned;
        console.log('🚀 ~ totalCaloryBurn:', totalCaloryBurn);
      } catch (apiError: any) {
        throw new ApppError(
          502,
          'Failed to calculate calories from AI API: ' +
            (apiError.response?.data?.message || apiError.message)
        );
      }
    }

    const createData: Record<string, unknown> = {
      exercise_id: payload.exercise_id,
      user_id,
      set: payload.set,
      reps: payload.reps,
      resetTime: payload.resetTime,
      weightLifted: validatedWeightLifted,
      ...(validatedDistance !== undefined && { distance: validatedDistance }),
      ...(payload.timeToPerform !== undefined && {
        timeToPerform: payload.timeToPerform,
      }),
      ...(payload.isCompleted !== undefined && {
        isCompleted: payload.isCompleted,
      }),
      ...(payload.note !== undefined && { note: payload.note }),
      ...(image !== undefined && { image }),
      totalCaloryBurn,
      isDeleted: false,
    };

    const doc = await UserExercisePerformModel.create({
      ...createData,
      history: [
        {
          action: 'create',
          before: null,
          after: createData,
          undone: false,
          createdAt: new Date(),
        },
      ],
    } as any);

    return doc;
  },

  update: async (
    user_id: Types.ObjectId,
    id: string,
    payload: any,
    file?: Express.Multer.File
  ) => {
    const prev = await UserExercisePerformModel.findOne({
      _id: id,
      user_id,
      isDeleted: false,
    } as any);

    if (!prev) throw new Error('Workout log not found');

    const before = prev.toObject();

    if (file?.path) {
      try {
        const imageName = `${payload.exerciseName ?? 'workout'}-${Date.now()}`;
        const uploadResult = await uploadImgToCloudinary(imageName, file.path);
        payload.image = uploadResult.secure_url;
      } catch (error) {
        await deleteFile(file.path);
        throw error;
      }
    }

    Object.assign(prev, payload);

    const existingHistory = ((prev as any).history ?? []) as any[];
    (prev as any).history = [
      ...existingHistory,
      {
        action: 'update',
        before,
        after: prev.toObject(),
        undone: false,
        createdAt: new Date(),
      },
    ];

    await prev.save();
    return prev;
  },

  list: async (user_id: Types.ObjectId) => {
    return UserExercisePerformModel.find({
      user_id,
      isDeleted: false,
    } as any).sort({ createdAt: -1 });
  },
  getSingle: async (user_id: Types.ObjectId, _id: string) => {
    return UserExercisePerformModel.findOne({
      _id,
      user_id,
      isDeleted: false,
    } as any);
  },

  remove: async (user_id: Types.ObjectId, id: string) => {
    const prev = await UserExercisePerformModel.findOne({
      _id: id,
      user_id,
      isDeleted: false,
    } as any);

    if (!prev) throw new Error('Workout log not found');

    const before = prev.toObject();
    (prev as any).isDeleted = true;

    const existingHistory = ((prev as any).history ?? []) as any[];
    (prev as any).history = [
      ...existingHistory,
      {
        action: 'delete',
        before,
        after: null,
        undone: false,
        createdAt: new Date(),
      },
    ];

    await prev.save();
    return { success: true };
  },

  // undo: async (user_id: Types.ObjectId, id: string) => {
  //   const doc = await UserExercisePerformModel.findOne({
  //     _id: id,
  //     user_id,
  //   } as any);

  //   if (!doc) throw new Error('Workout log not found');

  //   const history = [...(((doc as any).history ?? []) as any[])].reverse();
  //   const last = history.find((h) => !h.undone);

  //   if (!last) throw new Error('No undoable action found');

  //   if (last.action === 'create') (doc as any).isDeleted = true;
  //   if (last.action === 'delete') (doc as any).isDeleted = false;
  //   if (last.action === 'update' && last.before) {
  //     Object.assign(doc, last.before);
  //   }

  //   const originalHistory = (((doc as any).history ?? []) as any[]).map((h) => {
  //     if (
  //       h.createdAt?.toString?.() === last.createdAt?.toString?.() &&
  //       h.action === last.action &&
  //       !h.undone
  //     ) {
  //       return { ...h, undone: true };
  //     }
  //     return h;
  //   });

  //   (doc as any).history = originalHistory;
  //   await doc.save();

  //   return { success: true };
  // },

  // undoLatest: async (user_id: Types.ObjectId) => {
  //   const docs = await UserExercisePerformModel.find({ user_id } as any).sort({
  //     updatedAt: -1,
  //   });

  //   for (const doc of docs) {
  //     const currentHistory = ((doc as any).history ?? []) as Array<{
  //       action: 'create' | 'update' | 'delete';
  //       before: Record<string, unknown> | null;
  //       after: Record<string, unknown> | null;
  //       undone?: boolean;
  //       createdAt?: Date;
  //     }>;

  //     const reversedHistory = [...currentHistory].reverse();
  //     const lastActive = reversedHistory.find((entry) => !entry.undone);

  //     if (!lastActive) {
  //       continue;
  //     }

  //     if (lastActive.action === 'create') {
  //       (doc as any).isDeleted = true;
  //     } else if (lastActive.action === 'delete') {
  //       (doc as any).isDeleted = false;
  //     } else if (lastActive.action === 'update' && lastActive.before) {
  //       Object.assign(doc, lastActive.before);
  //     }

  //     const updatedHistory = currentHistory.map((entry) => {
  //       const sameCreatedAt =
  //         entry.createdAt?.toString() === lastActive.createdAt?.toString();
  //       const sameAction = entry.action === lastActive.action;

  //       if (sameCreatedAt && sameAction && !entry.undone) {
  //         return { ...entry, undone: true };
  //       }

  //       return entry;
  //     });

  //     (doc as any).history = updatedHistory;
  //     await doc.save();

  //     return { success: true };
  //   }

  //   throw new Error('No undoable action found');
  // },

  undo: async (user_id: Types.ObjectId, id: string) => {
    const stripMeta = (obj: Record<string, any>) => {
      const safe = { ...(obj || {}) };

      delete safe._id;
      delete safe.__v;
      delete safe.createdAt;
      delete safe.updatedAt;
      delete safe.history;
      delete safe.user_id;

      return safe;
    };

    const doc = await UserExercisePerformModel.findOne({
      _id: id,
      user_id,
    } as any);

    if (!doc) throw new Error('Workout log not found');

    const history = [...(((doc as any).history ?? []) as any[])].reverse();
    const last = history.find((h) => !h.undone);

    if (!last) throw new Error('No undoable action found');

    if (last.action === 'create') {
      (doc as any).isDeleted = true;
    } else if (last.action === 'delete') {
      (doc as any).isDeleted = false;
    } else if (last.action === 'update' && last.before) {
      Object.assign(doc, stripMeta(last.before as Record<string, any>));
    }

    const originalHistory = (((doc as any).history ?? []) as any[]).map((h) => {
      if (
        h.createdAt?.toString?.() === last.createdAt?.toString?.() &&
        h.action === last.action &&
        !h.undone
      ) {
        return { ...h, undone: true };
      }
      return h;
    });

    (doc as any).history = originalHistory;
    await doc.save();

    return { success: true };
  },

  undoLatest: async (user_id: Types.ObjectId) => {
    const stripMeta = (obj: Record<string, any>) => {
      const safe = { ...(obj || {}) };

      delete safe._id;
      delete safe.__v;
      delete safe.createdAt;
      delete safe.updatedAt;
      delete safe.history;
      delete safe.user_id;

      return safe;
    };

    const docs = await UserExercisePerformModel.find({ user_id } as any).sort({
      updatedAt: -1,
    });

    for (const doc of docs) {
      const currentHistory = ((doc as any).history ?? []) as Array<{
        action: 'create' | 'update' | 'delete';
        before: Record<string, unknown> | null;
        after: Record<string, unknown> | null;
        undone?: boolean;
        createdAt?: Date;
      }>;

      const reversedHistory = [...currentHistory].reverse();
      const lastActive = reversedHistory.find((entry) => !entry.undone);

      if (!lastActive) continue;

      if (lastActive.action === 'create') {
        (doc as any).isDeleted = true;
      } else if (lastActive.action === 'delete') {
        (doc as any).isDeleted = false;
      } else if (lastActive.action === 'update' && lastActive.before) {
        Object.assign(doc, stripMeta(lastActive.before as Record<string, any>));
      }

      const updatedHistory = currentHistory.map((entry) => {
        const sameCreatedAt =
          entry.createdAt?.toString() === lastActive.createdAt?.toString();
        const sameAction = entry.action === lastActive.action;

        if (sameCreatedAt && sameAction && !entry.undone) {
          return { ...entry, undone: true };
        }

        return entry;
      });

      (doc as any).history = updatedHistory;
      await doc.save();

      return { success: true };
    }

    throw new Error('No undoable action found');
  },

  share: async (user_id: Types.ObjectId, id: string) => {
    const log = await UserExercisePerformModel.findOne({
      _id: id,
      user_id,
      isDeleted: false,
    } as any).lean();

    if (!log) throw new Error('Workout log not found');

    return {
      type: 'workout',
      title: 'Workout Progress',
      caption: `${log.set} sets x ${log.reps} reps`,
      stats: {
        set: log.set,
        reps: log.reps,
        weightLifted: log.weightLifted,
        totalCaloryBurn: log.totalCaloryBurn,
      },
    };
  },

  analysis: async (
    user_id: Types.ObjectId,
    timeSpan: '30d' | '3m' | '6m' | '12m' | '1y' = '3m'
  ) => {
    let days = 90;
    if (timeSpan === '30d') days = 30;
    if (timeSpan === '6m') days = 180;
    if (timeSpan === '12m' || timeSpan === '1y') days = 365;

    const from = new Date();
    from.setDate(from.getDate() - days);

    return UserExercisePerformModel.aggregate([
      { $match: { user_id, isDeleted: false, createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          set: { $sum: '$set' },
          reps: { $sum: '$reps' },
          totalCaloryBurn: { $sum: '$totalCaloryBurn' },
        },
      },
      {
        $project: { _id: 0, date: '$_id', set: 1, reps: 1, totalCaloryBurn: 1 },
      },
      { $sort: { date: 1 } },
    ]);
  },
};

const liftLists = {
  create: async (user_id: Types.ObjectId, payload: any) => {
    if (!payload?.name?.trim?.()) {
      throw new ApppError(400, 'Lift list name is required');
    }

    const itemIds = Array.isArray(payload.itemIds) ? payload.itemIds : [];
    const doc = await WorkoutLiftListModel.create({
      user_id,
      name: payload.name.trim(),
      itemType: payload.itemType ?? 'workout',
      itemIds,
      isDeleted: false,
      history: [
        {
          action: 'create',
          before: null,
          after: {
            name: payload.name.trim(),
            itemType: payload.itemType ?? 'workout',
            itemIds,
          },
          undone: false,
          createdAt: new Date(),
        },
      ],
    });

    return doc;
  },

  list: async (user_id: Types.ObjectId) =>
    WorkoutLiftListModel.find({
      user_id,
      isDeleted: false,
    }).sort({ createdAt: -1 }),

  addItem: async (user_id: Types.ObjectId, id: string, itemId: string) => {
    if (!itemId) {
      throw new ApppError(400, 'itemId is required');
    }

    const doc = await WorkoutLiftListModel.findOne({
      _id: parseLiftListId(id),
      user_id,
      isDeleted: false,
    });

    if (!doc) throw new ApppError(404, 'Lift list not found');

    const before = doc.toObject();
    const itemSet = new Set<string>(doc.itemIds ?? []);
    itemSet.add(itemId);
    doc.itemIds = Array.from(itemSet);

    doc.history = [
      ...(doc.history ?? []),
      {
        action: 'update',
        before,
        after: doc.toObject(),
        undone: false,
        createdAt: new Date(),
      },
    ];

    await doc.save();
    return doc;
  },

  removeItem: async (user_id: Types.ObjectId, id: string, itemId: string) => {
    if (!itemId) {
      throw new ApppError(400, 'itemId is required');
    }

    const doc = await WorkoutLiftListModel.findOne({
      _id: parseLiftListId(id),
      user_id,
      isDeleted: false,
    });

    if (!doc) throw new ApppError(404, 'Lift list not found');

    const before = doc.toObject();
    doc.itemIds = (doc.itemIds ?? []).filter((x: string) => x !== itemId);

    doc.history = [
      ...(doc.history ?? []),
      {
        action: 'update',
        before,
        after: doc.toObject(),
        undone: false,
        createdAt: new Date(),
      },
    ];

    await doc.save();
    return doc;
  },

  remove: async (user_id: Types.ObjectId, id: string) => {
    const doc = await WorkoutLiftListModel.findOne({
      _id: parseLiftListId(id),
      user_id,
      isDeleted: false,
    });

    if (!doc) throw new ApppError(404, 'Lift list not found');

    const before = doc.toObject();
    doc.isDeleted = true;
    doc.history = [
      ...(doc.history ?? []),
      {
        action: 'delete',
        before,
        after: null,
        undone: false,
        createdAt: new Date(),
      },
    ];

    await doc.save();
    return { success: true };
  },

  undo: async (user_id: Types.ObjectId, id: string) => {
    const doc = await WorkoutLiftListModel.findOne({
      _id: parseLiftListId(id),
      user_id,
    });

    if (!doc) throw new ApppError(404, 'Lift list not found');

    const history = [...(doc.history ?? [])].reverse();
    const last = history.find((entry: any) => !entry.undone);

    if (!last) throw new ApppError(400, 'No undoable action found');

    if (last.action === 'create') doc.isDeleted = true;
    if (last.action === 'delete') doc.isDeleted = false;
    if (last.action === 'update' && last.before) {
      Object.assign(doc, last.before);
    }

    doc.history = (doc.history ?? []).map((entry: any) => {
      const sameAction = entry.action === last.action;
      const sameCreatedAt =
        entry.createdAt?.toString?.() === last.createdAt?.toString?.();
      if (sameAction && sameCreatedAt && !entry.undone) {
        return { ...entry, undone: true };
      }
      return entry;
    });

    await doc.save();
    return { success: true };
  },

  undoLatest: async (user_id: Types.ObjectId) => {
    const docs = await WorkoutLiftListModel.find({ user_id }).sort({
      updatedAt: -1,
    });

    for (const doc of docs) {
      const history = [...(doc.history ?? [])].reverse();
      const last = history.find((entry: any) => !entry.undone);
      if (!last) continue;

      if (last.action === 'create') doc.isDeleted = true;
      if (last.action === 'delete') doc.isDeleted = false;
      if (last.action === 'update' && last.before) {
        Object.assign(doc, last.before);
      }

      doc.history = (doc.history ?? []).map((entry: any) => {
        const sameAction = entry.action === last.action;
        const sameCreatedAt =
          entry.createdAt?.toString?.() === last.createdAt?.toString?.();
        if (sameAction && sameCreatedAt && !entry.undone) {
          return { ...entry, undone: true };
        }
        return entry;
      });

      await doc.save();
      return { success: true };
    }

    throw new ApppError(400, 'No undoable action found');
  },
};

const exerciseServicves = {
  createCommonExercise,
  createPersonalizeExercise,
  getExerciseBothCommonAndPersonalize,
  getExerciseById,
  performExercise,
  markExerciseAsCompleated,
  deleteExercise,
  getPerformedExerciseById,
  getAllPerformedExercise,
  workoutLogs,
  liftLists,
};

export default exerciseServicves;
