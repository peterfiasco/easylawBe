import { Document, Types } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  phone_number: number;
  website: string;
  business_type: string;
  role: string;
  address: string;
  password: string;
  verified: boolean;
  verification_code: string;
  createdAt: Date;
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
export interface IConsultation extends Document {
  user_id: IUser;
  call_type: string;
  date: Date;
  time: string;
  transaction_id: ITransaction;
  payment_status: string;
  createdAt: Date;
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