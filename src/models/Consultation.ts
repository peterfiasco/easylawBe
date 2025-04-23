import mongoose, { Schema } from 'mongoose';
import { IConsultation } from './modelInterface';

const ConsultationSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  consultation_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsultationType',
    required: [true, 'Consultation type is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'completed', 'cancelled'],
    default: 'pending'
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IConsultation>('Consultation', ConsultationSchema);
