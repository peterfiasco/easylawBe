import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceRequest extends Document {
  user_id: mongoose.Types.ObjectId;
  service_type: 'business_registration' | 'due_diligence' | 'ip_protection' | 'document_management' | 'consultation';
  service_subtype: string;
  reference_number: string;
  status: 'submitted' | 'in_progress' | 'requires_action' | 'completed' | 'cancelled';
  priority: 'standard' | 'express' | 'urgent';
  estimated_completion: Date;
  actual_completion?: Date;
  total_amount: number;
  paid_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  documents: Array<{
    name: string;
    url?: string; // Make optional since we're storing buffer
    upload_date: Date;
    document_type: string;
    // ✅ ADD: File storage fields (like DocumentTemplate)
    file_buffer: Buffer;  // Store actual file content
    file_size: number;
    mime_type: string;
    // Keep existing optional fields
    description?: string;
    file_path?: string;
    uploaded_by?: mongoose.Types.ObjectId;
    download_url?: string;
  }>;
  notes: Array<{
    message: string;
    added_by: mongoose.Types.ObjectId;
    date: Date;
    type: 'system' | 'admin' | 'user';
  }>;
  // Add investigation_details for due diligence
  investigation_details?: {
    investigation_type: string;
    subject_name: string;
    subject_type: string;
    company_registration_number?: string;
    subject_address?: string;
    investigation_scope: string;
    specific_requirements?: string;
    contact_information: {
      phone: string;
      email: string;
      preferred_contact_method: string;
    };
    urgency_reason?: string;
    background_information?: string;
    supporting_documents?: any[];
  };
  // Add business_details for business registration
  business_details?: {
    business_name: string;
    business_type: string;
    registration_type: string;
    proposed_names?: string[];
    business_address: string;
    directors?: any[];
    shareholders?: any[];
    business_objectives?: string[];
    authorized_share_capital?: number;
    issued_share_capital?: number;
  };
  created_at: Date;
  updated_at: Date;
}

const ServiceRequestSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  service_type: {
    type: String,
    enum: ['business_registration', 'due_diligence', 'ip_protection', 'document_management', 'consultation'],
    required: [true, 'Service type is required']
  },
  service_subtype: {
    type: String,
    required: [true, 'Service subtype is required'],
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
    enum: ['submitted', 'in_progress', 'requires_action', 'completed', 'cancelled'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['standard', 'express', 'urgent'],
    default: 'standard'
  },
  estimated_completion: {
    type: Date,
    required: [true, 'Estimated completion date is required']
  },
  actual_completion: {
    type: Date
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paid_amount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  payment_status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  documents: [{
    name: { type: String, required: true, trim: true },
    url: { type: String, trim: true }, // Make optional
    upload_date: { type: Date, default: Date.now },
    document_type: { type: String, required: true, trim: true },
    // ✅ ADD: File storage fields
    file_buffer: { type: Buffer, required: true },
    file_size: { type: Number, required: true, min: 0 },
    mime_type: { type: String, required: true, trim: true },
    // Keep existing optional fields
    description: { type: String, trim: true },
    file_path: { type: String, trim: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    download_url: { type: String, trim: true }
  }],
  notes: [{
    message: { type: String, required: true, trim: true },
    added_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['system', 'admin', 'user'], default: 'system' }
  }],
  // Investigation details for due diligence services
  investigation_details: {
    investigation_type: { type: String, trim: true },
    subject_name: { type: String, trim: true },
    subject_type: { type: String, trim: true },
    company_registration_number: { type: String, trim: true },
    subject_address: { type: String, trim: true },
    investigation_scope: { type: String, trim: true },
    specific_requirements: { type: String, trim: true },
    contact_information: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      preferred_contact_method: { type: String, trim: true }
    },
    urgency_reason: { type: String, trim: true },
    background_information: { type: String, trim: true },
    supporting_documents: [{ type: mongoose.Schema.Types.Mixed }]
  },
  // Business details for business registration services
  business_details: {
    business_name: { type: String, trim: true },
    business_type: { type: String, trim: true },
    registration_type: { type: String, trim: true },
    proposed_names: [{ type: String, trim: true }],
    business_address: { type: String, trim: true },
    directors: [{ type: mongoose.Schema.Types.Mixed }],
    shareholders: [{ type: mongoose.Schema.Types.Mixed }],
    business_objectives: [{ type: String, trim: true }],
    authorized_share_capital: { type: Number, min: 0 },
    issued_share_capital: { type: Number, min: 0 }
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

// Update the updated_at field on save
ServiceRequestSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

// Add indexes for better performance
ServiceRequestSchema.index({ user_id: 1, service_type: 1 });
ServiceRequestSchema.index({ reference_number: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ created_at: -1 });

export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);