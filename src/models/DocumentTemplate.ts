import mongoose, { Schema, Document } from 'mongoose';

export interface IField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'currency';
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  description?: string;
}

export interface IDocumentTemplate extends Document {
  name: string;
  description: string;
  category: string;
  fields: IField[];
  isActive: boolean;
  // Changed these fields to store the file directly in MongoDB
  templateFile: Buffer; // Binary data of the file
  templateFileName: string; // Original filename
  templateFileType: string; // File type (doc, docx, pdf)
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'currency'],
  },
  required: { type: Boolean, default: false },
  options: [String],
  placeholder: String,
  description: String
});

const DocumentTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentCategory', required: true },
  fields: [FieldSchema],
  isActive: { type: Boolean, default: true },
  // Changed the templateFile to Buffer type to store binary data
  templateFile: { type: Buffer, required: true },
  templateFileName: { type: String, required: true },
  templateFileType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocumentTemplate>('DocumentTemplate', DocumentTemplateSchema);
