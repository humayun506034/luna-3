import mongoose from 'mongoose';
import { UserConsumedFoodModel } from '../foodLooging/food.model';
import { WorkoutASetupModel } from '../user/user.model';

// export const getDailyNutritionSummary = async (
//   userId: string,
//   timeRange: number,
//   filterArray?: string[]
// ) => {
//   const fields = ['calories', 'protein', 'carbs', 'fats', 'fiber'];
//   const selectedFields = filterArray || fields;

//   // Step 1: Build match filter
//   const fromDate = new Date();
//   fromDate.setDate(fromDate.getDate() - timeRange);
//   const matchFilter = {
//     user_id: new mongoose.Types.ObjectId(userId),
//     createdAt: { $gte: fromDate },
//   };

//   // Step 2: Aggregate from DB
//   const groupStage: Record<string, any> = {
//     _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//   };

//   for (const key of selectedFields) {
//     groupStage[`total${capitalize(key)}`] = {
//       $sum: { $multiply: [`$nutritionPerServing.${key}`, "$servings"] },
//     };
//   }

//   const dbResults = await UserConsumedFoodModel.aggregate([
//     { $match: matchFilter },
//     { $group: groupStage },
//     { $sort: { _id: 1 } },
//   ]);

//   // Step 3: Fill missing dates with zero values
//   const resultMap = new Map<string, any>();
//   for (const dayData of dbResults) resultMap.set(dayData._id, dayData);

//   const finalData: any[] = [];
//   const total: Record<string, number> = {};
//   selectedFields.forEach(key => total[`total${capitalize(key)}`] = 0);

//   for (let i = 0; i < timeRange; i++) {
//     const date = new Date();
//     date.setDate(date.getDate() - (timeRange - 1 - i));
//     const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

//     const existing = resultMap.get(dateStr);
//     const dayEntry: Record<string, any> = { date: dateStr };

//     for (const key of selectedFields) {
//       const fieldName = `total${capitalize(key)}`;
//       const val = existing?.[fieldName] || 0;
//       dayEntry[fieldName] = val;
//       total[fieldName] += val;
//     }

//     finalData.push(dayEntry);
//   }

//   return {
//     daily: finalData,
//     total,
//   };
// };

// export const getDailyNutritionSummary = async (
//   userId: string,
//   timeRange: number,
//   filterArray?: string[]
// ) => {
//   const fields = ['calories', 'protein', 'carbs', 'fats', 'fiber', "vitamines", "minerals"];
//   const selectedFields = filterArray || fields;

//   const fromDate = new Date();
//   fromDate.setDate(fromDate.getDate() - timeRange);

//   const matchFilter = {
//     user_id: new mongoose.Types.ObjectId(userId),
//     createdAt: { $gte: fromDate },
//   };

//   // Step 1: Aggregate overall daily totals
//   const groupStage: Record<string, any> = {
//     _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//   };

//   for (const key of selectedFields) {
//     groupStage[`total${capitalize(key)}`] = {
//       $sum: { $multiply: [`$nutritionPerServing.${key}`, '$servings'] },
//     };
//   }

//   const dbResults = await UserConsumedFoodModel.aggregate([
//     { $match: matchFilter },
//     { $group: groupStage },
//     { $sort: { _id: 1 } },
//   ]);

//   // Step 2: Aggregate by date + meal (for per-meal totals)
//   const perMealGroupStage: Record<string, any> = {
//     _id: {
//       date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//       meal: '$consumedAs',
//     },
//   };

//   for (const key of selectedFields) {
//     perMealGroupStage[`total${capitalize(key)}`] = {
//       $sum: { $multiply: [`$nutritionPerServing.${key}`, '$servings'] },
//     };
//   }

//   const perMealResults = await UserConsumedFoodModel.aggregate([
//     { $match: matchFilter },
//     { $group: perMealGroupStage },
//   ]);

//   // Step 3: Organize aggregated data
//   const resultMap = new Map<string, any>();
//   for (const row of dbResults) {
//     resultMap.set(row._id, row);
//   }

