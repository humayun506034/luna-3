import { Types } from 'mongoose';


export type TEntity = 'workout' | 'meal' | 'running' | 'lift_list' | 'fasting';
export type TAction = 'create' | 'update' | 'delete';


export type TWorkoutLog = {
  user_id: Types.ObjectId;
  exerciseName?: string;
  set?: number;
  reps?: number;
  weightLifted?: number;
  resetTime?: number;
  distance?: number;
  totalCaloryBurn?: number;
  isCompleted?: boolean;
  image?: string;
  note?: string;
  isDeleted?: boolean;
};


export type TMealLog = {
  user_id: Types.ObjectId;
  consumedAs?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name?: string;
  servings?: number;
  nutritionPerServing?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  prepTimeMin?: number;
  ingredients?: string[];
  image?: string;
  isRecipe?: boolean;
  isPublicRecipe?: boolean;
  note?: string;
  isDeleted?: boolean;
};


export type TRunningSession = {
  user_id: Types.ObjectId;
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
  distanceKm: number;
  caloriesBurned: number;
  avgPace: number;
  note?: string;
  isDeleted?: boolean;
};


export type TLiftList = {
  user_id: Types.ObjectId;
  name: string;
  itemType: 'workout' | 'running';
  itemIds: string[];
  isDeleted?: boolean;
};


export type TFastingSession = {
  user_id: Types.ObjectId;
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
  fastingType?: string;
  note?: string;
  isDeleted?: boolean;
};


export type TActivityLog = {
  user_id: Types.ObjectId;
  entity: TEntity;
  entityId: Types.ObjectId;
  action: TAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  undone: boolean;
};
