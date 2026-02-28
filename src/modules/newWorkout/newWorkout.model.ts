import { model, Schema } from 'mongoose';
import {
  TActivityLog,
  TFastingSession,
  TLiftList,
  TMealLog,
  TRunningSession,
  TWorkoutLog,
} from './newWorkout.interface';


const WorkoutLogSchema = new Schema<TWorkoutLog>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    exerciseName: { type: String, required: true },
    set: { type: Number, required: true, default: 1 },
    reps: { type: Number, required: true, default: 1 },
    weightLifted: { type: Number, default: 0 },
    resetTime: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    totalCaloryBurn: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    image: { type: String, default: '' },
    note: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


const MealLogSchema = new Schema<TMealLog>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    consumedAs: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    name: { type: String, default: '' },
    servings: { type: Number, required: true, default: 1 },
    nutritionPerServing: {
      calories: { type: Number, required: true, default: 0 },
      protein: { type: Number, required: true, default: 0 },
      carbs: { type: Number, required: true, default: 0 },
      fats: { type: Number, required: true, default: 0 },
      fiber: { type: Number, required: true, default: 0 },
    },
    prepTimeMin: { type: Number, default: 0 },
    ingredients: { type: [String], default: [] },
    image: { type: String, default: '' },
    isRecipe: { type: Boolean, default: false, index: true },
    isPublicRecipe: { type: Boolean, default: false, index: true },
    note: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


const RunningSessionSchema = new Schema<TRunningSession>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationSec: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    caloriesBurned: { type: Number, default: 0 },
    avgPace: { type: Number, default: 0 },
    note: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const FastingSessionSchema = new Schema<TFastingSession>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationSec: { type: Number, required: true },
    fastingType: { type: String, default: '' },
    note: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


const LiftListSchema = new Schema<TLiftList>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    name: { type: String, required: true },
    itemType: { type: String, enum: ['workout', 'running'], required: true },
    itemIds: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


LiftListSchema.index({ user_id: 1, name: 1, itemType: 1 }, { unique: true });


const ActivityLogSchema = new Schema<TActivityLog>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'UserCollection' },
    entity: { type: String, enum: ['workout', 'meal', 'running', 'lift_list', 'fasting'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, enum: ['create', 'update', 'delete'], required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    undone: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);


export const WorkflowWorkoutLogModel = model<TWorkoutLog>('WorkflowWorkoutLog', WorkoutLogSchema);
export const WorkflowMealLogModel = model<TMealLog>('WorkflowMealLog', MealLogSchema);
export const WorkflowRunningSessionModel = model<TRunningSession>('WorkflowRunningSession', RunningSessionSchema);
export const WorkflowFastingSessionModel = model<TFastingSession>('WorkflowFastingSession', FastingSessionSchema);
export const WorkflowLiftListModel = model<TLiftList>('WorkflowLiftList', LiftListSchema);
export const WorkflowActivityLogModel = model<TActivityLog>('WorkflowActivityLog', ActivityLogSchema);
