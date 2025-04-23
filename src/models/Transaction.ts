import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  user_id: mongoose.Types.ObjectId;
  transactionRef: string;
  paymentmethod: string;
  status: string;
  amount: number;
  reversed: boolean;
  consultation_id?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const TransactionSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  transactionRef: {
    type: String,
    required: [true, 'Transaction reference is required'],
    unique: true
  },
  paymentmethod: {
    type: String,
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required']
  },
  reversed: {
    type: Boolean,
    default: false
  },
  consultation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
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
TransactionSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updated_at = new Date();
  }
  next();
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
