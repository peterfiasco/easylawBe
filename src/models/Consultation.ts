import mongoose, { Schema, model } from 'mongoose';

import { IConsultation } from './modelInterface';

const ConsultationSchema = new Schema<IConsultation>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    call_type: { type: String, required: true },
    date: { type: Date, required: true   },
    time: { type: String, required: true   },
    transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    payment_status: { type: String, required: true , default: 'pending'  },
    createdAt: { type: Date, default: Date.now }
});

const Consultation = model<IConsultation>('Consultation', ConsultationSchema);
export default Consultation;