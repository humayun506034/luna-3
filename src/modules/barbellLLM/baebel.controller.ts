import { Types } from 'mongoose';
import catchAsync from '../../util/catchAsync';
import idConverter from '../../util/idConvirter';
import barbelLLMServices from './barbel.service';

const createExerciseRoutine = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.createExerciseRoutine(
    user_id,
    payLoad
  );

  res.status(200).json({
    success: true,
    message: 'work out routine generated',
    data: result,
  });
});

const saveWorkOutPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.saveWorkOutPlan(user_id, payLoad);

  res.status(200).json({
    success: true,
    message: 'work out routine is saved',
    data: result,
  });
});

const getWorkoutRoutine = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;

  const result = await barbelLLMServices.getWorkoutRoutine(convertedId);

  res.status(200).json({
    success: true,
    message: 'work out routine is saved',
    data: result,
  });
});

const updateExerciseRoutine = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const feedBack = req.body;

  const result = await barbelLLMServices.updateExerciseRoutine(
    convertedId,
    feedBack.feedBack
  );

  res.status(200).json({
    success: true,
    message: 'work out routine is updated',
    data: result,
  });
});

const updateWorkOutPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.updateWorkOutPlan(
    convertedId,
    payLoad
  );

  res.status(200).json({
    success: true,
    message: 'work out routine is updated',
    data: result,
  });
});

// diet
const createDietPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.createDietPlan(user_id, payLoad);

  res.status(200).json({
    success: true,
    message: 'diet plan generated',
    data: result,
  });
});

const saveDietPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.saveDietPlan(user_id, payLoad);

  res.status(200).json({
    success: true,
    message: 'diet plan is saved',
    data: result,
  });
});

const getDietPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;

  const result = await barbelLLMServices.getDietPlan(convertedId);

  res.status(200).json({
    success: true,
    message: 'fetched diet plan',
    data: result,
  });
});

const updateDietPlan = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.updateDietPlan(convertedId, payLoad.feedback);

  res.status(200).json({
    success: true,
    message: 'diet  plan is updated',
    data: result,
  });
});

const updateDietPlanManually = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const payLoad = req.body;

  const result = await barbelLLMServices.updateDietPlanManually(
    convertedId,
    payLoad
  );

  res.status(200).json({
    success: true,
    message: 'diet plan is updated',
    data: result,
  });
});

//==========================>>>>>>>>>>>

const startChatOrGetPreviousChat = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;

  const result =
    await barbelLLMServices.startChatOrGetPreviousChat(convertedId);

  res.status(200).json({
    success: true,
    message: 'chat is retrieved or created',
    data: result,
  });
});
const endChat = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;

  const result = await barbelLLMServices.endChat(convertedId);

  res.status(200).json({
    success: true,
    message: 'chat is deleted',
    data: result,
  });
});

const sendMessageAndGetReply = catchAsync(async (req, res) => {
  const user_id = req.user.id;
  const convertedId = idConverter(user_id) as Types.ObjectId;
  const userFeedback = req.body;

  const result = await barbelLLMServices.sendMessageAndGetReply(
    convertedId,
    userFeedback.message
  );

  res.status(200).json({
    success: true,
    message: 'chat is retrieved or created',
    data: result,
  });
});

const barbellController = {
  createExerciseRoutine,
  saveWorkOutPlan,
  getWorkoutRoutine,
  updateExerciseRoutine,
  startChatOrGetPreviousChat,
  endChat,
  sendMessageAndGetReply,
  updateWorkOutPlan,
  createDietPlan,
  saveDietPlan,
  getDietPlan,
  updateDietPlan,
  updateDietPlanManually,
};

export default barbellController;
