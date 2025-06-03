import mongoose, { Schema } from 'mongoose';

interface IBusinessService extends mongoose.Document {
  user_id: mongoose.Types.ObjectId;
  service_type: 'business_registration' | 'due_diligence' | 'legal_documentation' | 'compliance_audit';
  service_name: string;
  reference_number: string;
  status: 'submitted' | 'pending' | 'processing' | 'review' | 'under_review' | 'approved' | 'completed' | 'failed' | 'rejected';
  priority: 'standard' | 'express' | 'urgent';
  
  // Client Information
  client_name: string;
  client_email: string;
  client_phone: string;
  
  // Business Registration Fields
  business_name?: string;
  business_type?: string;
  business_address?: string;
  business_objects?: string;
  directors?: Array<{
    name: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    occupation: string;
  }>;
  shareholders?: Array<{
    name: string;
    email: string;
    shares: number;
    percentage: number;
  }>;
  
  // Due Diligence Fields
  investigation_type?: 'individual' | 'company' | 'asset';
  subject_name?: string;
  subject_details?: string;
  investigation_scope?: string[];
  urgency_level?: string;
  
  // Payment Information
  amount_paid: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_date?: Date;
  transaction_reference?: string;
  transaction_id?: mongoose.Types.ObjectId;
  
  // Service Progress
  estimated_completion?: Date;
  actual_completion?: Date;
  progress_percentage: number;
  status_message?: string;
  last_updated: Date;
  
  // Documents
  documents?: Array<{
    name: string;
    type: string;
    size?: string;
    url: string;
    download_url: string;
    preview_url?: string;
    created_at: Date;
  }>;
  
  // Additional Data
  additional_requirements?: string;
  internal_notes?: string;
  assigned_staff?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const BusinessServiceSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  service_type: {
    type: String,
    enum: ['business_registration', 'due_diligence', 'legal_documentation', 'compliance_audit'],
    required: [true, 'Service type is required']
  },
  service_name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  reference_number: {
    type: String,
    required: [true, 'Reference number is required'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['submitted', 'pending', 'processing', 'review', 'under_review', 'approved', 'completed', 'failed', 'rejected'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['standard', 'express', 'urgent'],
    default: 'standard'
  },
  
  // Client Information
  client_name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  client_email: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true
  },
  client_phone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true
  },
  
  // Business Registration Fields
  business_name: {
    type: String,
    trim: true
  },
  business_type: {
    type: String,
    trim: true
  },
  business_address: {
    type: String,
    trim: true
  },
  business_objects: {
    type: String,
    trim: true
  },
  directors: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    nationality: { type: String, required: true },
    occupation: { type: String, required: true }
  }],
  shareholders: [{
    name: { type: String, required: true },
    email: { type: String, required: true },
    shares: { type: Number, required: true },
    percentage: { type: Number, required: true }
  }],
  
  // Due Diligence Fields
  investigation_type: {
    type: String,
    enum: ['individual', 'company', 'asset']
  },
  subject_name: {
    type: String,
    trim: true
  },
  subject_details: {
    type: String,
    trim: true
  },
  investigation_scope: [{
    type: String
  }],
  urgency_level: {
    type: String,
    trim: true
  },
  
  // Payment Information
  amount_paid: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_date: {
    type: Date
  },
  transaction_reference: {
    type: String,
    trim: true
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Service Progress
  estimated_completion: {
    type: Date
  },
  actual_completion: {
    type: Date
  },
  progress_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status_message: {
    type: String,
    trim: true
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  
  // Documents
  documents: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: String },
    url: { type: String, required: true },
    download_url: { type: String, required: true },
    preview_url: { type: String },
    created_at: { type: Date, default: Date.now }
  }],
  
  // Additional Data
  additional_requirements: {
    type: String,
    trim: true
  },
  internal_notes: {
    type: String,
    trim: true
  },
  assigned_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
BusinessServiceSchema.index({ reference_number: 1 });
BusinessServiceSchema.index({ user_id: 1, createdAt: -1 });
BusinessServiceSchema.index({ status: 1 });
BusinessServiceSchema.index({ service_type: 1 });

// Pre-save middleware to update last_updated
BusinessServiceSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.last_updated = new Date();
  }
  next();
});

// Method to generate reference number
BusinessServiceSchema.statics.generateReferenceNumber = function(serviceType: string): string {
  const prefix = serviceType.toUpperCase().substring(0, 3);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Update the interface to include the static method
export interface IBusinessServiceModel extends mongoose.Model<IBusinessService> {
  generateReferenceNumber(serviceType: string): string;
}

// Update the export
export default mongoose.model<IBusinessService, IBusinessServiceModel>('BusinessService', BusinessServiceSchema);
