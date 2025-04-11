import mongoose from 'mongoose';

export interface IRoom {
  name: string;
  participants: Array<{
    name: string;
    avatar?: string;
  }>;
  lastActivity: Date;
}

const RoomSchema = new mongoose.Schema<IRoom>({
  name: { type: String, required: true },
  participants: [{
    name: String,
    avatar: String
  }],
  lastActivity: { type: Date, default: Date.now }
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema); 