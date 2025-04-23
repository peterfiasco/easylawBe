import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;  // in days
  features: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const subscriptionPlanSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Subscription plan name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  features: [{
    type: String,
    trim: true
  }],
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
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);