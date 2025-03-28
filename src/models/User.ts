import { Schema, model } from 'mongoose';

import { IUser } from './modelInterface';

const UserSchema = new Schema<IUser>({
    first_name: { type: String, required: true  },
    last_name: { type: String, required: true  },
    email: { type: String, required: true ,  unique: true },
    phone_number: { type: Number, required: true , unique: true },
    website: { type: String },
    business_type: { type: String, required: false  },
    role: { type: String, default: "user" },
    address: { type: String, required: false  },
    password: { type: String, required: true  },
    verified: { type: Boolean, required: true , default: true },
    verification_code: { type: String  },
    createdAt: { type: Date, default: Date.now }
});

const User = model<IUser>('User', UserSchema);
export default User;