//   const mealMap = new Map<string, any>();
//   for (const row of perMealResults) {
//     const { date, meal } = row._id;
//     if (!mealMap.has(date)) {
//       mealMap.set(date, {});
//     }
//     mealMap.get(date)[meal] = {};

//     for (const key of selectedFields) {
//       mealMap.get(date)[meal][`total${capitalize(key)}`] =
//         row[`total${capitalize(key)}`] || 0;
//     }
//   }

//   // Step 4: Build final response
//   const finalData: any[] = [];
//   const total: Record<string, number> = {};
//   selectedFields.forEach((key) => (total[`total${capitalize(key)}`] = 0));

//   const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

//   for (let i = 0; i < timeRange; i++) {
//     const date = new Date();
//     date.setDate(date.getDate() - (timeRange - 1 - i));
//     const dateStr = date.toISOString().split('T')[0];

//     const existing = resultMap.get(dateStr);
//     const dayEntry: Record<string, any> = { date: dateStr };

//     // Daily total
//     for (const key of selectedFields) {
//       const fieldName = `total${capitalize(key)}`;
//       const val = existing?.[fieldName] || 0;
//       dayEntry[fieldName] = val;
//       total[fieldName] += val;
//     }

//     // Daily meals breakdown
//     const meals: Record<string, any> = {};
//     const mealData = mealMap.get(dateStr) || {};
//     for (const meal of mealTypes) {
//       meals[meal] = {};
//       for (const key of selectedFields) {
//         const field = `total${capitalize(key)}`;
//         meals[meal][field] = mealData?.[meal]?.[field] || 0;
//       }
//     }

//     dayEntry.consumedMeals = meals;
//     finalData.push(dayEntry);
//   }

//   return {
//     daily: finalData,
//     total,
//   };
// };

