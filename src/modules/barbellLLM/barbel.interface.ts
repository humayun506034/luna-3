// import { Types } from 'mongoose';
// // ==================== Exercise Plan Interface Types =====================
// export type TExercise = {
//   name: string;
//   sets: string;
//   reps: string;
//   rest_period_minutes: string;
// };

// export type TDailyPlan = {
//   day: string;
//   focus: string;
//   exercises: TExercise[];
// };

// export type TWorkoutPlan = {
//   plan: TDailyPlan[];
// };

// export type TExercisePlan = {
//   user_id: Types.ObjectId;
//   workout_plan: TWorkoutPlan;
// };

// //==================== Chat Interface Types =====================
// export type TEachChat = {
//   response_id?: string;
//   user_id: string;
//   user_feedback: 'string';
//   ai_response: string;
//   timestamp: string;
//   status: string;
//   session_id: string;
// };

// export type TUserChatList = {
//   user_id: Types.ObjectId;
//   chatList: [TEachChat];
// };

// //==================== Diet Plan Interface Types =====================
// export type TMeal = {
// foodName:[string];
// dailyServingSize: string;
// macroNutrients:{
//   calories: number;
//   protein: number;
//   carbs: number;
//   fats: number;
// }

// export type TNutrient = {
//   name: string;
//   quantity: number;
//   unit: string; // mg, mcg, g, IU, etc.
// };

// export type microNutrients ={
//   vitamins: TNutrient[];
//   minerals: TNutrient[];
// }

// export type TMealWithTime = {
//   mealTime: "breakfast" | "lunch" | "dinner" | "snack";
//   mealDetails: TMeal;
// }

// export type TDietPlan ={
//   user_id: Types.ObjectId;
//   dailyMeals: TMealWithTime[];
// }

import { Types } from 'mongoose';

// ==================== Exercise Plan Interface Types =====================
export type TExercise = {
  name: string;
  sets: string;
  reps: string;
  rest_period_minutes: string;
};

export type TDailyPlan = {
  day: string;
  focus: string;
  exercises: TExercise[];
};

export type TWorkoutPlan = {
  plan: TDailyPlan[];
};

export type TExercisePlan = {
  user_id: Types.ObjectId;
  workout_plan: TWorkoutPlan;
};

// ==================== Chat Interface Types =====================
export type TEachChat = {
  response_id?: string;
  user_id: string;
  user_feedback: string;
  ai_response: string;
  timestamp: string;
  status: string;
  session_id: string;
};

export type TUserChatList = {
  user_id: Types.ObjectId;
  chatList: TEachChat[];
};

// ==================== Diet Plan Interface Types =====================
export type TNutrient = {
  name: string;
  quantity: number;
  unit: string; // mg, mcg, g, IU, etc.
};

// export type TMicroNutrients = {
//   vitamins: TNutrient[];
//   minerals: TNutrient[];
// };

export type TMicroNutrient = {
  name?: string;
  amount?: string;
};

export type TMacroNutrients = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type TMeal = {
  foodName: string[]; // FIXED
  dailyServingSize: string;
  macroNutrients?: TMacroNutrients;
  microNutrients?: TMicroNutrient[]; // optional if needed
};

export type TMealWithTime = {
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealDetails: TMeal;
};

export type TDietPlan = {
  user_id: Types.ObjectId;
  dailyMeals: TMealWithTime[];
};
