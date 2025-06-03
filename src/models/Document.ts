import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends mongoose.Document {
  service_request_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  document_type: 'upload' | 'generated' | 'certificate' | 'report';
  document_category: string;
  file_name: string;
  file_size: number;
  file_type: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  secure_url: string;
  is_confidential: boolean;
  access_level: 'public' | 'client_only' | 'internal_only' | 'restricted';
  uploaded_by: mongoose.Types.ObjectId;
  description?: string;
  tags: string[];
  version: number;
  parent_document_id?: mongoose.Types.ObjectId;
  expiry_date?: Date;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  format?: string;
}

const DocumentSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  format: { 
    type: String, 
    default: 'html' 
  },
  service_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: [true, 'Service request ID is required']
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  document_type: {
    type: String,
    enum: ['upload', 'generated', 'certificate', 'report'],
    required: [true, 'Document type is required']
  },
  document_category: {
    type: String,
    required: [true, 'Document category is required'],
    trim: true
  },
  file_name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  file_size: {
    type: Number,
    required: [true, 'File size is required'],
    min: 0
  },
  file_type: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  cloudinary_public_id: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
    trim: true
  },
  cloudinary_url: {
    type: String,
    required: [true, 'Cloudinary URL is required'],
    trim: true
  },
  secure_url: {
    type: String,
    required: [true, 'Secure URL is required'],
    trim: true
  },
  is_confidential: {
    type: Boolean,
    default: true
  },
  access_level: {
    type: String,
    enum: ['public', 'client_only', 'internal_only', 'restricted'],
    default: 'client_only'
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploaded by is required']
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  parent_document_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  expiry_date: {
    type: Date
  }
}, {
  timestamps: true // This creates createdAt and updatedAt automatically
});

export default mongoose.model<IDocument>('Document', DocumentSchema);