export const getDailyNutritionSummary = async (
  userId: string,
  timeRange: number,
  filterArray?: string[]
) => {
  const defaultMacroFields = ['calories', 'protein', 'carbs', 'fats', 'fiber'];
  const vitaminList = [
    'Vitamin A',
    'Vitamin C',
    'Vitamin D',
    'Vitamin E',
    'Vitamin K',
    'Vitamin B1',
    'Vitamin B2',
    'Vitamin B3',
    'Vitamin B6',
    'Vitamin B9',
    'Vitamin B12',
  ];
  const mineralList = [
    'Calcium',
    'Iron',
    'Magnesium',
    'Phosphorus',
    'Potassium',
    'Sodium',
    'Zinc',
    'Copper',
    'Manganese',
    'Selenium',
  ];

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - timeRange);

  const matchFilter = {
    user_id: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: fromDate },
  };

  // Separate macro and micro filters
  const macroFields = filterArray
    ? filterArray.filter((f) => defaultMacroFields.includes(f))
    : defaultMacroFields;

  const microFilter = filterArray
    ? filterArray.filter((f) =>
        ['vitamins', 'minerals'].includes(f.toLowerCase())
      )
    : [];

  // Step 1: Aggregate daily macros
  const groupStage: any = {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  };
  for (const key of macroFields) {
    groupStage[`total${capitalize(key)}`] = {
      $sum: {
        $multiply: [{ $toDouble: `$nutritionPerServing.${key}` }, '$servings'],
      },
    };
  }

  const macroResults = await UserConsumedFoodModel.aggregate([
    { $match: matchFilter },
    { $group: groupStage },
    { $sort: { _id: 1 } },
  ]);

  // Step 2: Aggregate per-meal macros
  const perMealGroupStage: any = {
    _id: {
      date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      meal: '$consumedAs',
    },
  };
  for (const key of macroFields) {
    perMealGroupStage[`total${capitalize(key)}`] = {
      $sum: {
        $multiply: [{ $toDouble: `$nutritionPerServing.${key}` }, '$servings'],
      },
    };
  }

  const perMealResults = await UserConsumedFoodModel.aggregate([
    { $match: matchFilter },
    { $group: perMealGroupStage },
  ]);

  const mealMap = new Map<string, any>();
  for (const row of perMealResults) {
    const { date, meal } = row._id;
    if (!mealMap.has(date)) mealMap.set(date, {});
    mealMap.get(date)[meal] = {};
    for (const key of macroFields) {
      mealMap.get(date)[meal][`total${capitalize(key)}`] =
        row[`total${capitalize(key)}`] || 0;
    }
  }

  // Step 3: Aggregate micro-nutrients per day
  let microMap = new Map<string, any>();
  if (microFilter.length > 0) {
    const microQuery: string[] = [];
    if (microFilter.includes('vitamins')) microQuery.push(...vitaminList);
    if (microFilter.includes('minerals')) microQuery.push(...mineralList);

    const microNutrientsAgg = await UserConsumedFoodModel.aggregate([
      { $match: matchFilter },
      { $unwind: '$microNutrients' },
      { $match: { 'microNutrients.name': { $in: microQuery } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            name: '$microNutrients.name',
          },
          totalAmount: {
            $sum: {
              $multiply: [{ $toDouble: '$microNutrients.amount' }, '$servings'],
            },
          },
        },
      },
    ]);

    for (const entry of microNutrientsAgg) {
      const date = entry._id.date;
      const name = entry._id.name;
      if (!microMap.has(date)) microMap.set(date, {});
      microMap.get(date)[name] = entry.totalAmount;
    }
  }

  // Step 4: Build final response
  const finalData = [];
  const total: Record<string, number> = {};
  macroFields.forEach((k) => (total[`total${capitalize(k)}`] = 0));

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  for (let i = 0; i < timeRange; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (timeRange - 1 - i));
    const dateStr = date.toISOString().split('T')[0];

    const macroRow = macroResults.find((r) => r._id === dateStr) || {};
    const dayEntry: any = { date: dateStr };

    // Daily macros
    for (const key of macroFields) {
      const field = `total${capitalize(key)}`;
      dayEntry[field] = macroRow[field] || 0;
      total[field] += dayEntry[field];
    }

    // Per-meal macros
    const meals: Record<string, any> = {};
    const mealData = mealMap.get(dateStr) || {};
    for (const meal of mealTypes) {
      meals[meal] = {};
      for (const key of macroFields) {
        const field = `total${capitalize(key)}`;
        meals[meal][field] = mealData?.[meal]?.[field] || 0;
      }
    }
    dayEntry.consumedMeals = meals;

    // Micro-nutrients
    dayEntry.microNutrients = microMap.get(dateStr) || {};

    finalData.push(dayEntry);
  }

  return { daily: finalData, total };
};

// export const getUserNutritionProgress = async (
//   userId: string,
//   timeRange: number
// ) => {
//   const fromDate = new Date();
//   fromDate.setDate(fromDate.getDate() - timeRange);

//   // Step 1: Get User Goal
//   const workoutSetup = await WorkoutASetupModel.findOne({ user_id: userId });
//   if (!workoutSetup) {
//     throw new Error('Workout setup not found for user');
//   }

//   const goal = {
//     calorieGoal: workoutSetup.calorieGoal,
//     proteinGoal: workoutSetup.proteinGoal,
//     carbsGoal: workoutSetup.carbsGoal,
//     fatsGoal: workoutSetup.fatsGoal,
//     fiberGoal: workoutSetup.fiberGoal,
//   };

