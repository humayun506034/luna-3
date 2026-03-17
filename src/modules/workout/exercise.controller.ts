/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongoose';
// import { Types } from 'mongoose';
// import catchAsync from '../../util/catchAsync';
// import idConverter from '../../util/idConvirter';
// import exerciseServicves from './exercise.service';

// const createCommonExercise = catchAsync(async (req, res) => {
//   const File = req.file;
//   if (!File) {
//     throw new Error('img file is required');
//   }
//   const data = req.body.data;

//   if (!data) {
//     console.log('data must be there');
//   }

//   const convertData = JSON.parse(data);

//   const result = await exerciseServicves.createCommonExercise(
//     File,
//     convertData
//   );

//   res.status(200).json({
//     success: true,
//     message: 'a common exercise created',
//     data: result,
//   });
// });

// const createPersonalizeExercise = catchAsync(async (req, res) => {
//   const user_id = req.user.id;
//   const convertedUserId = idConverter(user_id);

//   const File = req.file;
//   if (!File) {
//     throw new Error('img file is required');
//   }
//   const data = req.body.data;

//   if (!data) {
//     console.log('data must be there');
//   }

//   const convertData = JSON.parse(data);

//   const result = await exerciseServicves.createPersonalizeExercise(
//     File,
//     convertData,
//     convertedUserId as Types.ObjectId
//   );

//   res.status(200).json({
//     success: true,
//     message: 'a personalized exercise created',
//     data: result,
//   });
// });

// // Get both common and personalized exercises
// const getExerciseBothCommonAndPersonalize = catchAsync(async (req, res) => {
//   const userId = req.user?.id; // Assuming user ID is attached to req.user from authentication middleware
//   if (!userId) {
//     throw new Error('User not authenticated.');
//   }
//   const convertedUserId = idConverter(userId) as Types.ObjectId;

//   const exercises =
//     await exerciseServicves.getExerciseBothCommonAndPersonalize(
//       convertedUserId
//     );

//   res.status(200).json({
//     success: true,
//     message: 'Exercises retrieved successfully.',
//     data: exercises,
//   });
// });

// // Get exercise by ID
// const getExerciseById = catchAsync(async (req, res) => {
//   const exerciseId = req.query.exerciseId as string;
//   if (!Types.ObjectId.isValid(exerciseId)) {
//     throw new Error('Invalid exercise ID.');
//   }
//   const convertedExerciseId = idConverter(exerciseId) as Types.ObjectId;

//   const exercise = await exerciseServicves.getExerciseById(convertedExerciseId);

//   res.status(200).json({
//     success: true,
//     message: 'Exercise retrieved successfully.',
//     data: exercise,
//   });
// });

// // Perform an exercise
// const performExercise = catchAsync(async (req, res) => {
//   const userId = req.user?.id;
//   if (!userId) {
//     throw new Error('User not authenticated.');
//   }
//   const convertedUserId = idConverter(userId) as Types.ObjectId;

//   const payload = req.body;

//   const savedExercisePerform = await exerciseServicves.performExercise(
//     convertedUserId,
//     payload
//   );

//   res.status(201).json({
//     success: true,
//     message: 'Exercise performed successfully.',
//     data: savedExercisePerform,
//   });
// });

// // Mark exercise as completed
// const markExerciseAsCompleated = catchAsync(async (req, res) => {
//   const userId = req.user?.id;
//   if (!userId) {
//     throw new Error('User not authenticated.');
//   }
//   const convertedUserId = idConverter(userId) as Types.ObjectId;

//   const performedExerciseId = req.query.performedExerciseId as string;
//   if (!Types.ObjectId.isValid(performedExerciseId)) {
//     throw new Error('Invalid performed exercise ID.');
//   }
//   const convertedPerformedExerciseId = idConverter(
//     performedExerciseId
//   ) as Types.ObjectId;

//   const updatedExercise = await exerciseServicves.markExerciseAsCompleated(
//     convertedUserId,
//     convertedPerformedExerciseId
//   );

//   if (!updatedExercise) {
//     throw new Error('Performed exercise not found or user not authorized.');
//   }

//   res.status(200).json({
//     success: true,
//     message: 'Exercise marked as completed successfully.',
//     data: updatedExercise,
//   });
// });

// const deleteExercise = catchAsync(async (req, res) => {
//   const userId = req.user?.id;
//   const exerciseId = req.params.id;

//   if (!userId) {
//     throw new Error('User not authenticated.');
//   }

//   const convertedUserId = idConverter(userId) as Types.ObjectId;
//   const convertedExerciseId = idConverter(exerciseId as string) as Types.ObjectId;

//   const result = await exerciseServicves.deleteExercise(
//     convertedExerciseId,
//     convertedUserId
//   );

//   res.status(200).json(result);
// });

// const getPerformedExerciseById = catchAsync(async (req, res) => {
//   const exerciseId = req.params.exerciseId as string;

