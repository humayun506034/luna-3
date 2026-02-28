/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import newWorkoutService from './newWorkout.service';

const getUserId = (req: any): Types.ObjectId => {
  const id = req.user?.id as string;

  if (!id || !Types.ObjectId.isValid(id)) {
    throw new Error('Unauthorized');
  }

  return new Types.ObjectId(String(id));
};

const parseIncomingData = (req: any) => {
  if (typeof req.body?.data === 'string') {
    return JSON.parse(req.body.data);
  }

  const payload = { ...req.body };

  if (typeof payload.ingredients === 'string') {
    try {
      payload.ingredients = JSON.parse(payload.ingredients);
    } catch {
      payload.ingredients = payload.ingredients
        .split(',')
        .map((x: string) => x.trim())
        .filter(Boolean);
    }
  }

  if (typeof payload.nutritionPerServing === 'string') {
    payload.nutritionPerServing = JSON.parse(payload.nutritionPerServing);
  }

  return payload;
};

const newWorkoutController = {
  // ================= WORKOUT =================

  workoutCreate: catchAsync(async (req, res) => {
    const payload = parseIncomingData(req);
    const data = await newWorkoutService.workout.create(
      getUserId(req),
      payload,
      req.file
    );
    res.status(201).json({
      success: true,
      message: 'Workout log created successfully',
      data,
    });
  }),

  workoutUpdate: catchAsync(async (req, res) => {
    const payload = parseIncomingData(req);
    const data = await newWorkoutService.workout.update(
      getUserId(req),
      req.params.id as string,
      payload,
      req.file
    );
    res.status(200).json({
      success: true,
      message: 'Workout log updated successfully',
      data,
    });
  }),

  workoutList: catchAsync(async (req, res) => {
    const data = await newWorkoutService.workout.list(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Workout log list fetched successfully',
      data,
    });
  }),

  workoutDelete: catchAsync(async (req, res) => {
    const data = await newWorkoutService.workout.remove(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Workout log deleted successfully',
      data,
    });
  }),

  workoutUndo: catchAsync(async (req, res) => {
    const data = await newWorkoutService.workout.undo(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Workout undo successful',
      data,
    });
  }),

  workoutUndoLatest: catchAsync(async (req, res) => {
    const data = await newWorkoutService.workout.undoLatest(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Latest workout action undone successfully',
      data,
    });
  }),

  workoutShare: catchAsync(async (req, res) => {
    const data = await newWorkoutService.workout.share(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Workout shared data fetched successfully',
      data,
    });
  }),

  // ================= MEAL =================

  mealCreate: catchAsync(async (req, res) => {
    const payload = parseIncomingData(req);
    const data = await newWorkoutService.meal.create(
      getUserId(req),
      payload,
      req.file
    );
    res.status(201).json({
      success: true,
      message: 'Meal log created successfully',
      data,
    });
  }),

  mealUpdate: catchAsync(async (req, res) => {
    const payload = parseIncomingData(req);
    const data = await newWorkoutService.meal.update(
      getUserId(req),
      req.params.id as string,
      payload,
      req.file
    );
    res.status(200).json({
      success: true,
      message: 'Meal log updated successfully',
      data,
    });
  }),

  mealList: catchAsync(async (req, res) => {
    const data = await newWorkoutService.meal.list(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Meal log list fetched successfully',
      data,
    });
  }),

  mealListPublicRecipes: catchAsync(async (_req, res) => {
    const data = await newWorkoutService.meal.listPublicRecipes();
    res.status(200).json({
      success: true,
      message: 'Public recipes fetched successfully',
      data,
    });
  }),

  mealDelete: catchAsync(async (req, res) => {
    const data = await newWorkoutService.meal.remove(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Meal log deleted successfully',
      data,
    });
  }),

  mealUndo: catchAsync(async (req, res) => {
    const data = await newWorkoutService.meal.undo(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Meal undo successful',
      data,
    });
  }),

  mealUndoLatest: catchAsync(async (req, res) => {
    const data = await newWorkoutService.meal.undoLatest(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Latest meal action undone successfully',
      data,
    });
  }),

  mealShare: catchAsync(async (req, res) => {
    const data = await newWorkoutService.meal.share(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Meal shared data fetched successfully',
      data,
    });
  }),

  // ================= RUNNING =================

  runningCreate: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.create(
      getUserId(req),
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Running session created successfully',
      data,
    });
  }),

  runningUpdate: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.update(
      getUserId(req),
      req.params.id as string,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Running session updated successfully',
      data,
    });
  }),

  runningList: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.list(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Running session list fetched successfully',
      data,
    });
  }),

  runningDelete: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.remove(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Running session deleted successfully',
      data,
    });
  }),

  runningUndo: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.undo(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Running undo successful',
      data,
    });
  }),

  runningUndoLatest: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.undoLatest(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Latest running action undone successfully',
      data,
    });
  }),

  runningShare: catchAsync(async (req, res) => {
    const data = await newWorkoutService.running.share(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Running shared data fetched successfully',
      data,
    });
  }),

  // ================= FASTING =================

  fastingCreate: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.create(
      getUserId(req),
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Fasting session created successfully',
      data,
    });
  }),

  fastingUpdate: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.update(
      getUserId(req),
      req.params.id as string,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Fasting session updated successfully',
      data,
    });
  }),

  fastingList: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.list(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Fasting session list fetched successfully',
      data,
    });
  }),

  fastingDelete: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.remove(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Fasting session deleted successfully',
      data,
    });
  }),

  fastingUndo: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.undo(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Fasting undo successful',
      data,
    });
  }),

  fastingUndoLatest: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.undoLatest(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Latest fasting action undone successfully',
      data,
    });
  }),

  fastingShare: catchAsync(async (req, res) => {
    const data = await newWorkoutService.fasting.share(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Fasting shared data fetched successfully',
      data,
    });
  }),

  // ================= LIFT LIST =================

  liftListCreate: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.create(
      getUserId(req),
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Lift list created successfully',
      data,
    });
  }),

  liftListList: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.list(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Lift list fetched successfully',
      data,
    });
  }),

  liftListAddItem: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.addItem(
      getUserId(req),
      req.params.id as string,
      req.body.itemId
    );
    res.status(200).json({
      success: true,
      message: 'Item added successfully',
      data,
    });
  }),

  liftListRemoveItem: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.removeItem(
      getUserId(req),
      req.params.id as string,
      req.body.itemId
    );
    res.status(200).json({
      success: true,
      message: 'Item removed successfully',
      data,
    });
  }),

  liftListDelete: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.remove(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Lift list deleted successfully',
      data,
    });
  }),

  liftListUndo: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.undo(
      getUserId(req),
      req.params.id as string
    );
    res.status(200).json({
      success: true,
      message: 'Lift list undo successful',
      data,
    });
  }),

  liftListUndoLatest: catchAsync(async (req, res) => {
    const data = await newWorkoutService.liftList.undoLatest(getUserId(req));
    res.status(200).json({
      success: true,
      message: 'Latest lift list action undone successfully',
      data,
    });
  }),

  // ================= ANALYSIS =================

  workoutAnalysis: catchAsync(async (req, res) => {
    const timeSpan = (req.query.timeSpan as '3m' | '6m' | '12m') || '3m';
    const data = await newWorkoutService.analysis.workout(
      getUserId(req),
      timeSpan
    );
    res.status(200).json({
      success: true,
      message: 'Workout analysis fetched successfully',
      data,
    });
  }),

  calorieAnalysis: catchAsync(async (req, res) => {
    const timeSpan =
      (req.query.timeSpan as '30d' | '3m' | '6m' | '12m') || '30d';
    const adjustByActivity = req.query.adjustByActivity !== 'false';

    const data = await newWorkoutService.analysis.calories(
      getUserId(req),
      timeSpan,
      adjustByActivity
    );

    res.status(200).json({
      success: true,
      message: 'Calorie analysis fetched successfully',
      data,
    });
  }),

  achievementShare: catchAsync(async (req, res) => {
    const timeSpan = (req.query.timeSpan as '3m' | '6m' | '12m') || '3m';

    const data = await newWorkoutService.sharing.achievement(
      getUserId(req),
      timeSpan
    );

    res.status(200).json({
      success: true,
      message: 'Achievement data fetched successfully',
      data,
    });
  }),
};

export default newWorkoutController;