//   // Step 2: Aggregate consumed data
//   const [consumed] = await UserConsumedFoodModel.aggregate([
//     {
//       $match: {
//         user_id: new mongoose.Types.ObjectId(userId),
//         createdAt: { $gte: fromDate },
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalCalories: {
//           $sum: { $multiply: ['$nutritionPerServing.calories', '$servings'] },
//         },
//         totalProtein: {
//           $sum: { $multiply: ['$nutritionPerServing.protein', '$servings'] },
//         },
//         totalCarbs: {
//           $sum: { $multiply: ['$nutritionPerServing.carbs', '$servings'] },
//         },
//         totalFats: {
//           $sum: { $multiply: ['$nutritionPerServing.fats', '$servings'] },
//         },
//         totalFiber: {
//           $sum: { $multiply: ['$nutritionPerServing.fiber', '$servings'] },
//         },
//       },
//     },
//   ]);

//   const actual = consumed || {
//     totalCalories: 0,
//     totalProtein: 0,
//     totalCarbs: 0,
//     totalFats: 0,
//     totalFiber: 0,
//   };

//   // Step 3: Calculate difference and percentage
//   const calculateProgress = (goal: number, actual: number) => {
//     const remaining = Math.max(goal - actual, 0);
//     const progress = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;
//     return { goal, actual, remaining, progress: Number(progress.toFixed(2)) };
//   };

//   return {
//     calories: calculateProgress(goal.calorieGoal, actual.totalCalories),
//     protein: calculateProgress(goal.proteinGoal, actual.totalProtein),
//     carbs: calculateProgress(goal.carbsGoal, actual.totalCarbs),
//     fats: calculateProgress(goal.fatsGoal, actual.totalFats),
//     fiber: calculateProgress(goal.fiberGoal, actual.totalFiber),
//   };
// };

interface NutritionProgress {
  goal: number;
  actual: number;
  remaining: number;
  progress: number; // percentage
}

interface UserNutritionProgress {
  calories: NutritionProgress;
  protein: NutritionProgress;
  carbs: NutritionProgress;
  fats: NutritionProgress;
  fiber: NutritionProgress;
}

export const getUserNutritionProgress = async (
  userId: string,
  timeRange: number
) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - timeRange);

  // Step 1: Get User Goal
  const workoutSetup = await WorkoutASetupModel.findOne({ user_id: userId });
  if (!workoutSetup) throw new Error('Workout setup not found for user');

  const goal = {
    calorieGoal: workoutSetup?.calorieGoal ?? 0,
    proteinGoal: workoutSetup?.proteinGoal ?? 0,
    carbsGoal: workoutSetup?.carbsGoal ?? 0,
    fatsGoal: workoutSetup?.fatsGoal ?? 0,
    fiberGoal: workoutSetup?.fiberGoal ?? 0,
  };

  // Step 2: Aggregate consumed data
  const [consumed] = await UserConsumedFoodModel.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: fromDate },
      },
    },
    {
      $group: {
        _id: null,
        totalCalories: {
          $sum: {
            $multiply: [
              { $toDouble: '$nutritionPerServing.calories' },
              '$servings',
            ],
          },
        },
        totalProtein: {
          $sum: {
            $multiply: [
              { $toDouble: '$nutritionPerServing.protein' },
              '$servings',
            ],
          },
        },
        totalCarbs: {
          $sum: {
            $multiply: [
              { $toDouble: '$nutritionPerServing.carbs' },
              '$servings',
            ],
          },
        },
        totalFats: {
          $sum: {
            $multiply: [
              { $toDouble: '$nutritionPerServing.fats' },
              '$servings',
            ],
          },
        },
        totalFiber: {
          $sum: {
            $multiply: [
              { $toDouble: '$nutritionPerServing.fiber' },
              '$servings',
            ],
          },
        },
      },
    },
  ]);

  const actual = consumed || {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    totalFiber: 0,
  };

  // Step 3: Calculate difference and percentage
  const calculateProgress = (goal: number, actual: number) => {
    const remaining = Math.max(goal - actual, 0);
    const progress = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;
    return { goal, actual, remaining, progress: Number(progress.toFixed(2)) };
  };

  return {
    calories: calculateProgress(goal.calorieGoal, actual.totalCalories),
    protein: calculateProgress(goal.proteinGoal, actual.totalProtein),
    carbs: calculateProgress(goal.carbsGoal, actual.totalCarbs),
    fats: calculateProgress(goal.fatsGoal, actual.totalFats),
    fiber: calculateProgress(goal.fiberGoal, actual.totalFiber),
    vitamins: calculateProgress(goal.calorieGoal, actual.totalCalories),
    minerals: calculateProgress(goal.proteinGoal, actual.totalProtein),
  };
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
