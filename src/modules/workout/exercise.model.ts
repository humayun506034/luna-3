// import { model, Schema } from 'mongoose';
// import { TExercise, UserExercisePerform } from './exercise.interface';

// const ExerciseSchema = new Schema<TExercise>({
//   img: {
//     type: String,
//     required: true,
//   },
//   user_id: {
//     type: Schema.Types.ObjectId,
//     required: false,
//     default: null,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   primaryMuscleGroup: {
//     type: String,
//     required: true,
//   },
//   exerciseType: {
//     type: String,
//     enum: [
//       'cardio',
//       'strength_Training',
//       'stretching',
//       'balance_Training',
//       'high_Intensity',
//       'weight_training',
//       'bodyweight_exercises',
//     ],
//     required: true,
//   },
// });

// const UserExercisePerformSchema = new Schema<UserExercisePerform>(
//   {
//     exercise_id: {
//       type: Schema.Types.ObjectId,
//       ref: 'Exercise',
//       required: true,
//     },
//     user_id: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: 'userCollection',
//     },
//     set: {
//       type: Number,
//       required: true,
//     },
//     weightLifted: {
//       type: Number,
//       required: false,
//       default: 0,
//     },
//     reps: {
//       type: Number,
//       required: true,
//     },
//     resetTime: {
//       type: Number,
//       required: true,
//     },
//     timeToPerform: {
//       type: Number,
//       required: false,
//     },
//     isCompleted: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },
//     distance: {
//       type: Number,
//       required: false,
//       default: 0,
//     },
//     totalCaloryBurn: {
//       type: Number,
//       required: false,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// // Models
// export const ExerciseModel = model<TExercise>('Exercise', ExerciseSchema);
// export const UserExercisePerformModel = model<UserExercisePerform>(
//   'UserExercisePerformModel',
//   UserExercisePerformSchema
// );



import { model, Schema } from 'mongoose';
import { TExercise, UserExercisePerform } from './exercise.interface';

const ExerciseSchema = new Schema<TExercise>({
  img: {
    type: String,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: false,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  primaryMuscleGroup: {
    type: String,
    required: true,
  },
  exerciseType: {
    type: String,
    enum: [
      'cardio',
      'strength_Training',
      'stretching',
      'balance_Training',
      'high_Intensity',
      'weight_training',
      'bodyweight_exercises',
    ],
    required: true,
  },
});

const UserExercisePerformSchema = new Schema<UserExercisePerform>(
  {
    exercise_id: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'userCollection',
    },
    set: {
      type: Number,
      required: true,
    },
    weightLifted: {
      type: Number,
      required: false,
      default: 0,
    },
    reps: {
      type: Number,
      required: true,
    },
    resetTime: {
      type: Number,
      required: true,
    },
    timeToPerform: {
      type: Number,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    distance: {
      type: Number,
      required: false,
      default: 0,
    },
    totalCaloryBurn: {
      type: Number,
      required: false,
      default: 0,
    },

    // add-only fields for workout-log style flow
    image: {
      type: String,
      required: false,
      default: '',
    },
    note: {
      type: String,
      required: false,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      required: false,
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
            type: Schema.Types.Mixed,
            default: null,
          },
          after: {
            type: Schema.Types.Mixed,
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

// Models
export const ExerciseModel = model<TExercise>('Exercise', ExerciseSchema);
export const UserExercisePerformModel = model<UserExercisePerform>(
  'UserExercisePerformModel',
  UserExercisePerformSchema
);
