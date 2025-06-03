import mongoose, { Schema, Document } from 'mongoose';

export interface IGeneratedDocument extends mongoose.Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  formData: Record<string, any>;
  status: 'draft' | 'finalized' | 'exported';
  format?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GeneratedDocumentSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentTemplate',
    required: false
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'exported'],
    default: 'draft'
  },
  format: { 
    type: String, 
    default: 'html' 
  }
}, {
  timestamps: true
});

export default mongoose.model<IGeneratedDocument>('GeneratedDocument', GeneratedDocumentSchema);