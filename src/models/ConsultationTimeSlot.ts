import mongoose, { Schema } from 'mongoose';

const ConsultationTimeSlotSchema = new Schema({
  start_time: {
    type: String,
    required: true,
    trim: true
  },
  end_time: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ConsultationTimeSlot', ConsultationTimeSlotSchema);