import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentCategory extends Document {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDocumentCategory>('DocumentCategory', DocumentCategorySchema);