import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSubscription extends Document {
  user_id: mongoose.Types.ObjectId;
  plan_id: mongoose.Types.ObjectId;
  start_date: Date;
  end_date: Date;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  payment_reference: string;
  amount_paid: number;
  metadata?: {
    downloadUsed?: boolean;
    downloadDate?: Date;
    downloadFormat?: string;
    [key: string]: any; // Allow for additional metadata properties
  };
  created_at: Date;
  updated_at: Date;
}

const userSubscriptionSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  plan_id: {
    type: Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: [true, 'Subscription plan ID is required']
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'pending'],
    default: 'active'
  },
  payment_reference: {
    type: String,
    trim: true
  },
  amount_paid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount cannot be negative']
  },
  metadata: {
    type: Object,
    default: {}
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

// Create an index for querying active subscriptions efficiently
userSubscriptionSchema.index({ user_id: 1, status: 1 });

// Create an index for querying expiring subscriptions efficiently
userSubscriptionSchema.index({ end_date: 1, status: 1 });

export default mongoose.model<IUserSubscription>('UserSubscription', userSubscriptionSchema);
