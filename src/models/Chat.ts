import mongoose, { Schema, model } from 'mongoose';
import { IChat, IMessage } from './modelInterface';

const MessageSchema = new Schema<IMessage>({
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  });


  const ChatSchema = new Schema<IChat>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    messages: [MessageSchema],
    createdAt: { type: Date, default: Date.now }
});

const Chat = model<IChat>('Chat', ChatSchema);
export default Chat;