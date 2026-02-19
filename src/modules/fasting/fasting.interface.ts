import { ObjectId } from 'mongoose';

export interface IFastingTimeSlot {
  startTime: string;
  endTime: string;
}

export interface IEatingTimeSlot {
  startTime: string;
  endTime: string;
}

export interface IFasting {
  userId: ObjectId;
  fastingRules: 'Everyday' | 'Every_Other_Day';
  fastingStart: Date;
  fastingEnd: Date;
  fastingDuration: number;
  fastingTimeSlot: IFastingTimeSlot[];
  eatingTimeSlot: IEatingTimeSlot[];
}
