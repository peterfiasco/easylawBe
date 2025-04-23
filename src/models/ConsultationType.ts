import mongoose, { Schema } from 'mongoose';
import { IConsultationType } from './modelInterface';

const ConsultationTypeSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  call_type: {
    type: String,
    enum: ['video', 'phone'],
    required: [true, 'Call type is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 15,
    default: 30
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

// Update timestamp on update
ConsultationTypeSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

export default mongoose.model<IConsultationType>('ConsultationType', ConsultationTypeSchema);
