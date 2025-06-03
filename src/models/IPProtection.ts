import mongoose, { Schema } from 'mongoose';

export interface IIPProtection extends mongoose.Document {
  service_request_id: mongoose.Types.ObjectId;
  protection_type: 'trademark' | 'copyright' | 'patent' | 'industrial_design' | 'dispute_resolution';
  application_details: {
    title: string;
    description: string;
    category: string;
    classes: number[];
    applicant_type: 'individual' | 'company';
    prior_use_date?: Date;
  };
  applicant_info: {
    full_name: string;
    company_name?: string;
    address: string;
    nationality: string;
    email: string;
    phone: string;
  };
  trademark_details?: {
    mark_type: 'word' | 'logo' | 'combined' | 'sound' | 'color';
    trademark_text?: string;
    logo_url?: string;
    color_codes?: string[];
    goods_services: string[];
    nice_classification: number[];
  };
  patent_details?: {
    invention_title: string;
    invention_type: 'utility' | 'design' | 'plant';
    technical_field: string;
    background_art: string;
    invention_summary: string;
    claims: string[];
    drawings_url?: string[];
  };
  copyright_details?: {
    work_type: 'literary' | 'artistic' | 'musical' | 'dramatic' | 'software';
    work_title: string;
    creation_date: Date;
    publication_date?: Date;
    authors: string[];
    work_url?: string;
  };
  dispute_details?: {
    dispute_type: 'infringement' | 'opposition' | 'cancellation' | 'enforcement';
    opposing_party: string;
    dispute_description: string;
    evidence_urls: string[];
    preferred_resolution: 'negotiation' | 'mediation' | 'litigation';
  };
  filing_status: 'not_filed' | 'filed' | 'examination' | 'approved' | 'rejected' | 'published';
  registry_reference?: string;
  certificate_number?: string;
  certificate_url?: string;
  renewal_date?: Date;
  created_at: Date;
  updated_at: Date;
}

const IPProtectionSchema: Schema = new Schema({
  service_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request ID is required']
  },
  protection_type: {
    type: String,
    enum: ['trademark', 'copyright', 'patent', 'industrial_design', 'dispute_resolution'],
    required: [true, 'Protection type is required']
  },
  application_details: {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    classes: [{ type: Number }],
    applicant_type: {
      type: String,
      enum: ['individual', 'company'],
      required: true
    },
    prior_use_date: { type: Date }
  },
  applicant_info: {
    full_name: { type: String, required: true, trim: true },
    company_name: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  trademark_details: {
    mark_type: {
      type: String,
      enum: ['word', 'logo', 'combined', 'sound', 'color']
    },
    trademark_text: { type: String, trim: true },
    logo_url: { type: String, trim: true },
    color_codes: [{ type: String, trim: true }],
    goods_services: [{ type: String, trim: true }],
    nice_classification: [{ type: Number }]
  },
  patent_details: {
    invention_title: { type: String, trim: true },
    invention_type: {
      type: String,
      enum: ['utility', 'design', 'plant']
    },
    technical_field: { type: String, trim: true },
    background_art: { type: String, trim: true },
    invention_summary: { type: String, trim: true },
    claims: [{ type: String, trim: true }],
    drawings_url: [{ type: String, trim: true }]
  },
  copyright_details: {
    work_type: {
      type: String,
      enum: ['literary', 'artistic', 'musical', 'dramatic', 'software']
    },
    work_title: { type: String, trim: true },
    creation_date: { type: Date },
    publication_date: { type: Date },
    authors: [{ type: String, trim: true }],
    work_url: { type: String, trim: true }
  },
  dispute_details: {
    dispute_type: {
      type: String,
      enum: ['infringement', 'opposition', 'cancellation', 'enforcement']
    },
    opposing_party: { type: String, trim: true },
    dispute_description: { type: String, trim: true },
    evidence_urls: [{ type: String, trim: true }],
    preferred_resolution: {
      type: String,
      enum: ['negotiation', 'mediation', 'litigation']
    }
  },
  filing_status: {
    type: String,
    enum: ['not_filed', 'filed', 'examination', 'approved', 'rejected', 'published'],
    default: 'not_filed'
  },
  registry_reference: {
    type: String,
    trim: true
  },
  certificate_number: {
    type: String,
    trim: true
  },
  certificate_url: {
    type: String,
    trim: true
  },
  renewal_date: {
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

IPProtectionSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

export default mongoose.model<IIPProtection>('IPProtection', IPProtectionSchema);