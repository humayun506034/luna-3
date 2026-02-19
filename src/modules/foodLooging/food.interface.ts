import { Types } from 'mongoose';
import { TMicroNutrient } from '../barbellLLM/barbel.interface';


export type TFood = {
  img: string;
  user_id?: Types.ObjectId;
  name: string;
  ingredients?: [string];
  instructions?: string;
  servings: number;
  preparationTime: number;
  nutritionPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  microNutrients?: TMicroNutrient[];
};

export type TUserConsumedFood = {
  user_id: Types.ObjectId;
  consumedAs: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutritionPerServing: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  microNutrients?: TMicroNutrient[];
  servings: number;
};
