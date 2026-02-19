import { model, Schema } from 'mongoose';
import {
  TDailyPlan,
  TExercise,
  TExercisePlan,
  TWorkoutPlan,
} from './barbel.interface';

// Mongoose schemas
const exerciseSchema = new Schema<TExercise>(
  {
    name: { type: String, required: true },
    sets: { type: String, required: true },
    reps: { type: String, required: true },
    rest_period_minutes: { type: String, required: true },
  },
  { _id: false } // No _id for subdocuments
);

const dailyPlanSchema = new Schema<TDailyPlan>(
  {
    day: { type: String, required: true },
    focus: { type: String, required: true },
    exercises: { type: [exerciseSchema], required: true },
  },
  { _id: false }
);

const workoutPlanSchema = new Schema<TWorkoutPlan>(
  {
    plan: { type: [dailyPlanSchema], required: true },
  },
  { _id: false }
);

const exercisePlanSchema = new Schema<TExercisePlan>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional, for personalized plans
    workout_plan: { type: workoutPlanSchema, required: true },
  },
  { timestamps: true } // Adds createdAt, updatedAt
);

// Define the TEachChat schema
const TEachChatSchema = new Schema({
  response_id: {
    type: String,
    required: false,
  },
  user_id: {
    type: String,
    required: true,
  },
  user_feedback: {
    type: String,
    required: true,
  },
  ai_response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    require: false,
  },
  status: {
    type: String,
    require: false,
  },
  session_id: {
    type: String,
    require: false,
  },
});

// Define the TUserChatList schema
const TUserChatListSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true, // Ensures one chat list per user
  },
  chatList: {
    type: [TEachChatSchema],
    default: [],
  },
});

// Create and export the model
export const UserChatListModel = model('TUserChatList', TUserChatListSchema);
// Mongoose model
export const ExercisePlanModel = model<TExercisePlan>(
  'ExercisePlan',
  exercisePlanSchema
);

// diet plan
// Nutrient schema
const nutrientSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false }
);

// MicroNutrients schema
const microNutrientsSchema = new Schema(
  {
    vitamins: { type: [nutrientSchema], default: [] },
    minerals: { type: [nutrientSchema], default: [] },
  },
  { _id: false }
);

// MacroNutrients schema
const macroNutrientsSchema = new Schema(
  {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
  { _id: false }
);

// Meal schema
const mealSchema = new Schema(
  {
    foodName: { type: [String], required: true },
    dailyServingSize: { type: String, required: true },
    macroNutrients: { type: macroNutrientsSchema, required: false },
    microNutrients: { type: microNutrientsSchema, required: false },
  },
  { _id: false }
);

// MealWithTime schema
const mealWithTimeSchema = new Schema(
  {
    mealTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    mealDetails: { type: mealSchema, required: true },
  },
  { _id: false }
);

// DietPlan schema
const dietPlanSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dailyMeals: { type: [mealWithTimeSchema], default: [] },
  },
  { timestamps: true }
);

// DietPlan model
export const DietPlanModel = model('DietPlan', dietPlanSchema);
