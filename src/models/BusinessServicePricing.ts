import mongoose, { Document, Schema } from 'mongoose';

export interface IBusinessServicePricing extends Document {
  service_type: 'incorporation' | 'annual_returns' | 'name_change' | 'address_change' | 'increase_capital';
  priority: 'standard' | 'express' | 'urgent';
  price: number;
  duration: string;
  description?: string;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BusinessServicePricingSchema = new Schema<IBusinessServicePricing>({
  service_type: {
    type: String,
    required: true,
    enum: ['incorporation', 'annual_returns', 'name_change', 'address_change', 'increase_capital']
  },
  priority: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'urgent']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to ensure unique pricing per service_type + priority combination
BusinessServicePricingSchema.index({ service_type: 1, priority: 1 }, { unique: true });

// Index for efficient querying
BusinessServicePricingSchema.index({ is_active: 1 });
BusinessServicePricingSchema.index({ service_type: 1, is_active: 1 });

const BusinessServicePricing = mongoose.model<IBusinessServicePricing>('BusinessServicePricing', BusinessServicePricingSchema);

export default BusinessServicePricing;