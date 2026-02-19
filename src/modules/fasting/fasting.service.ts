// import moment from 'moment';
import moment from 'moment-timezone';
import { Types } from 'mongoose';
import cron from 'node-cron';
import { sendSingleNotification } from '../../firebaseSetup/sendPushNotification';
import { IFasting } from './fasting.interface';
import Fasting from './fasting.model';

const createFastingSchedule = async (userId: string, body: IFasting) => {
  try {
    const { fastingStart, fastingEnd } = body;
    const duration =
      (new Date(fastingEnd).getTime() - new Date(fastingStart).getTime()) /
      (1000 * 60 * 60 * 24);

    const durationDays = Math.ceil(duration);
    const result = await Fasting.create({
      ...body,
      userId,
      fastingDuration: durationDays,
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error(String(error));
    }
  }
};

const getSchedules = async (userId: string) => {
  try {
    const results = await Fasting.find({ userId });
    const todaysSchedules = [];

    if (results.length > 0) {
      for (const result of results) {
        const isToday = await isFastingToday(
          result.fastingStart,
          result.fastingRules,
        );
        if (isToday) {
          todaysSchedules.push(result);
        }
      }
    }

    return { allSchedules: results, todaysSchedules };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error(String(error));
    }
  }
};

const isFastingToday = async (fastingStart: Date, rule: string) => {
  if (rule === 'Everyday') return true;

  if (rule === 'Every_Other_Day') {
    const daysPassed = moment()
      .startOf('day')
      .diff(moment(fastingStart).startOf('day'), 'days');
    return daysPassed % 2 === 0; // even → fasting day, odd → off day
  }

  return false;
};

// const getTodayDateTime = (timeString: string) => {
// // Example '06:00 AM' or '18:00'
//   return moment.tz(timeString, 'hh:mm A', 'Asia/Dhaka');
// };

cron.schedule('* * * * *', async () => {
  const schedules = await Fasting.find();
  const now = moment().utc().format('HH:mm');

  for (const schedule of schedules) {
    const isToday = await isFastingToday(
      schedule.fastingStart,
      schedule.fastingRules,
    );
    if (!isToday) continue;

    // ================== FASTING START ==================
    schedule.fastingTimeSlot.forEach((slot) => {
      const slotUTC = moment(slot.startTime, 'hh:mm A').utc().format('HH:mm');
      if (slotUTC === now) {
        sendSingleNotification(
          schedule.userId as unknown as Types.ObjectId,
          '⏳ Fasting Window Started',
          'Your fasting period has begun. Stay hydrated and stay strong!',
        );
      }
    });

    // ================== FASTING END ==================
    schedule.fastingTimeSlot.forEach((slot) => {
      const endUTC = moment(slot.endTime, 'hh:mm A').utc().format('HH:mm');
      if (endUTC === now) {
        sendSingleNotification(
          schedule.userId as unknown as Types.ObjectId,
          '🍽 Fasting Window Ended',
          'Your fasting period is now complete. You may eat mindfully — great discipline!',
        );
      }
    });

    // ================== EATING START ==================
    schedule.eatingTimeSlot.forEach((slot) => {
      const slotUTC = moment(slot.startTime, 'hh:mm A').utc().format('HH:mm');
      if (slotUTC === now) {
        sendSingleNotification(
          schedule.userId as unknown as Types.ObjectId,
          '🍽 Eating Window Started',
          'Your eating window is now open — fuel your body wisely!',
        );
      }
    });

    // ================== EATING END ==================
    schedule.eatingTimeSlot.forEach((slot) => {
      const endUTC = moment(slot.endTime, 'hh:mm A').utc().format('HH:mm');
      if (endUTC === now) {
        sendSingleNotification(
          schedule.userId as unknown as Types.ObjectId,
          '🔚 Eating Window Ended',
          'Your eating time has finished — fasting will resume next cycle.',
        );
      }
    });
  }
});

export const fastingServices = {
  createFastingSchedule,
  getSchedules,
};
