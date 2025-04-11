import mongoose from 'mongoose';

export interface IMessage {
  content: string;
  sender: {
    name: string;
    avatar?: string;
  };
  roomId: string;
  timestamp: Date;
  readBy: string[];
}

const MessageSchema = new mongoose.Schema<IMessage>({
  content: { type: String, required: true },
  sender: {
    name: { type: String, required: true },
    avatar: String
  },
  roomId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [String]
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 