//   const convertedExerciseId = idConverter(exerciseId) as Types.ObjectId;
//   console.log("🚀 ~ convertedExerciseId:", convertedExerciseId)

//   const userId = req.user?.id;
//   const convertedUserId = idConverter(userId) as Types.ObjectId;

//   const exercise = await exerciseServicves.getPerformedExerciseById(
//     convertedExerciseId,
//     convertedUserId
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Exercise retrieved successfully.',
//     data: exercise,
//   });
// });

// const getAllPerformedExercise = catchAsync(async (req, res) => {
//   const userId = req.user?.id;
//   const convertedUserId = idConverter(userId) as Types.ObjectId;

//   const exercise =
//     await exerciseServicves.getAllPerformedExercise(convertedUserId);

//   res.status(200).json({
//     success: true,
//     message: 'Exercise retrieved successfully.',
//     data: exercise,
//   });
// });

// const exerciseController = {
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

// export default exerciseController;

import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import exerciseServicves from './exercise.service';
import ApppError from '../../error/AppError';

const createCommonExercise = catchAsync(async (req, res) => {
  const File = req.file;
  if (!File) {
    throw new Error('img file is required');
  }

  const data = req.body.data;
  if (!data) {
    console.log('data must be there');
  }

  const convertData = JSON.parse(data);
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }

  const result = await exerciseServicves.createCommonExercise(
    File,
    convertData,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'A common exercise created',
    data: result,
  });
});

const createPersonalizeExercise = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const File = req.file;
  if (!File) {
    throw new Error('img file is required');
  }

  const data = req.body.data;
  if (!data) {
    console.log('data must be there');
  }

  const convertData = JSON.parse(data);

  const result = await exerciseServicves.createPersonalizeExercise(
    File,
    convertData,
    convertedUserId
  );

  res.status(200).json({
    success: true,
    message: 'a personalized exercise created',
    data: result,
  });
});

const getExerciseBothCommonAndPersonalize = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const exercises = await exerciseServicves.getExerciseBothCommonAndPersonalize(
    convertedUserId,
    req?.user?.role
  );

  res.status(200).json({
    success: true,
    message: 'Exercises retrieved successfully.',
    data: exercises,
  });
});

const getExerciseById = catchAsync(async (req, res) => {
  const exerciseId = req.query.exerciseId as string;
  if (!Types.ObjectId.isValid(exerciseId)) {
    throw new Error('Invalid exercise ID.');
  }
  const convertedExerciseId = idConverter(exerciseId) as Types.ObjectId;

  const exercise = (await exerciseServicves.getExerciseById(
    req?.user?.id,
    convertedExerciseId
  )) as any;

  // if (!(exercise.user_id as any).equals(req?.user?.id)) {
  //   throw new ApppError(401, 'Unauthorized');
  // }

  res.status(200).json({
    success: true,
    message: 'Exercise retrieved successfully.',
    data: exercise,
  });
});

const performExercise = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const payload = req.body;
  const savedExercisePerform = await exerciseServicves.performExercise(
    convertedUserId,
    payload
  );

  res.status(201).json({
    success: true,
    message: 'Exercise performed successfully.',
    data: savedExercisePerform,
  });
});

const markWorkoutAsCompleated = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const performedExerciseId = req.query.performedExerciseId as string;
  if (!Types.ObjectId.isValid(performedExerciseId)) {
    throw new Error('Invalid performed exercise ID.');
  }
  const convertedPerformedExerciseId = idConverter(
    performedExerciseId
  ) as Types.ObjectId;

  const updatedExercise = await exerciseServicves.marWorkoutAsCompleated(
    convertedUserId,
    convertedPerformedExerciseId
  );

  if (!updatedExercise) {
    throw new Error('Performed exercise not found or user not authorized.');
  }

  res.status(200).json({
    success: true,
    message: 'Exercise marked as completed successfully.',
    data: updatedExercise,
  });
});
const markExerciseAsCompleated = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const performedExerciseId = req.query.exerciseId as string;
  if (!Types.ObjectId.isValid(performedExerciseId)) {
    throw new Error('Invalid performed exercise ID.');
  }
  const convertedExerciseId = idConverter(
    performedExerciseId
  ) as Types.ObjectId;
  console.log("🚀 ~ convertedExerciseId:", convertedExerciseId)

  const updatedExercise = await exerciseServicves.markExerciseAsCompleated(
    convertedUserId,
    convertedExerciseId
  );

 
  res.status(200).json({
    success: true,
    message: 'Exercise marked as completed successfully.',
    data: updatedExercise,
  });
});

const deleteExercise = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const exerciseId = req.params.id;
  const convertedExerciseId = idConverter(
    exerciseId as string
  ) as Types.ObjectId;

  const result = await exerciseServicves.deleteExercise(
    convertedExerciseId,
    convertedUserId
  );

  res.status(200).json(result);
});

