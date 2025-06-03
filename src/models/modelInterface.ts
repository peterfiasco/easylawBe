import { Document, Types } from "mongoose";
import mongoose from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  phone_number: number;
  phone?: string;
  website: string;
  business_type: string;
  role: string;
  address: string;
  password: string;
  verified: boolean;
  verification_code: string;
  createdAt: Date;
  created_at: Date;
  updated_at: Date;
  name: string;
}

export interface ISetting extends Document {
  user_id: IUser;
  twofa: boolean;
  session_timeout: number;
  email_update: boolean;
  document_alert: boolean;
  consultation_reminder: boolean;
  marketing_email: boolean;
  createdAt: Date;
}

export interface ITransaction extends Document {
  user_id: IUser;
  transactionRef: string;
  paymentmethod: string;
  status: string;
  amount: number;
  reversed: boolean;
  createdAt: Date;
}

// Update this interface to match our new structure
export interface IConsultation extends Document {
  user_id: Types.ObjectId | IUser;
  consultation_type_id: Types.ObjectId | IConsultationType;
  date: Date;
  time: string;
  reason: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  transaction_id?: Types.ObjectId | ITransaction;
  createdAt: Date;
  updated_at: Date;
}

// Add the ConsultationType interface
export interface IConsultationType extends Document {
  name: string;
  description: string;
  call_type: 'video' | 'phone';
  price: number;
  duration: number;
  created_at: Date;
  updated_at: Date;
}

// 🆕 Add populated consultation interface for proper typing
export interface IConsultationPopulated extends Omit<IConsultation, 'user_id' | 'consultation_type_id'> {
  user_id: IUser;
  consultation_type_id: IConsultationType;
  updated_at: Date;
}

export interface IMessage extends Document {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  user_id: IUser;
  title: string;
  messages: IMessage[];
  createdAt: Date;
}

export interface IDocument extends Document {
  title: string;
  content: string;
  userId: Types.ObjectId; // Changed from mongoose.Schema.Types.ObjectId
  createdAt: Date;
  updatedAt?: Date;
  format?: string;
}

export function createMessage(role: string, content: string, timestamp: Date = new Date()) {
  return {
    role,
    content,
    timestamp
  };
}
