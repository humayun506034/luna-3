// import { Types } from 'mongoose';

// export type TExercise = {
//   img: string;
//   user_id?: Types.ObjectId;
//   name: string;
//   description: string;
//   primaryMuscleGroup: string;
//   exerciseType:
//     | 'cardio'
//     | 'strength_Training'
//     | 'stretching'
//     | 'balance_Training'
//     | 'high_Intensity'
//     | 'weight_training'
//     | 'bodyweight_exercises';
// };

// export type UserExercisePerform = {
//   exercise_id: Types.ObjectId | TExercise;
//   user_id: Types.ObjectId;
//   set: number;
//   weightLifted: number;
//   reps: number;
//   distance?: number;
//   timeToPerform?: number;
//   resetTime: number;
//   isCompleted: boolean;
//   totalCaloryBurn: number;
// };

import { Types } from 'mongoose';

export type TExercise = {
  img: string;
  user_id?: Types.ObjectId;
  name: string;
  description: string;
  primaryMuscleGroup: string;
  exerciseType:
    | 'cardio'
    | 'strength_Training'
    | 'stretching'
    | 'balance_Training'
    | 'high_Intensity'
    | 'weight_training'
    | 'bodyweight_exercises';
  isCompleted?: boolean;
  isDeleted?:boolean
};

export type UserExercisePerform = {
  exercise_id: Types.ObjectId | TExercise;
  user_id: Types.ObjectId;
  set: number;
  weightLifted: number;
  reps: number;
  distance?: number;
  timeToPerform?: number;
  resetTime: number;
  isCompleted: boolean;
  totalCaloryBurn: number;

  // (optional)
  image?: string;
  note?: string;
  isDeleted?: boolean;
  history?: Array<{
    action: 'create' | 'update' | 'delete';
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    undone?: boolean;
    createdAt?: Date;
  }>;
};
