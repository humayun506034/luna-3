import express from 'express';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';
import { upload } from '../../util/uploadImgToCludinary';
import newWorkoutController from './newWorkout.controller';

const newWorkoutRouter = express.Router();
const protectedAccess = auth([userRole.user, userRole.admin]);

newWorkoutRouter.post('/workouts/logs', protectedAccess, upload.single('file'), newWorkoutController.workoutCreate);
newWorkoutRouter.patch('/workouts/logs/:id', protectedAccess, upload.single('file'), newWorkoutController.workoutUpdate);
newWorkoutRouter.get('/workouts/logs', protectedAccess, newWorkoutController.workoutList);
newWorkoutRouter.delete('/workouts/logs/:id', protectedAccess, newWorkoutController.workoutDelete);
newWorkoutRouter.post('/workouts/logs/:id/undo', protectedAccess, newWorkoutController.workoutUndo);
newWorkoutRouter.post('/workouts/logs/undo-latest', protectedAccess, newWorkoutController.workoutUndoLatest);
newWorkoutRouter.get('/workouts/logs/:id/share', protectedAccess, newWorkoutController.workoutShare);

newWorkoutRouter.post('/meals/logs', protectedAccess, upload.single('file'), newWorkoutController.mealCreate);
newWorkoutRouter.patch('/meals/logs/:id', protectedAccess, upload.single('file'), newWorkoutController.mealUpdate);
newWorkoutRouter.get('/meals/logs', protectedAccess, newWorkoutController.mealList);
newWorkoutRouter.delete('/meals/logs/:id', protectedAccess, newWorkoutController.mealDelete);
newWorkoutRouter.post('/meals/logs/:id/undo', protectedAccess, newWorkoutController.mealUndo);
newWorkoutRouter.post('/meals/logs/undo-latest', protectedAccess, newWorkoutController.mealUndoLatest);
newWorkoutRouter.get('/meals/logs/:id/share', protectedAccess, newWorkoutController.mealShare);
newWorkoutRouter.get('/meals/recipes/public', protectedAccess, newWorkoutController.mealListPublicRecipes);

newWorkoutRouter.post('/running/sessions', protectedAccess, newWorkoutController.runningCreate);
newWorkoutRouter.patch('/running/sessions/:id', protectedAccess, newWorkoutController.runningUpdate);
newWorkoutRouter.get('/running/sessions', protectedAccess, newWorkoutController.runningList);
newWorkoutRouter.delete('/running/sessions/:id', protectedAccess, newWorkoutController.runningDelete);
newWorkoutRouter.post('/running/sessions/:id/undo', protectedAccess, newWorkoutController.runningUndo);
newWorkoutRouter.post('/running/sessions/undo-latest', protectedAccess, newWorkoutController.runningUndoLatest);
newWorkoutRouter.get('/running/sessions/:id/share', protectedAccess, newWorkoutController.runningShare);

newWorkoutRouter.post('/fasting/sessions', protectedAccess, newWorkoutController.fastingCreate);
newWorkoutRouter.patch('/fasting/sessions/:id', protectedAccess, newWorkoutController.fastingUpdate);
newWorkoutRouter.get('/fasting/sessions', protectedAccess, newWorkoutController.fastingList);
newWorkoutRouter.delete('/fasting/sessions/:id', protectedAccess, newWorkoutController.fastingDelete);
newWorkoutRouter.post('/fasting/sessions/:id/undo', protectedAccess, newWorkoutController.fastingUndo);
newWorkoutRouter.post('/fasting/sessions/undo-latest', protectedAccess, newWorkoutController.fastingUndoLatest);
newWorkoutRouter.get('/fasting/sessions/:id/share', protectedAccess, newWorkoutController.fastingShare);

newWorkoutRouter.post('/lift-lists', protectedAccess, newWorkoutController.liftListCreate);
newWorkoutRouter.get('/lift-lists', protectedAccess, newWorkoutController.liftListList);
newWorkoutRouter.patch('/lift-lists/:id/add-item', protectedAccess, newWorkoutController.liftListAddItem);
newWorkoutRouter.patch('/lift-lists/:id/remove-item', protectedAccess, newWorkoutController.liftListRemoveItem);
newWorkoutRouter.delete('/lift-lists/:id', protectedAccess, newWorkoutController.liftListDelete);
newWorkoutRouter.post('/lift-lists/:id/undo', protectedAccess, newWorkoutController.liftListUndo);
newWorkoutRouter.post('/lift-lists/undo-latest', protectedAccess, newWorkoutController.liftListUndoLatest);

newWorkoutRouter.get('/analysis/workout', protectedAccess, newWorkoutController.workoutAnalysis);
newWorkoutRouter.get('/analysis/calories', protectedAccess, newWorkoutController.calorieAnalysis);
newWorkoutRouter.get('/sharing/achievement', protectedAccess, newWorkoutController.achievementShare);

export default newWorkoutRouter;
