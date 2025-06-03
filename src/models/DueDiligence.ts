import mongoose, { Schema } from 'mongoose';

export interface IDueDiligence extends mongoose.Document {
  service_request_id: mongoose.Types.ObjectId;
  investigation_type: 'land_title' | 'corporate_records' | 'investment_check' | 'comprehensive';
  subject_details: {
    type: 'individual' | 'company' | 'property';
    name: string;
    registration_number?: string;
    property_address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  investigation_scope: string[];
  findings: Array<{
    category: string;
    description: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    evidence_url?: string;
    date_discovered: Date;
  }>;
  red_flags: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    evidence_url?: string;
  }>;
  final_report_url?: string;
  investigator_notes: string;
  client_briefing_scheduled?: Date;
  created_at: Date;
  updated_at: Date;
}

const DueDiligenceSchema: Schema = new Schema({
  service_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request ID is required']
  },
  investigation_type: {
    type: String,
    enum: ['land_title', 'corporate_records', 'investment_check', 'comprehensive'],
    required: [true, 'Investigation type is required']
  },
  subject_details: {
    type: {
      type: String,
      enum: ['individual', 'company', 'property'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    registration_number: {
      type: String,
      trim: true
    },
    property_address: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  investigation_scope: [{
    type: String,
    trim: true
  }],
  findings: [{
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    evidence_url: { type: String, trim: true },
    date_discovered: { type: Date, default: Date.now }
  }],
  red_flags: [{
    description: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    recommendation: { type: String, required: true, trim: true },
    evidence_url: { type: String, trim: true }
  }],
  final_report_url: {
    type: String,
    trim: true
  },
  investigator_notes: {
    type: String,
    trim: true
  },
  client_briefing_scheduled: {
    type: Date
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

DueDiligenceSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

export default mongoose.model<IDueDiligence>('DueDiligence', DueDiligenceSchema);