const getPerformedExerciseById = catchAsync(async (req, res) => {
  const exerciseId = req.params.exerciseId as string;
  const convertedExerciseId = idConverter(exerciseId) as Types.ObjectId;

  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const exercise = await exerciseServicves.getPerformedExerciseById(
    convertedExerciseId,
    convertedUserId
  );

  res.status(200).json({
    success: true,
    message: 'Exercise retrieved successfully.',
    data: exercise,
  });
});

const getAllPerformedExercise = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const exercise =
    await exerciseServicves.getAllPerformedExercise(convertedUserId);

  res.status(200).json({
    success: true,
    message: 'Exercise retrieved successfully.',
    data: exercise,
  });
});

// New workout-log style endpoints

const createWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const payload =
    typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const data = await exerciseServicves.workoutLogs.create(
    convertedUserId,
    payload,
    req.file
  );

  res.status(201).json({
    success: true,
    message: 'Workout log created successfully',
    data,
  });
});

const updateWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const payload =
    typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body;

  const data = await exerciseServicves.workoutLogs.update(
    convertedUserId,
    req.params.id as string,
    payload,
    req.file
  );

  res.status(200).json({
    success: true,
    message: 'Workout log updated successfully',
    data,
  });
});

const listWorkoutLogs = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.list(convertedUserId);

  res.status(200).json({
    success: true,
    message: 'Workout log list fetched successfully',
    data,
  });
});
const SingleWorkoutLogs = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.getSingle(
    convertedUserId,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: 'Single Workout log fetched successfully',
    data,
  });
});

const deleteWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.remove(
    convertedUserId,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: 'Workout log deleted successfully',
    data,
  });
});

const undoWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.undo(
    convertedUserId,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: 'Workout undo successful',
    data,
  });
});

const undoLatestWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.undoLatest(convertedUserId);

  res.status(200).json({
    success: true,
    message: 'Latest workout action undone successfully',
    data,
  });
});

const shareWorkoutLog = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.workoutLogs.share(
    convertedUserId,
    req.params.id as string
  );

  res.status(200).json({
    success: true,
    message: 'Workout shared data fetched successfully',
    data,
  });
});

const workoutAnalysis = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const timeSpan =
    (req.query.timeSpan as '30d' | '3m' | '6m' | '12m' | '1y') || '3m';

  const data = await exerciseServicves.workoutLogs.analysis(
    convertedUserId,
    timeSpan
  );

  res.status(200).json({
    success: true,
    message: 'Workout analysis fetched successfully',
    data,
  });
});

const createLiftList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.create(
    convertedUserId,
    req.body
  );
  res.status(201).json({
    success: true,
    message: 'Lift list created successfully',
    data,
  });
});

const listLiftLists = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.list(convertedUserId);
  res.status(200).json({
    success: true,
    message: 'Lift lists fetched successfully',
    data,
  });
});

const getSingleLiftList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.getSingleList(
    convertedUserId,
    req.params.id as any
  );
  res.status(200).json({
    success: true,
    message: 'Single Lift list fetched successfully',
    data,
  });
})

const addLiftListItem = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.addItem(
    convertedUserId,
    req.params.id as string,
    req.body.itemId as string
  );
  res.status(200).json({
    success: true,
    message: 'Lift list item added successfully',
    data,
  });
});

const removeLiftListItem = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.removeItem(
    convertedUserId,
    req.params.id as string,
    req.body.itemId as string
  );
  res.status(200).json({
    success: true,
    message: 'Lift list item removed successfully',
    data,
  });
});

const deleteLiftList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.remove(
    convertedUserId,
    req.params.id as string
  );
  res.status(200).json({
    success: true,
    message: 'Lift list deleted successfully',
    data,
  });
});

const undoLiftList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.undo(
    convertedUserId,
    req.params.id as string
  );
  res.status(200).json({
    success: true,
    message: 'Lift list undo successful',
    data,
  });
});

const undoLatestLiftList = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new Error('User not authenticated.');
  }
  const convertedUserId = idConverter(userId) as Types.ObjectId;

  const data = await exerciseServicves.liftLists.undoLatest(convertedUserId);
  res.status(200).json({
    success: true,
    message: 'Latest lift list action undone successfully',
    data,
  });
});

const exerciseController = {
  createCommonExercise,
  createPersonalizeExercise,
  getExerciseBothCommonAndPersonalize,
  getExerciseById,
  performExercise,
  markExerciseAsCompleated,
  deleteExercise,
  getPerformedExerciseById,
  getAllPerformedExercise,
  SingleWorkoutLogs,
  createWorkoutLog,
  updateWorkoutLog,
  listWorkoutLogs,
  deleteWorkoutLog,
  undoWorkoutLog,
  undoLatestWorkoutLog,
  shareWorkoutLog,
  workoutAnalysis,
  createLiftList,
  listLiftLists,
  getSingleLiftList,
  addLiftListItem,
  removeLiftListItem,
  deleteLiftList,
  undoLiftList,
  undoLatestLiftList,
  markWorkoutAsCompleated
};

export default exerciseController;
