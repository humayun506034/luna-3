/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import {
  WorkflowActivityLogModel,
  WorkflowFastingSessionModel,
  WorkflowLiftListModel,
  WorkflowMealLogModel,
  WorkflowRunningSessionModel,
  WorkflowWorkoutLogModel,
} from './newWorkout.model';
import { TEntity } from './newWorkout.interface';
import { deleteFile, uploadImgToCloudinary } from '../../util/uploadImgToCludinary';

const oid = (id: string) => {
  if (!Types.ObjectId.isValid(id)) throw new Error('Invalid id');
  return new Types.ObjectId(id);
};

const normalizeTimeSpan = (timeSpan?: string) => {
  if (timeSpan === '6m') return 180;
  if (timeSpan === '12m' || timeSpan === '1y') return 365;
  if (timeSpan === '30d') return 30;
  return 90;
};

const nutritionDefaults = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  fiber: 0,
};

const getIngredientSafety = (ingredients: string[] = []) => {
  const riskyKeywords = ['nitrite', 'aspartame', 'msg', 'sulfite', 'hfcs', 'color', 'preservative'];
  if (ingredients.length === 0) {
    return {
      score: 100,
      description: 'No risky ingredients detected',
      riskyIngredients: [],
    };
  }

  const riskyIngredients = ingredients.filter((item) =>
    riskyKeywords.some((key) => item.toLowerCase().includes(key))
  );

  const score = Math.max(0, 100 - riskyIngredients.length * 15);
  const description =
    riskyIngredients.length > 0
      ? 'Some ingredients may be less healthy in frequent intake'
      : 'Ingredients look generally safe for regular intake';

  return { score, description, riskyIngredients };
};

const writeLog = async (
  user_id: Types.ObjectId,
  entity: TEntity,
  entityId: Types.ObjectId,
  action: 'create' | 'update' | 'delete',
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
) => {
  await WorkflowActivityLogModel.create({ user_id, entity, entityId, action, before, after, undone: false });
};

const updateByEntity = async (entity: TEntity, entityId: Types.ObjectId, update: Record<string, unknown>) => {
  if (entity === 'workout') {
    await WorkflowWorkoutLogModel.findByIdAndUpdate(entityId, update);
    return;
  }
  if (entity === 'meal') {
    await WorkflowMealLogModel.findByIdAndUpdate(entityId, update);
    return;
  }
  if (entity === 'running') {
    await WorkflowRunningSessionModel.findByIdAndUpdate(entityId, update);
    return;
  }
  if (entity === 'fasting') {
    await WorkflowFastingSessionModel.findByIdAndUpdate(entityId, update);
    return;
  }
  await WorkflowLiftListModel.findByIdAndUpdate(entityId, update);
};

const undoFromLog = async (entity: TEntity, last: any) => {
  const entityId = last.entityId as Types.ObjectId;

  if (last.action === 'create') {
    await updateByEntity(entity, entityId, { isDeleted: true });
  } else if (last.action === 'update' && last.before) {
    const before = { ...last.before } as Record<string, unknown>;
    delete (before as any)._id;
    delete (before as any).__v;
    await updateByEntity(entity, entityId, { $set: before } as any);
  } else if (last.action === 'delete') {
    await updateByEntity(entity, entityId, { isDeleted: false });
  }

  last.undone = true;
  await last.save();
  return { success: true };
};

const undo = async (user_id: Types.ObjectId, entity: TEntity, entityId: Types.ObjectId) => {
  const last = await WorkflowActivityLogModel.findOne({ user_id, entity, entityId, undone: false }).sort({ createdAt: -1 });
  if (!last) throw new Error('No undoable action found');
  return undoFromLog(entity, last);
};

const undoLatest = async (user_id: Types.ObjectId, entity: TEntity) => {
  const last = await WorkflowActivityLogModel.findOne({ user_id, entity, undone: false }).sort({ createdAt: -1 });
  if (!last) throw new Error('No undoable action found');
  return undoFromLog(entity, last);
};

