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
  quote?: {
    messageId: mongoose.Types.ObjectId;
    content: string; // why content? speed up the query and if the message is deleted, the quote will not be deleted
    sender: {
      name: string;
      avatar?: string;
    };
    timestamp: Date;
  };
}

const MessageSchema = new mongoose.Schema<IMessage>({
  content: { type: String, required: true },
  sender: {
    name: { type: String, required: true },
    avatar: String
  },
  roomId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [String],
  quote: {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    content: String,
    sender: {
      name: String,
      avatar: String
    },
    timestamp: Date
  }
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema); 