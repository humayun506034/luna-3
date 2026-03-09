// import { model, Schema } from 'mongoose';
// import { TFood, TUserConsumedFood } from './food.interface';

// const MicroNutrientSchema = new Schema(
//   {
//     name: { type: String, required: false },
//     amount: { type: String, required: false },
//   },
//   { _id: false } // optional, prevents automatic _id for subdocuments
// );

// const FoodSchema = new Schema<TFood>(
//   {
//     img: {
//       type: String,
//       required: true,
//     },
//     user_id: {
//       type: Schema.Types.ObjectId,
//       required: false,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     ingredients: {
//       type: [String],
//       required: false,
//     },
//     instructions: {
//       type: String,
//       required: false,
//     },
//     servings: {
//       type: Number,
//       required: true,
//     },
//     preparationTime: {
//       type: Number,
//       required: false,
//     },
//     nutritionPerServing: {
//       type: {
//         calories: { type: Number, required: true, default: 0 },
//         protein: { type: Number, required: true, default: 0 },
//         carbs: { type: Number, required: true, default: 0 },
//         fats: { type: Number, required: true, default: 0 },
//         fiber: { type: Number, required: true, default: 0 },
//       },

//       required: true,
//     },
//     microNutrients: { type: [MicroNutrientSchema], required: false },
//   },
//   { timestamps: true }
// );

// const UserConsumedFoodSchema = new Schema<TUserConsumedFood>(
//   {
//     user_id: {
//       type: Schema.Types.ObjectId,
//       required: true,
//     },
//     consumedAs: {
//       type: String,
//       enum: ['breakfast', 'lunch', 'dinner', 'snack'],
//       required: true,
//     },
//     nutritionPerServing: {
//       type: {
//         calories: { type: Number, required: true, default: 0 },
//         protein: { type: Number, required: true, default: 0 },
//         carbs: { type: Number, required: true, default: 0 },
//         fats: { type: Number, required: true, default: 0 },
//         fiber: { type: Number, required: true, default: 0 },
//       },
//       required: true,
//     },
//     microNutrients: { type: [MicroNutrientSchema], required: false },
//     servings: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // Models
// export const FoodModel = model<TFood>('FoodCollection', FoodSchema);
// export const UserConsumedFoodModel = model<TUserConsumedFood>(
//   'UserConsumedFood',
//   UserConsumedFoodSchema
// );



import { model, Schema } from 'mongoose';
import { TFood, TUserConsumedFood } from './food.interface';

const MicroNutrientSchema = new Schema(
  {
    name: { type: String, required: false },
    amount: { type: String, required: false },
  },
  { _id: false }
);

const FoodSchema = new Schema<TFood>(
  {
    img: { type: String, required: false },
    user_id: { type: Schema.Types.ObjectId, required: false },
    name: { type: String, required: true },

    ingredients: { type: [String], required: false },
    instructions: { type: String, required: false },
    servings: { type: Number, required: false },
    preparationTime: { type: Number, required: false },

    nutritionPerServing: {
      type: {
        calories: { type: Number, required: false },
        protein: { type: Number, required: false },
        carbs: { type: Number, required: false },
        fats: { type: Number, required: false },
        fiber: { type: Number, required: false },
      },
      required: false,
    },

    microNutrients: { type: [MicroNutrientSchema], required: false },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
    },
    publishedAt: { type: Date, required: false, default: null },
  },
  { timestamps: true }
);

const UserConsumedFoodSchema = new Schema<TUserConsumedFood>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true },
    consumedAs: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    nutritionPerServing: {
      type: {
        calories: { type: Number, required: true, default: 0 },
        protein: { type: Number, required: true, default: 0 },
        carbs: { type: Number, required: true, default: 0 },
        fats: { type: Number, required: true, default: 0 },
        fiber: { type: Number, required: true, default: 0 },
      },
      required: true,
    },
    microNutrients: { type: [MicroNutrientSchema], required: false },
    servings: { type: Number, required: true },
  },
  { timestamps: true }
);

export const FoodModel = model<TFood>('FoodCollection', FoodSchema);
export const UserConsumedFoodModel = model<TUserConsumedFood>(
  'UserConsumedFood',
  UserConsumedFoodSchema
);
 
