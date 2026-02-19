import { model, Schema } from 'mongoose';
import {
  IEatingTimeSlot,
  IFasting,
  IFastingTimeSlot,
} from './fasting.interface';

const FastingTimeSlotSchema = new Schema<IFastingTimeSlot>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const EatingTimeSlotSchema = new Schema<IEatingTimeSlot>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const FastingSchema = new Schema<IFasting>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    fastingRules: {
      type: String,
      required: [true, 'Please select fasting rule'],
      enum: {
        values: ['Everyday', 'Every_Other_Day'],
        message: '{VALUE} is not valid, please provide a valid fasting rule',
      },
    },
    fastingStart: { type: Date, required: true },
    fastingEnd: { type: Date, required: true },
    fastingDuration: { type: Number, required: true },
    fastingTimeSlot: { type: [FastingTimeSlotSchema], required: true },
    eatingTimeSlot: { type: [EatingTimeSlotSchema], required: true },
  },
  {
    timestamps: true,
  },
);

const Fasting = model('Fasting', FastingSchema);
export default Fasting;