const newWorkoutService = {
  workout: {
    create: async (user_id: Types.ObjectId, payload: any, file?: Express.Multer.File) => {
      let image = payload.image ?? '';
      if (file?.path) {
        try {
          const imageName = `${payload.exerciseName ?? 'workout'}-${Date.now()}`;
          const uploadResult = await uploadImgToCloudinary(imageName, file.path);
          image = uploadResult.secure_url;
        } catch (error) {
          await deleteFile(file.path);
          throw error;
        }
      }

      const doc = await WorkflowWorkoutLogModel.create({
        user_id,
        exerciseName: payload.exerciseName ?? 'Workout',
        set: payload.set ?? 1,
        reps: payload.reps ?? 1,
        weightLifted: payload.weightLifted ?? 0,
        resetTime: payload.resetTime ?? 0,
        distance: payload.distance ?? 0,
        totalCaloryBurn: payload.totalCaloryBurn ?? 0,
        isCompleted: payload.isCompleted ?? false,
        image: image,
        note: payload.note ?? '',
      });
      await writeLog(user_id, 'workout', doc._id as Types.ObjectId, 'create', null, doc.toObject());
      return doc;
    },
    update: async (user_id: Types.ObjectId, id: string, payload: any, file?: Express.Multer.File) => {
      const _id = oid(id);
      const prev = await WorkflowWorkoutLogModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Workout log not found');

      const before = prev.toObject();
      if (file?.path) {
        try {
          const imageName = `${payload.exerciseName ?? prev.exerciseName ?? 'workout'}-${Date.now()}`;
          const uploadResult = await uploadImgToCloudinary(imageName, file.path);
          payload.image = uploadResult.secure_url;
        } catch (error) {
          await deleteFile(file.path);
          throw error;
        }
      }
      Object.assign(prev, payload);
      await prev.save();

      await writeLog(user_id, 'workout', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    list: async (user_id: Types.ObjectId) =>
      WorkflowWorkoutLogModel.find({ user_id, isDeleted: false }).sort({ createdAt: -1 }),
    remove: async (user_id: Types.ObjectId, id: string) => {
      const _id = oid(id);
      const prev = await WorkflowWorkoutLogModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Workout log not found');

      await WorkflowWorkoutLogModel.updateOne({ _id }, { $set: { isDeleted: true } });
      await writeLog(user_id, 'workout', _id, 'delete', prev.toObject() as any, null);
      return { success: true };
    },
    undo: async (user_id: Types.ObjectId, id: string) => undo(user_id, 'workout', oid(id)),
    undoLatest: async (user_id: Types.ObjectId) => undoLatest(user_id, 'workout'),
    share: async (user_id: Types.ObjectId, id: string) => {
      const log = await WorkflowWorkoutLogModel.findOne({ _id: oid(id), user_id, isDeleted: false });
      if (!log) throw new Error('Workout log not found');
      return {
        type: 'workout',
        title: 'Workout Progress',
        caption: `${log.exerciseName} - ${log.set} sets x ${log.reps} reps`,
        stats: {
          exerciseName: log.exerciseName,
          set: log.set,
          reps: log.reps,
          weightLifted: log.weightLifted,
          totalCaloryBurn: log.totalCaloryBurn,
        },
      };
    },
  },

  meal: {
    create: async (user_id: Types.ObjectId, payload: any, file?: Express.Multer.File) => {
      let image = payload.image ?? '';
      if (file?.path) {
        try {
          const imageName = `${payload.name ?? 'meal'}-${Date.now()}`;
          const uploadResult = await uploadImgToCloudinary(imageName, file.path);
          image = uploadResult.secure_url;
        } catch (error) {
          await deleteFile(file.path);
          throw error;
        }
      }

      const doc = await WorkflowMealLogModel.create({
        user_id,
        consumedAs: payload.consumedAs ?? 'snack',
        name: payload.name ?? '',
        servings: payload.servings ?? 1,
        nutritionPerServing: {
          calories: payload?.nutritionPerServing?.calories ?? 0,
          protein: payload?.nutritionPerServing?.protein ?? 0,
          carbs: payload?.nutritionPerServing?.carbs ?? 0,
          fats: payload?.nutritionPerServing?.fats ?? 0,
          fiber: payload?.nutritionPerServing?.fiber ?? 0,
        },
        prepTimeMin: payload.prepTimeMin ?? 0,
        ingredients: payload.ingredients ?? [],
        image,
        isRecipe: payload.isRecipe ?? false,
        isPublicRecipe: payload.isPublicRecipe ?? false,
        note: payload.note ?? '',
      });
      await writeLog(user_id, 'meal', doc._id as Types.ObjectId, 'create', null, doc.toObject());
      return doc;
    },
    update: async (user_id: Types.ObjectId, id: string, payload: any, file?: Express.Multer.File) => {
      const _id = oid(id);
      const prev = await WorkflowMealLogModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Meal log not found');

      const before = prev.toObject();
      if (file?.path) {
        try {
          const imageName = `${payload.name ?? prev.name ?? 'meal'}-${Date.now()}`;
          const uploadResult = await uploadImgToCloudinary(imageName, file.path);
          payload.image = uploadResult.secure_url;
        } catch (error) {
          await deleteFile(file.path);
          throw error;
        }
      }
      Object.assign(prev, payload);
      await prev.save();

      await writeLog(user_id, 'meal', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    list: async (user_id: Types.ObjectId) =>
      WorkflowMealLogModel.find({ user_id, isDeleted: false }).sort({ createdAt: -1 }),
    listPublicRecipes: async () =>
      WorkflowMealLogModel.find({ isDeleted: false, isRecipe: true, isPublicRecipe: true }).sort({ createdAt: -1 }),
    remove: async (user_id: Types.ObjectId, id: string) => {
      const _id = oid(id);
      const prev = await WorkflowMealLogModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Meal log not found');

      await WorkflowMealLogModel.updateOne({ _id }, { $set: { isDeleted: true } });
      await writeLog(user_id, 'meal', _id, 'delete', prev.toObject() as any, null);
      return { success: true };
    },
    undo: async (user_id: Types.ObjectId, id: string) => undo(user_id, 'meal', oid(id)),
    undoLatest: async (user_id: Types.ObjectId) => undoLatest(user_id, 'meal'),
    share: async (user_id: Types.ObjectId, id: string) => {
      const meal = await WorkflowMealLogModel.findOne({ _id: oid(id), user_id, isDeleted: false });
      if (!meal) throw new Error('Meal log not found');
      const nutrition = meal.nutritionPerServing ?? nutritionDefaults;
      const safety = getIngredientSafety(meal.ingredients ?? []);

      return {
        type: 'meal',
        title: meal.name || 'My Meal',
        caption: `${meal.consumedAs ?? 'meal'} • ${nutrition.calories} kcal/serving`,
        prepTimeMin: meal.prepTimeMin ?? 0,
        stats: {
          servings: meal.servings ?? 1,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fats: nutrition.fats,
          fiber: nutrition.fiber,
        },
        ingredientSafety: safety,
      };
    },
  },

  running: {
    create: async (user_id: Types.ObjectId, payload: any) => {
      const durationSec =
        payload.durationSec ??
        Math.max(0, (new Date(payload.endedAt).getTime() - new Date(payload.startedAt).getTime()) / 1000);
      const avgPace = payload.avgPace ?? (payload.distanceKm > 0 ? durationSec / 60 / payload.distanceKm : 0);

      const doc = await WorkflowRunningSessionModel.create({
        user_id,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
        durationSec,
        distanceKm: payload.distanceKm,
        caloriesBurned: payload.caloriesBurned ?? 0,
        avgPace,
        note: payload.note ?? '',
      });
      await writeLog(user_id, 'running', doc._id as Types.ObjectId, 'create', null, doc.toObject());
      return doc;
    },
    update: async (user_id: Types.ObjectId, id: string, payload: any) => {
      const _id = oid(id);
      const prev = await WorkflowRunningSessionModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Running session not found');

      const before = prev.toObject();
      Object.assign(prev, payload);
      await prev.save();

      await writeLog(user_id, 'running', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    list: async (user_id: Types.ObjectId) =>
      WorkflowRunningSessionModel.find({ user_id, isDeleted: false }).sort({ createdAt: -1 }),
    remove: async (user_id: Types.ObjectId, id: string) => {
      const _id = oid(id);
      const prev = await WorkflowRunningSessionModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Running session not found');

      await WorkflowRunningSessionModel.updateOne({ _id }, { $set: { isDeleted: true } });
      await writeLog(user_id, 'running', _id, 'delete', prev.toObject() as any, null);
      return { success: true };
    },
    undo: async (user_id: Types.ObjectId, id: string) => undo(user_id, 'running', oid(id)),
    undoLatest: async (user_id: Types.ObjectId) => undoLatest(user_id, 'running'),
    share: async (user_id: Types.ObjectId, id: string) => {
      const session = await WorkflowRunningSessionModel.findOne({ _id: oid(id), user_id, isDeleted: false });
      if (!session) throw new Error('Running session not found');

      return {
        type: 'running',
        title: 'My Run',
        caption: `${session.distanceKm} km in ${Math.round(session.durationSec / 60)} min`,
        stats: {
          distanceKm: session.distanceKm,
          durationSec: session.durationSec,
          caloriesBurned: session.caloriesBurned,
          avgPace: session.avgPace,
        },
      };
    },
  },

  fasting: {
    create: async (user_id: Types.ObjectId, payload: any) => {
      const durationSec =
        payload.durationSec ??
        Math.max(0, (new Date(payload.endedAt).getTime() - new Date(payload.startedAt).getTime()) / 1000);

      const doc = await WorkflowFastingSessionModel.create({
        user_id,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
        durationSec,
        fastingType: payload.fastingType ?? '',
        note: payload.note ?? '',
      });

      await writeLog(user_id, 'fasting', doc._id as Types.ObjectId, 'create', null, doc.toObject());
      return doc;
    },
    update: async (user_id: Types.ObjectId, id: string, payload: any) => {
      const _id = oid(id);
      const prev = await WorkflowFastingSessionModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Fasting session not found');

      const before = prev.toObject();
      Object.assign(prev, payload);
      await prev.save();

      await writeLog(user_id, 'fasting', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    list: async (user_id: Types.ObjectId) =>
      WorkflowFastingSessionModel.find({ user_id, isDeleted: false }).sort({ createdAt: -1 }),
    remove: async (user_id: Types.ObjectId, id: string) => {
      const _id = oid(id);
      const prev = await WorkflowFastingSessionModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Fasting session not found');

      await WorkflowFastingSessionModel.updateOne({ _id }, { $set: { isDeleted: true } });
      await writeLog(user_id, 'fasting', _id, 'delete', prev.toObject() as any, null);
      return { success: true };
    },
    undo: async (user_id: Types.ObjectId, id: string) => undo(user_id, 'fasting', oid(id)),
    undoLatest: async (user_id: Types.ObjectId) => undoLatest(user_id, 'fasting'),
    share: async (user_id: Types.ObjectId, id: string) => {
      const session = await WorkflowFastingSessionModel.findOne({ _id: oid(id), user_id, isDeleted: false });
      if (!session) throw new Error('Fasting session not found');

      return {
        type: 'fasting',
        title: session.fastingType || 'Fasting Session',
        caption: `${Math.round(session.durationSec / 3600)}h fasting completed`,
        stats: {
          durationSec: session.durationSec,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
        },
      };
    },
  },

  liftList: {
    create: async (user_id: Types.ObjectId, payload: any) => {
      const doc = await WorkflowLiftListModel.create({
        user_id,
        name: payload.name,
        itemType: payload.itemType,
        itemIds: payload.itemIds ?? [],
      });
      await writeLog(user_id, 'lift_list', doc._id as Types.ObjectId, 'create', null, doc.toObject());
      return doc;
    },
    list: async (user_id: Types.ObjectId) =>
      WorkflowLiftListModel.find({ user_id, isDeleted: false }).sort({ createdAt: -1 }),
    addItem: async (user_id: Types.ObjectId, id: string, itemId: string) => {
      const _id = oid(id);
      const prev = await WorkflowLiftListModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Lift list not found');

      const before = prev.toObject();
      if (!prev.itemIds.includes(itemId)) prev.itemIds.push(itemId);
      await prev.save();

      await writeLog(user_id, 'lift_list', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    removeItem: async (user_id: Types.ObjectId, id: string, itemId: string) => {
      const _id = oid(id);
      const prev = await WorkflowLiftListModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Lift list not found');

      const before = prev.toObject();
      prev.itemIds = prev.itemIds.filter((x) => x !== itemId);
      await prev.save();

      await writeLog(user_id, 'lift_list', _id, 'update', before as any, prev.toObject());
      return prev;
    },
    remove: async (user_id: Types.ObjectId, id: string) => {
      const _id = oid(id);
      const prev = await WorkflowLiftListModel.findOne({ _id, user_id, isDeleted: false });
      if (!prev) throw new Error('Lift list not found');

      await WorkflowLiftListModel.updateOne({ _id }, { $set: { isDeleted: true } });
      await writeLog(user_id, 'lift_list', _id, 'delete', prev.toObject() as any, null);
      return { success: true };
    },
    undo: async (user_id: Types.ObjectId, id: string) => undo(user_id, 'lift_list', oid(id)),
    undoLatest: async (user_id: Types.ObjectId) => undoLatest(user_id, 'lift_list'),
  },

  sharing: {
    achievement: async (user_id: Types.ObjectId, timeSpan: '3m' | '6m' | '12m' = '3m') => {
      const days = normalizeTimeSpan(timeSpan);
      const from = new Date();
      from.setDate(from.getDate() - days);

      const [workoutCount, mealCount, runCount, fastingCount] = await Promise.all([
        WorkflowWorkoutLogModel.countDocuments({ user_id, isDeleted: false, createdAt: { $gte: from } }),
        WorkflowMealLogModel.countDocuments({ user_id, isDeleted: false, createdAt: { $gte: from } }),
        WorkflowRunningSessionModel.countDocuments({ user_id, isDeleted: false, createdAt: { $gte: from } }),
        WorkflowFastingSessionModel.countDocuments({ user_id, isDeleted: false, createdAt: { $gte: from } }),
      ]);

      return {
        type: 'achievement',
        title: 'My Fitness Activity',
        caption: `In last ${days} days: ${workoutCount} workouts, ${runCount} runs, ${fastingCount} fasts`,
        stats: {
          workouts: workoutCount,
          mealsTracked: mealCount,
          runs: runCount,
          fasts: fastingCount,
        },
      };
    },
  },

  analysis: {
    workout: async (user_id: Types.ObjectId, timeSpan: '3m' | '6m' | '12m') => {
      const days = normalizeTimeSpan(timeSpan);
      const from = new Date();
      from.setDate(from.getDate() - days);

      return WorkflowWorkoutLogModel.aggregate([
        { $match: { user_id, isDeleted: false, createdAt: { $gte: from } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            set: { $sum: '$set' },
            reps: { $sum: '$reps' },
            totalCaloryBurn: { $sum: '$totalCaloryBurn' },
          },
        },
        { $project: { _id: 0, date: '$_id', set: 1, reps: 1, totalCaloryBurn: 1 } },
        { $sort: { date: 1 } },
      ]);
    },
    calories: async (
      user_id: Types.ObjectId,
      timeSpan: '30d' | '3m' | '6m' | '12m',
      adjustByActivity: boolean
    ) => {
      const days = normalizeTimeSpan(timeSpan);
      const from = new Date();
      from.setDate(from.getDate() - days);

      const [mealLogs, workoutBurn, runningBurn] = await Promise.all([
        WorkflowMealLogModel.find({ user_id, isDeleted: false, createdAt: { $gte: from } }),
        WorkflowWorkoutLogModel.aggregate([
          { $match: { user_id, isDeleted: false, createdAt: { $gte: from } } },
          { $group: { _id: null, total: { $sum: '$totalCaloryBurn' } } },
        ]),
        WorkflowRunningSessionModel.aggregate([
          { $match: { user_id, isDeleted: false, createdAt: { $gte: from } } },
          { $group: { _id: null, total: { $sum: '$caloriesBurned' } } },
        ]),
      ]);

      const consumedCalories = mealLogs.reduce((sum, item: any) => {
        const perServing = item?.nutritionPerServing?.calories ?? 0;
        return sum + perServing * (item.servings ?? 1);
      }, 0);

      const burnedByWorkout = workoutBurn?.[0]?.total ?? 0;
      const burnedByRunning = runningBurn?.[0]?.total ?? 0;
      const activityBurn = burnedByWorkout + burnedByRunning;

      return {
        timeSpan,
        consumedCalories,
        activityBurn,
        netCalories: adjustByActivity ? consumedCalories - activityBurn : consumedCalories,
        adjustmentApplied: adjustByActivity,
      };
    },
  },
};

export default newWorkoutService;

