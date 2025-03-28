import mongoose, { Schema, model } from 'mongoose';

import { ITransaction } from './modelInterface';

const TransactionSchema = new Schema<ITransaction>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionRef: { type: String, required: true  },
    paymentmethod: { type: String, required: true  },
    status: { type: String, required: true, default: 'pending'  },
    amount: { type: Number, required: true  },
    reversed: { type: Boolean, required: true , default: false  },
    createdAt: { type: Date, default: Date.now }
});

const Transaction = model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;