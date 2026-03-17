// import express from 'express';
// import auth from '../../middleware/auth';
// import { userRole } from '../../constents';
// import exerciseController from './exercise.controller';
// import { upload } from '../../util/uploadImgToCludinary';

// const exerciseRoutes = express.Router();

// // Create a common exercise (Admin only, with file upload)
// exerciseRoutes.post(
//   '/createCommonExercise',
//   auth([userRole.admin]),
//   upload.single('file'),
//   exerciseController.createCommonExercise
// );

// // Create a personalized exercise (Authenticated users, with file upload)
// exerciseRoutes.post(
//   '/createPersonalizeExercise',
//   auth([userRole.user, userRole.admin]),
//   upload.single('file'),
//   exerciseController.createPersonalizeExercise
// );

// // Get both common and personalized exercises (Authenticated users)
// exerciseRoutes.get(
//   '/getExerciseBothCommonAndPersonalize',
//   auth([userRole.user, userRole.admin]),
//   exerciseController.getExerciseBothCommonAndPersonalize
// );

// // Get exercise by ID (Authenticated users)
// exerciseRoutes.get(
//   '/getExerciseById',
//   auth([userRole.user, userRole.admin]),
//   exerciseController.getExerciseById
// );

// // Perform an exercise (Authenticated users)
// exerciseRoutes.post(
//   '/performExercise',
//   auth([userRole.user, userRole.admin]),
//   exerciseController.performExercise
// );

// // Mark exercise as completed (Authenticated users)
// exerciseRoutes.patch(
//   '/markExerciseAsCompleated',
//   auth([userRole.user, userRole.admin]),
//   exerciseController.markExerciseAsCompleated
// );

// // Delete exercise by ID (Authenticated user or admin)
// exerciseRoutes.delete(
//   '/deleteExercise/:id',
//   auth([userRole.user, userRole.admin]),
//   exerciseController.deleteExercise
// );

// exerciseRoutes.get(
//   '/performed-exercises/:exerciseId',
//   auth([userRole.user]),
//   exerciseController.getPerformedExerciseById
// );

// exerciseRoutes.get(
//   '/performed-exercises',
//   auth([userRole.user]),
//   exerciseController.getAllPerformedExercise
// );

// export default exerciseRoutes;


import express from 'express';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';
import exerciseController from './exercise.controller';
import { upload } from '../../util/uploadImgToCludinary';

const exerciseRoutes = express.Router();

// Create exercise (canonical route)
exerciseRoutes.post(
  '/createExercise',
  auth([userRole.user, userRole.admin]),
  upload.single('file'),
  exerciseController.createCommonExercise
);

// Backward-compatible aliases
exerciseRoutes.post(
  '/createCommonExercise',
  auth([userRole.admin, userRole.user]),
  upload.single('file'),
  exerciseController.createCommonExercise
);

exerciseRoutes.post(
  '/createPersonalizeExercise',
  auth([userRole.user, userRole.admin]),
  upload.single('file'),
  exerciseController.createPersonalizeExercise
);

exerciseRoutes.get(
  '/getExerciseBothCommonAndPersonalize',
  auth([userRole.user, userRole.admin]),
  exerciseController.getExerciseBothCommonAndPersonalize
);

exerciseRoutes.get(
  '/getExerciseById',
  auth([userRole.user, userRole.admin]),
  exerciseController.getExerciseById
);

exerciseRoutes.post(
  '/performExercise',
  auth([userRole.user, userRole.admin]),
  exerciseController.performExercise
);

// alias for lower-friction tracking flow
exerciseRoutes.post(
  '/trackExercise',
  auth([userRole.user, userRole.admin]),
  exerciseController.performExercise
);

exerciseRoutes.patch(
  '/markExerciseAsCompleated',
  auth([userRole.user, userRole.admin]),
  exerciseController.markExerciseAsCompleated
);
exerciseRoutes.patch(
  '/markWorkoutAsCompleated',
  auth([userRole.user, userRole.admin]),
  exerciseController.markWorkoutAsCompleated
);

exerciseRoutes.delete(
  '/deleteExercise/:id',
  auth([userRole.user, userRole.admin]),
  exerciseController.deleteExercise
);

exerciseRoutes.get(
  '/performed-exercises/:exerciseId',
  auth([userRole.user, userRole.admin]),
  exerciseController.getPerformedExerciseById
);

exerciseRoutes.get(
  '/performed-exercises',
  auth([userRole.user, userRole.admin]),
  exerciseController.getAllPerformedExercise
);

// New workout-log routes (from newWorkout workout-related part)
exerciseRoutes.post(
  '/workouts/logs',
  auth([userRole.user, userRole.admin]),
  upload.single('file'),
  exerciseController.createWorkoutLog
);

exerciseRoutes.patch(
  '/workouts/logs/:id',
  auth([userRole.user, userRole.admin]),
  upload.single('file'),
  exerciseController.updateWorkoutLog
);


exerciseRoutes.get(
  '/workouts/logs',
  auth([userRole.user, userRole.admin]),
  exerciseController.listWorkoutLogs
);
exerciseRoutes.get(
  '/workouts/logs/:id',
  auth([userRole.user, userRole.admin]),
  exerciseController.SingleWorkoutLogs
);
exerciseRoutes.delete(
  '/workouts/logs/:id',
  auth([userRole.user, userRole.admin]),
  exerciseController.deleteWorkoutLog
);

exerciseRoutes.post(
  '/workouts/logs/:id/undo',
  auth([userRole.user, userRole.admin]),
  exerciseController.undoWorkoutLog
);

exerciseRoutes.post(
  '/workouts/logs/undo-latest',
  auth([userRole.user, userRole.admin]),
  exerciseController.undoLatestWorkoutLog
);

exerciseRoutes.get(
  '/workouts/logs/:id/share',
  auth([userRole.user, userRole.admin]),
  exerciseController.shareWorkoutLog
);

exerciseRoutes.get(
  '/analysis/workout',
  auth([userRole.user, userRole.admin]),
  exerciseController.workoutAnalysis
);

// lift lists (playlist-style organization)
exerciseRoutes.post(
  '/lift-lists',
  auth([userRole.user, userRole.admin]),
  exerciseController.createLiftList
);

exerciseRoutes.get(
  '/lift-lists/:id',
  auth([userRole.user, userRole.admin]),
  exerciseController.getSingleLiftList
);
exerciseRoutes.get(
  '/lift-lists',
  auth([userRole.user, userRole.admin]),
  exerciseController.listLiftLists
);

exerciseRoutes.patch(
  '/lift-lists/:id/add-item',
  auth([userRole.user, userRole.admin]),
  exerciseController.addLiftListItem
);

exerciseRoutes.patch(
  '/lift-lists/:id/remove-item',
  auth([userRole.user, userRole.admin]),
  exerciseController.removeLiftListItem
);

exerciseRoutes.delete(
  '/lift-lists/:id',
  auth([userRole.user, userRole.admin]),
  exerciseController.deleteLiftList
);

exerciseRoutes.patch(
  '/lift-lists/:id/undo',
  auth([userRole.user, userRole.admin]),
  exerciseController.undoLiftList
);

exerciseRoutes.post(
  '/lift-lists/undo-latest',
  auth([userRole.user, userRole.admin]),
  exerciseController.undoLatestLiftList
);

export default exerciseRoutes;
