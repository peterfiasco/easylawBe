import mongoose, { Schema, model } from 'mongoose';

import { ISetting } from './modelInterface';

const SettingSchema = new Schema<ISetting>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    twofa: { type: Boolean, required: true , default: false  },
    session_timeout: { type: Number, required: true , default: 30  },
    document_alert: { type: Boolean, required: true , default: false  },
    consultation_reminder: { type: Boolean, required: true , default: false  },
    marketing_email: { type: Boolean, required: true , default: false  },
    createdAt: { type: Date, default: Date.now }
});

const Setting = model<ISetting>('Setting', SettingSchema);
export default Setting;