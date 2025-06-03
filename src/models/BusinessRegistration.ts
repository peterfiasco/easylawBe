import mongoose, { Schema } from 'mongoose';

export interface IBusinessRegistration extends mongoose.Document {
  service_request_id: mongoose.Types.ObjectId;
  business_name: string;
  business_type: 'limited_company' | 'business_name' | 'incorporated_trustee' | 'partnership';
  registration_type: 'incorporation' | 'annual_filing' | 'change_of_directors' | 'change_of_address';
  proposed_names: string[];
  business_address: {
    street: string;
    city: string;
    state: string;
    postal_code?: string;
  };
  directors: Array<{
    full_name: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    occupation: string;
  }>;
  shareholders: Array<{
    full_name: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    shares: number;
    share_percentage: number;
  }>;
  business_objectives: string[];
  authorized_share_capital: number;
  issued_share_capital: number;
  memorandum_articles: string;
  cac_status: 'not_submitted' | 'submitted' | 'approved' | 'rejected';
  cac_reference?: string;
  registration_number?: string;
  certificate_url?: string;
  created_at: Date;
  updated_at: Date;
}

const BusinessRegistrationSchema: Schema = new Schema({
  service_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request ID is required']
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  business_type: {
    type: String,
    enum: ['limited_company', 'business_name', 'incorporated_trustee', 'partnership'],
    required: [true, 'Business type is required']
  },
  registration_type: {
    type: String,
    enum: ['incorporation', 'annual_filing', 'change_of_directors', 'change_of_address'],
    required: [true, 'Registration type is required']
  },
  proposed_names: [{
    type: String,
    trim: true
  }],
  business_address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postal_code: { type: String, trim: true }
  },
  directors: [{
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true }
  }],
  shareholders: [{
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    shares: { type: Number, required: true, min: 1 },
    share_percentage: { type: Number, required: true, min: 0, max: 100 }
  }],
  business_objectives: [{ type: String, trim: true }],
  authorized_share_capital: {
    type: Number,
    required: [true, 'Authorized share capital is required'],
    min: 10000
  },
  issued_share_capital: {
    type: Number,
    required: [true, 'Issued share capital is required'],
    min: 10000
  },
  memorandum_articles: {
    type: String,
    trim: true
  },
  cac_status: {
    type: String,
    enum: ['not_submitted', 'submitted', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  cac_reference: {
    type: String,
    trim: true
  },
  registration_number: {
    type: String,
    trim: true
  },
  certificate_url: {
    type: String,
    trim: true
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

BusinessRegistrationSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

export default mongoose.model<IBusinessRegistration>('BusinessRegistration', BusinessRegistrationSchema);