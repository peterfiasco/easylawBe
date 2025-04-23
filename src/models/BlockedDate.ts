import mongoose, { Schema } from 'mongoose';

const BlockedDateSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

// Add index for fast querying
BlockedDateSchema.index({ date: 1 });

export default mongoose.model('BlockedDate', BlockedDateSchema);